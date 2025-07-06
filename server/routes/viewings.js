const express = require('express');
const router = express.Router();
const Viewing = require('../models/Viewing');
const Property = require('../models/Property');
const Client = require('../models/Client');

// @desc    Get all viewings with search and filtering
// @route   GET /api/viewings
// @access  Private (Agent)
router.get('/', async (req, res) => {
  try {
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
    } = req.query;

    // Build filter object
    const filters = {
      search,
      status: status ? status.split(',') : undefined,
      priority,
      type,
      propertyId,
      clientId,
      dateFrom,
      dateTo,
      isActive: isActive === 'true',
      sort,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    // Get viewings using static method
    const viewings = await Viewing.searchViewings(filters);
    
    // Get total count for pagination
    const totalQuery = Viewing.find({ isActive: isActive === 'true' });
    if (status) totalQuery.where({ status: { $in: status.split(',') } });
    if (priority) totalQuery.where({ priority });
    if (type) totalQuery.where({ type });
    if (propertyId) totalQuery.where({ propertyId });
    if (clientId) totalQuery.where({ clientId });
    if (dateFrom || dateTo) {
      const dateFilter = {};
      if (dateFrom) dateFilter.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.$lte = new Date(dateTo);
      totalQuery.where({ scheduledDate: dateFilter });
    }

    const total = await totalQuery.countDocuments();
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: viewings,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalViewings: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      },
      filters: filters
    });
  } catch (error) {
    console.error('Error fetching viewings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching viewings',
      error: error.message
    });
  }
});

// @desc    Get single viewing
// @route   GET /api/viewings/:id
// @access  Private (Agent)
router.get('/:id', async (req, res) => {
  try {
    const viewing = await Viewing.findById(req.params.id)
      .populate('propertyId', 'title location.address location.city price type images')
      .populate('clientId', 'name email phone message requirements');
    
    if (!viewing) {
      return res.status(404).json({
        success: false,
        message: 'Viewing not found'
      });
    }

    res.json({
      success: true,
      data: viewing
    });
  } catch (error) {
    console.error('Error fetching viewing:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching viewing',
      error: error.message
    });
  }
});

// @desc    Create new viewing
// @route   POST /api/viewings
// @access  Private (Agent)
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

    // Validate client exists
    const client = await Client.findById(req.body.clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const viewing = new Viewing(req.body);
    await viewing.save();

    // Populate property and client details for response
    await viewing.populate([
      { path: 'propertyId', select: 'title location.address location.city price type' },
      { path: 'clientId', select: 'name email phone' }
    ]);

    // Update client status to scheduled if it was new
    if (client.status === 'new') {
      client.status = 'scheduled';
      await client.save();
    }

    res.status(201).json({
      success: true,
      data: viewing,
      message: 'Viewing scheduled successfully'
    });
  } catch (error) {
    console.error('Error creating viewing:', error);
    res.status(400).json({
      success: false,
      message: 'Error scheduling viewing',
      error: error.message
    });
  }
});

// @desc    Update viewing
// @route   PUT /api/viewings/:id
// @access  Private (Agent)
router.put('/:id', async (req, res) => {
  try {
    const viewing = await Viewing.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate([
      { path: 'propertyId', select: 'title location.address location.city price type' },
      { path: 'clientId', select: 'name email phone' }
    ]);

    if (!viewing) {
      return res.status(404).json({
        success: false,
        message: 'Viewing not found'
      });
    }

    res.json({
      success: true,
      data: viewing,
      message: 'Viewing updated successfully'
    });
  } catch (error) {
    console.error('Error updating viewing:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating viewing',
      error: error.message
    });
  }
});

// @desc    Delete viewing
// @route   DELETE /api/viewings/:id
// @access  Private (Agent)
router.delete('/:id', async (req, res) => {
  try {
    const viewing = await Viewing.findByIdAndDelete(req.params.id);

    if (!viewing) {
      return res.status(404).json({
        success: false,
        message: 'Viewing not found'
      });
    }

    res.json({
      success: true,
      message: 'Viewing deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting viewing:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting viewing',
      error: error.message
    });
  }
});

// @desc    Update viewing status
// @route   PATCH /api/viewings/:id/status
// @access  Private (Agent)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const viewing = await Viewing.findById(req.params.id);
    
    if (!viewing) {
      return res.status(404).json({
        success: false,
        message: 'Viewing not found'
      });
    }

    await viewing.updateStatus(status, notes);
    
    // Populate and return updated viewing
    await viewing.populate([
      { path: 'propertyId', select: 'title location.address location.city price type' },
      { path: 'clientId', select: 'name email phone' }
    ]);

    res.json({
      success: true,
      data: viewing,
      message: 'Viewing status updated successfully'
    });
  } catch (error) {
    console.error('Error updating viewing status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating viewing status',
      error: error.message
    });
  }
});

// @desc    Reschedule viewing
// @route   PATCH /api/viewings/:id/reschedule
// @access  Private (Agent)
router.patch('/:id/reschedule', async (req, res) => {
  try {
    const { scheduledDate, scheduledTime } = req.body;
    
    if (!scheduledDate || !scheduledTime) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled date and time are required'
      });
    }

    const viewing = await Viewing.findById(req.params.id);
    
    if (!viewing) {
      return res.status(404).json({
        success: false,
        message: 'Viewing not found'
      });
    }

    await viewing.reschedule(new Date(scheduledDate), scheduledTime);
    
    // Populate and return updated viewing
    await viewing.populate([
      { path: 'propertyId', select: 'title location.address location.city price type' },
      { path: 'clientId', select: 'name email phone' }
    ]);

    res.json({
      success: true,
      data: viewing,
      message: 'Viewing rescheduled successfully'
    });
  } catch (error) {
    console.error('Error rescheduling viewing:', error);
    res.status(500).json({
      success: false,
      message: 'Error rescheduling viewing',
      error: error.message
    });
  }
});

// @desc    Add agent note to viewing
// @route   POST /api/viewings/:id/notes
// @access  Private (Agent)
router.post('/:id/notes', async (req, res) => {
  try {
    const { note, type = 'general' } = req.body;
    
    if (!note) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required'
      });
    }

    const viewing = await Viewing.findById(req.params.id);
    
    if (!viewing) {
      return res.status(404).json({
        success: false,
        message: 'Viewing not found'
      });
    }

    await viewing.addAgentNote(note, type);
    
    // Populate and return updated viewing
    await viewing.populate([
      { path: 'propertyId', select: 'title location.address location.city price type' },
      { path: 'clientId', select: 'name email phone' }
    ]);

    res.json({
      success: true,
      data: viewing,
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

// @desc    Get today's viewings
// @route   GET /api/viewings/today
// @access  Private (Agent)
router.get('/today/list', async (req, res) => {
  try {
    const viewings = await Viewing.getTodayViewings();

    res.json({
      success: true,
      data: viewings
    });
  } catch (error) {
    console.error('Error fetching today viewings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching today\'s viewings',
      error: error.message
    });
  }
});

// @desc    Get upcoming viewings
// @route   GET /api/viewings/upcoming
// @access  Private (Agent)
router.get('/upcoming/list', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const viewings = await Viewing.getUpcomingViewings(days);

    res.json({
      success: true,
      data: viewings
    });
  } catch (error) {
    console.error('Error fetching upcoming viewings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming viewings',
      error: error.message
    });
  }
});

// @desc    Get viewing statistics
// @route   GET /api/viewings/stats
// @access  Private (Agent)
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Viewing.getStats();
    
    // Get additional metrics
    const totalViewings = await Viewing.countDocuments({ isActive: true });
    const todayViewings = await Viewing.countDocuments({
      scheduledDate: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999))
      },
      isActive: true
    });
    const upcomingViewings = await Viewing.countDocuments({
      scheduledDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] },
      isActive: true
    });
    const completedViewings = await Viewing.countDocuments({
      status: 'completed',
      isActive: true
    });

    res.json({
      success: true,
      data: {
        total: totalViewings,
        today: todayViewings,
        upcoming: upcomingViewings,
        completed: completedViewings,
        statusBreakdown: stats
      }
    });
  } catch (error) {
    console.error('Error fetching viewing stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching viewing statistics',
      error: error.message
    });
  }
});

// @desc    Get viewings by property
// @route   GET /api/viewings/property/:propertyId
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

    const viewings = await Viewing.find(query)
      .sort('-scheduledDate')
      .limit(parseInt(limit))
      .populate('clientId', 'name email phone')
      .populate('propertyId', 'title location.address location.city price type');

    res.json({
      success: true,
      data: viewings
    });
  } catch (error) {
    console.error('Error fetching viewings by property:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching viewings for property',
      error: error.message
    });
  }
});

// @desc    Get viewings by client
// @route   GET /api/viewings/client/:clientId
// @access  Private (Agent)
router.get('/client/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const { status, limit = 10 } = req.query;

    const query = { 
      clientId, 
      isActive: true 
    };
    
    if (status) {
      query.status = status;
    }

    const viewings = await Viewing.find(query)
      .sort('-scheduledDate')
      .limit(parseInt(limit))
      .populate('propertyId', 'title location.address location.city price type')
      .populate('clientId', 'name email phone');

    res.json({
      success: true,
      data: viewings
    });
  } catch (error) {
    console.error('Error fetching viewings by client:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching viewings for client',
      error: error.message
    });
  }
});

// @desc    Check viewing availability
// @route   POST /api/viewings/availability
// @access  Private (Agent)
router.post('/availability', async (req, res) => {
  try {
    const { propertyId, scheduledDate, scheduledTime, duration = 60 } = req.body;
    
    if (!propertyId || !scheduledDate || !scheduledTime) {
      return res.status(400).json({
        success: false,
        message: 'Property ID, scheduled date, and time are required'
      });
    }

    const date = new Date(scheduledDate);
    date.setHours(scheduledTime.hour, scheduledTime.minute, 0, 0);
    const endTime = new Date(date.getTime() + (duration * 60 * 1000));

    // Check for conflicts
    const conflictingViewings = await Viewing.find({
      propertyId,
      status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
      isActive: true,
      scheduledDate: {
        $gte: new Date(date.getTime() - (duration * 60 * 1000)),
        $lte: endTime
      }
    });

    const isAvailable = conflictingViewings.length === 0;

    res.json({
      success: true,
      data: {
        available: isAvailable,
        conflicts: conflictingViewings.length,
        suggestedTimes: isAvailable ? [] : await getSuggestedTimes(propertyId, scheduledDate)
      }
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking viewing availability',
      error: error.message
    });
  }
});

// Helper function to get suggested times
const getSuggestedTimes = async (propertyId, date) => {
  const suggestedTimes = [];
  const baseDate = new Date(date);
  
  // Generate time slots from 9 AM to 6 PM
  for (let hour = 9; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeSlot = new Date(baseDate);
      timeSlot.setHours(hour, minute, 0, 0);
      
      // Check if this time slot is available
      const conflicts = await Viewing.find({
        propertyId,
        status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
        isActive: true,
        scheduledDate: {
          $gte: new Date(timeSlot.getTime() - (60 * 60 * 1000)), // 1 hour buffer
          $lte: new Date(timeSlot.getTime() + (60 * 60 * 1000))
        }
      });
      
      if (conflicts.length === 0) {
        suggestedTimes.push({
          hour,
          minute,
          formatted: timeSlot.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })
        });
      }
      
      // Limit to 5 suggestions
      if (suggestedTimes.length >= 5) break;
    }
    if (suggestedTimes.length >= 5) break;
  }
  
  return suggestedTimes;
};

// @desc    Cancel viewing
// @route   PATCH /api/viewings/:id/cancel
// @access  Private (Agent)
router.patch('/:id/cancel', async (req, res) => {
  try {
    const { reason } = req.body;
    
    const viewing = await Viewing.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'cancelled',
        $push: {
          agentNotes: {
            note: `Viewing cancelled. Reason: ${reason || 'No reason provided'}`,
            type: 'general',
            createdAt: new Date()
          }
        }
      },
      { new: true }
    ).populate([
      { path: 'propertyId', select: 'title location.address location.city price type' },
      { path: 'clientId', select: 'name email phone' }
    ]);

    if (!viewing) {
      return res.status(404).json({
        success: false,
        message: 'Viewing not found'
      });
    }

    res.json({
      success: true,
      data: viewing,
      message: 'Viewing cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling viewing:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling viewing',
      error: error.message
    });
  }
});

module.exports = router; 