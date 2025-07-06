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

// UAE Cities and Areas
const uaeCities = [
  { city: 'Dubai', areas: ['Downtown Dubai', 'Dubai Marina', 'Jumeirah', 'Business Bay', 'DIFC', 'Palm Jumeirah', 'Dubai Hills', 'Arabian Ranches', 'Mirdif', 'Deira'] },
  { city: 'Abu Dhabi', areas: ['Corniche', 'Al Reem Island', 'Saadiyat Island', 'Yas Island', 'Al Khalidiyah', 'Al Bateen', 'Masdar City', 'Al Raha Beach', 'Khalifa City', 'Al Reef'] },
  { city: 'Sharjah', areas: ['Al Majaz', 'Al Qasba', 'Al Taawun', 'Al Nahda', 'Muweilah', 'Al Khan', 'Al Qasimia', 'University City', 'Al Suyoh', 'Al Ramtha'] },
  { city: 'Ajman', areas: ['Al Nuaimiya', 'Al Rashidiya', 'Al Jurf', 'Al Hamidiyah', 'Al Rumailah', 'Al Sawan', 'Al Tallah', 'Al Helio', 'Al Mowaihat', 'Al Ameera'] },
  { city: 'Ras Al Khaimah', areas: ['Al Nakheel', 'Al Hamra', 'Al Marjan Island', 'Al Qawasim', 'Al Rams', 'Al Jazirah Al Hamra', 'Khuzam', 'Al Dhait', 'Al Seer', 'Wadi Shah'] },
  { city: 'Fujairah', areas: ['Fujairah City', 'Dibba', 'Kalba', 'Khor Fakkan', 'Al Bithnah', 'Al Hayl', 'Masafi', 'Al Quriyah', 'Al Tawyeen', 'Mirbah'] },
  { city: 'Umm Al Quwain', areas: ['UAQ City', 'Al Salamah', 'Al Ramlah', 'Falaj Al Mualla', 'Al Sinniyah', 'Al Dur', 'Al Khor', 'Al Heera', 'Al Jazirah', 'Al Humraniyah'] }
];

// Sample Users (Agents and Regular Users)
const sampleUsers = [
  // Agents
  { name: 'Ahmed Al Mansouri', email: 'ahmed.mansouri@proptrack.ae', password: 'password123', role: 'admin' },
  { name: 'Fatima Al Zahra', email: 'fatima.zahra@proptrack.ae', password: 'password123', role: 'admin' },
  { name: 'Mohammed Al Rashid', email: 'mohammed.rashid@proptrack.ae', password: 'password123', role: 'admin' },
  { name: 'Aisha Al Maktoum', email: 'aisha.maktoum@proptrack.ae', password: 'password123', role: 'admin' },
  { name: 'Omar Al Nahyan', email: 'omar.nahyan@proptrack.ae', password: 'password123', role: 'admin' },
  { name: 'Layla Al Qasimi', email: 'layla.qasimi@proptrack.ae', password: 'password123', role: 'admin' },
  { name: 'Khalid Al Nuaimi', email: 'khalid.nuaimi@proptrack.ae', password: 'password123', role: 'admin' },
  { name: 'Mariam Al Shamsi', email: 'mariam.shamsi@proptrack.ae', password: 'password123', role: 'admin' },
  { name: 'Saeed Al Mazrouei', email: 'saeed.mazrouei@proptrack.ae', password: 'password123', role: 'admin' },
  { name: 'Noura Al Ketbi', email: 'noura.ketbi@proptrack.ae', password: 'password123', role: 'admin' },
  
  // Regular Users
  { name: 'Ali Hassan', email: 'ali.hassan@email.com', password: 'password123', role: 'user' },
  { name: 'Sara Ahmed', email: 'sara.ahmed@email.com', password: 'password123', role: 'user' },
  { name: 'Yusuf Al Balushi', email: 'yusuf.balushi@email.com', password: 'password123', role: 'user' },
  { name: 'Nadia Al Farsi', email: 'nadia.farsi@email.com', password: 'password123', role: 'user' },
  { name: 'Rashid Al Kindi', email: 'rashid.kindi@email.com', password: 'password123', role: 'user' },
  { name: 'Hala Al Zaabi', email: 'hala.zaabi@email.com', password: 'password123', role: 'user' },
  { name: 'Tariq Al Mulla', email: 'tariq.mulla@email.com', password: 'password123', role: 'user' },
  { name: 'Reem Al Suwaidi', email: 'reem.suwaidi@email.com', password: 'password123', role: 'user' },
  { name: 'Hamad Al Ghurair', email: 'hamad.ghurair@email.com', password: 'password123', role: 'user' },
  { name: 'Amina Al Rostamani', email: 'amina.rostamani@email.com', password: 'password123', role: 'user' },
  { name: 'Faisal Al Habtoor', email: 'faisal.habtoor@email.com', password: 'password123', role: 'user' },
  { name: 'Mona Al Tayer', email: 'mona.tayer@email.com', password: 'password123', role: 'user' },
  { name: 'Jassim Al Awadi', email: 'jassim.awadi@email.com', password: 'password123', role: 'user' },
  { name: 'Shaikha Al Qassemi', email: 'shaikha.qassemi@email.com', password: 'password123', role: 'user' },
  { name: 'Abdulla Al Serkal', email: 'abdulla.serkal@email.com', password: 'password123', role: 'user' },
  { name: 'Latifa Al Basti', email: 'latifa.basti@email.com', password: 'password123', role: 'user' },
  { name: 'Majid Al Futtaim', email: 'majid.futtaim@email.com', password: 'password123', role: 'user' },
  { name: 'Sheikha Al Maktoum', email: 'sheikha.maktoum@email.com', password: 'password123', role: 'user' },
  { name: 'Hamdan Al Shamsi', email: 'hamdan.shamsi@email.com', password: 'password123', role: 'user' },
  { name: 'Wadha Al Otaiba', email: 'wadha.otaiba@email.com', password: 'password123', role: 'user' }
];

// Property Types and Amenities
const propertyTypes = ['villa', 'apartment', 'townhouse', 'penthouse', 'studio', 'duplex'];
const listingTypes = ['sale', 'rent'];
const amenities = [
  'Swimming Pool', 'Gym', 'Parking', 'Security', 'Balcony', 'Garden', 'Maid Room',
  'Study Room', 'Walk-in Closet', 'Built-in Wardrobes', 'Central AC', 'Kitchen Appliances',
  'Laundry Room', 'Storage Room', 'Elevator', 'Concierge', 'Sauna', 'Steam Room',
  'Jacuzzi', 'BBQ Area', 'Children Play Area', 'Tennis Court', 'Basketball Court',
  'Jogging Track', 'Covered Parking', 'Visitor Parking', 'CCTV', '24/7 Security',
  'Intercom', 'Maintenance', 'Pets Allowed', 'Furnished', 'Semi Furnished'
];

// Generate random property data
const generateProperty = (cityData, index, agents) => {
  const area = cityData.areas[Math.floor(Math.random() * cityData.areas.length)];
  const type = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
  const listingType = listingTypes[Math.floor(Math.random() * listingTypes.length)];
  
  // Assign a random agent to this property
  const agent = agents[Math.floor(Math.random() * agents.length)];
  
  const bedrooms = Math.floor(Math.random() * 6) + 1; // 1-6 bedrooms
  const bathrooms = Math.floor(Math.random() * 4) + 1; // 1-4 bathrooms
  const sqft = Math.floor(Math.random() * 4000) + 500; // 500-4500 sqft
  
  // Price ranges based on city and type (in AED)
  let basePrice;
  if (cityData.city === 'Dubai') {
    basePrice = listingType === 'sale' ? Math.floor(Math.random() * 8000000) + 500000 : Math.floor(Math.random() * 200000) + 30000;
  } else if (cityData.city === 'Abu Dhabi') {
    basePrice = listingType === 'sale' ? Math.floor(Math.random() * 6000000) + 400000 : Math.floor(Math.random() * 150000) + 25000;
  } else {
    basePrice = listingType === 'sale' ? Math.floor(Math.random() * 3000000) + 200000 : Math.floor(Math.random() * 100000) + 15000;
  }
  
  // Adjust price based on bedrooms and type
  const multiplier = type === 'villa' ? 1.5 : type === 'penthouse' ? 2 : type === 'studio' ? 0.5 : 1;
  const price = Math.floor(basePrice * multiplier * (bedrooms * 0.2 + 1));
  
  // Random amenities (3-8 amenities per property)
  const numAmenities = Math.floor(Math.random() * 6) + 3;
  const selectedAmenities = [];
  for (let i = 0; i < numAmenities; i++) {
    const amenity = amenities[Math.floor(Math.random() * amenities.length)];
    if (!selectedAmenities.includes(amenity)) {
      selectedAmenities.push(amenity);
    }
  }
  
  // Property titles
  const propertyTitles = [
    `Luxury ${type} in ${area}`,
    `Modern ${type} with ${bedrooms} bedrooms`,
    `Spacious ${type} in prime location`,
    `Stunning ${type} with city views`,
    `Premium ${type} in ${area}`,
    `Beautiful ${type} with amenities`,
    `Exclusive ${type} in ${cityData.city}`,
    `Elegant ${type} with ${bathrooms} bathrooms`,
    `Contemporary ${type} in ${area}`,
    `Prestigious ${type} with parking`
  ];
  
  const title = propertyTitles[Math.floor(Math.random() * propertyTitles.length)];
  
  return {
    title,
    description: `This ${type} offers ${bedrooms} bedrooms and ${bathrooms} bathrooms spread across ${sqft} square feet. Located in the heart of ${area}, ${cityData.city}, this property combines modern living with convenience. The property features high-quality finishes, spacious rooms, and excellent amenities. Perfect for ${listingType === 'sale' ? 'investment or family living' : 'comfortable living'}.`,
    price,
    type,
    listingType,
    bedrooms,
    bathrooms,
    area: sqft,
    location: {
      address: `${Math.floor(Math.random() * 999) + 1} ${area} Street`,
      city: cityData.city,
      state: cityData.city, // In UAE, emirates are like states
      zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
      country: 'UAE',
      coordinates: [
        25.2048 + (Math.random() - 0.5) * 2, // longitude
        55.2708 + (Math.random() - 0.5) * 4  // latitude
      ]
    },
    amenities: selectedAmenities,
    images: [
      `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80`,
      `https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80`,
      `https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80`,
      `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80`
    ],
    status: Math.random() > 0.1 ? 'active' : 'sold',
    featured: Math.random() > 0.7, // 30% chance of being featured
    agent: agent._id, // Assign the agent to this property
    yearBuilt: Math.floor(Math.random() * 20) + 2005,
    parkingSpaces: Math.floor(Math.random() * 3) + 1, // 1-3 parking spaces
    furnishing: ['unfurnished', 'semi-furnished', 'fully-furnished'][Math.floor(Math.random() * 3)]
  };
};

// Generate client data
const generateClient = (index) => {
  const names = [
    'Ahmed Abdullah', 'Fatima Hassan', 'Mohammed Ali', 'Aisha Omar', 'Khalid Saeed',
    'Mariam Rashid', 'Omar Khalil', 'Layla Ahmed', 'Saeed Mohammed', 'Nadia Ali',
    'Rashid Hassan', 'Hala Omar', 'Tariq Khalil', 'Reem Saeed', 'Hamad Ahmed',
    'Amina Hassan', 'Faisal Omar', 'Mona Ali', 'Jassim Khalil', 'Shaikha Saeed',
    'Abdullah Ahmed', 'Latifa Hassan', 'Majid Omar', 'Sheikha Ali', 'Hamdan Khalil',
    'Wadha Saeed', 'Yusuf Ahmed', 'Sara Hassan', 'Ali Omar', 'Noura Ali'
  ];
  
  const name = names[index % names.length];
  const email = `${name.toLowerCase().replace(' ', '.')}${index}@email.com`;
  const phone = `+971-${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
  
  const inquiryTypes = ['purchase', 'rent', 'investment', 'consultation'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const statuses = ['new', 'contacted', 'qualified', 'viewing_scheduled', 'offer_made', 'closed'];
  
  const cityData = uaeCities[Math.floor(Math.random() * uaeCities.length)];
  const area = cityData.areas[Math.floor(Math.random() * cityData.areas.length)];
  
  return {
    name,
    email,
    phone,
    inquiryType: inquiryTypes[Math.floor(Math.random() * inquiryTypes.length)],
    message: `Hi, I'm interested in properties in ${area}, ${cityData.city}. Please contact me with available options.`,
    budget: {
      min: Math.floor(Math.random() * 2000000) + 100000,
      max: Math.floor(Math.random() * 5000000) + 1000000
    },
    preferences: {
      location: [`${area}, ${cityData.city}`],
      propertyType: [propertyTypes[Math.floor(Math.random() * propertyTypes.length)]],
      bedrooms: {
        min: Math.floor(Math.random() * 3) + 1,
        max: Math.floor(Math.random() * 3) + 3
      },
      bathrooms: {
        min: Math.floor(Math.random() * 2) + 1,
        max: Math.floor(Math.random() * 2) + 2
      },
      amenities: amenities.slice(0, Math.floor(Math.random() * 5) + 2)
    },
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    source: ['website', 'referral', 'social_media', 'advertisement'][Math.floor(Math.random() * 4)],
    notes: [
      {
        content: 'Initial inquiry received',
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      }
    ]
  };
};

// Generate viewing data
const generateViewing = (propertyId, clientId, index) => {
  const statuses = ['scheduled', 'completed', 'cancelled', 'no_show'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  // Generate viewing date based on status
  let viewingDate = new Date();
  
  if (['completed', 'cancelled', 'no_show'].includes(status)) {
    // Past dates for completed/cancelled/no_show viewings
    const daysOffset = Math.floor(Math.random() * 30) + 1;
    viewingDate.setDate(viewingDate.getDate() - daysOffset);
  } else {
    // Future dates for active viewings
    const daysOffset = Math.floor(Math.random() * 30) + 1;
    viewingDate.setDate(viewingDate.getDate() + daysOffset);
  }
  
  // Set random time between 9 AM and 6 PM
  viewingDate.setHours(Math.floor(Math.random() * 9) + 9, Math.floor(Math.random() * 60), 0, 0);
  
  return {
    property: propertyId,
    client: clientId,
    scheduledDateTime: viewingDate,
    duration: [30, 45, 60][Math.floor(Math.random() * 3)], // 30, 45, or 60 minutes
    status,
    notes: status === 'completed' ? 'Client showed interest in the property' : 
           status === 'cancelled' ? 'Client requested to reschedule' :
           status === 'no_show' ? 'Client did not show up for viewing' : 
           'Viewing scheduled successfully',
    agentNotes: [{
      note: 'Property viewing arranged',
      createdAt: new Date(),
      type: 'general'
    }],
    clientFeedback: status === 'completed' ? {
      comments: ['Excellent property', 'Good location', 'Needs some improvements', 'Perfect for family', 'Great amenities'][Math.floor(Math.random() * 5)],
      interested: Math.random() > 0.3,
      rating: Math.floor(Math.random() * 5) + 1,
      submittedAt: new Date()
    } : {}
  };
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🗑️  Clearing existing data...');
    await Property.deleteMany({});
    await Client.deleteMany({});
    await Viewing.deleteMany({});
    await User.deleteMany({});
    
    console.log('👥 Creating users...');
    const users = [];
    
    // Create users individually to trigger pre-save hooks for password hashing
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
    }
    
    console.log(`✅ Created ${users.length} users (${users.filter(u => u.role === 'admin').length} agents, ${users.filter(u => u.role === 'user').length} regular users)`);
    
    console.log('🏠 Creating properties...');
    const properties = [];
    
    // Get only agent users for property assignment
    const agents = users.filter(user => user.role === 'admin');
    
    // Create 100 properties distributed across UAE cities
    for (let i = 0; i < 100; i++) {
      const cityData = uaeCities[i % uaeCities.length];
      properties.push(generateProperty(cityData, i, agents));
    }
    
    const createdProperties = await Property.insertMany(properties);
    console.log(`✅ Created ${createdProperties.length} properties across UAE`);
    console.log(`📋 Properties assigned to ${agents.length} agents`);
    
    console.log('👤 Creating clients...');
    const clients = [];
    
    // Create 50 clients
    for (let i = 0; i < 50; i++) {
      clients.push(generateClient(i));
    }
    
    const createdClients = await Client.insertMany(clients);
    console.log(`✅ Created ${createdClients.length} client inquiries`);
    
    console.log('📅 Creating viewings...');
    const viewings = [];
    
    // Create 75 viewings (some clients may have multiple viewings)
    for (let i = 0; i < 75; i++) {
      const property = createdProperties[Math.floor(Math.random() * createdProperties.length)];
      const client = createdClients[Math.floor(Math.random() * createdClients.length)];
      viewings.push(generateViewing(property._id, client._id, i));
    }
    
    const createdViewings = await Viewing.insertMany(viewings);
    console.log(`✅ Created ${createdViewings.length} property viewings`);
    
    console.log('\n🎉 Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   👥 Users: ${users.length} (${users.filter(u => u.role === 'admin').length} agents)`);
    console.log(`   🏠 Properties: ${createdProperties.length} (${createdProperties.filter(p => p.featured).length} featured)`);
    console.log(`   👤 Clients: ${createdClients.length}`);
    console.log(`   📅 Viewings: ${createdViewings.length}`);
    console.log(`   🏙️  Cities: ${uaeCities.length} UAE cities covered`);
    console.log(`   💰 Currency: AED (UAE Dirham)`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };