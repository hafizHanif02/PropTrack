const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Property description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Property price is required'],
    min: [0, 'Price cannot be negative']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Property address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required'],
      trim: true
    },
    coordinates: [{
      type: Number
    }]
  },
  type: {
    type: String,
    required: [true, 'Property type is required'],
    enum: ['house', 'apartment', 'condo', 'townhouse', 'villa', 'studio', 'penthouse', 'duplex', 'compound', 'warehouse', 'office', 'retail', 'land'],
    lowercase: true
  },
  listingType: {
    type: String,
    required: [true, 'Listing type is required'],
    enum: ['sale', 'rent'],
    lowercase: true
  },
  bedrooms: {
    type: Number,
    required: [true, 'Number of bedrooms is required'],
    min: [0, 'Bedrooms cannot be negative'],
    max: [20, 'Bedrooms cannot exceed 20']
  },
  bathrooms: {
    type: Number,
    required: [true, 'Number of bathrooms is required'],
    min: [0, 'Bathrooms cannot be negative'],
    max: [20, 'Bathrooms cannot exceed 20']
  },
  area: {
    type: Number,
    required: [true, 'Property area is required'],
    min: [1, 'Area must be at least 1 square foot']
  },
  amenities: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['active', 'archived', 'sold', 'rented', 'pending'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Agent is required']
  },
  agentNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Agent notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance optimization
propertySchema.index({ 'location.city': 1, 'location.state': 1 });
propertySchema.index({ type: 1, status: 1 });
propertySchema.index({ listingType: 1, status: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ bedrooms: 1, bathrooms: 1 });
propertySchema.index({ status: 1, featured: -1, createdAt: -1 });
propertySchema.index({ agent: 1, status: 1 });
propertySchema.index({ 
  title: 'text', 
  description: 'text', 
  'location.address': 'text',
  'location.city': 'text' 
});

// Virtual for formatted price
propertySchema.virtual('formattedPrice').get(function() {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED'
  }).format(this.price);
});

// Virtual for full address
propertySchema.virtual('fullAddress').get(function() {
  return `${this.location.address}, ${this.location.city}, ${this.location.state} ${this.location.zipCode}`;
});

// Virtual for primary image
propertySchema.virtual('primaryImage').get(function() {
  return this.images && this.images.length > 0 ? this.images[0] : null;
});

// Static method for advanced search
propertySchema.statics.searchProperties = function(filters = {}) {
  const {
    search,
    type,
    listingType,
    minPrice,
    maxPrice,
    city,
    state,
    minBedrooms,
    maxBedrooms,
    minBathrooms,
    maxBathrooms,
    minArea,
    maxArea,
    amenities,
    status = 'active',
    featured,
    sort = '-createdAt',
    page = 1,
    limit = 12
  } = filters;

  const query = { status };
  
  // Text search
  if (search) {
    query.$text = { $search: search };
  }
  
  // Property type filter
  if (type) {
    query.type = type;
  }
  
  // Listing type filter
  if (listingType) {
    query.listingType = listingType;
  }
  
  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = minPrice;
    if (maxPrice) query.price.$lte = maxPrice;
  }
  
  // Location filters
  if (city) {
    query['location.city'] = new RegExp(city, 'i');
  }
  if (state) {
    query['location.state'] = new RegExp(state, 'i');
  }
  
  // Bedroom filters
  if (minBedrooms || maxBedrooms) {
    query.bedrooms = {};
    if (minBedrooms) query.bedrooms.$gte = minBedrooms;
    if (maxBedrooms) query.bedrooms.$lte = maxBedrooms;
  }
  
  // Bathroom filters
  if (minBathrooms || maxBathrooms) {
    query.bathrooms = {};
    if (minBathrooms) query.bathrooms.$gte = minBathrooms;
    if (maxBathrooms) query.bathrooms.$lte = maxBathrooms;
  }
  
  // Area filters
  if (minArea || maxArea) {
    query.area = {};
    if (minArea) query.area.$gte = minArea;
    if (maxArea) query.area.$lte = maxArea;
  }
  
  // Amenities filter
  if (amenities && amenities.length > 0) {
    query.amenities = { $in: amenities };
  }
  
  // Featured filter
  if (featured !== undefined) {
    query.featured = featured;
  }
  
  const skip = (page - 1) * limit;
  
  return this.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .exec();
};

// Static method for getting property statistics
propertySchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalProperties: { $sum: 1 },
        averagePrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        totalArea: { $sum: '$area' },
        averageArea: { $avg: '$area' }
      }
    }
  ]);
  
  const typeStats = await this.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        averagePrice: { $avg: '$price' }
      }
    }
  ]);
  
  const listingTypeStats = await this.aggregate([
    {
      $group: {
        _id: '$listingType',
        count: { $sum: 1 },
        averagePrice: { $avg: '$price' }
      }
    }
  ]);
  
  return {
    general: stats[0] || {},
    byType: typeStats,
    byListingType: listingTypeStats
  };
};

module.exports = mongoose.model('Property', propertySchema); 