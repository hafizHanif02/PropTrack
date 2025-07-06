import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchFeaturedProperties, setFilters } from '../store/slices/propertySlice';
import {
  MagnifyingGlassIcon as SearchIcon,
  MapPinIcon as LocationMarkerIcon,
  HomeIcon,
  StarIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  SupportIcon,
  ArrowRightIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';

const Home = () => {
  const { currentUser } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featuredProperties, isLoadingFeatured } = useSelector((state) => state.properties);

  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    dispatch(fetchFeaturedProperties(6));
  }, [dispatch]);

  const handleSearch = (searchTerm) => {
    if (searchTerm.trim()) {
      dispatch(setFilters({ search: searchTerm, page: 1 }));
      navigate('/properties');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const PropertyCard = ({ property, index }) => (
    <div 
      className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-2 animate-fade-in`}
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={() => navigate(`/properties/${property._id}`)}
    >
      <div className="relative overflow-hidden">
        <img
          src={property.images?.[0] || '/placeholder-property.jpg'}
          alt={property.title}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Property Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-semibold capitalize">
            {property.type}
          </span>
        </div>
        
        {/* Heart Icon */}
        <div className="absolute top-4 right-4">
          <HeartIcon className="w-6 h-6 text-white/80 hover:text-red-500 transition-colors cursor-pointer" />
        </div>
        
        {/* Price Badge */}
        <div className="absolute bottom-4 right-4 bg-gray-900/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
          <span className="text-lg font-bold">{formatPrice(property.price)}</span>
        </div>
        
        {/* View Details Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="bg-white text-gray-900 px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-gray-100 transition-colors">
            View Details
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{property.title}</h3>
        
        <div className="flex items-center text-gray-600 mb-4">
          <LocationMarkerIcon className="w-4 h-4 mr-2" />
          <span className="truncate">{property.location?.city}, {property.location?.state}</span>
        </div>
        
        <div className="flex items-center justify-between text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <HomeIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{property.bedrooms} bed</span>
            </div>
            <div className="flex items-center gap-1">
              <BuildingOfficeIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{property.bathrooms} bath</span>
            </div>
            <div className="flex items-center gap-1">
              <UserGroupIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{property.area} sq ft</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const FeatureCard = ({ icon: Icon, title, description, delay }) => (
    <div 
      className={`group p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 text-center animate-slide-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );

  const TestimonialCard = ({ name, role, content, rating, avatar, delay }) => (
    <div 
      className={`bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 animate-slide-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
          {avatar}
        </div>
        <div>
          <h4 className="font-bold text-gray-900">{name}</h4>
          <p className="text-gray-600 text-sm">{role}</p>
        </div>
      </div>
      <div className="flex mb-4">
        {[...Array(rating)].map((_, i) => (
          <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
        ))}
      </div>
      <p className="text-gray-700 italic">"{content}"</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-primary overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '2s' }} />
        
        <div className="container mx-auto px-6 text-center text-white relative z-10">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              Find Your Perfect
              <br />
              <span className="text-gradient bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Dream Home
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed opacity-90">
              Discover premium properties across UAE with cutting-edge technology and expert guidance
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-16">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-2 shadow-2xl">
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1 relative">
                    <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search location, property type..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchValue)}
                      className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-500 bg-transparent rounded-xl focus:outline-none text-lg"
                    />
                  </div>
                  <button
                    onClick={() => handleSearch(searchValue)}
                    className="bg-gradient-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { number: '1,000+', label: 'Premium Properties' },
                { number: '7', label: 'Emirates Covered' },
                { number: '98%', label: 'Client Satisfaction' },
              ].map((stat, index) => (
                <div key={index} className="text-center animate-scale-in" style={{ animationDelay: `${index * 200}ms` }}>
                  <div className="text-4xl md:text-5xl font-black mb-2">{stat.number}</div>
                  <div className="text-lg opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Featured Properties
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Handpicked premium properties offering exceptional value and prime locations
            </p>
          </div>
          
          {isLoadingFeatured ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-64 bg-gray-300" />
                  <div className="p-6">
                    <div className="h-6 bg-gray-300 rounded mb-4" />
                    <div className="h-4 bg-gray-300 rounded mb-2" />
                    <div className="h-4 bg-gray-300 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property, index) => (
                <PropertyCard key={property._id} property={property} index={index} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 bg-gradient-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              View All Properties
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Why Choose PropTrack?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your trusted partner for premium real estate in UAE
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={TrendingUpIcon}
              title="Market Expertise"
              description="Deep knowledge of UAE real estate market with data-driven insights and trends."
              delay={0}
            />
            <FeatureCard
              icon={ShieldCheckIcon}
              title="Verified Listings"
              description="All properties are thoroughly verified and authenticated for your peace of mind."
              delay={200}
            />
            <FeatureCard
              icon={SupportIcon}
              title="24/7 Support"
              description="Dedicated support team available round the clock to assist with your queries."
              delay={400}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600">
              Real stories from satisfied clients
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Ahmed Al-Rashid"
              role="Business Owner"
              content="PropTrack helped me find the perfect villa in Dubai. The process was smooth and professional."
              rating={5}
              avatar="A"
              delay={0}
            />
            <TestimonialCard
              name="Sarah Johnson"
              role="Expat Professional"
              content="Excellent service and great property options. Found my dream apartment in Abu Dhabi quickly."
              rating={5}
              avatar="S"
              delay={200}
            />
            <TestimonialCard
              name="Mohammed Hassan"
              role="Investor"
              content="The market insights and property recommendations were spot on. Highly recommended!"
              rating={5}
              avatar="M"
              delay={400}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Ready to Find Your Dream Home?
          </h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90">
            Join thousands of satisfied clients who found their perfect property with PropTrack
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            {currentUser ? (
              <>
                <Link
                  to="/dashboard"
                  className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                >
                  Go to Dashboard
                </Link>
                <Link
                  to="/properties"
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105"
                >
                  Browse Properties
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/properties"
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105"
                >
                  Browse Properties
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
