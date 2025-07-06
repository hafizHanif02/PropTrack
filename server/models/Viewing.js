const mongoose = require('mongoose');

const viewingSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property reference is required']
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client reference is required']
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Scheduled date must be in the future'
    }
  },
  scheduledTime: {
    hour: {
      type: Number,
      required: [true, 'Scheduled hour is required'],
      min: [0, 'Hour must be between 0-23'],
      max: [23, 'Hour must be between 0-23']
    },
    minute: {
      type: Number,
      required: [true, 'Scheduled minute is required'],
      min: [0, 'Minute must be between 0-59'],
      max: [59, 'Minute must be between 0-59']
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
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'no_show', 'cancelled', 'rescheduled'],
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
viewingSchema.index({ propertyId: 1, scheduledDate: 1 });
viewingSchema.index({ clientId: 1, scheduledDate: 1 });
viewingSchema.index({ scheduledDate: 1, status: 1 });
viewingSchema.index({ status: 1, priority: -1 });
viewingSchema.index({ createdAt: -1 });
viewingSchema.index({ 'outcome.followUpDate': 1 });

// Virtual for scheduled datetime
viewingSchema.virtual('scheduledDateTime').get(function() {
  const date = new Date(this.scheduledDate);
  date.setHours(this.scheduledTime.hour, this.scheduledTime.minute, 0, 0);
  return date;
});

// Virtual for formatted scheduled time
viewingSchema.virtual('formattedScheduledTime').get(function() {
  const date = this.scheduledDateTime;
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
});

// Virtual for viewing duration in hours
viewingSchema.virtual('durationHours').get(function() {
  return this.duration / 60;
});

// Virtual for time until viewing
viewingSchema.virtual('timeUntilViewing').get(function() {
  const now = new Date();
  const scheduledTime = this.scheduledDateTime;
  const diffTime = scheduledTime - now;
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  return diffHours;
});

// Virtual for actual duration
viewingSchema.virtual('actualDuration').get(function() {
  if (!this.actualStartTime || !this.actualEndTime) return null;
  const diffTime = this.actualEndTime - this.actualStartTime;
  return Math.round(diffTime / (1000 * 60)); // in minutes
});

// Virtual for status color (for UI)
viewingSchema.virtual('statusColor').get(function() {
  const colors = {
    scheduled: 'blue',
    confirmed: 'green',
    in_progress: 'orange',
    completed: 'success',
    no_show: 'error',
    cancelled: 'grey',
    rescheduled: 'warning'
  };
  return colors[this.status] || 'default';
});

// Pre-save middleware to validate scheduling conflicts
viewingSchema.pre('save', async function(next) {
  if (this.isModified('scheduledDate') || this.isModified('scheduledTime')) {
    const scheduledDateTime = this.scheduledDateTime;
    const endTime = new Date(scheduledDateTime.getTime() + (this.duration * 60 * 1000));
    
    // Check for conflicts with other viewings for the same property
    const conflictingViewings = await this.constructor.find({
      _id: { $ne: this._id },
      propertyId: this.propertyId,
      status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
      isActive: true,
      $or: [
        {
          // New viewing starts during existing viewing
          scheduledDate: {
            $lte: scheduledDateTime,
            $gte: new Date(scheduledDateTime.getTime() - (240 * 60 * 1000)) // 4 hours buffer
          }
        },
        {
          // New viewing ends during existing viewing
          scheduledDate: {
            $lte: endTime,
            $gte: scheduledDateTime
          }
        }
      ]
    });
    
    if (conflictingViewings.length > 0) {
      const error = new Error('Viewing time conflicts with existing appointment');
      error.name = 'ValidationError';
      return next(error);
    }
  }
  next();
});

// Static method for searching viewings
viewingSchema.statics.searchViewings = function(filters = {}) {
  const {
    search,
    status,
    priority,
    type,
    propertyId,
    clientId,
    dateFrom,
    dateTo,
    isActive = true,
    sort = 'scheduledDate',
    page = 1,
    limit = 20
  } = filters;

  const query = { isActive };
  
  // Status filter
  if (status) {
    if (Array.isArray(status)) {
      query.status = { $in: status };
    } else {
      query.status = status;
    }
  }
  
  // Priority filter
  if (priority) {
    query.priority = priority;
  }
  
  // Type filter
  if (type) {
    query.type = type;
  }
  
  // Property filter
  if (propertyId) {
    query.propertyId = propertyId;
  }
  
  // Client filter
  if (clientId) {
    query.clientId = clientId;
  }
  
  // Date range filter
  if (dateFrom || dateTo) {
    query.scheduledDate = {};
    if (dateFrom) query.scheduledDate.$gte = new Date(dateFrom);
    if (dateTo) query.scheduledDate.$lte = new Date(dateTo);
  }
  
  const skip = (page - 1) * limit;
  
  return this.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('propertyId', 'title location.address location.city price type')
    .populate('clientId', 'name email phone');
};

// Static method for getting today's viewings
viewingSchema.statics.getTodayViewings = function() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.find({
    scheduledDate: {
      $gte: today,
      $lt: tomorrow
    },
    status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
    isActive: true
  })
  .sort('scheduledTime.hour scheduledTime.minute')
  .populate('propertyId', 'title location.address location.city')
  .populate('clientId', 'name email phone');
};

// Static method for getting upcoming viewings
viewingSchema.statics.getUpcomingViewings = function(days = 7) {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    scheduledDate: {
      $gte: today,
      $lte: futureDate
    },
    status: { $in: ['scheduled', 'confirmed'] },
    isActive: true
  })
  .sort('scheduledDate scheduledTime.hour scheduledTime.minute')
  .populate('propertyId', 'title location.address location.city')
  .populate('clientId', 'name email phone');
};

// Static method for getting viewing statistics
viewingSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgDuration: { $avg: '$duration' }
      }
    }
  ]);
};

// Instance method to add agent note
viewingSchema.methods.addAgentNote = function(noteText, noteType = 'general') {
  this.agentNotes.push({
    note: noteText,
    type: noteType,
    createdAt: new Date()
  });
  return this.save();
};

// Instance method to update status
viewingSchema.methods.updateStatus = function(newStatus, notes = null) {
  this.status = newStatus;
  
  if (newStatus === 'in_progress') {
    this.actualStartTime = new Date();
  } else if (newStatus === 'completed') {
    this.actualEndTime = new Date();
  }
  
  if (notes) {
    this.addAgentNote(notes, 'follow_up');
  }
  
  return this.save();
};

// Instance method to reschedule
viewingSchema.methods.reschedule = function(newDate, newTime) {
  this.scheduledDate = newDate;
  this.scheduledTime = newTime;
  this.status = 'rescheduled';
  this.addAgentNote('Viewing rescheduled', 'general');
  return this.save();
};

module.exports = mongoose.model('Viewing', viewingSchema); 