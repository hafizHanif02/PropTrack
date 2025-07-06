import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Async thunks for API calls
export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const response = await fetch(`${API_URL}/clients?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch clients');
    }
    return response.json();
  }
);

export const fetchClientById = createAsyncThunk(
  'clients/fetchClientById',
  async (id) => {
    const response = await fetch(`${API_URL}/clients/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch client');
    }
    return response.json();
  }
);

export const fetchClientStats = createAsyncThunk(
  'clients/fetchClientStats',
  async () => {
    const response = await fetch(`${API_URL}/clients/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch client statistics');
    }
    return response.json();
  }
);

export const fetchUrgentClients = createAsyncThunk(
  'clients/fetchUrgentClients',
  async (limit = 5) => {
    const response = await fetch(`${API_URL}/clients/urgent?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch urgent clients');
    }
    return response.json();
  }
);

export const createClient = createAsyncThunk(
  'clients/createClient',
  async (clientData) => {
    const response = await fetch(`${API_URL}/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });
    if (!response.ok) {
      throw new Error('Failed to create client');
    }
    return response.json();
  }
);

export const updateClient = createAsyncThunk(
  'clients/updateClient',
  async ({ id, clientData }) => {
    const response = await fetch(`${API_URL}/clients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });
    if (!response.ok) {
      throw new Error('Failed to update client');
    }
    return response.json();
  }
);

export const updateClientStatus = createAsyncThunk(
  'clients/updateClientStatus',
  async ({ id, status }) => {
    const response = await fetch(`${API_URL}/clients/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error('Failed to update client status');
    }
    return response.json();
  }
);

export const updateClientPriority = createAsyncThunk(
  'clients/updateClientPriority',
  async ({ id, priority }) => {
    const response = await fetch(`${API_URL}/clients/${id}/priority`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priority }),
    });
    if (!response.ok) {
      throw new Error('Failed to update client priority');
    }
    return response.json();
  }
);

export const deleteClient = createAsyncThunk(
  'clients/deleteClient',
  async (id) => {
    const response = await fetch(`${API_URL}/clients/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete client');
    }
    return { id };
  }
);

export const createClientInquiry = createAsyncThunk(
  'clients/createClientInquiry',
  async (inquiryData) => {
    const response = await fetch(`${API_URL}/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inquiryData),
    });
    if (!response.ok) {
      throw new Error('Failed to create client inquiry');
    }
    return response.json();
  }
);

const initialState = {
  clients: [],
  currentClient: null,
  urgentClients: [],
  stats: null,
  pagination: {
    totalPages: 0,
    currentPage: 1,
    totalClients: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  isLoading: false,
  isLoadingStats: false,
  isLoadingUrgent: false,
  error: null,
};

const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    clearCurrentClient: (state) => {
      state.currentClient = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch clients
      .addCase(fetchClients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle API response structure: { success, data, pagination }
        if (action.payload.success && action.payload.data) {
          state.clients = Array.isArray(action.payload.data) ? action.payload.data : [];
          state.pagination = action.payload.pagination || {
            totalPages: 1,
            currentPage: 1,
            totalClients: action.payload.data.length,
            hasNextPage: false,
            hasPrevPage: false,
          };
        } else if (Array.isArray(action.payload)) {
          state.clients = action.payload;
          state.pagination = {
            totalPages: 1,
            currentPage: 1,
            totalClients: action.payload.length,
            hasNextPage: false,
            hasPrevPage: false,
          };
        } else {
          state.clients = [];
          state.pagination = {
            totalPages: 1,
            currentPage: 1,
            totalClients: 0,
            hasNextPage: false,
            hasPrevPage: false,
          };
        }
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Fetch client by ID
      .addCase(fetchClientById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentClient = action.payload;
      })
      .addCase(fetchClientById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Fetch client stats
      .addCase(fetchClientStats.pending, (state) => {
        state.isLoadingStats = true;
        state.error = null;
      })
      .addCase(fetchClientStats.fulfilled, (state, action) => {
        state.isLoadingStats = false;
        // Handle API response structure: { success, data }
        if (action.payload.success && action.payload.data) {
          state.stats = action.payload.data;
        } else {
          state.stats = action.payload;
        }
      })
      .addCase(fetchClientStats.rejected, (state, action) => {
        state.isLoadingStats = false;
        state.error = action.error.message;
      })
      // Fetch urgent clients
      .addCase(fetchUrgentClients.pending, (state) => {
        state.isLoadingUrgent = true;
        state.error = null;
      })
      .addCase(fetchUrgentClients.fulfilled, (state, action) => {
        state.isLoadingUrgent = false;
        // Handle API response structure: { success, data }
        if (action.payload.success && action.payload.data) {
          state.urgentClients = Array.isArray(action.payload.data) ? action.payload.data : [];
        } else if (Array.isArray(action.payload)) {
          state.urgentClients = action.payload;
        } else {
          state.urgentClients = [];
        }
      })
      .addCase(fetchUrgentClients.rejected, (state, action) => {
        state.isLoadingUrgent = false;
        state.error = action.error.message;
      })
      // Create client
      .addCase(createClient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clients.unshift(action.payload);
      })
      .addCase(createClient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Update client
      .addCase(updateClient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.clients.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
        if (state.currentClient && state.currentClient._id === action.payload._id) {
          state.currentClient = action.payload;
        }
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Update client status
      .addCase(updateClientStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateClientStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle API response structure: { success, data }
        const updatedClient = action.payload.success ? action.payload.data : action.payload;
        const index = state.clients.findIndex(c => c._id === updatedClient._id);
        if (index !== -1) {
          state.clients[index] = updatedClient;
        }
        // Update urgent clients if needed
        const urgentIndex = state.urgentClients.findIndex(c => c._id === updatedClient._id);
        if (urgentIndex !== -1) {
          state.urgentClients[urgentIndex] = updatedClient;
        }
      })
      .addCase(updateClientStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Update client priority
      .addCase(updateClientPriority.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateClientPriority.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.clients.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
        // Update urgent clients if needed
        const urgentIndex = state.urgentClients.findIndex(c => c._id === action.payload._id);
        if (urgentIndex !== -1) {
          state.urgentClients[urgentIndex] = action.payload;
        }
      })
      .addCase(updateClientPriority.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Delete client
      .addCase(deleteClient.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clients = state.clients.filter(c => c._id !== action.payload.id);
        state.urgentClients = state.urgentClients.filter(c => c._id !== action.payload.id);
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Create client inquiry
      .addCase(createClientInquiry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createClientInquiry.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle API response structure: { success, data }
        const newClient = action.payload.success ? action.payload.data : action.payload;
        state.clients.unshift(newClient);
      })
      .addCase(createClientInquiry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearCurrentClient, clearError } = clientSlice.actions;
export default clientSlice.reducer; 