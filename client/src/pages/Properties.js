import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProperties, setFilters, clearFilters } from '../store/slices/propertySlice';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  HomeIcon,
  BuildingOfficeIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  HeartIcon,
  ShareIcon,
  StarIcon,
  ChevronDownIcon,
  ViewColumnsIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const Properties = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { 
    properties, 
    pagination, 
    filters, 
    isLoading, 
    error 
  } = useSelector((state) => state.properties);

  const [localFilters, setLocalFilters] = useState(filters);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState(new Set());
  const [sortBy, setSortBy] = useState('-createdAt');

  useEffect(() => {
    dispatch(fetchProperties(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    dispatch(setFilters({ ...localFilters, page: 1 }));
    setShowFilters(false);
  };

  const clearAllFilters = () => {
    const resetFilters = {
      search: '',
      type: '',
      minPrice: '',
      maxPrice: '',
      city: '',
      state: '',
      minBedrooms: '',
      maxBedrooms: '',
      minBathrooms: '',
      maxBathrooms: '',
      minArea: '',
      maxArea: '',
      amenities: [],
      featured: false,
      sort: '-createdAt',
      page: 1,
      limit: 12,
    };
    setLocalFilters(resetFilters);
    dispatch(clearFilters());
    setShowFilters(false);
  };

  const handlePageChange = (page) => {
    dispatch(setFilters({ ...filters, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = (propertyId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId);
      } else {
        newFavorites.add(propertyId);
      }
      return newFavorites;
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const PropertyCard = ({ property, index }) => {
    const isFavorite = favorites.has(property._id);
    
    return (
      <div 
        className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-2 animate-fade-in ${
          viewMode === 'list' ? 'flex' : ''
        }`}
        style={{ animationDelay: `${index * 100}ms` }}
        onClick={() => navigate(`/properties/${property._id}`)}
      >
        <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-80 flex-shrink-0' : ''}`}>
          <img
            src={property.images?.[0] || '/placeholder-property.jpg'}
            alt={property.title}
            className={`object-cover group-hover:scale-110 transition-transform duration-700 ${
              viewMode === 'list' ? 'w-full h-full' : 'w-full h-64'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Property Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-semibold capitalize">
              {property.type}
            </span>
            {property.featured && (
              <span className="bg-yellow-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <StarIcon className="w-4 h-4" />
                Featured
              </span>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(property._id);
              }}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              {isFavorite ? (
                <HeartIconSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              <ShareIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          {/* Price Badge */}
          <div className="absolute bottom-4 right-4 bg-gray-900/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
            <span className="text-lg font-bold">{formatPrice(property.price)}</span>
          </div>
        </div>
        
        <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{property.title}</h3>
          
          <div className="flex items-center text-gray-600 mb-4">
            <MapPinIcon className="w-4 h-4 mr-2" />
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
                <span className="text-sm font-medium">{property.area} sq ft</span>
              </div>
            </div>
          </div>
          
          {viewMode === 'list' && (
            <div className="mt-4">
              <p className="text-gray-600 text-sm line-clamp-2">{property.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {property.amenities?.slice(0, 3).map((amenity, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    {amenity}
                  </span>
                ))}
                {property.amenities?.length > 3 && (
                  <span className="text-gray-500 text-xs">+{property.amenities.length - 3} more</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const FilterPanel = () => (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Filters</h3>
        <button
          onClick={() => setShowFilters(false)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={localFilters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
          <select
            value={localFilters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="condo">Condo</option>
            <option value="townhouse">Townhouse</option>
            <option value="villa">Villa</option>
            <option value="penthouse">Penthouse</option>
            <option value="studio">Studio</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Min Price"
              value={localFilters.minPrice || ''}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={localFilters.maxPrice || ''}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="City"
              value={localFilters.city || ''}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="State"
              value={localFilters.state || ''}
              onChange={(e) => handleFilterChange('state', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Bedrooms & Bathrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms & Bathrooms</label>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={localFilters.minBedrooms || ''}
              onChange={(e) => handleFilterChange('minBedrooms', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Any Bedrooms</option>
              <option value="1">1+ Bedrooms</option>
              <option value="2">2+ Bedrooms</option>
              <option value="3">3+ Bedrooms</option>
              <option value="4">4+ Bedrooms</option>
              <option value="5">5+ Bedrooms</option>
            </select>
            <select
              value={localFilters.minBathrooms || ''}
              onChange={(e) => handleFilterChange('minBathrooms', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Any Bathrooms</option>
              <option value="1">1+ Bathrooms</option>
              <option value="2">2+ Bathrooms</option>
              <option value="3">3+ Bathrooms</option>
              <option value="4">4+ Bathrooms</option>
            </select>
          </div>
        </div>

        {/* Area Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Area (sq ft)</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Min Area"
              value={localFilters.minArea || ''}
              onChange={(e) => handleFilterChange('minArea', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Max Area"
              value={localFilters.maxArea || ''}
              onChange={(e) => handleFilterChange('maxArea', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Featured Properties */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={localFilters.featured || false}
              onChange={(e) => handleFilterChange('featured', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Featured Properties Only</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={applyFilters}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
          >
            Apply Filters
          </button>
          <button
            onClick={clearAllFilters}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Property Listings
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Discover your perfect home from our extensive collection of properties across UAE
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {pagination?.totalProperties || 0} Properties Found
            </h2>
            {isLoading && (
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  dispatch(setFilters({ ...filters, sort: e.target.value }));
                }}
                className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="area">Area: Small to Large</option>
                <option value="-area">Area: Large to Small</option>
              </select>
              <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="hidden md:flex bg-white border border-gray-300 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ViewColumnsIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Bars3Icon className="w-5 h-5" />
              </button>
            </div>

            {/* Filters Button */}
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        {/* Properties Grid/List */}
        {isLoading ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[...Array(9)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {(properties || []).map((property, index) => (
                <PropertyCard 
                  key={property._id} 
                  property={property} 
                  index={index} 
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination?.totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-xl transition-colors ${
                          page === pagination.currentPage
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* No Results */}
            {(!properties || properties.length === 0) && !isLoading && (
              <div className="text-center py-16">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No properties found</h3>
                <p className="text-gray-600 mb-8">Try adjusting your search criteria or clearing filters</p>
                <button 
                  onClick={clearAllFilters}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter Sidebar */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <FilterPanel />
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties; 