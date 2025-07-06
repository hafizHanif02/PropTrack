const mongoose = require('mongoose');

const viewingSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property reference is required']
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client reference is required']
  },
  scheduledDateTime: {
    type: Date,
    required: [true, 'Scheduled date and time is required'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Scheduled date must be in the future'
    }
  },
  duration: {
    type: Number,
    default: 60, // minutes
    min: [15, 'Viewing duration must be at least 15 minutes'],
    max: [240, 'Viewing duration cannot exceed 4 hours']
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'pending', 'in_progress', 'completed', 'no_show', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['individual', 'group', 'virtual', 'open_house'],
    default: 'individual'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  agentNotes: [{
    note: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['preparation', 'during_viewing', 'follow_up', 'general'],
      default: 'general'
    }
  }],
  clientFeedback: {
    rating: {
      type: Number,
      min: [1, 'Rating must be between 1-5'],
      max: [5, 'Rating must be between 1-5']
    },
    comments: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comments cannot exceed 1000 characters']
    },
    interested: {
      type: Boolean
    },
    concerns: [{
      type: String,
      trim: true
    }],
    submittedAt: {
      type: Date
    }
  },
  outcome: {
    result: {
      type: String,
      enum: ['interested', 'not_interested', 'needs_time', 'wants_second_viewing', 'ready_to_offer'],
      default: 'interested'
    },
    nextSteps: {
      type: String,
      trim: true,
      maxlength: [500, 'Next steps cannot exceed 500 characters']
    },
    followUpDate: {
      type: Date
    }
  },
  attendees: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    relationship: {
      type: String,
      enum: ['primary', 'spouse', 'family', 'friend', 'advisor', 'other'],
      default: 'primary'
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    }
  }],
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'call'],
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    scheduledFor: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending'
    }
  }],
  actualStartTime: {
    type: Date
  },
  actualEndTime: {
    type: Date
  },
  weatherConditions: {
    type: String,
    trim: true
  },
  specialInstructions: {
    type: String,
    trim: true,
    maxlength: [500, 'Special instructions cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
viewingSchema.index({ property: 1, scheduledDateTime: 1 });
viewingSchema.index({ client: 1, scheduledDateTime: 1 });
viewingSchema.index({ scheduledDateTime: 1, status: 1 });
viewingSchema.index({ status: 1, priority: -1 });
viewingSchema.index({ createdAt: -1 });
viewingSchema.index({ 'outcome.followUpDate': 1 });

// Virtual for formatted scheduled time
viewingSchema.virtual('formattedScheduledTime').get(function() {
  return this.scheduledDateTime.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Virtual for duration in hours
viewingSchema.virtual('durationHours').get(function() {
  return this.duration / 60;
});

// Virtual for viewing status display
viewingSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'scheduled': 'Scheduled',
    'confirmed': 'Confirmed',
    'pending': 'Pending',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'no_show': 'No Show',
    'cancelled': 'Cancelled',
    'rescheduled': 'Rescheduled'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for time until viewing
viewingSchema.virtual('timeUntilViewing').get(function() {
  const now = new Date();
  const diffMs = this.scheduledDateTime - now;
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  
  if (diffMs < 0) {
    return 'Past due';
  } else if (diffHours < 1) {
    const diffMinutes = Math.ceil(diffMs / (1000 * 60));
    return `${diffMinutes} minutes`;
  } else if (diffHours < 24) {
    return `${diffHours} hours`;
  } else {
    const diffDays = Math.ceil(diffHours / 24);
    return `${diffDays} days`;
  }
});

// Pre-save middleware for validation
viewingSchema.pre('save', function(next) {
  // Ensure viewing is not scheduled too far in advance (6 months max)
  const maxAdvanceDate = new Date();
  maxAdvanceDate.setMonth(maxAdvanceDate.getMonth() + 6);
  
  if (this.scheduledDateTime > maxAdvanceDate) {
    next(new Error('Viewing cannot be scheduled more than 6 months in advance'));
  } else {
    next();
  }
});

// Static method for finding conflicting viewings
viewingSchema.statics.findConflicts = function(propertyId, scheduledDateTime, duration, excludeId = null) {
  const startTime = new Date(scheduledDateTime);
  const endTime = new Date(startTime.getTime() + (duration * 60 * 1000));
  
  const query = {
    property: propertyId,
    status: { $in: ['scheduled', 'confirmed'] },
    $or: [
      // New viewing starts during existing viewing
      {
        scheduledDateTime: { $lte: startTime },
        $expr: {
          $gte: [
            { $add: ['$scheduledDateTime', { $multiply: ['$duration', 60000] }] },
            startTime
          ]
        }
      },
      // New viewing ends during existing viewing
      {
        scheduledDateTime: { $lte: endTime },
        $expr: {
          $gte: [
            { $add: ['$scheduledDateTime', { $multiply: ['$duration', 60000] }] },
            endTime
          ]
        }
      },
      // Existing viewing is completely within new viewing
      {
        scheduledDateTime: { $gte: startTime, $lte: endTime }
      }
    ]
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  return this.find(query).populate('client', 'name email phone');
};

// Static method for getting today's viewings
viewingSchema.statics.getTodayViewings = function() {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  
  return this.find({
    scheduledDateTime: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
    isActive: true
  })
  .sort('scheduledDateTime')
  .populate('property', 'title location.address location.city')
  .populate('client', 'name email phone');
};

// Static method for getting upcoming viewings
viewingSchema.statics.getUpcomingViewings = function(days = 7) {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    scheduledDateTime: { $gte: now, $lte: futureDate },
    status: { $in: ['scheduled', 'confirmed'] },
    isActive: true
  })
  .sort('scheduledDateTime')
  .populate('property', 'title location.address location.city')
  .populate('client', 'name email phone');
};

// Static method for viewing statistics
viewingSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalViewings: { $sum: 1 },
        confirmedViewings: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
        },
        completedViewings: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        cancelledViewings: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        averageDuration: { $avg: '$duration' }
      }
    }
  ]);
  
  const statusStats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const typeStats = await this.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return {
    general: stats[0] || {},
    byStatus: statusStats,
    byType: typeStats
  };
};

module.exports = mongoose.model('Viewing', viewingSchema); 