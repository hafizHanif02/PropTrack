const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const { auth, optionalAuth } = require('../middleware/auth');

// @desc    Get all properties with search and filtering
// @route   GET /api/properties
// @access  Public (but filtered by agent if authenticated)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      search,
      type,
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
    } = req.query;

    // Build filter object
    const filters = {
      search,
      type,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      city,
      state,
      minBedrooms: minBedrooms ? parseInt(minBedrooms) : undefined,
      maxBedrooms: maxBedrooms ? parseInt(maxBedrooms) : undefined,
      minBathrooms: minBathrooms ? parseInt(minBathrooms) : undefined,
      maxBathrooms: maxBathrooms ? parseInt(maxBathrooms) : undefined,
      minArea: minArea ? parseFloat(minArea) : undefined,
      maxArea: maxArea ? parseFloat(maxArea) : undefined,
      amenities: amenities ? amenities.split(',') : undefined,
      status,
      featured: featured ? featured === 'true' : undefined,
      sort,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    // Add agent filter if user is authenticated (for dashboard)
    if (req.user && req.query.agentOnly === 'true') {
      filters.agent = req.user._id;
    }

    // Build query
    const query = { status };
    
    // Agent filter for authenticated users requesting their own properties
    if (filters.agent) {
      query.agent = filters.agent;
    }
    
    // Text search
    if (search) {
      query.$text = { $search: search };
    }
    
    // Property type filter
    if (type) {
      query.type = type;
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
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
      if (minBedrooms) query.bedrooms.$gte = parseInt(minBedrooms);
      if (maxBedrooms) query.bedrooms.$lte = parseInt(maxBedrooms);
    }
    
    // Bathroom filters
    if (minBathrooms || maxBathrooms) {
      query.bathrooms = {};
      if (minBathrooms) query.bathrooms.$gte = parseInt(minBathrooms);
      if (maxBathrooms) query.bathrooms.$lte = parseInt(maxBathrooms);
    }
    
    // Area filters
    if (minArea || maxArea) {
      query.area = {};
      if (minArea) query.area.$gte = parseFloat(minArea);
      if (maxArea) query.area.$lte = parseFloat(maxArea);
    }
    
    // Amenities filter
    if (amenities) {
      query.amenities = { $in: amenities.split(',') };
    }
    
    // Featured filter
    if (featured !== undefined) {
      query.featured = featured === 'true';
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const properties = await Property.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('agent', 'name email')
      .exec();
    
    // Get total count for pagination
    const total = await Property.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: properties,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProperties: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      },
      filters: filters
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching properties',
      error: error.message
    });
  }
});

// @desc    Get property statistics
// @route   GET /api/properties/stats/overview
// @access  Private (Agent)
router.get('/stats/overview', auth, async (req, res) => {
  try {
    // Get stats for the authenticated agent only
    const agentQuery = { agent: req.user._id };
    
    const totalProperties = await Property.countDocuments(agentQuery);
    const activeProperties = await Property.countDocuments({ ...agentQuery, status: 'active' });
    const featuredProperties = await Property.countDocuments({ ...agentQuery, featured: true });
    const avgPrice = await Property.aggregate([
      { $match: agentQuery },
      { $group: { _id: null, avgPrice: { $avg: '$price' } } }
    ]);

    res.json({
      success: true,
      data: {
        total: totalProperties,
        active: activeProperties,
        featured: featuredProperties,
        averagePrice: avgPrice[0]?.avgPrice || 0
      }
    });
  } catch (error) {
    console.error('Error fetching property stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching property statistics',
      error: error.message
    });
  }
});

// @desc    Get featured properties
// @route   GET /api/properties/featured/list
// @access  Public
router.get('/featured/list', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    
    const properties = await Property.find({ 
      featured: true, 
      status: 'active' 
    })
    .sort('-createdAt')
    .limit(limit);

    res.json({
      success: true,
      data: properties
    });
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured properties',
      error: error.message
    });
  }
});

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching property',
      error: error.message
    });
  }
});

// @desc    Get similar properties
// @route   GET /api/properties/:id/similar
// @access  Public
router.get('/:id/similar', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const limit = parseInt(req.query.limit) || 4;
    let similarProperties = [];
    
    // Strategy 1: Find properties with same type, city, and similar price (±50%)
    const priceRange = property.price * 0.5;
    
    similarProperties = await Property.find({
      _id: { $ne: property._id },
      type: property.type,
      'location.city': property.location.city,
      price: {
        $gte: property.price - priceRange,
        $lte: property.price + priceRange
      },
      status: 'active'
    })
    .limit(limit)
    .sort('-createdAt');

    // Strategy 2: If not enough results, try same type and state (wider area)
    if (similarProperties.length < limit) {
      const additionalProperties = await Property.find({
        _id: { 
          $ne: property._id,
          $nin: similarProperties.map(p => p._id)
        },
        type: property.type,
        'location.state': property.location.state,
        status: 'active'
      })
      .limit(limit - similarProperties.length)
      .sort('-createdAt');
      
      similarProperties = [...similarProperties, ...additionalProperties];
    }

    // Strategy 3: If still not enough, try same type anywhere with similar price
    if (similarProperties.length < limit) {
      const moreProperties = await Property.find({
        _id: { 
          $ne: property._id,
          $nin: similarProperties.map(p => p._id)
        },
        type: property.type,
        price: {
          $gte: property.price - priceRange,
          $lte: property.price + priceRange
        },
        status: 'active'
      })
      .limit(limit - similarProperties.length)
      .sort('-createdAt');
      
      similarProperties = [...similarProperties, ...moreProperties];
    }

    // Strategy 4: Last resort - any properties of the same type
    if (similarProperties.length < limit) {
      const fallbackProperties = await Property.find({
        _id: { 
          $ne: property._id,
          $nin: similarProperties.map(p => p._id)
        },
        type: property.type,
        status: 'active'
      })
      .limit(limit - similarProperties.length)
      .sort('-createdAt');
      
      similarProperties = [...similarProperties, ...fallbackProperties];
    }

    res.json({
      success: true,
      data: similarProperties
    });
  } catch (error) {
    console.error('Error fetching similar properties:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching similar properties',
      error: error.message
    });
  }
});

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Agent)
router.post('/', auth, async (req, res) => {
  try {
    const propertyData = {
      ...req.body,
      agent: req.user._id  // Set the agent to the authenticated user
    };
    
    const property = new Property(propertyData);
    await property.save();

    // Populate agent details for response
    await property.populate('agent', 'name email');

    res.status(201).json({
      success: true,
      data: property,
      message: 'Property created successfully'
    });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating property',
      error: error.message
    });
  }
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Agent)
router.put('/:id', auth, async (req, res) => {
  try {
    // First check if the property belongs to the authenticated agent
    const existingProperty = await Property.findOne({ _id: req.params.id, agent: req.user._id });
    
    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        message: 'Property not found or you do not have permission to edit it'
      });
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('agent', 'name email');

    res.json({
      success: true,
      data: property,
      message: 'Property updated successfully'
    });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating property',
      error: error.message
    });
  }
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Agent)
router.delete('/:id', auth, async (req, res) => {
  try {
    // First check if the property belongs to the authenticated agent
    const property = await Property.findOne({ _id: req.params.id, agent: req.user._id });
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found or you do not have permission to delete it'
      });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting property',
      error: error.message
    });
  }
});

// @desc    Archive property
// @route   PATCH /api/properties/:id/archive
// @access  Private (Agent)
router.patch('/:id/archive', async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status: 'archived' },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: property,
      message: 'Property archived successfully'
    });
  } catch (error) {
    console.error('Error archiving property:', error);
    res.status(500).json({
      success: false,
      message: 'Error archiving property',
      error: error.message
    });
  }
});

// @desc    Restore archived property
// @route   PATCH /api/properties/:id/restore
// @access  Private (Agent)
router.patch('/:id/restore', async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: property,
      message: 'Property restored successfully'
    });
  } catch (error) {
    console.error('Error restoring property:', error);
    res.status(500).json({
      success: false,
      message: 'Error restoring property',
      error: error.message
    });
  }
});

// @desc    Toggle featured status
// @route   PATCH /api/properties/:id/featured
// @access  Private (Agent)
router.patch('/:id/featured', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    property.featured = !property.featured;
    await property.save();

    res.json({
      success: true,
      data: property,
      message: `Property ${property.featured ? 'featured' : 'unfeatured'} successfully`
    });
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating featured status',
      error: error.message
    });
  }
});

module.exports = router; 