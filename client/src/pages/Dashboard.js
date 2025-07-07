import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  fetchProperties, 
  fetchPropertyStats,
  createProperty,
  updateProperty,
  deleteProperty 
} from '../store/slices/propertySlice';
import { 
  fetchClients, 
  fetchClientStats,
  fetchUrgentClients,
  updateClientStatus
} from '../store/slices/clientSlice';
import { 
  fetchTodayViewings,
  fetchUpcomingViewings,
  fetchViewingStats,
  createViewing 
} from '../store/slices/viewingSlice';
import { loadUser } from '../store/slices/authSlice';

// Import Heroicons
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  TrendingUpIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  StarIcon,
  CheckCircleIcon,
  ClockIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid,
  UsersIcon as UsersIconSolid,
  CalendarIcon as CalendarIconSolid,
  ArrowTrendingUpIcon as TrendingUpIconSolid,
} from '@heroicons/react/24/solid';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const { user, isAuthenticated, token } = useSelector(state => state.auth);
  const { properties, isLoading: isLoadingProperties, error: propertyError, stats: propertyStats } = useSelector(state => state.properties);
  const { clients, urgentClients, isLoading: isLoadingClients, stats: clientStats } = useSelector(state => state.clients);
  const { todayViewings, upcomingViewings, isLoading: isLoadingViewings, stats: viewingStats } = useSelector(state => state.viewings);

  // Debug information - remove this in production
  console.log('🔍 Dashboard Debug Info:', {
    isAuthenticated,
    hasToken: !!token,
    hasUser: !!user,
    propertiesCount: properties.length,
    clientsCount: clients.length,
    isLoadingProperties,
    isLoadingClients,
    isLoadingViewings,
    propertyError
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [propertyDialog, setPropertyDialog] = useState({ open: false, property: null });
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPropertyMenu, setShowPropertyMenu] = useState(null);
  const [viewingDialog, setViewingDialog] = useState({ open: false, client: null });
  const [viewingForm, setViewingForm] = useState({
    scheduledDate: '',
    scheduledTime: '',
    duration: 60,
    notes: '',
    type: 'individual',
    selectedProperty: ''
  });

  const [propertyForm, setPropertyForm] = useState({
    title: '',
    description: '',
    price: '',
    type: 'house',
    listingType: 'sale',
    bedrooms: '',
    bathrooms: '',
    area: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
    amenities: [],
    images: [],
    featured: false,
    status: 'active',
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Load dashboard data only once on mount
    dispatch(loadUser());
    dispatch(fetchPropertyStats());
    dispatch(fetchClientStats());
    dispatch(fetchViewingStats());
    // Fetch agent-specific properties for dashboard
    dispatch(fetchProperties({ limit: 10, sort: '-createdAt', agentOnly: true }));
    dispatch(fetchClients({ limit: 10, sort: '-createdAt' }));
    dispatch(fetchUrgentClients(5));
    dispatch(fetchTodayViewings());
    dispatch(fetchUpcomingViewings(7));
  }, [dispatch]);

  // Separate effect for logging (doesn't trigger data fetching)
  useEffect(() => {
    console.log('🔐 Auth state:', { user, isAuthenticated, token: !!token });
    console.log('📊 Properties state:', { count: properties.length, isLoading: isLoadingProperties, error: propertyError });
  }, [user, isAuthenticated, token, properties.length, isLoadingProperties, propertyError]);

  const handlePropertyEdit = (property) => {
    setPropertyForm({
      ...property,
      location: property.location || {
        address: '',
        city: '',
        state: '',
        zipCode: '',
      },
      amenities: property.amenities || [],
      images: property.images || [],
    });
    setImageFiles([]);
    setImagePreviews(property.images || []);
    setFormErrors({}); // Clear any previous errors
    setPropertyDialog({ open: true, property });
    setShowPropertyMenu(null);
  };

  const handlePropertyDelete = async (property) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      await dispatch(deleteProperty(property._id));
      setShowPropertyMenu(null);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handlePropertySubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      return;
    }
    
    try {
      const propertyData = {
        ...propertyForm,
        price: parseFloat(propertyForm.price),
        bedrooms: propertyForm.bedrooms ? parseInt(propertyForm.bedrooms) : 0,
        bathrooms: propertyForm.bathrooms ? parseInt(propertyForm.bathrooms) : 0,
        area: propertyForm.area ? parseFloat(propertyForm.area) : 0,
        images: imagePreviews, // Use the preview URLs as images for now
      };

      let result;
      if (propertyDialog.property) {
        result = await dispatch(updateProperty({ 
          id: propertyDialog.property._id, 
          propertyData 
        }));
      } else {
        result = await dispatch(createProperty(propertyData));
      }
      
      // Check if the action was successful
      if (result.type.endsWith('/fulfilled')) {
        // Refresh the properties list
        await dispatch(fetchProperties({ limit: 10, sort: '-createdAt', agentOnly: true }));
        
        // Close dialog and reset form
        setPropertyDialog({ open: false, property: null });
        setPropertyForm({
          title: '',
          description: '',
          price: '',
          type: 'house',
          listingType: 'sale',
          bedrooms: '',
          bathrooms: '',
          area: '',
          location: {
            address: '',
            city: '',
            state: '',
            zipCode: '',
          },
          amenities: [],
          images: [],
          featured: false,
          status: 'active',
        });
        setImageFiles([]);
        setImagePreviews([]);
        setFormErrors({});
      } else {
        console.error('❌ Property save failed:', result);
        // Extract error message from the result
        const errorMessage = result.payload?.message || result.error?.message || 'Failed to save property';
        alert(`Failed to save property: ${errorMessage}`);
      }
    } catch (error) {
      console.error('💥 Error saving property:', error);
      alert(`Error saving property: ${error.message}`);
    }
  };

  const handleClientStatusUpdate = async (clientId, status) => {
    console.log('🔄 Updating client status:', { clientId, status });
    
    // If changing to viewing_scheduled, show scheduling dialog first
    if (status === 'viewing_scheduled') {
      const client = clients.find(c => c._id === clientId);
      if (client) {
        setViewingDialog({ open: true, client });
        setViewingForm({
          scheduledDate: '',
          scheduledTime: '',
          duration: 60,
          notes: '',
          type: 'individual',
          selectedProperty: client.property ? client.property._id : ''
        });
        return; // Don't update status yet, wait for viewing to be scheduled
      }
    }
    
    try {
      const result = await dispatch(updateClientStatus({ id: clientId, status }));
      
      if (result.type.endsWith('/fulfilled')) {
        console.log('✅ Status updated successfully');
        // Show brief success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity';
        notification.textContent = 'Client status updated successfully!';
        document.body.appendChild(notification);
        
        // Remove notification after 2 seconds
        setTimeout(() => {
          notification.style.opacity = '0';
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 300);
        }, 2000);
        
        // Refresh client data to ensure UI is updated
        await dispatch(fetchClients({ limit: 10, sort: '-createdAt' }));
        await dispatch(fetchUrgentClients(5));
      } else {
        console.error('❌ Status update failed:', result);
        alert(`Failed to update status: ${result.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('💥 Error updating client status:', error);
      alert(`Error updating status: ${error.message}`);
    }
  };

  const handleViewingSubmit = async () => {
    try {
      // Validate form
      if (!viewingForm.scheduledDate || !viewingForm.scheduledTime) {
        alert('Please select both date and time for the viewing');
        return;
      }

      // Get the property ID from the client's inquiry or selected property
      let propertyId = null;
      
      // Check if client has a property in their inquiry
      if (viewingDialog.client.property) {
        propertyId = viewingDialog.client.property;
      } else if (viewingForm.selectedProperty) {
        // Use the selected property from the form
        propertyId = viewingForm.selectedProperty;
      } else {
        alert('Please select a property for the viewing');
        return;
      }

      // Create the viewing data
      const viewingData = {
        property: propertyId,
        client: viewingDialog.client._id,
        scheduledDateTime: new Date(`${viewingForm.scheduledDate}T${viewingForm.scheduledTime}`).toISOString(),
        duration: parseInt(viewingForm.duration),
        notes: viewingForm.notes,
        type: viewingForm.type,
        status: 'scheduled'
      };

      console.log('📅 Creating viewing with data:', viewingData);

      // Create the viewing
      const result = await dispatch(createViewing(viewingData));
      
      if (result.type.endsWith('/fulfilled')) {
        // Update client status to viewing_scheduled
        await dispatch(updateClientStatus({ 
          id: viewingDialog.client._id, 
          status: 'viewing_scheduled' 
        }));
        
        // Refresh data
        await dispatch(fetchClients({ limit: 10, sort: '-createdAt' }));
        await dispatch(fetchUrgentClients(5));
        await dispatch(fetchTodayViewings());
        await dispatch(fetchUpcomingViewings());
        
        // Close dialog
        setViewingDialog({ open: false, client: null });
        
        // Show success message
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.textContent = 'Viewing scheduled successfully!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.remove();
        }, 3000);
      } else {
        console.error('❌ Failed to create viewing:', result);
        alert(`Failed to schedule viewing: ${result.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('💥 Error scheduling viewing:', error);
      alert(`Error scheduling viewing: ${error.message}`);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-purple-100 text-purple-800',
      viewing_scheduled: 'bg-yellow-100 text-yellow-800',
      interested: 'bg-green-100 text-green-800',
      not_interested: 'bg-gray-100 text-gray-800',
      closed: 'bg-red-100 text-red-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'properties', label: 'Properties', icon: HomeIcon },
    { id: 'clients', label: 'Clients', icon: UsersIcon },
    { id: 'viewings', label: 'Viewings', icon: CalendarIcon },
  ];

  const StatCard = ({ title, value, icon: Icon, color, isLoading }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
            ) : (
              <span className="break-all">{value}</span>
            )}
          </p>
        </div>
        <div className={`p-3 rounded-xl ${color} flex-shrink-0 ml-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const PropertyCard = ({ property }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="relative">
        <img
          src={property.images?.[0] || '/placeholder-property.jpg'}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(property.status)}`}>
            {property.status}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <div className="relative">
            <button
              onClick={() => setShowPropertyMenu(showPropertyMenu === property._id ? null : property._id)}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            >
              <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
            </button>
            {showPropertyMenu === property._id && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
                <button
                  onClick={() => navigate(`/properties/${property._id}`)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <EyeIcon className="w-4 h-4" />
                  View Details
                </button>
                <button
                  onClick={() => handlePropertyEdit(property)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handlePropertyDelete(property)}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.title}</h3>
        <div className="flex items-center text-gray-600 mb-3">
          <MapPinIcon className="w-4 h-4 mr-1" />
          <span className="text-sm">{property.location?.city}, {property.location?.state}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">{formatPrice(property.price)}</span>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{property.bedrooms}bed</span>
            <span>•</span>
            <span>{property.bathrooms}bath</span>
            <span>•</span>
            <span>{property.area}sqft</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Form validation function
  const validateForm = () => {
    const errors = {};

    // Title validation
    if (!propertyForm.title.trim()) {
      errors.title = 'Property title is required';
    } else if (propertyForm.title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    } else if (propertyForm.title.length > 100) {
      errors.title = 'Title cannot exceed 100 characters';
    }

    // Price validation
    if (!propertyForm.price) {
      errors.price = 'Price is required';
    } else if (parseFloat(propertyForm.price) <= 0) {
      errors.price = 'Price must be greater than 0';
    } else if (parseFloat(propertyForm.price) > 100000000) {
      errors.price = 'Price cannot exceed 100 million AED';
    }

    // Bedrooms validation
    if (propertyForm.bedrooms !== '') {
      const bedrooms = parseInt(propertyForm.bedrooms);
      if (isNaN(bedrooms) || bedrooms < 0) {
        errors.bedrooms = 'Bedrooms must be a valid number';
      } else if (bedrooms > 20) {
        errors.bedrooms = 'Bedrooms cannot exceed 20';
      }
    }

    // Bathrooms validation
    if (propertyForm.bathrooms !== '') {
      const bathrooms = parseInt(propertyForm.bathrooms);
      if (isNaN(bathrooms) || bathrooms < 0) {
        errors.bathrooms = 'Bathrooms must be a valid number';
      } else if (bathrooms > 20) {
        errors.bathrooms = 'Bathrooms cannot exceed 20';
      }
    }

    // Area validation
    if (propertyForm.area !== '') {
      const area = parseFloat(propertyForm.area);
      if (isNaN(area) || area <= 0) {
        errors.area = 'Area must be a valid positive number';
      } else if (area > 50000) {
        errors.area = 'Area cannot exceed 50,000 sq ft';
      }
    }

    // Location validation
    if (!propertyForm.location.address.trim()) {
      errors.address = 'Address is required';
    }
    if (!propertyForm.location.city.trim()) {
      errors.city = 'City is required';
    }
    if (!propertyForm.location.state.trim()) {
      errors.state = 'State is required';
    }

    // Description validation
    if (propertyForm.description && propertyForm.description.length > 2000) {
      errors.description = 'Description cannot exceed 2000 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddNewProperty = () => {
    setPropertyForm({
      title: '',
      description: '',
      price: '',
      type: 'house',
      listingType: 'sale',
      bedrooms: '',
      bathrooms: '',
      area: '',
      location: {
        address: '',
        city: '',
        state: '',
        zipCode: '',
      },
      amenities: [],
      images: [],
      featured: false,
      status: 'active',
    });
    setImageFiles([]);
    setImagePreviews([]);
    setFormErrors({}); // Clear any previous errors
    setPropertyDialog({ open: true, property: null });
  };

  // Real-time validation handlers
  const handleBedroomsChange = (e) => {
    const value = e.target.value;
    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 20)) {
      setPropertyForm(prev => ({ ...prev, bedrooms: value }));
      // Clear error if value is now valid
      if (formErrors.bedrooms && (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 20))) {
        setFormErrors(prev => ({ ...prev, bedrooms: '' }));
      }
    }
  };

  const handleBathroomsChange = (e) => {
    const value = e.target.value;
    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 20)) {
      setPropertyForm(prev => ({ ...prev, bathrooms: value }));
      // Clear error if value is now valid
      if (formErrors.bathrooms && (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 20))) {
        setFormErrors(prev => ({ ...prev, bathrooms: '' }));
      }
    }
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 100000000)) {
      setPropertyForm(prev => ({ ...prev, price: value }));
      // Clear error if value is now valid
      if (formErrors.price && value !== '' && parseFloat(value) > 0) {
        setFormErrors(prev => ({ ...prev, price: '' }));
      }
    }
  };

  const handleAreaChange = (e) => {
    const value = e.target.value;
    if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 50000)) {
      setPropertyForm(prev => ({ ...prev, area: value }));
      // Clear error if value is now valid
      if (formErrors.area && value !== '' && parseFloat(value) > 0) {
        setFormErrors(prev => ({ ...prev, area: '' }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug Panel - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Debug Info:</strong> Auth: {isAuthenticated ? '✅' : '❌'} | 
                Token: {token ? '✅' : '❌'} | 
                User: {user?.name || 'None'} | 
                Properties: {properties.length} | 
                Clients: {clients.length}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Dashboard</h1>
          <p className="text-gray-600">Manage your properties, clients, and viewings from one central location</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Properties"
            value={propertyStats?.total || 0}
            icon={HomeIconSolid}
            color="bg-blue-500"
            isLoading={false}
          />
          <StatCard
            title="Active Clients"
            value={clientStats?.totalClients || 0}
            icon={UsersIconSolid}
            color="bg-green-500"
            isLoading={false}
          />
          <StatCard
            title="Today's Viewings"
            value={todayViewings?.length || 0}
            icon={CalendarIconSolid}
            color="bg-yellow-500"
            isLoading={false}
          />
          <StatCard
            title="Revenue This Month"
            value={formatPrice(
              // Calculate revenue based on average property price * total properties * commission rate (3%)
              (propertyStats?.averagePrice || 0) * (propertyStats?.total || 0) * 0.03 || 0
            )}
            icon={TrendingUpIconSolid}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            isLoading={false}
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Recent Properties and Urgent Clients */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Properties */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Recent Properties</h2>
                      <button
                        onClick={() => setActiveTab('properties')}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View All
                      </button>
                    </div>
                    <div className="space-y-4">
                      {properties.slice(0, 5).map((property) => (
                        <div key={property._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <HomeIcon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{property.title}</h3>
                            <p className="text-sm text-gray-600">{property.location?.city}, {property.location?.state}</p>
                            <p className="text-sm font-medium text-blue-600">{formatPrice(property.price)}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                            {property.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Urgent Clients */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Urgent Clients</h2>
                      <button
                        onClick={() => setActiveTab('clients')}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View All
                      </button>
                    </div>
                    <div className="space-y-4">
                      {urgentClients.map((client) => (
                        <div key={client._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <UsersIcon className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{client.name}</h3>
                            <p className="text-sm text-gray-600">{client.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                                {client.status}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(client.priority)}`}>
                                {client.priority}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                              <PhoneIcon className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors">
                              <EnvelopeIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Today's Viewings */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Today's Viewings</h2>
                    <button
                      onClick={() => setActiveTab('viewings')}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      View All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {todayViewings.map((viewing) => (
                      <div key={viewing._id} className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <CalendarIcon className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{viewing.property?.title || 'Property'}</h3>
                            <p className="text-sm text-gray-600">Client: {viewing.client?.name || 'Unknown'}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{formatDate(viewing.scheduledDateTime)}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            viewing.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {viewing.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'properties' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Property Management</h2>
                  <button
                    onClick={handleAddNewProperty}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Add New Property
                  </button>
                </div>
                {properties.length === 0 ? (
                  <div className="text-center py-12">
                    <HomeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Yet</h3>
                    <p className="text-gray-600 mb-4">Start by adding your first property to manage</p>
                    <button
                      onClick={handleAddNewProperty}
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Add Your First Property
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                      <PropertyCard key={property._id} property={property} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'clients' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Client Management</h2>
                </div>
                <div className="space-y-4">
                  {clients.map((client) => (
                    <div key={client._id} className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <UsersIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{client.name}</h3>
                          <p className="text-sm text-gray-600">{client.email}</p>
                          <p className="text-sm text-gray-600">{client.phone}</p>
                          <p className="text-sm text-gray-500">Property: {client.property?.title || 'N/A'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <select
                            value={client.status}
                            onChange={(e) => handleClientStatusUpdate(client._id, e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="viewing_scheduled">Viewing Scheduled</option>
                            <option value="interested">Interested</option>
                            <option value="not_interested">Not Interested</option>
                            <option value="closed">Closed</option>
                          </select>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(client.priority)}`}>
                            {client.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'viewings' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Viewing Management</h2>
                </div>
                <div className="space-y-4">
                  {upcomingViewings.map((viewing) => (
                    <div key={viewing._id} className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                          <CalendarIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{viewing.property?.title || 'Property'}</h3>
                          <p className="text-sm text-gray-600">Client: {viewing.client?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-600">{formatDate(viewing.scheduledDateTime)}</p>
                          <p className="text-sm text-gray-500">Duration: {viewing.duration} minutes</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          viewing.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {viewing.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Property Dialog */}
      {propertyDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {propertyDialog.property ? 'Edit Property' : 'Add New Property'}
                </h2>
                <button
                  onClick={() => setPropertyDialog({ open: false, property: null })}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handlePropertySubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Title</label>
                  <input
                    type="text"
                    value={propertyForm.title}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    maxLength={100}
                    required
                  />
                  {formErrors.title && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (AED)</label>
                  <input
                    type="number"
                    value={propertyForm.price}
                    onChange={handlePriceChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="1"
                    max="100000000"
                    required
                  />
                  {formErrors.price && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                  <select
                    value={propertyForm.type}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="villa">Villa</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type</label>
                  <select
                    value={propertyForm.listingType}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, listingType: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                  <input
                    type="number"
                    value={propertyForm.bedrooms}
                    onChange={handleBedroomsChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.bedrooms ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                    max="20"
                    placeholder="0"
                  />
                  {formErrors.bedrooms && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.bedrooms}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                  <input
                    type="number"
                    value={propertyForm.bathrooms}
                    onChange={handleBathroomsChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.bathrooms ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                    max="20"
                    placeholder="0"
                  />
                  {formErrors.bathrooms && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.bathrooms}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area (sq ft)</label>
                  <input
                    type="number"
                    value={propertyForm.area}
                    onChange={handleAreaChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.area ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="1"
                    max="50000"
                    placeholder="0"
                  />
                  {formErrors.area && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.area}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={propertyForm.location.address}
                    onChange={(e) => setPropertyForm(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, address: e.target.value }
                    }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.address && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={propertyForm.location.city}
                    onChange={(e) => setPropertyForm(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, city: e.target.value }
                    }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.city && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={propertyForm.location.state}
                    onChange={(e) => setPropertyForm(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, state: e.target.value }
                    }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.state && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.state}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={propertyForm.location.zipCode}
                    onChange={(e) => setPropertyForm(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, zipCode: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={propertyForm.description}
                    onChange={(e) => setPropertyForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    maxLength={2000}
                    placeholder="Describe the property features, location, and amenities..."
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    {propertyForm.description.length}/2000 characters
                  </p>
                </div>

                {/* Image Upload Section */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Images</label>
                  
                  {/* Image Upload Input */}
                  <div className="mb-4">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <div className="text-center">
                        <PlusIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload images</p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                      </div>
                    </label>
                  </div>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Amenities Section */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-xl p-3">
                    {[
                      'Swimming Pool', 'Gym', 'Parking', 'Security', 'Balcony', 'Garden', 'Maid Room',
                      'Study Room', 'Walk-in Closet', 'Built-in Wardrobes', 'Central AC', 'Kitchen Appliances',
                      'Laundry Room', 'Storage Room', 'Elevator', 'Concierge', 'Sauna', 'Steam Room',
                      'Jacuzzi', 'BBQ Area', 'Children Play Area', 'Tennis Court', 'Basketball Court',
                      'Jogging Track', 'Covered Parking', 'Visitor Parking', 'CCTV', '24/7 Security',
                      'Intercom', 'Maintenance', 'Pets Allowed', 'Furnished', 'Semi Furnished'
                    ].map((amenity) => (
                      <label key={amenity} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={propertyForm.amenities.includes(amenity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPropertyForm(prev => ({
                                ...prev,
                                amenities: [...prev.amenities, amenity]
                              }));
                            } else {
                              setPropertyForm(prev => ({
                                ...prev,
                                amenities: prev.amenities.filter(a => a !== amenity)
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Featured Property Toggle */}
                <div className="md:col-span-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={propertyForm.featured}
                      onChange={(e) => setPropertyForm(prev => ({ ...prev, featured: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Mark as Featured Property</span>
                  </label>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setPropertyDialog({ open: false, property: null })}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  {propertyDialog.property ? 'Update' : 'Create'} Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Scheduling Dialog */}
      {viewingDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Schedule Viewing</h2>
                <button
                  onClick={() => setViewingDialog({ open: false, client: null })}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Client Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Viewing Details</h3>
                  <p className="text-sm text-gray-600">
                    <strong>Client:</strong> {viewingDialog.client?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Property:</strong> {viewingDialog.client?.property ? 'From client inquiry' : 'Select below'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Location:</strong> {viewingDialog.client?.location?.city || 'N/A'}
                  </p>
                </div>

                {/* Property Selection (if client doesn't have a specific property) */}
                {!viewingDialog.client?.property && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Property *
                    </label>
                    <select
                      value={viewingForm.selectedProperty || ''}
                      onChange={(e) => setViewingForm(prev => ({ ...prev, selectedProperty: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Choose a property...</option>
                      {properties.map(property => (
                        <option key={property._id} value={property._id}>
                          {property.title} - {property.location.city} ({property.type})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Viewing Date *
                  </label>
                  <input
                    type="date"
                    value={viewingForm.scheduledDate}
                    onChange={(e) => setViewingForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Viewing Time *
                  </label>
                  <input
                    type="time"
                    value={viewingForm.scheduledTime}
                    onChange={(e) => setViewingForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <select
                    value={viewingForm.duration}
                    onChange={(e) => setViewingForm(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Viewing Type
                  </label>
                  <select
                    value={viewingForm.type}
                    onChange={(e) => setViewingForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="individual">Individual Viewing</option>
                    <option value="group">Group Viewing</option>
                    <option value="virtual">Virtual Viewing</option>
                    <option value="open_house">Open House</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={viewingForm.notes}
                    onChange={(e) => setViewingForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any special instructions or notes for the viewing..."
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setViewingDialog({ open: false, client: null })}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleViewingSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Schedule Viewing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
