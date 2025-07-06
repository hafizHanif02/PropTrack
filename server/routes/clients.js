const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Property = require('../models/Property');

// @desc    Get all clients with search and filtering
// @route   GET /api/clients
// @access  Private (Agent)
router.get('/', async (req, res) => {
  try {
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
    } = req.query;

    // Build filter object
    const filters = {
      search,
      status: status ? status.split(',') : undefined,
      priority: priority ? priority.split(',') : undefined,
      inquiryType,
      propertyId,
      source,
      isActive: isActive === 'true',
      sort,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    // Get clients using static method
    const clients = await Client.searchClients(filters);
    
    // Get total count for pagination
    const totalQuery = Client.find({ isActive: isActive === 'true' });
    if (search) totalQuery.where({ $text: { $search: search } });
    if (status) totalQuery.where({ status: { $in: status.split(',') } });
    if (priority) totalQuery.where({ priority: { $in: priority.split(',') } });
    if (inquiryType) totalQuery.where({ inquiryType });
    if (propertyId) totalQuery.where({ propertyId });
    if (source) totalQuery.where({ source });

    const total = await totalQuery.countDocuments();
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: clients,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalClients: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      },
      filters: filters
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching clients',
      error: error.message
    });
  }
});

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Private (Agent)
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('propertyId', 'title location.address location.city price type images');
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching client',
      error: error.message
    });
  }
});

// @desc    Create new client inquiry
// @route   POST /api/clients
// @access  Public (Inquiry form)
router.post('/', async (req, res) => {
  try {
    // Validate property exists
    const property = await Property.findById(req.body.propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const client = new Client(req.body);
    await client.save();

    // Populate property details for response
    await client.populate('propertyId', 'title location.address location.city price type');

    res.status(201).json({
      success: true,
      data: client,
      message: 'Inquiry submitted successfully'
    });
  } catch (error) {
    console.error('Error creating client inquiry:', error);
    res.status(400).json({
      success: false,
      message: 'Error submitting inquiry',
      error: error.message
    });
  }
});

// @desc    Update client information
// @route   PUT /api/clients/:id
// @access  Private (Agent)
router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('propertyId', 'title location.address location.city price type');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: client,
      message: 'Client updated successfully'
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating client',
      error: error.message
    });
  }
});

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private (Agent)
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting client',
      error: error.message
    });
  }
});

// @desc    Update client status
// @route   PATCH /api/clients/:id/status
// @access  Private (Agent)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('propertyId', 'title location.address location.city price type');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: client,
      message: 'Client status updated successfully'
    });
  } catch (error) {
    console.error('Error updating client status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating client status',
      error: error.message
    });
  }
});

// @desc    Update client priority
// @route   PATCH /api/clients/:id/priority
// @access  Private (Agent)
router.patch('/:id/priority', async (req, res) => {
  try {
    const { priority } = req.body;
    
    if (!priority) {
      return res.status(400).json({
        success: false,
        message: 'Priority is required'
      });
    }

    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { priority },
      { new: true }
    ).populate('propertyId', 'title location.address location.city price type');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: client,
      message: 'Client priority updated successfully'
    });
  } catch (error) {
    console.error('Error updating client priority:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating client priority',
      error: error.message
    });
  }
});

// @desc    Add agent note to client
// @route   POST /api/clients/:id/notes
// @access  Private (Agent)
router.post('/:id/notes', async (req, res) => {
  try {
    const { note, important = false } = req.body;
    
    if (!note) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required'
      });
    }

    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    await client.addAgentNote(note, important);
    
    // Populate and return updated client
    await client.populate('propertyId', 'title location.address location.city price type');

    res.json({
      success: true,
      data: client,
      message: 'Note added successfully'
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding note',
      error: error.message
    });
  }
});

// @desc    Set next follow-up date
// @route   PATCH /api/clients/:id/followup
// @access  Private (Agent)
router.patch('/:id/followup', async (req, res) => {
  try {
    const { followUpDate } = req.body;
    
    if (!followUpDate) {
      return res.status(400).json({
        success: false,
        message: 'Follow-up date is required'
      });
    }

    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    await client.setNextFollowUp(new Date(followUpDate));
    
    // Populate and return updated client
    await client.populate('propertyId', 'title location.address location.city price type');

    res.json({
      success: true,
      data: client,
      message: 'Follow-up date set successfully'
    });
  } catch (error) {
    console.error('Error setting follow-up:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting follow-up date',
      error: error.message
    });
  }
});

// @desc    Get client statistics
// @route   GET /api/clients/stats
// @access  Private (Agent)
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Client.getStats();
    
    // Get additional metrics
    const totalClients = await Client.countDocuments({ isActive: true });
    const newInquiries = await Client.countDocuments({ 
      status: 'new', 
      isActive: true 
    });
    const urgentClients = await Client.countDocuments({ 
      priority: 'urgent', 
      isActive: true 
    });
    const todayInquiries = await Client.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999))
      },
      isActive: true
    });

    res.json({
      success: true,
      data: {
        total: totalClients,
        new: newInquiries,
        urgent: urgentClients,
        todayInquiries,
        statusBreakdown: stats
      }
    });
  } catch (error) {
    console.error('Error fetching client stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching client statistics',
      error: error.message
    });
  }
});

// @desc    Get follow-up reminders
// @route   GET /api/clients/followups
// @access  Private (Agent)
router.get('/followups/due', async (req, res) => {
  try {
    const followUps = await Client.getFollowUpReminders();

    res.json({
      success: true,
      data: followUps
    });
  } catch (error) {
    console.error('Error fetching follow-ups:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching follow-up reminders',
      error: error.message
    });
  }
});

// @desc    Get clients by property
// @route   GET /api/clients/property/:propertyId
// @access  Private (Agent)
router.get('/property/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { status, limit = 10 } = req.query;

    const query = { 
      propertyId, 
      isActive: true 
    };
    
    if (status) {
      query.status = status;
    }

    const clients = await Client.find(query)
      .sort('-createdAt')
      .limit(parseInt(limit))
      .populate('propertyId', 'title location.address location.city price type');

    res.json({
      success: true,
      data: clients
    });
  } catch (error) {
    console.error('Error fetching clients by property:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching clients for property',
      error: error.message
    });
  }
});

// @desc    Get urgent clients
// @route   GET /api/clients/urgent
// @access  Private (Agent)
router.get('/urgent/list', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const urgentClients = await Client.find({
      priority: { $in: ['high', 'urgent'] },
      status: { $nin: ['completed', 'closed'] },
      isActive: true
    })
    .sort('-priority -createdAt')
    .limit(limit)
    .populate('propertyId', 'title location.address location.city price type');

    res.json({
      success: true,
      data: urgentClients
    });
  } catch (error) {
    console.error('Error fetching urgent clients:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching urgent clients',
      error: error.message
    });
  }
});

// @desc    Deactivate client
// @route   PATCH /api/clients/:id/deactivate
// @access  Private (Agent)
router.patch('/:id/deactivate', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: client,
      message: 'Client deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating client:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating client',
      error: error.message
    });
  }
});

module.exports = router; 