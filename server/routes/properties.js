const express = require('express');
const router = express.Router();
const Property = require('../models/Property');

// @desc    Get all properties with search and filtering
// @route   GET /api/properties
// @access  Public
router.get('/', async (req, res) => {
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

    // Get properties using static method
    const properties = await Property.searchProperties(filters);
    
    // Get total count for pagination
    const totalQuery = Property.find();
    if (search) totalQuery.where({ $text: { $search: search } });
    if (type) totalQuery.where({ type });
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
      totalQuery.where({ price: priceFilter });
    }
    if (city) totalQuery.where({ 'location.city': new RegExp(city, 'i') });
    if (state) totalQuery.where({ 'location.state': new RegExp(state, 'i') });
    if (minBedrooms || maxBedrooms) {
      const bedroomFilter = {};
      if (minBedrooms) bedroomFilter.$gte = parseInt(minBedrooms);
      if (maxBedrooms) bedroomFilter.$lte = parseInt(maxBedrooms);
      totalQuery.where({ bedrooms: bedroomFilter });
    }
    if (minBathrooms || maxBathrooms) {
      const bathroomFilter = {};
      if (minBathrooms) bathroomFilter.$gte = parseInt(minBathrooms);
      if (maxBathrooms) bathroomFilter.$lte = parseInt(maxBathrooms);
      totalQuery.where({ bathrooms: bathroomFilter });
    }
    if (minArea || maxArea) {
      const areaFilter = {};
      if (minArea) areaFilter.$gte = parseFloat(minArea);
      if (maxArea) areaFilter.$lte = parseFloat(maxArea);
      totalQuery.where({ area: areaFilter });
    }
    if (amenities) totalQuery.where({ amenities: { $in: amenities.split(',') } });
    if (featured !== undefined) totalQuery.where({ featured: featured === 'true' });
    totalQuery.where({ status });

    const total = await totalQuery.countDocuments();
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
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Property.getStats();
    
    // Get additional metrics
    const totalProperties = await Property.countDocuments();
    const activeProperties = await Property.countDocuments({ status: 'active' });
    const featuredProperties = await Property.countDocuments({ featured: true });
    const avgPrice = await Property.aggregate([
      { $group: { _id: null, avgPrice: { $avg: '$price' } } }
    ]);

    res.json({
      success: true,
      data: {
        total: totalProperties,
        active: activeProperties,
        featured: featuredProperties,
        averagePrice: avgPrice[0]?.avgPrice || 0,
        statusBreakdown: stats
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
    
    // Find similar properties based on type, location, and price range
    const priceRange = property.price * 0.3; // 30% price range
    
    const similarProperties = await Property.find({
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
router.post('/', async (req, res) => {
  try {
    const property = new Property(req.body);
    await property.save();

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
router.put('/:id', async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
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
router.delete('/:id', async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

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