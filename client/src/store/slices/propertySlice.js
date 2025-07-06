import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Async thunks for API calls
export const fetchProperties = createAsyncThunk(
  'properties/fetchProperties',
  async (params = {}) => {
    const { agentOnly = false, ...otherParams } = params;
    const queryParams = new URLSearchParams();
    
    // Add agentOnly parameter if specified
    if (agentOnly) {
      queryParams.append('agentOnly', 'true');
    }
    
    // Add other parameters
    Object.entries(otherParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'priceRange' && Array.isArray(value)) {
          queryParams.append('minPrice', value[0]);
          queryParams.append('maxPrice', value[1]);
        } else if (key === 'areaRange' && Array.isArray(value)) {
          queryParams.append('minArea', value[0]);
          queryParams.append('maxArea', value[1]);
        } else if (Array.isArray(value)) {
          value.forEach(item => queryParams.append(key, item));
        } else {
          queryParams.append(key, value);
        }
      }
    });
    
    const response = await fetch(`${API_URL}/properties?${queryParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch properties');
    }
    
    return response.json();
  }
);

export const fetchPropertyById = createAsyncThunk(
  'properties/fetchPropertyById',
  async (id) => {
    const response = await fetch(`${API_URL}/properties/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch property');
    }
    return response.json();
  }
);

export const fetchFeaturedProperties = createAsyncThunk(
  'properties/fetchFeaturedProperties',
  async () => {
    const response = await fetch(`${API_URL}/properties/featured/list`);
    if (!response.ok) {
      throw new Error('Failed to fetch featured properties');
    }
    return response.json();
  }
);

export const fetchSimilarProperties = createAsyncThunk(
  'properties/fetchSimilarProperties',
  async (id) => {
    const response = await fetch(`${API_URL}/properties/${id}/similar`);
    if (!response.ok) {
      throw new Error('Failed to fetch similar properties');
    }
    return response.json();
  }
);

export const fetchPropertyStats = createAsyncThunk(
  'properties/fetchPropertyStats',
  async () => {
    const response = await fetch(`${API_URL}/properties/stats/overview`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch property stats');
    }
    
    return response.json();
  }
);

export const createProperty = createAsyncThunk(
  'properties/createProperty',
  async (propertyData) => {
    const response = await fetch(`${API_URL}/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(propertyData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create property');
    }
    
    return response.json();
  }
);

export const updateProperty = createAsyncThunk(
  'properties/updateProperty',
  async ({ id, propertyData }) => {
    const response = await fetch(`${API_URL}/properties/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(propertyData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update property');
    }
    
    return response.json();
  }
);

export const deleteProperty = createAsyncThunk(
  'properties/deleteProperty',
  async (id) => {
    const response = await fetch(`${API_URL}/properties/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete property');
    }
    
    return { id };
  }
);

const initialState = {
  properties: [],
  currentProperty: null,
  featuredProperties: [],
  similarProperties: [],
  stats: null,
  pagination: {
    totalPages: 0,
    currentPage: 1,
    totalProperties: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  filters: {
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
  },
  isLoading: false,
  isLoadingProperty: false,
  isLoadingFeatured: false,
  isLoadingSimilar: false,
  isLoadingStats: false,
  error: null,
  similarError: null,
};

const propertySlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
      state.similarError = null;
    },
    clearCurrentProperty: (state) => {
      state.currentProperty = null;
      state.similarProperties = [];
      state.similarError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch properties
      .addCase(fetchProperties.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle API response structure: { success, data, pagination, filters }
        if (action.payload.success && action.payload.data && Array.isArray(action.payload.data)) {
          state.properties = action.payload.data;
          state.pagination = {
            totalPages: action.payload.pagination?.totalPages || 1,
            currentPage: action.payload.pagination?.currentPage || 1,
            totalProperties: action.payload.pagination?.totalProperties || action.payload.data.length,
            hasNextPage: action.payload.pagination?.hasNextPage || false,
            hasPrevPage: action.payload.pagination?.hasPrevPage || false,
          };
        } else if (action.payload.properties && Array.isArray(action.payload.properties)) {
          // Fallback for old response structure
          state.properties = action.payload.properties;
          state.pagination = {
            totalPages: action.payload.totalPages || 1,
            currentPage: action.payload.currentPage || 1,
            totalProperties: action.payload.totalProperties || action.payload.properties.length,
            hasNextPage: action.payload.hasNextPage || false,
            hasPrevPage: action.payload.hasPrevPage || false,
          };
        } else if (Array.isArray(action.payload)) {
          // Response is directly an array
          state.properties = action.payload;
          state.pagination = {
            totalPages: 1,
            currentPage: 1,
            totalProperties: action.payload.length,
            hasNextPage: false,
            hasPrevPage: false,
          };
        } else {
          // Fallback - ensure properties is always an array
          state.properties = [];
          state.pagination = {
            totalPages: 1,
            currentPage: 1,
            totalProperties: 0,
            hasNextPage: false,
            hasPrevPage: false,
          };
        }
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Fetch property by ID
      .addCase(fetchPropertyById.pending, (state) => {
        state.isLoadingProperty = true;
        state.error = null;
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.isLoadingProperty = false;
        // Handle API response structure: { success, data }
        if (action.payload.success && action.payload.data) {
          state.currentProperty = action.payload.data;
        } else {
          state.currentProperty = action.payload;
        }
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.isLoadingProperty = false;
        state.error = action.error.message;
      })
      // Fetch featured properties
      .addCase(fetchFeaturedProperties.pending, (state) => {
        state.isLoadingFeatured = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProperties.fulfilled, (state, action) => {
        state.isLoadingFeatured = false;
        // Handle API response structure: { success, data }
        if (action.payload.success && action.payload.data) {
          state.featuredProperties = Array.isArray(action.payload.data) ? action.payload.data : [];
        } else if (Array.isArray(action.payload)) {
          state.featuredProperties = action.payload;
        } else {
          state.featuredProperties = [];
        }
      })
      .addCase(fetchFeaturedProperties.rejected, (state, action) => {
        state.isLoadingFeatured = false;
        state.error = action.error.message;
      })
      // Fetch similar properties
      .addCase(fetchSimilarProperties.pending, (state) => {
        state.isLoadingSimilar = true;
        state.error = null;
      })
      .addCase(fetchSimilarProperties.fulfilled, (state, action) => {
        state.isLoadingSimilar = false;
        // Handle API response structure: { success, data }
        if (action.payload.success && action.payload.data) {
          state.similarProperties = Array.isArray(action.payload.data) ? action.payload.data : [];
        } else if (Array.isArray(action.payload)) {
          state.similarProperties = action.payload;
        } else {
          state.similarProperties = [];
        }
      })
      .addCase(fetchSimilarProperties.rejected, (state, action) => {
        state.isLoadingSimilar = false;
        state.similarError = action.error.message;
      })
      // Fetch property stats
      .addCase(fetchPropertyStats.pending, (state) => {
        state.isLoadingStats = true;
        state.error = null;
      })
      .addCase(fetchPropertyStats.fulfilled, (state, action) => {
        state.isLoadingStats = false;
        // Handle API response structure: { success, data }
        if (action.payload.success && action.payload.data) {
          state.stats = action.payload.data;
        } else {
          state.stats = action.payload;
        }
      })
      .addCase(fetchPropertyStats.rejected, (state, action) => {
        state.isLoadingStats = false;
        state.error = action.error.message;
      })
      // Create property
      .addCase(createProperty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        console.log('🎯 createProperty.fulfilled payload:', action.payload);
        state.isLoading = false;
        
        // Handle API response structure: { success, data }
        const newProperty = action.payload.success ? action.payload.data : action.payload;
        console.log('📝 Adding new property to state:', newProperty);
        
        state.properties.unshift(newProperty);
      })
      .addCase(createProperty.rejected, (state, action) => {
        console.error('❌ createProperty.rejected:', action.error);
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Update property
      .addCase(updateProperty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.properties.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.properties[index] = action.payload;
        }
        if (state.currentProperty && state.currentProperty._id === action.payload._id) {
          state.currentProperty = action.payload;
        }
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Delete property
      .addCase(deleteProperty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.isLoading = false;
        state.properties = state.properties.filter(p => p._id !== action.payload.id);
      })
      .addCase(deleteProperty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { setFilters, clearFilters, clearError, clearCurrentProperty } = propertySlice.actions;
export default propertySlice.reducer; 