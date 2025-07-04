const express = require('express');
const User = require('../models/User');
const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Public (for demo purposes)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching users',
      error: error.message 
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching user',
      error: error.message 
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (should be protected)
router.put('/:id', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating user',
      error: error.message 
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (should be protected)
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting user',
      error: error.message 
    });
  }
});

module.exports = router;
