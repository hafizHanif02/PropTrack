const mongoose = require('mongoose');
const Property = require('../models/Property');
const Client = require('../models/Client');
const Viewing = require('../models/Viewing');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/proptrack');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const sampleProperties = [
  {
    title: 'Luxury Downtown Condo',
    description: 'Beautiful 2-bedroom condo in the heart of downtown with stunning city views. Features modern amenities, hardwood floors, and a spacious balcony.',
    price: 750000,
    type: 'condo',
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    location: {
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      coordinates: [-74.0059, 40.7128]
    },
    amenities: ['Gym', 'Pool', 'Concierge', 'Parking', 'Balcony'],
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'
    ],
    featured: true,
    status: 'active',
    listingType: 'sale'
  },
  {
    title: 'Suburban Family Home',
    description: 'Spacious 4-bedroom family home in quiet suburban neighborhood. Perfect for families with large backyard and modern kitchen.',
    price: 450000,
    type: 'house',
    bedrooms: 4,
    bathrooms: 3,
    area: 2500,
    location: {
      address: '456 Oak Avenue',
      city: 'Westfield',
      state: 'NJ',
      zipCode: '07090',
      coordinates: [-74.3476, 40.6589]
    },
    amenities: ['Garage', 'Garden', 'Fireplace', 'Basement'],
    images: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'
    ],
    featured: true,
    status: 'active',
    listingType: 'sale'
  },
  {
    title: 'Modern Studio Apartment',
    description: 'Stylish studio apartment perfect for young professionals. Recently renovated with modern appliances and great location.',
    price: 2200,
    type: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    area: 600,
    location: {
      address: '789 Broadway',
      city: 'New York',
      state: 'NY',
      zipCode: '10003',
      coordinates: [-73.9876, 40.7589]
    },
    amenities: ['Laundry', 'Air Conditioning', 'Elevator'],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
    ],
    featured: false,
    status: 'active',
    listingType: 'rent'
  },
  {
    title: 'Waterfront Villa',
    description: 'Stunning waterfront villa with private beach access. Luxury living with panoramic ocean views and premium finishes.',
    price: 2500000,
    type: 'villa',
    bedrooms: 5,
    bathrooms: 4,
    area: 4000,
    location: {
      address: '101 Ocean Drive',
      city: 'Miami Beach',
      state: 'FL',
      zipCode: '33139',
      coordinates: [-80.1300, 25.7907]
    },
    amenities: ['Private Beach', 'Pool', 'Spa', 'Wine Cellar', 'Boat Dock'],
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'
    ],
    featured: true,
    status: 'active',
    listingType: 'sale'
  },
  {
    title: 'Cozy Townhouse',
    description: 'Charming 3-bedroom townhouse in family-friendly neighborhood. Move-in ready with updated kitchen and bathrooms.',
    price: 3500,
    type: 'townhouse',
    bedrooms: 3,
    bathrooms: 2,
    area: 1800,
    location: {
      address: '234 Pine Street',
      city: 'Boston',
      state: 'MA',
      zipCode: '02101',
      coordinates: [-71.0589, 42.3601]
    },
    amenities: ['Parking', 'Patio', 'Storage'],
    images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800'
    ],
    featured: false,
    status: 'active',
    listingType: 'rent'
  }
];

const sampleClients = [
  {
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    inquiryType: 'buy',
    budget: { min: 400000, max: 800000 },
    preferences: {
      propertyType: ['house', 'condo'],
      bedrooms: { min: 2, max: 4 },
      bathrooms: { min: 2 },
      location: ['New York', 'New Jersey']
    },
    status: 'new',
    priority: 'high',
    notes: [
      {
        content: 'Looking for family home with good schools nearby',
        timestamp: new Date()
      }
    ]
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1-555-0456',
    inquiryType: 'rent',
    budget: { min: 2000, max: 3000 },
    preferences: {
      propertyType: ['apartment', 'condo'],
      bedrooms: { min: 1, max: 2 },
      bathrooms: { min: 1 },
      location: ['New York']
    },
    status: 'contacted',
    priority: 'medium',
    notes: [
      {
        content: 'Young professional, prefers modern amenities',
        timestamp: new Date()
      }
    ]
  },
  {
    name: 'Michael Davis',
    email: 'michael.davis@email.com',
    phone: '+1-555-0789',
    inquiryType: 'buy',
    budget: { min: 1000000, max: 3000000 },
    preferences: {
      propertyType: ['villa', 'house'],
      bedrooms: { min: 4 },
      bathrooms: { min: 3 },
      location: ['Miami', 'Florida']
    },
    status: 'viewing_scheduled',
    priority: 'high',
    notes: [
      {
        content: 'High-end buyer, interested in luxury properties',
        timestamp: new Date()
      }
    ]
  },
  {
    name: 'Emily Wilson',
    email: 'emily.wilson@email.com',
    phone: '+1-555-0321',
    inquiryType: 'rent',
    budget: { min: 3000, max: 4000 },
    preferences: {
      propertyType: ['townhouse', 'house'],
      bedrooms: { min: 3 },
      bathrooms: { min: 2 },
      location: ['Boston']
    },
    status: 'interested',
    priority: 'medium',
    notes: [
      {
        content: 'Family with two children, needs good school district',
        timestamp: new Date()
      }
    ]
  },
  {
    name: 'David Brown',
    email: 'david.brown@email.com',
    phone: '+1-555-0654',
    inquiryType: 'buy',
    budget: { min: 600000, max: 1200000 },
    preferences: {
      propertyType: ['condo', 'apartment'],
      bedrooms: { min: 2, max: 3 },
      bathrooms: { min: 2 },
      location: ['New York']
    },
    status: 'new',
    priority: 'high',
    notes: [
      {
        content: 'First-time buyer, needs guidance through process',
        timestamp: new Date()
      }
    ]
  }
];

const seedData = async () => {
  try {
    // Clear existing data
    await Property.deleteMany({});
    await Client.deleteMany({});
    await Viewing.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Insert sample properties
    const properties = await Property.insertMany(sampleProperties);
    console.log(`Inserted ${properties.length} properties`);
    
    // Insert sample clients
    const clients = await Client.insertMany(sampleClients);
    console.log(`Inserted ${clients.length} clients`);
    
    // Create sample viewings
    const sampleViewings = [
      {
        property: properties[0]._id,
        client: clients[0]._id,
        scheduledDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        duration: 60,
        status: 'confirmed',
        notes: 'First viewing for luxury condo'
      },
      {
        property: properties[1]._id,
        client: clients[0]._id,
        scheduledDateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        duration: 90,
        status: 'confirmed',
        notes: 'Family home viewing'
      },
      {
        property: properties[3]._id,
        client: clients[2]._id,
        scheduledDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        duration: 120,
        status: 'confirmed',
        notes: 'Luxury villa viewing'
      },
      {
        property: properties[4]._id,
        client: clients[3]._id,
        scheduledDateTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now (today)
        duration: 60,
        status: 'confirmed',
        notes: 'Townhouse viewing for family'
      },
      {
        property: properties[2]._id,
        client: clients[1]._id,
        scheduledDateTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now (today)
        duration: 45,
        status: 'pending',
        notes: 'Studio apartment viewing'
      }
    ];
    
    const viewings = await Viewing.insertMany(sampleViewings);
    console.log(`Inserted ${viewings.length} viewings`);
    
    console.log('Sample data seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seed function
connectDB().then(() => {
  seedData();
});

module.exports = { seedData }; 