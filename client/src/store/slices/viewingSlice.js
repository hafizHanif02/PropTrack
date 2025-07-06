import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Async thunks for API calls
export const fetchViewings = createAsyncThunk(
  'viewings/fetchViewings',
  async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const response = await fetch(`${API_URL}/viewings?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch viewings');
    }
    return response.json();
  }
);

export const fetchViewingById = createAsyncThunk(
  'viewings/fetchViewingById',
  async (id) => {
    const response = await fetch(`${API_URL}/viewings/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch viewing');
    }
    return response.json();
  }
);

export const fetchTodayViewings = createAsyncThunk(
  'viewings/fetchTodayViewings',
  async () => {
    const response = await fetch(`${API_URL}/viewings/today`);
    if (!response.ok) {
      throw new Error('Failed to fetch today\'s viewings');
    }
    return response.json();
  }
);

export const fetchUpcomingViewings = createAsyncThunk(
  'viewings/fetchUpcomingViewings',
  async (days = 7) => {
    const response = await fetch(`${API_URL}/viewings/upcoming?days=${days}`);
    if (!response.ok) {
      throw new Error('Failed to fetch upcoming viewings');
    }
    return response.json();
  }
);

export const fetchViewingStats = createAsyncThunk(
  'viewings/fetchViewingStats',
  async () => {
    const response = await fetch(`${API_URL}/viewings/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch viewing statistics');
    }
    return response.json();
  }
);

export const createViewing = createAsyncThunk(
  'viewings/createViewing',
  async (viewingData) => {
    const response = await fetch(`${API_URL}/viewings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(viewingData),
    });
    if (!response.ok) {
      throw new Error('Failed to create viewing');
    }
    return response.json();
  }
);

export const updateViewing = createAsyncThunk(
  'viewings/updateViewing',
  async ({ id, viewingData }) => {
    const response = await fetch(`${API_URL}/viewings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(viewingData),
    });
    if (!response.ok) {
      throw new Error('Failed to update viewing');
    }
    return response.json();
  }
);

export const updateViewingStatus = createAsyncThunk(
  'viewings/updateViewingStatus',
  async ({ id, status }) => {
    const response = await fetch(`${API_URL}/viewings/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error('Failed to update viewing status');
    }
    return response.json();
  }
);

export const deleteViewing = createAsyncThunk(
  'viewings/deleteViewing',
  async (id) => {
    const response = await fetch(`${API_URL}/viewings/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete viewing');
    }
    return { id };
  }
);

export const checkAvailability = createAsyncThunk(
  'viewings/checkAvailability',
  async ({ propertyId, date, duration }) => {
    const response = await fetch(`${API_URL}/viewings/availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ propertyId, date, duration }),
    });
    if (!response.ok) {
      throw new Error('Failed to check availability');
    }
    return response.json();
  }
);

const initialState = {
  viewings: [],
  currentViewing: null,
  todayViewings: [],
  upcomingViewings: [],
  availability: null,
  stats: null,
  totalPages: 0,
  currentPage: 1,
  totalViewings: 0,
  filters: {
    status: '',
    propertyId: '',
    clientId: '',
    scheduledDate: '',
    page: 1,
    limit: 10,
  },
  isLoading: false,
  isLoadingViewing: false,
  isLoadingToday: false,
  isLoadingUpcoming: false,
  isLoadingAvailability: false,
  isLoadingStats: false,
  isCheckingAvailability: false,
  error: null,
};

const viewingSlice = createSlice({
  name: 'viewings',
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
    },
    clearCurrentViewing: (state) => {
      state.currentViewing = null;
    },
    clearAvailability: (state) => {
      state.availability = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch viewings
      .addCase(fetchViewings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchViewings.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle API response structure: { success, data, pagination }
        if (action.payload.success && action.payload.data) {
          state.viewings = Array.isArray(action.payload.data) ? action.payload.data : [];
          state.totalPages = action.payload.pagination?.totalPages || 1;
          state.currentPage = action.payload.pagination?.currentPage || 1;
          state.totalViewings = action.payload.pagination?.totalViewings || action.payload.data.length;
        } else if (Array.isArray(action.payload)) {
          state.viewings = action.payload;
          state.totalPages = 1;
          state.currentPage = 1;
          state.totalViewings = action.payload.length;
        } else {
          state.viewings = [];
          state.totalPages = 1;
          state.currentPage = 1;
          state.totalViewings = 0;
        }
      })
      .addCase(fetchViewings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Fetch viewing by ID
      .addCase(fetchViewingById.pending, (state) => {
        state.isLoadingViewing = true;
        state.error = null;
      })
      .addCase(fetchViewingById.fulfilled, (state, action) => {
        state.isLoadingViewing = false;
        // Handle API response structure: { success, data }
        if (action.payload.success && action.payload.data) {
          state.currentViewing = action.payload.data;
        } else {
          state.currentViewing = action.payload;
        }
      })
      .addCase(fetchViewingById.rejected, (state, action) => {
        state.isLoadingViewing = false;
        state.error = action.error.message;
      })
      // Fetch today's viewings
      .addCase(fetchTodayViewings.pending, (state) => {
        state.isLoadingToday = true;
        state.error = null;
      })
      .addCase(fetchTodayViewings.fulfilled, (state, action) => {
        state.isLoadingToday = false;
        // Handle API response structure: { success, data }
        if (action.payload.success && action.payload.data) {
          state.todayViewings = Array.isArray(action.payload.data) ? action.payload.data : [];
        } else if (Array.isArray(action.payload)) {
          state.todayViewings = action.payload;
        } else {
          state.todayViewings = [];
        }
      })
      .addCase(fetchTodayViewings.rejected, (state, action) => {
        state.isLoadingToday = false;
        state.error = action.error.message;
      })
      // Fetch upcoming viewings
      .addCase(fetchUpcomingViewings.pending, (state) => {
        state.isLoadingUpcoming = true;
        state.error = null;
      })
      .addCase(fetchUpcomingViewings.fulfilled, (state, action) => {
        state.isLoadingUpcoming = false;
        // Handle API response structure: { success, data }
        if (action.payload.success && action.payload.data) {
          state.upcomingViewings = Array.isArray(action.payload.data) ? action.payload.data : [];
        } else if (Array.isArray(action.payload)) {
          state.upcomingViewings = action.payload;
        } else {
          state.upcomingViewings = [];
        }
      })
      .addCase(fetchUpcomingViewings.rejected, (state, action) => {
        state.isLoadingUpcoming = false;
        state.error = action.error.message;
      })
      // Fetch viewing stats
      .addCase(fetchViewingStats.pending, (state) => {
        state.isLoadingStats = true;
        state.error = null;
      })
      .addCase(fetchViewingStats.fulfilled, (state, action) => {
        state.isLoadingStats = false;
        // Handle API response structure: { success, data }
        if (action.payload.success && action.payload.data) {
          state.stats = action.payload.data;
        } else {
          state.stats = action.payload;
        }
      })
      .addCase(fetchViewingStats.rejected, (state, action) => {
        state.isLoadingStats = false;
        state.error = action.error.message;
      })
      // Create viewing
      .addCase(createViewing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createViewing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.viewings.unshift(action.payload);
        state.upcomingViewings.unshift(action.payload);
      })
      .addCase(createViewing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Update viewing
      .addCase(updateViewing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateViewing.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.viewings.findIndex(v => v._id === action.payload._id);
        if (index !== -1) {
          state.viewings[index] = action.payload;
        }
        if (state.currentViewing && state.currentViewing._id === action.payload._id) {
          state.currentViewing = action.payload;
        }
        // Update today's viewings if needed
        const todayIndex = state.todayViewings.findIndex(v => v._id === action.payload._id);
        if (todayIndex !== -1) {
          state.todayViewings[todayIndex] = action.payload;
        }
        // Update upcoming viewings if needed
        const upcomingIndex = state.upcomingViewings.findIndex(v => v._id === action.payload._id);
        if (upcomingIndex !== -1) {
          state.upcomingViewings[upcomingIndex] = action.payload;
        }
      })
      .addCase(updateViewing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Update viewing status
      .addCase(updateViewingStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateViewingStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.viewings.findIndex(v => v._id === action.payload._id);
        if (index !== -1) {
          state.viewings[index] = action.payload;
        }
        // Update today's viewings if needed
        const todayIndex = state.todayViewings.findIndex(v => v._id === action.payload._id);
        if (todayIndex !== -1) {
          state.todayViewings[todayIndex] = action.payload;
        }
        // Update upcoming viewings if needed
        const upcomingIndex = state.upcomingViewings.findIndex(v => v._id === action.payload._id);
        if (upcomingIndex !== -1) {
          state.upcomingViewings[upcomingIndex] = action.payload;
        }
      })
      .addCase(updateViewingStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Delete viewing
      .addCase(deleteViewing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteViewing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.viewings = state.viewings.filter(v => v._id !== action.payload.id);
        state.todayViewings = state.todayViewings.filter(v => v._id !== action.payload.id);
        state.upcomingViewings = state.upcomingViewings.filter(v => v._id !== action.payload.id);
      })
      .addCase(deleteViewing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Check availability
      .addCase(checkAvailability.pending, (state) => {
        state.isCheckingAvailability = true;
        state.error = null;
      })
      .addCase(checkAvailability.fulfilled, (state, action) => {
        state.isCheckingAvailability = false;
        state.availability = action.payload;
      })
      .addCase(checkAvailability.rejected, (state, action) => {
        state.isCheckingAvailability = false;
        state.error = action.error.message;
      });
  },
});

export const { 
  setFilters, 
  clearFilters, 
  clearError, 
  clearCurrentViewing, 
  clearAvailability 
} = viewingSlice.actions;

export default viewingSlice.reducer; 