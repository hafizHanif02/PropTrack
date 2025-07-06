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
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  message: {
    type: String,
    required: [true, 'Inquiry message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property reference is required']
  },
  inquiryType: {
    type: String,
    enum: ['viewing', 'information', 'offer', 'general'],
    default: 'viewing'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'scheduled', 'completed', 'closed'],
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
  requirements: {
    bedrooms: {
      type: Number,
      min: [0, 'Bedrooms cannot be negative']
    },
    bathrooms: {
      type: Number,
      min: [0, 'Bathrooms cannot be negative']
    },
    area: {
      type: Number,
      min: [1, 'Area must be at least 1 square foot']
    },
    amenities: [{
      type: String,
      trim: true
    }],
    location: {
      type: String,
      trim: true
    }
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
    important: {
      type: Boolean,
      default: false
    }
  }],
  source: {
    type: String,
    enum: ['website', 'referral', 'social_media', 'advertisement', 'walk_in', 'other'],
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
clientSchema.index({ propertyId: 1 });
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

// Virtual for budget range string
clientSchema.virtual('budgetRange').get(function() {
  if (!this.budget || (!this.budget.min && !this.budget.max)) {
    return 'Not specified';
  }
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  if (this.budget.min && this.budget.max) {
    return `${formatCurrency(this.budget.min)} - ${formatCurrency(this.budget.max)}`;
  } else if (this.budget.min) {
    return `Above ${formatCurrency(this.budget.min)}`;
  } else if (this.budget.max) {
    return `Below ${formatCurrency(this.budget.max)}`;
  }
});

// Pre-save middleware to update lastContactedAt when status changes
clientSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'new') {
    this.lastContactedAt = new Date();
  }
  next();
});

// Static method for searching clients
clientSchema.statics.searchClients = function(filters = {}) {
  const {
    search,
    status,
    priority,
    inquiryType,
    propertyId,
    source,
    isActive = true,
    sort = '-createdAt',
    page = 1,
    limit = 20
  } = filters;

  const query = { isActive };
  
  // Text search
  if (search) {
    query.$text = { $search: search };
  }
  
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
    if (Array.isArray(priority)) {
      query.priority = { $in: priority };
    } else {
      query.priority = priority;
    }
  }
  
  // Inquiry type filter
  if (inquiryType) {
    query.inquiryType = inquiryType;
  }
  
  // Property filter
  if (propertyId) {
    query.propertyId = propertyId;
  }
  
  // Source filter
  if (source) {
    query.source = source;
  }
  
  const skip = (page - 1) * limit;
  
  return this.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('propertyId', 'title location.address location.city price type');
};

// Static method for getting client statistics
clientSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgDaysSinceInquiry: { 
          $avg: { 
            $divide: [
              { $subtract: [new Date(), '$createdAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      }
    }
  ]);
};

// Static method for getting follow-up reminders
clientSchema.statics.getFollowUpReminders = function() {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  return this.find({
    nextFollowUpAt: { $lte: today },
    isActive: true,
    status: { $nin: ['completed', 'closed'] }
  })
  .populate('propertyId', 'title location.address location.city')
  .sort('nextFollowUpAt');
};

// Instance method to add agent note
clientSchema.methods.addAgentNote = function(noteText, important = false) {
  this.agentNotes.push({
    note: noteText,
    important: important,
    createdAt: new Date()
  });
  return this.save();
};

// Instance method to set next follow-up
clientSchema.methods.setNextFollowUp = function(date) {
  this.nextFollowUpAt = date;
  return this.save();
};

module.exports = mongoose.model('Client', clientSchema); 