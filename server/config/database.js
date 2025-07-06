const mongoose = require('mongoose');

// Import models to ensure indexes are created
const Property = require('../models/Property');
const Client = require('../models/Client');
const Viewing = require('../models/Viewing');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/proptrack';
    
    // MongoDB connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI, options);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Create indexes for performance optimization
    await createIndexes();
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔄 MongoDB connection closed through app termination');
      process.exit(0);
    });
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Create database indexes for optimal performance
const createIndexes = async () => {
  try {
    console.log('🔍 Creating database indexes...');
    
    // Property indexes
    await Property.createIndexes();
    console.log('✅ Property indexes created');
    
    // Client indexes
    await Client.createIndexes();
    console.log('✅ Client indexes created');
    
    // Viewing indexes
    await Viewing.createIndexes();
    console.log('✅ Viewing indexes created');
    
    // Additional compound indexes for complex queries
    await createCompoundIndexes();
    
    console.log('🎯 All database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  }
};

// Create additional compound indexes for complex queries
const createCompoundIndexes = async () => {
  try {
    // Property search performance indexes
    await Property.collection.createIndex(
      { 
        'location.city': 1, 
        'location.state': 1, 
        type: 1, 
        status: 1, 
        price: 1 
      },
      { name: 'location_type_status_price_idx' }
    );
    
    await Property.collection.createIndex(
      { 
        bedrooms: 1, 
        bathrooms: 1, 
        type: 1, 
        status: 1, 
        price: 1 
      },
      { name: 'rooms_type_status_price_idx' }
    );
    
    // Client inquiry performance indexes
    await Client.collection.createIndex(
      { 
        propertyId: 1, 
        status: 1, 
        priority: 1, 
        createdAt: -1 
      },
      { name: 'property_status_priority_date_idx' }
    );
    
    // Viewing scheduling performance indexes
    await Viewing.collection.createIndex(
      { 
        scheduledDate: 1, 
        'scheduledTime.hour': 1, 
        'scheduledTime.minute': 1, 
        status: 1 
      },
      { name: 'scheduled_datetime_status_idx' }
    );
    
    await Viewing.collection.createIndex(
      { 
        propertyId: 1, 
        clientId: 1, 
        scheduledDate: 1, 
        status: 1 
      },
      { name: 'property_client_date_status_idx' }
    );
    
    console.log('✅ Compound indexes created');
  } catch (error) {
    console.error('❌ Error creating compound indexes:', error.message);
  }
};

// Get database statistics
const getDatabaseStats = async () => {
  try {
    const stats = await mongoose.connection.db.stats();
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    const propertyCount = await Property.countDocuments();
    const clientCount = await Client.countDocuments();
    const viewingCount = await Viewing.countDocuments();
    
    return {
      database: {
        name: mongoose.connection.name,
        collections: collections.length,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize
      },
      collections: {
        properties: propertyCount,
        clients: clientCount,
        viewings: viewingCount
      }
    };
  } catch (error) {
    console.error('❌ Error getting database stats:', error.message);
    return null;
  }
};

// Drop all indexes (for development/testing)
const dropAllIndexes = async () => {
  try {
    console.log('🗑️  Dropping all indexes...');
    
    await Property.collection.dropIndexes();
    await Client.collection.dropIndexes();
    await Viewing.collection.dropIndexes();
    
    console.log('✅ All indexes dropped');
  } catch (error) {
    console.error('❌ Error dropping indexes:', error.message);
  }
};

// Rebuild all indexes
const rebuildIndexes = async () => {
  try {
    console.log('🔄 Rebuilding all indexes...');
    
    await dropAllIndexes();
    await createIndexes();
    
    console.log('✅ All indexes rebuilt');
  } catch (error) {
    console.error('❌ Error rebuilding indexes:', error.message);
  }
};

// Health check function
const healthCheck = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return {
      status: states[state],
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      database: mongoose.connection.name,
      healthy: state === 1
    };
  } catch (error) {
    return {
      status: 'error',
      healthy: false,
      error: error.message
    };
  }
};

module.exports = {
  connectDB,
  createIndexes,
  createCompoundIndexes,
  getDatabaseStats,
  dropAllIndexes,
  rebuildIndexes,
  healthCheck
}; 