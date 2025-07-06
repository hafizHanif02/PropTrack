import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchPropertyById, fetchSimilarProperties, clearError, fetchProperties } from '../store/slices/propertySlice';
import { createClientInquiry } from '../store/slices/clientSlice';
import {
  ArrowLeftIcon,
  HeartIcon,
  ShareIcon,
  MapPinIcon,
  HomeIcon,
  BuildingOfficeIcon,
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  CheckCircleIcon,
  CalendarIcon,
  UserIcon,
  InformationCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { 
    currentProperty, 
    similarProperties, 
    properties,
    isLoading, 
    isLoadingSimilar,
    error 
  } = useSelector((state) => state.properties);
  
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    inquiryType: 'general',
  });

  useEffect(() => {
    if (id) {
      dispatch(clearError());
      dispatch(fetchPropertyById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentProperty) {
      dispatch(fetchSimilarProperties(currentProperty._id));
      dispatch(fetchProperties({ limit: 8, page: 1 }));
    }
  }, [dispatch, currentProperty]);

  // Get fallback properties if no similar properties found
  const displayProperties = React.useMemo(() => {
    if (similarProperties && similarProperties.length > 0) {
      return similarProperties;
    }
    
    // Fallback: filter properties of the same type, excluding current property
    if (properties && properties.length > 0 && currentProperty) {
      return properties
        .filter(prop => prop._id !== currentProperty._id && prop.type === currentProperty.type)
        .slice(0, 4);
    }
    
    return [];
  }, [similarProperties, properties, currentProperty]);

  const handleInquirySubmit = async () => {
    try {
      const inquiryData = {
        ...inquiryForm,
        property: currentProperty._id,
        preferences: {
          propertyType: currentProperty.type,
          priceRange: {
            min: currentProperty.price * 0.8,
            max: currentProperty.price * 1.2,
          },
          location: currentProperty.location,
        },
      };
      
      await dispatch(createClientInquiry(inquiryData));
      setInquiryDialogOpen(false);
      setInquiryForm({
        name: '',
        email: '',
        phone: '',
        message: '',
        inquiryType: 'general',
      });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const nextImage = () => {
    setSelectedImage((prev) => 
      prev === (currentProperty?.images?.length - 1) ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImage((prev) => 
      prev === 0 ? (currentProperty?.images?.length - 1) : prev - 1
    );
  };

  const PropertyCard = ({ property, index }) => (
    <div 
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-2"
      onClick={() => navigate(`/properties/${property._id}`)}
    >
      <div className="relative overflow-hidden">
        <img
          src={property.images?.[0] || '/placeholder-property.jpg'}
          alt={property.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-semibold capitalize">
            {property.type}
          </span>
        </div>
        <div className="absolute bottom-4 right-4 bg-gray-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg">
          <span className="font-bold">{formatPrice(property.price)}</span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2 truncate">{property.title}</h3>
        <div className="flex items-center text-gray-600 mb-2">
          <MapPinIcon className="w-4 h-4 mr-1" />
          <span className="text-sm truncate">{property.location?.city}, {property.location?.state}</span>
        </div>
        <div className="flex items-center gap-4 text-gray-600 text-sm">
          <div className="flex items-center gap-1">
            <HomeIcon className="w-4 h-4" />
            <span>{property.bedrooms} bed</span>
          </div>
          <div className="flex items-center gap-1">
            <BuildingOfficeIcon className="w-4 h-4" />
            <span>{property.bathrooms} bath</span>
          </div>
          <div className="flex items-center gap-1">
            <span>{property.area} sq ft</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-300 rounded-2xl mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-8 bg-gray-300 rounded mb-4"></div>
                <div className="h-6 bg-gray-300 rounded mb-4 w-2/3"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
              </div>
              <div className="h-96 bg-gray-300 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
            <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Property</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/properties')}
              className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-colors"
            >
              Back to Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProperty) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/properties')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/properties')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <nav className="flex items-center gap-2 text-sm text-gray-600">
                <Link to="/" className="hover:text-blue-600">Home</Link>
                <span>/</span>
                <Link to="/properties" className="hover:text-blue-600">Properties</Link>
                <span>/</span>
                <span className="text-gray-900 font-medium truncate max-w-xs">
                  {currentProperty.title}
                </span>
              </nav>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                {isFavorite ? (
                  <HeartIconSolid className="w-6 h-6 text-red-500" />
                ) : (
                  <HeartIcon className="w-6 h-6 text-gray-600" />
                )}
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ShareIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Image Gallery */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-96">
            {/* Main Image */}
            <div className="md:col-span-3 relative rounded-2xl overflow-hidden">
              <img
                src={currentProperty.images?.[0] || '/placeholder-property.jpg'}
                alt={currentProperty.title}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => setImageDialogOpen(true)}
              />
              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-medium">
                  1 / {currentProperty.images?.length || 1}
                </span>
              </div>
              <button
                onClick={() => setImageDialogOpen(true)}
                className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-lg backdrop-blur-sm hover:bg-black/70 transition-colors"
              >
                <PhotoIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Thumbnail Images */}
            <div className="hidden md:flex flex-col gap-4">
              {currentProperty.images?.slice(1, 3).map((image, index) => (
                <div key={index} className="relative rounded-xl overflow-hidden flex-1">
                  <img
                    src={image}
                    alt={`${currentProperty.title} ${index + 2}`}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() => {
                      setSelectedImage(index + 1);
                      setImageDialogOpen(true);
                    }}
                  />
                </div>
              ))}
              {currentProperty.images?.length > 3 && (
                <div 
                  className="relative rounded-xl overflow-hidden flex-1 cursor-pointer"
                  onClick={() => setImageDialogOpen(true)}
                >
                  <img
                    src={currentProperty.images[3]}
                    alt={`${currentProperty.title} 4`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      +{currentProperty.images.length - 3} more
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Property Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Property Header */}
            <div className="bg-white rounded-2xl p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold capitalize">
                      {currentProperty.type}
                    </span>
                    {currentProperty.featured && (
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <StarIcon className="w-4 h-4" />
                        Featured
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentProperty.title}</h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPinIcon className="w-5 h-5 mr-2" />
                    <span className="text-lg">{currentProperty.location?.address}, {currentProperty.location?.city}, {currentProperty.location?.state}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {formatPrice(currentProperty.price)}
                  </div>
                  <div className="text-gray-600">
                    {currentProperty.listingType === 'rent' ? '/month' : ''}
                  </div>
                </div>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <HomeIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{currentProperty.bedrooms}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{currentProperty.bathrooms}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <InformationCircleIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{currentProperty.area}</div>
                  <div className="text-sm text-gray-600">Sq Ft</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <CalendarIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">2025</div>
                  <div className="text-sm text-gray-600">Listed</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl p-6 mb-6">
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'amenities', label: 'Amenities' },
                    { id: 'location', label: 'Location' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{currentProperty.description}</p>
                  </div>
                </div>
              )}

              {activeTab === 'amenities' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {currentProperty.amenities?.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700 capitalize">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'location' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Location</h3>
                  <div className="bg-gray-100 rounded-xl p-8 text-center">
                    <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Map integration coming soon</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {currentProperty.location?.address}, {currentProperty.location?.city}, {currentProperty.location?.state}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Similar Properties Section */}
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {similarProperties && similarProperties.length > 0 
                    ? 'Similar Properties' 
                    : 'More Properties Like This'
                  }
                </h3>
                {displayProperties.length > 0 && (
                  <Link
                    to="/properties"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                  >
                    View All
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                )}
              </div>
              
              {isLoadingSimilar ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-gray-200 rounded-2xl h-64 animate-pulse"></div>
                  ))}
                </div>
              ) : displayProperties && displayProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {displayProperties.map((property, index) => (
                    <PropertyCard key={property._id} property={property} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HomeIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Similar Properties Found</h4>
                  <p className="text-gray-600 mb-6">We couldn't find properties similar to this one at the moment.</p>
                  <button
                    onClick={() => navigate('/properties')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Browse All Properties
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Interested in this property?</h3>
              <p className="text-gray-600 mb-6">Get in touch with our team for more information or to schedule a viewing.</p>
              
              <div className="space-y-4">
                <button
                  onClick={() => setInquiryDialogOpen(true)}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Request Information
                </button>
                
                <button className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                  <PhoneIcon className="w-5 h-5" />
                  Call Now
                </button>
                
                <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <EnvelopeIcon className="w-5 h-5" />
                  Send Email
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Property Agent</h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">PropTrack Agent</div>
                    <div className="text-sm text-gray-600">Real Estate Professional</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {imageDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setImageDialogOpen(false)}
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            
            <div className="relative">
              <img
                src={currentProperty.images?.[selectedImage] || '/placeholder-property.jpg'}
                alt={`${currentProperty.title} ${selectedImage + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
              />
              
              {currentProperty.images?.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
            
            <div className="text-center mt-4">
              <span className="text-white text-sm">
                {selectedImage + 1} of {currentProperty.images?.length || 1}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Inquiry Modal */}
      {inquiryDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Request Information</h3>
                <button
                  onClick={() => setInquiryDialogOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={inquiryForm.name}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={inquiryForm.email}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={inquiryForm.phone}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+971 XX XXX XXXX"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Inquiry Type</label>
                  <select
                    value={inquiryForm.inquiryType}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, inquiryType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="viewing">Schedule Viewing</option>
                    <option value="purchase">Purchase Interest</option>
                    <option value="rent">Rental Interest</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={inquiryForm.message}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us more about your requirements..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setInquiryDialogOpen(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInquirySubmit}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Send Inquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail; 