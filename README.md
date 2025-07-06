# 🏠 PropTrack - Real Estate Platform

A comprehensive real estate listings and client management platform built with the MERN stack. PropTrack enables users to browse properties and provides agents with powerful tools to manage listings, clients, and viewings.

## 🌟 Features

### Public Interface
- **Property Browsing**: Browse through extensive property listings with advanced search and filtering
- **Advanced Search**: Filter by price range, location, property type, bedrooms, bathrooms, and area
- **Property Details**: Comprehensive property information with image galleries and amenities
- **Inquiry System**: Submit inquiries directly to agents for specific properties
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Featured Properties**: Highlighted premium listings on the homepage

### Agent Dashboard
- **Property Management**: Full CRUD operations for property listings
- **Client Management**: Track client inquiries, priorities, and follow-ups
- **Viewing Scheduling**: Schedule and manage property viewings with conflict detection
- **Statistics Overview**: Real-time metrics and analytics
- **Status Tracking**: Monitor client priorities and viewing statuses
- **Notes System**: Add detailed notes for clients and viewings

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with optimized indexing
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication

### Frontend
- **React** - Frontend library
- **Redux Toolkit** - State management
- **Material-UI** - UI component library
- **React Router** - Navigation

### Development Tools
- **Nodemon** - Development server
- **ESLint** - Code linting
- **Git** - Version control

## 📋 Prerequisites

Before running this project, make sure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/PropTrack.git
cd PropTrack
```

### 2. Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configurations:
# MONGODB_URI=mongodb://localhost:27017/proptrack
# JWT_SECRET=your_jwt_secret_here
# PORT=5001

# Start MongoDB service (if not already running)
# On macOS with Homebrew:
brew services start mongodb-community

# Seed the database with sample data
npm run seed

# Start the backend server
npm run dev
```

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to client directory
cd client

# Install dependencies
npm install

# Start the React development server
npm start
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **API Documentation**: http://localhost:5001/api/health

## 📊 Database Structure

### Collections
- **Properties**: Property listings with location, pricing, and amenities
- **Clients**: Client inquiries and management data
- **Viewings**: Scheduled property viewings and appointments
- **Users**: Authentication and user management

### Performance Optimization
- Compound indexes on frequently queried fields
- Optimized for 10,000+ property listings
- Efficient pagination and filtering

## 🔧 API Endpoints

### Properties
- `GET /api/properties` - Get all properties with filtering
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Create new property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `GET /api/properties/featured/list` - Get featured properties
- `GET /api/properties/stats/overview` - Get property statistics

### Clients
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create client inquiry
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client
- `GET /api/clients/urgent` - Get urgent clients

### Viewings
- `GET /api/viewings` - Get all viewings
- `POST /api/viewings` - Schedule viewing
- `PUT /api/viewings/:id` - Update viewing
- `DELETE /api/viewings/:id` - Cancel viewing
- `GET /api/viewings/today` - Get today's viewings
- `GET /api/viewings/upcoming` - Get upcoming viewings

## 🎨 Screenshots

### Homepage
The landing page features a hero section with search functionality and featured properties.

### Property Listings
Advanced search interface with multiple filters and responsive property cards.

### Property Details
Comprehensive property view with image gallery and inquiry form.

### Agent Dashboard
Complete management interface with statistics, property management, and client tracking.

## 🏗️ Project Structure

```
PropTrack/
├── client/                 # React frontend
│   ├── public/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store and slices
│   │   ├── theme.js        # Material-UI theme
│   │   └── App.js          # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/             # Database configuration
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── scripts/            # Utility scripts
│   ├── index.js            # Server entry point
│   └── package.json
├── requirements.md         # Project requirements
├── LICENSE                 # MIT License
└── README.md              # This file
```

## 🔐 Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/proptrack
JWT_SECRET=your_jwt_secret_here
PORT=5001
NODE_ENV=development
```

## 🚦 Available Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data (original 5 properties)
- `npm run seed:small` - Seed with small dataset (10 users, 25 properties, 15 clients, 20 viewings)
- `npm run seed:medium` - Seed with medium dataset (25 users, 100 properties, 50 clients, 75 viewings)
- `npm run seed:large` - Seed with large dataset (50 users, 500 properties, 200 clients, 300 viewings)
- `npm run seed:xlarge` - Seed with extra large dataset (100 users, 1000 properties, 500 clients, 750 viewings)
- `npm run seed:bulk` - Seed with default medium dataset
- `npm run clear` - Clear all data from database

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 💰 Currency & Localization

This application is configured for the **UAE market** with the following features:
- **Currency**: AED (United Arab Emirates Dirham) 
- **Locale**: en-AE (English - UAE)
- **Coverage**: All 7 UAE Emirates with 140+ areas
- **Realistic Pricing**: Based on actual UAE real estate market rates
- **Local Names**: Authentic Arabic names for users and locations

## 🌍 UAE Market Coverage

The application includes comprehensive coverage of:
- **Dubai**: 20 premium areas (Downtown, Marina, Jumeirah, etc.)
- **Abu Dhabi**: 20 key locations (Corniche, Saadiyat Island, Yas Island, etc.)
- **Sharjah**: 20 residential areas (Al Majaz, Al Qasba, University City, etc.)
- **Ajman**: 20 districts (Al Nuaimiya, Marina, Al Zorah, etc.)
- **Ras Al Khaimah**: 20 areas (Al Hamra, Marjan Island, etc.)
- **Fujairah**: 20 locations (Fujairah City, Dibba, Kalba, etc.)
- **Umm Al Quwain**: 20 areas (UAQ City, Al Salamah, etc.)

## 📊 Data Seeding Options

Choose the appropriate dataset size for your development needs:

### Small Dataset (Quick Testing)
```bash
npm run seed:small
```
- 10 users (3 agents, 7 regular users)
- 25 properties across UAE
- 15 client inquiries
- 20 property viewings

### Medium Dataset (Development)
```bash
npm run seed:medium
```
- 25 users (7 agents, 18 regular users)
- 100 properties across UAE
- 50 client inquiries
- 75 property viewings

### Large Dataset (Performance Testing)
```bash
npm run seed:large
```
- 50 users (15 agents, 35 regular users)
- 500 properties across UAE
- 200 client inquiries
- 300 property viewings

### Extra Large Dataset (Production Simulation)
```bash
npm run seed:xlarge
```
- 100 users (30 agents, 70 regular users)
- 1000 properties across UAE
- 500 client inquiries
- 750 property viewings

### Clear Database
```bash
npm run clear
```
Removes all data from the database (users, properties, clients, viewings)

## 📈 Performance Features

- **MongoDB Indexing**: Compound indexes for efficient queries
- **Pagination**: Efficient data loading for large datasets
- **Lazy Loading**: Optimized component loading
- **Responsive Design**: Mobile-first approach
- **Error Handling**: Comprehensive error management
- **Loading States**: User-friendly loading indicators

## 🔧 Development Notes

### Database Seeding
The application includes multiple seeding options for different development needs:
- **Original Seeder**: 5 realistic properties with varied types and locations
- **Small Dataset**: Perfect for quick testing and development
- **Medium Dataset**: Ideal for feature development and testing
- **Large Dataset**: Great for performance testing and UI stress testing
- **Extra Large Dataset**: Simulates production-level data for comprehensive testing

All datasets include:
- Realistic UAE property data with authentic locations and pricing
- Diverse user profiles including agents and regular users
- Comprehensive client inquiries with various statuses and priorities
- Property viewings with different states and feedback
- AED currency formatting throughout the application

### State Management
Redux Toolkit is used for efficient state management with:
- Async thunks for API calls
- Proper error handling
- Loading state management
- Normalized data structure

### Authentication
- JWT-based authentication
- Protected routes for admin features
- User session management

### UAE Market Features
- **Authentic Locations**: 140+ real areas across all 7 UAE emirates
- **Realistic Pricing**: Market-based pricing in AED for different emirates
- **Local Names**: Authentic Arabic names for users and locations
- **Property Types**: Comprehensive range including villas, apartments, penthouses, etc.
- **Amenities**: UAE-specific amenities and features

## 🐛 Troubleshooting

### Common Issues

1. **Port 5000 Conflict**: Backend uses port 5001 to avoid conflicts with macOS AirPlay
2. **MongoDB Connection**: Ensure MongoDB is running before starting the server
3. **CORS Issues**: Backend is configured to allow requests from localhost:3000
4. **Missing Dependencies**: Run `npm install` in both client and server directories

### Debug Commands
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Check if ports are available
lsof -i :3000
lsof -i :5001

# View application logs
npm run dev (in server directory)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Hafiz Hanif**
- GitHub: [@hafizhanif](https://github.com/hafizhanif)
- Email: hafiz.hanif992@gmail.com

## 🙏 Acknowledgments

- Material-UI for the excellent component library
- Unsplash for placeholder images
- MongoDB for the robust database solution
- The React and Node.js communities for excellent documentation

---

**PropTrack** - Making real estate management simple and efficient. 🏠✨

