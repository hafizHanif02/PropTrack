require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('../models/Property');
const Client = require('../models/Client');
const Viewing = require('../models/Viewing');
const User = require('../models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/proptrack');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🗑️  Clearing all data from database...');
    
    await Property.deleteMany({});
    console.log('✅ Cleared all properties');
    
    await Client.deleteMany({});
    console.log('✅ Cleared all clients');
    
    await Viewing.deleteMany({});
    console.log('✅ Cleared all viewings');
    
    await User.deleteMany({});
    console.log('✅ Cleared all users');
    
    console.log('\n🎉 Database cleared successfully!');
    console.log('💡 Run "npm run seed" to populate with sample data');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
};

// Run the clear script
if (require.main === module) {
  clearDatabase();
}

module.exports = { clearDatabase }; 