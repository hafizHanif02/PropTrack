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

// Configuration for different data sizes
const DATA_SIZES = {
  small: { users: 10, properties: 25, clients: 15, viewings: 20 },
  medium: { users: 25, properties: 100, clients: 50, viewings: 75 },
  large: { users: 50, properties: 500, clients: 200, viewings: 300 },
  xlarge: { users: 100, properties: 1000, clients: 500, viewings: 750 }
};

// UAE Cities and Areas (expanded list)
const uaeCities = [
  { 
    city: 'Dubai', 
    areas: ['Downtown Dubai', 'Dubai Marina', 'Jumeirah', 'Business Bay', 'DIFC', 'Palm Jumeirah', 'Dubai Hills', 'Arabian Ranches', 'Mirdif', 'Deira', 'Bur Dubai', 'Jumeirah Lake Towers', 'Dubai South', 'Al Barsha', 'Motor City', 'Sports City', 'International City', 'Discovery Gardens', 'Jumeirah Village Circle', 'Dubai Investment Park'] 
  },
  { 
    city: 'Abu Dhabi', 
    areas: ['Corniche', 'Al Reem Island', 'Saadiyat Island', 'Yas Island', 'Al Khalidiyah', 'Al Bateen', 'Masdar City', 'Al Raha Beach', 'Khalifa City', 'Al Reef', 'Al Mushrif', 'Al Karamah', 'Al Manhal', 'Al Zaab', 'Bloom Gardens', 'Shams Abu Dhabi', 'Al Ghadeer', 'Al Shamkha', 'Mohammed Bin Zayed City', 'Al Falah'] 
  },
  { 
    city: 'Sharjah', 
    areas: ['Al Majaz', 'Al Qasba', 'Al Taawun', 'Al Nahda', 'Muweilah', 'Al Khan', 'Al Qasimia', 'University City', 'Al Suyoh', 'Al Ramtha', 'Al Zahia', 'Tilal City', 'Al Juraina', 'Al Fisht', 'Al Qulayaah', 'Al Tawun', 'Al Butina', 'Al Nasserya', 'Al Qadisiya', 'Al Azra'] 
  },
  { 
    city: 'Ajman', 
    areas: ['Al Nuaimiya', 'Al Rashidiya', 'Al Jurf', 'Al Hamidiyah', 'Al Rumailah', 'Al Sawan', 'Al Tallah', 'Al Helio', 'Al Mowaihat', 'Al Ameera', 'Ajman Marina', 'Al Zorah', 'Al Yasmeen', 'Al Khor', 'Al Rawda', 'Al Nakheel', 'Al Humaid City', 'Al Corniche', 'Al Bustan', 'Al Jerf'] 
  },
  { 
    city: 'Ras Al Khaimah', 
    areas: ['Al Nakheel', 'Al Hamra', 'Al Marjan Island', 'Al Qawasim', 'Al Rams', 'Al Jazirah Al Hamra', 'Khuzam', 'Al Dhait', 'Al Seer', 'Wadi Shah', 'Mina Al Arab', 'Al Mairid', 'Al Uraibi', 'Al Muntazah', 'Al Jeer', 'Al Qusaidat', 'Al Nasla', 'Al Hamraniyah', 'Al Ghubaiba', 'Al Jazira'] 
  },
  { 
    city: 'Fujairah', 
    areas: ['Fujairah City', 'Dibba', 'Kalba', 'Khor Fakkan', 'Al Bithnah', 'Al Hayl', 'Masafi', 'Al Quriyah', 'Al Tawyeen', 'Mirbah', 'Al Faseel', 'Al Aqah', 'Al Badiyah', 'Qidfa', 'Al Fujairah', 'Al Gurfa', 'Al Halah', 'Al Madhab', 'Al Rughaylat', 'Al Siji'] 
  },
  { 
    city: 'Umm Al Quwain', 
    areas: ['UAQ City', 'Al Salamah', 'Al Ramlah', 'Falaj Al Mualla', 'Al Sinniyah', 'Al Dur', 'Al Khor', 'Al Heera', 'Al Jazirah', 'Al Humraniyah', 'Al Ratba', 'Al Salam City', 'Al Aqor', 'Al Labsa', 'Al Khaznah', 'Al Humaid', 'Al Qor', 'Al Jawhara', 'Al Nayhan', 'Al Seneyah'] 
  }
];

// Extended property types
const propertyTypes = ['villa', 'apartment', 'townhouse', 'penthouse', 'studio', 'duplex', 'compound', 'warehouse', 'office', 'retail', 'land'];
const listingTypes = ['sale', 'rent'];

// Comprehensive amenities list
const amenities = [
  'Swimming Pool', 'Gym', 'Parking', 'Security', 'Balcony', 'Garden', 'Maid Room',
  'Study Room', 'Walk-in Closet', 'Built-in Wardrobes', 'Central AC', 'Kitchen Appliances',
  'Laundry Room', 'Storage Room', 'Elevator', 'Concierge', 'Sauna', 'Steam Room',
  'Jacuzzi', 'BBQ Area', 'Children Play Area', 'Tennis Court', 'Basketball Court',
  'Jogging Track', 'Covered Parking', 'Visitor Parking', 'CCTV', '24/7 Security',
  'Intercom', 'Maintenance', 'Pets Allowed', 'Furnished', 'Semi Furnished',
  'Beach Access', 'Marina View', 'City View', 'Golf Course View', 'Mountain View',
  'Burj Khalifa View', 'Sea View', 'Pool View', 'Garden View', 'Landmark View',
  'Mosque Nearby', 'School Nearby', 'Hospital Nearby', 'Shopping Mall Nearby',
  'Metro Station Nearby', 'Bus Stop Nearby', 'Restaurant Nearby', 'Supermarket Nearby'
];

// Generate realistic UAE names
const generateUAEName = () => {
  const firstNames = [
    'Ahmed', 'Mohammed', 'Ali', 'Omar', 'Khalid', 'Saeed', 'Rashid', 'Hamad', 'Faisal', 'Tariq',
    'Abdullah', 'Majid', 'Yusuf', 'Jassim', 'Hamdan', 'Abdulla', 'Sultan', 'Mansour', 'Nasser', 'Obaid',
    'Fatima', 'Aisha', 'Mariam', 'Layla', 'Nadia', 'Hala', 'Reem', 'Amina', 'Mona', 'Shaikha',
    'Noura', 'Latifa', 'Wadha', 'Sara', 'Sheikha', 'Maitha', 'Salama', 'Meera', 'Shamsa', 'Hessa'
  ];
  
  const lastNames = [
    'Al Mansouri', 'Al Zahra', 'Al Rashid', 'Al Maktoum', 'Al Nahyan', 'Al Qasimi', 'Al Nuaimi', 'Al Shamsi',
    'Al Mazrouei', 'Al Ketbi', 'Al Balushi', 'Al Farsi', 'Al Kindi', 'Al Zaabi', 'Al Mulla', 'Al Suwaidi',
    'Al Ghurair', 'Al Rostamani', 'Al Habtoor', 'Al Tayer', 'Al Awadi', 'Al Qassemi', 'Al Serkal', 'Al Basti',
    'Al Futtaim', 'Al Otaiba', 'Hassan', 'Ahmed', 'Ali', 'Omar', 'Khalil', 'Saeed', 'Abdullah', 'Mohammed'
  ];
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

// Generate user data
const generateUser = (index, isAgent = false) => {
  const name = generateUAEName();
  const email = `${name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')}.${index}@${isAgent ? 'proptrack.ae' : 'email.com'}`;
  
  return {
    name,
    email,
    password: 'password123',
    role: isAgent ? 'admin' : 'user',
    isVerified: Math.random() > 0.2 // 80% verified
  };
};

// Generate property data with realistic UAE pricing
const generateProperty = (cityData, index, agents) => {
  const area = cityData.areas[Math.floor(Math.random() * cityData.areas.length)];
  const type = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
  const listingType = listingTypes[Math.floor(Math.random() * listingTypes.length)];
  
  // Assign a random agent to this property
  const agent = agents[Math.floor(Math.random() * agents.length)];
  
  let bedrooms, bathrooms, sqft, basePrice;
  
  // Property-specific configurations
  switch (type) {
    case 'studio':
      bedrooms = 0;
      bathrooms = 1;
      sqft = Math.floor(Math.random() * 300) + 300; // 300-600 sqft
      break;
    case 'apartment':
      bedrooms = Math.floor(Math.random() * 4) + 1; // 1-4 bedrooms
      bathrooms = Math.floor(Math.random() * 3) + 1; // 1-3 bathrooms
      sqft = Math.floor(Math.random() * 1500) + 500; // 500-2000 sqft
      break;
    case 'villa':
      bedrooms = Math.floor(Math.random() * 5) + 3; // 3-7 bedrooms
      bathrooms = Math.floor(Math.random() * 4) + 2; // 2-5 bathrooms
      sqft = Math.floor(Math.random() * 3000) + 2000; // 2000-5000 sqft
      break;
    case 'townhouse':
      bedrooms = Math.floor(Math.random() * 3) + 2; // 2-4 bedrooms
      bathrooms = Math.floor(Math.random() * 2) + 2; // 2-3 bathrooms
      sqft = Math.floor(Math.random() * 1500) + 1000; // 1000-2500 sqft
      break;
    case 'penthouse':
      bedrooms = Math.floor(Math.random() * 3) + 3; // 3-5 bedrooms
      bathrooms = Math.floor(Math.random() * 3) + 3; // 3-5 bathrooms
      sqft = Math.floor(Math.random() * 2000) + 2000; // 2000-4000 sqft
      break;
    default:
      bedrooms = Math.floor(Math.random() * 4) + 1;
      bathrooms = Math.floor(Math.random() * 3) + 1;
      sqft = Math.floor(Math.random() * 2000) + 500;
  }
  
  // Realistic UAE pricing in AED
  const priceMultipliers = {
    'Dubai': { sale: 1.5, rent: 1.3 },
    'Abu Dhabi': { sale: 1.2, rent: 1.1 },
    'Sharjah': { sale: 0.7, rent: 0.8 },
    'Ajman': { sale: 0.5, rent: 0.6 },
    'Ras Al Khaimah': { sale: 0.6, rent: 0.7 },
    'Fujairah': { sale: 0.4, rent: 0.5 },
    'Umm Al Quwain': { sale: 0.3, rent: 0.4 }
  };
  
  const cityMultiplier = priceMultipliers[cityData.city] || { sale: 1, rent: 1 };
  
  if (listingType === 'sale') {
    basePrice = sqft * (type === 'villa' ? 1200 : type === 'penthouse' ? 1500 : type === 'studio' ? 800 : 1000);
    basePrice *= cityMultiplier.sale;
  } else {
    basePrice = sqft * (type === 'villa' ? 2.5 : type === 'penthouse' ? 3 : type === 'studio' ? 1.5 : 2);
    basePrice *= cityMultiplier.rent;
  }
  
  const price = Math.floor(basePrice * (0.8 + Math.random() * 0.4)); // ±20% variation
  
  // Random amenities
  const numAmenities = Math.floor(Math.random() * 8) + 3;
  const selectedAmenities = [];
  const shuffledAmenities = [...amenities].sort(() => 0.5 - Math.random());
  for (let i = 0; i < numAmenities; i++) {
    selectedAmenities.push(shuffledAmenities[i]);
  }
  
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
    `Prestigious ${type} with parking`,
    `Brand new ${type} for ${listingType}`,
    `Fully furnished ${type} available`,
    `Waterfront ${type} with sea views`,
    `High-end ${type} in ${cityData.city}`,
    `Family-friendly ${type} with garden`
  ];
  
  return {
    title: propertyTitles[Math.floor(Math.random() * propertyTitles.length)],
    description: `This exceptional ${type} offers ${bedrooms} bedrooms and ${bathrooms} bathrooms spread across ${sqft} square feet. Located in the prestigious ${area} area of ${cityData.city}, this property represents the pinnacle of modern living. Features include premium finishes, spacious layouts, and world-class amenities. ${listingType === 'sale' ? 'Perfect for investment or luxury living' : 'Ideal for comfortable and convenient living'}. The property boasts excellent connectivity to major landmarks and business districts.`,
    price,
    type,
    listingType,
    bedrooms,
    bathrooms,
    area: sqft,
    location: {
      address: `${Math.floor(Math.random() * 999) + 1} ${area} Street, Building ${Math.floor(Math.random() * 50) + 1}`,
      city: cityData.city,
      state: cityData.city,
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
      `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80`,
      `https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&q=80`
    ],
    status: Math.random() > 0.15 ? 'active' : Math.random() > 0.5 ? 'sold' : 'pending',
    featured: Math.random() > 0.75, // 25% chance of being featured
    agent: agent._id, // Assign the agent to this property
    yearBuilt: Math.floor(Math.random() * 20) + 2005,
    parkingSpaces: Math.floor(Math.random() * 4) + 1,
    furnishing: ['unfurnished', 'semi-furnished', 'fully-furnished'][Math.floor(Math.random() * 3)]
  };
};

// Generate client data
const generateClient = (index) => {
  const name = generateUAEName();
  const email = `${name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')}.${index}@email.com`;
  const phone = `+971-${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
  
  const inquiryTypes = ['purchase', 'rent', 'investment', 'consultation', 'evaluation'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const statuses = ['new', 'contacted', 'qualified', 'viewing_scheduled', 'offer_made', 'negotiating', 'closed', 'lost'];
  
  const cityData = uaeCities[Math.floor(Math.random() * uaeCities.length)];
  const area = cityData.areas[Math.floor(Math.random() * cityData.areas.length)];
  
  const minBudget = Math.floor(Math.random() * 3000000) + 100000;
  const maxBudget = minBudget + Math.floor(Math.random() * 5000000) + 500000;
  
  return {
    name,
    email,
    phone,
    inquiryType: inquiryTypes[Math.floor(Math.random() * inquiryTypes.length)],
    message: `Hello, I'm interested in ${inquiryTypes[Math.floor(Math.random() * inquiryTypes.length)]} opportunities in ${area}, ${cityData.city}. I'm looking for properties that match my requirements. Please contact me with suitable options. Thank you.`,
    budget: { min: minBudget, max: maxBudget },
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
      amenities: amenities.slice(0, Math.floor(Math.random() * 6) + 2)
    },
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    source: ['website', 'referral', 'social_media', 'advertisement', 'walk_in', 'phone_call'][Math.floor(Math.random() * 6)],
    notes: [
      {
        content: 'Initial inquiry received via website',
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      },
      {
        content: 'Client preferences noted and profile created',
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 25) * 24 * 60 * 60 * 1000)
      }
    ]
  };
};

// Generate viewing data
const generateViewing = (propertyId, clientId) => {
  const statuses = ['scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled'];
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
  
  viewingDate.setHours(Math.floor(Math.random() * 9) + 9, [0, 15, 30, 45][Math.floor(Math.random() * 4)], 0, 0);
  
  const feedbacks = [
    'Excellent property, very interested',
    'Good location but needs some improvements',
    'Perfect for our family needs',
    'Great amenities and facilities',
    'Pricing is within our budget range',
    'Location is convenient for work',
    'Property condition is excellent',
    'Needs minor renovations',
    'Very satisfied with the viewing',
    'Will consider this option'
  ];
  
  return {
    property: propertyId,
    client: clientId,
    scheduledDateTime: viewingDate,
    duration: [30, 45, 60, 90][Math.floor(Math.random() * 4)],
    status,
    notes: status === 'completed' ? 'Viewing completed successfully' : 
           status === 'cancelled' ? 'Client requested cancellation' :
           status === 'no_show' ? 'Client did not attend the viewing' :
           status === 'rescheduled' ? 'Viewing rescheduled to new date' :
           'Viewing scheduled and confirmed',
    agentNotes: [{
      note: 'Property viewing arranged and managed by agent',
      createdAt: new Date(),
      type: 'general'
    }],
    clientFeedback: status === 'completed' ? {
      comments: feedbacks[Math.floor(Math.random() * feedbacks.length)],
      interested: Math.random() > 0.3,
      rating: Math.floor(Math.random() * 5) + 1,
      submittedAt: new Date()
    } : {}
  };
};

const seedBulkData = async (size = 'medium') => {
  try {
    await connectDB();
    
    const config = DATA_SIZES[size] || DATA_SIZES.medium;
    
    console.log(`🌱 Starting bulk data seeding (${size} dataset)...`);
    console.log(`📊 Configuration: ${config.users} users, ${config.properties} properties, ${config.clients} clients, ${config.viewings} viewings`);
    
    console.log('🗑️  Clearing existing data...');
    await Property.deleteMany({});
    await Client.deleteMany({});
    await Viewing.deleteMany({});
    await User.deleteMany({});
    
    console.log('👥 Creating users...');
    const users = [];
    const numAgents = Math.floor(config.users * 0.3); // 30% agents
    
    // Create users individually to trigger pre-save hooks for password hashing
    for (let i = 0; i < config.users; i++) {
      const userData = generateUser(i, i < numAgents);
      const user = new User(userData);
      await user.save();
      users.push(user);
    }
    
    const createdUsers = users;
    console.log(`✅ Created ${createdUsers.length} users (${numAgents} agents, ${config.users - numAgents} regular users)`);
    
    console.log('🏠 Creating properties...');
    const properties = [];
    
    // Get only agent users for property assignment
    const agents = createdUsers.filter(user => user.role === 'admin');
    
    for (let i = 0; i < config.properties; i++) {
      const cityData = uaeCities[i % uaeCities.length];
      properties.push(generateProperty(cityData, i, agents));
    }
    
    const createdProperties = await Property.insertMany(properties);
    console.log(`✅ Created ${createdProperties.length} properties across ${uaeCities.length} UAE cities`);
    console.log(`📋 Properties assigned to ${agents.length} agents`);
    
    console.log('👤 Creating clients...');
    const clients = [];
    
    for (let i = 0; i < config.clients; i++) {
      clients.push(generateClient(i));
    }
    
    const createdClients = await Client.insertMany(clients);
    console.log(`✅ Created ${createdClients.length} client inquiries`);
    
    console.log('📅 Creating viewings...');
    const viewings = [];
    
    for (let i = 0; i < config.viewings; i++) {
      const property = createdProperties[Math.floor(Math.random() * createdProperties.length)];
      const client = createdClients[Math.floor(Math.random() * createdClients.length)];
      viewings.push(generateViewing(property._id, client._id));
    }
    
    const createdViewings = await Viewing.insertMany(viewings);
    console.log(`✅ Created ${createdViewings.length} property viewings`);
    
    // Statistics
    const featuredCount = createdProperties.filter(p => p.featured).length;
    const activeCount = createdProperties.filter(p => p.status === 'active').length;
    const saleCount = createdProperties.filter(p => p.listingType === 'sale').length;
    const rentCount = createdProperties.filter(p => p.listingType === 'rent').length;
    
    console.log('\n🎉 Bulk data seeding completed successfully!');
    console.log('📊 Final Summary:');
    console.log(`   👥 Users: ${createdUsers.length} (${numAgents} agents, ${config.users - numAgents} regular users)`);
    console.log(`   🏠 Properties: ${createdProperties.length} (${featuredCount} featured, ${activeCount} active)`);
    console.log(`   💰 Listings: ${saleCount} for sale, ${rentCount} for rent`);
    console.log(`   👤 Clients: ${createdClients.length} inquiries`);
    console.log(`   📅 Viewings: ${createdViewings.length} scheduled/completed`);
    console.log(`   🏙️  Coverage: ${uaeCities.length} UAE cities with ${uaeCities.reduce((acc, city) => acc + city.areas.length, 0)} areas`);
    console.log(`   💵 Currency: AED (UAE Dirham)`);
    console.log(`   📈 Dataset Size: ${size.toUpperCase()}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding bulk data:', error);
    process.exit(1);
  }
};

// Command line argument parsing
const args = process.argv.slice(2);
const size = args[0] || 'medium';

if (!DATA_SIZES[size]) {
  console.error(`❌ Invalid size: ${size}`);
  console.log('Available sizes: small, medium, large, xlarge');
  process.exit(1);
}

// Run the bulk seeder
if (require.main === module) {
  seedBulkData(size);
}

module.exports = { seedBulkData, DATA_SIZES }; 