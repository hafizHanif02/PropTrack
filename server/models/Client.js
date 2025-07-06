const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  message: {
    type: String,
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  inquiryType: {
    type: String,
    enum: ['buy', 'rent', 'viewing', 'information', 'offer', 'general', 'purchase', 'investment', 'consultation', 'evaluation'],
    default: 'viewing'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'viewing_scheduled', 'interested', 'not_interested', 'closed', 'qualified', 'offer_made', 'negotiating', 'lost'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  preferredContactMethod: {
    type: String,
    enum: ['email', 'phone', 'both'],
    default: 'both'
  },
  preferredContactTime: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'anytime'],
    default: 'anytime'
  },
  budget: {
    min: {
      type: Number,
      min: [0, 'Budget cannot be negative']
    },
    max: {
      type: Number,
      min: [0, 'Budget cannot be negative']
    }
  },
  preferences: {
    propertyType: [{
      type: String,
      enum: ['house', 'apartment', 'condo', 'townhouse', 'villa', 'studio', 'penthouse', 'duplex', 'compound', 'warehouse', 'office', 'retail', 'land']
    }],
    bedrooms: {
      min: {
        type: Number,
        min: [0, 'Bedrooms cannot be negative']
      },
      max: {
        type: Number,
        min: [0, 'Bedrooms cannot be negative']
      }
    },
    bathrooms: {
      min: {
        type: Number,
        min: [0, 'Bathrooms cannot be negative']
      },
      max: {
        type: Number,
        min: [0, 'Bathrooms cannot be negative']
      }
    },
    area: {
      min: {
        type: Number,
        min: [1, 'Area must be at least 1 square foot']
      },
      max: {
        type: Number,
        min: [1, 'Area must be at least 1 square foot']
      }
    },
    amenities: [{
      type: String,
      trim: true
    }],
    location: [{
      type: String,
      trim: true
    }]
  },
  notes: [{
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    important: {
      type: Boolean,
      default: false
    }
  }],
  source: {
    type: String,
    enum: ['website', 'referral', 'social_media', 'advertisement', 'walk_in', 'phone_call', 'other'],
    default: 'website'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastContactedAt: {
    type: Date
  },
  nextFollowUpAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
clientSchema.index({ email: 1 });
clientSchema.index({ phone: 1 });
clientSchema.index({ property: 1 });
clientSchema.index({ status: 1, priority: -1 });
clientSchema.index({ createdAt: -1 });
clientSchema.index({ nextFollowUpAt: 1 });
clientSchema.index({ 
  name: 'text', 
  email: 'text', 
  message: 'text' 
});

// Virtual for full contact info
clientSchema.virtual('fullContact').get(function() {
  return `${this.name} (${this.email}, ${this.phone})`;
});

// Virtual for days since inquiry
clientSchema.virtual('daysSinceInquiry').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for urgency score
clientSchema.virtual('urgencyScore').get(function() {
  let score = 0;
  
  // Priority scoring
  const priorityScores = { low: 1, medium: 2, high: 3, urgent: 4 };
  score += priorityScores[this.priority] || 0;
  
  // Days since inquiry (older inquiries get higher score)
  score += Math.min(this.daysSinceInquiry, 10);
  
  // Status scoring (new inquiries get higher score)
  if (this.status === 'new') score += 5;
  else if (this.status === 'contacted') score += 3;
  
  return score;
});

// Virtual for formatted budget
clientSchema.virtual('formattedBudget').get(function() {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  if (this.budget.min && this.budget.max) {
    return `${formatCurrency(this.budget.min)} - ${formatCurrency(this.budget.max)}`;
  } else if (this.budget.min) {
    return `Above ${formatCurrency(this.budget.min)}`;
  } else if (this.budget.max) {
    return `Below ${formatCurrency(this.budget.max)}`;
  }
  return 'Budget not specified';
});

// Pre-save middleware to update lastContactedAt when status changes
clientSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'new') {
    this.lastContactedAt = new Date();
  }
  next();
});

// Static method for finding urgent clients
clientSchema.statics.findUrgent = function(limit = 10) {
  return this.find({
    $or: [
      { priority: 'urgent' },
      { priority: 'high', status: 'new' },
      { 
        priority: 'high', 
        nextFollowUpAt: { $lte: new Date() }
      }
    ],
    isActive: true
  })
  .sort({ priority: -1, createdAt: 1 })
  .limit(limit)
  .populate('property', 'title location price')
  .exec();
};

// Static method for client statistics
clientSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalClients: { $sum: 1 },
        activeClients: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        newInquiries: {
          $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] }
        },
        urgentClients: {
          $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
        }
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
  
  const priorityStats = await this.aggregate([
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return {
    general: stats[0] || {},
    byStatus: statusStats,
    byPriority: priorityStats
  };
};

module.exports = mongoose.model('Client', clientSchema); 