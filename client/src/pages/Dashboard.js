import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home as PropertyIcon,
  People as ClientIcon,
  Event as ViewingIcon,
  TrendingUp as TrendingIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MoreVert as MoreIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
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
  fetchViewingStats 
} from '../store/slices/viewingSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { 
    properties, 
    stats: propertyStats, 
    isLoadingStats: isLoadingPropertyStats 
  } = useSelector((state) => state.properties);
  
  const { 
    clients, 
    urgentClients,
    stats: clientStats, 
    isLoadingStats: isLoadingClientStats 
  } = useSelector((state) => state.clients);
  
  const { 
    todayViewings,
    upcomingViewings
  } = useSelector((state) => state.viewings);

  const [activeTab, setActiveTab] = useState(0);
  const [propertyDialog, setPropertyDialog] = useState({ open: false, property: null });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const [propertyForm, setPropertyForm] = useState({
    title: '',
    description: '',
    price: '',
    type: 'house',
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

  useEffect(() => {
    // Load dashboard data
    dispatch(fetchPropertyStats());
    dispatch(fetchClientStats());
    dispatch(fetchViewingStats());
    dispatch(fetchProperties({ limit: 5, sort: '-createdAt' }));
    dispatch(fetchClients({ limit: 5, sort: '-createdAt' }));
    dispatch(fetchUrgentClients(5));
    dispatch(fetchTodayViewings());
    dispatch(fetchUpcomingViewings(7));
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePropertyMenuOpen = (event, property) => {
    setAnchorEl(event.currentTarget);
    setSelectedProperty(property);
  };

  const handlePropertyMenuClose = () => {
    setAnchorEl(null);
    setSelectedProperty(null);
  };

  const handlePropertyEdit = () => {
    setPropertyForm({
      ...selectedProperty,
      location: selectedProperty.location || {
        address: '',
        city: '',
        state: '',
        zipCode: '',
      },
      amenities: selectedProperty.amenities || [],
      images: selectedProperty.images || [],
    });
    setPropertyDialog({ open: true, property: selectedProperty });
    handlePropertyMenuClose();
  };

  const handlePropertyDelete = async () => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      await dispatch(deleteProperty(selectedProperty._id));
      handlePropertyMenuClose();
    }
  };

  const handlePropertySubmit = async () => {
    try {
      if (propertyDialog.property) {
        await dispatch(updateProperty({ 
          id: propertyDialog.property._id, 
          propertyData: propertyForm 
        }));
      } else {
        await dispatch(createProperty(propertyForm));
      }
      setPropertyDialog({ open: false, property: null });
      setPropertyForm({
        title: '',
        description: '',
        price: '',
        type: 'house',
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
    } catch (error) {
      console.error('Error saving property:', error);
    }
  };

  const handleClientStatusUpdate = async (clientId, status) => {
    await dispatch(updateClientStatus({ id: clientId, status }));
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
      new: 'primary',
      contacted: 'info',
      viewing_scheduled: 'warning',
      interested: 'success',
      not_interested: 'default',
      closed: 'secondary',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'error',
      medium: 'warning',
      low: 'success',
    };
    return colors[priority] || 'default';
  };

    return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ fontWeight: 700, color: 'primary.main' }}
        >
          Agent Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your properties, clients, and viewings from one central location
        </Typography>
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.15)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Properties
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {isLoadingPropertyStats ? (
                      <CircularProgress size={24} />
                    ) : (
                      propertyStats?.totalProperties || 0
                    )}
                  </Typography>
                </Box>
                <PropertyIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.15)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Active Clients
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {isLoadingClientStats ? (
                      <CircularProgress size={24} />
                    ) : (
                      clientStats?.totalClients || 0
                    )}
                  </Typography>
                </Box>
                <ClientIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.15)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Today's Viewings
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {todayViewings?.length || 0}
                  </Typography>
                </Box>
                <ViewingIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.15)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Revenue This Month
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {isLoadingPropertyStats ? (
                      <CircularProgress size={24} />
                    ) : (
                      formatPrice(propertyStats?.averagePrice * (propertyStats?.totalProperties || 0) * 0.1 || 0)
                    )}
                  </Typography>
                </Box>
                <TrendingIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper 
        sx={{ 
          mb: 3, 
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              py: 2,
            },
          }}
        >
          <Tab label="Overview" />
          <Tab label="Properties" />
          <Tab label="Clients" />
          <Tab label="Viewings" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Recent Properties */}
          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 3,
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Properties
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  View All
                </Button>
              </Box>
              <List>
                {properties.slice(0, 5).map((property) => (
                  <ListItem key={property._id} sx={{ px: 0, py: 1 }}>
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'primary.main',
                          width: 48,
                          height: 48,
                        }}
                      >
                        <PropertyIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {property.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {property.location?.city}, {property.location?.state}
                          </Typography>
                          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                            {formatPrice(property.price)}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Chip
                        label={property.status}
                        size="small"
                        color={property.status === 'available' ? 'success' : 'warning'}
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Urgent Clients */}
          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 3,
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Urgent Clients
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  View All
                </Button>
              </Box>
              <List>
                {urgentClients.map((client) => (
                  <ListItem key={client._id} sx={{ px: 0, py: 1 }}>
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'secondary.main',
                          width: 48,
                          height: 48,
                        }}
                      >
                        <ClientIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {client.name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {client.email}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip
                              label={client.status}
                              color={getStatusColor(client.status)}
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                            <Chip
                              label={client.priority}
                              color={getPriorityColor(client.priority)}
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                          </Box>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <IconButton size="small" color="primary">
                        <PhoneIcon />
                      </IconButton>
                      <IconButton size="small" color="secondary">
                        <EmailIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          
          {/* Today's Viewings */}
          <Grid item xs={12}>
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 3,
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Today's Viewings
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  View All
                </Button>
              </Box>
              <List>
                {todayViewings.map((viewing) => (
                  <ListItem key={viewing._id} sx={{ px: 0, py: 1 }}>
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'warning.main',
                          width: 48,
                          height: 48,
                        }}
                      >
                        <ViewingIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {viewing.property?.title || 'Property'}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Client: {viewing.client?.name || 'Unknown'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(viewing.scheduledDateTime)}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      label={viewing.status}
                      color={viewing.status === 'confirmed' ? 'success' : 'warning'}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Property Management</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setPropertyDialog({ open: true, property: null })}
            >
              Add New Property
            </Button>
          </Box>
          <Grid container spacing={2}>
            {properties.map((property) => (
              <Grid item xs={12} sm={6} md={4} key={property._id}>
                <Card>
                  <Box sx={{ position: 'relative' }}>
                    <img
                      src={property.images?.[0] || '/placeholder-property.jpg'}
                      alt={property.title}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                      }}
                    />
                    <IconButton
                      sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.8)' }}
                      onClick={(e) => handlePropertyMenuOpen(e, property)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {property.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <LocationIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      {property.location?.city}, {property.location?.state}
                    </Typography>
                    <Typography variant="h5" color="primary">
                      {formatPrice(property.price)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Chip label={property.type} size="small" />
                      <Chip 
                        label={property.status} 
                        color={property.status === 'active' ? 'success' : 'default'}
                        size="small" 
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Client Management
          </Typography>
          <List>
            {clients.map((client) => (
              <ListItem key={client._id}>
                <ListItemAvatar>
                  <Avatar>
                    <ClientIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={client.name}
                  secondary={
                    <Box>
                      <Typography variant="body2">{client.email}</Typography>
                      <Typography variant="body2">{client.phone}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Property: {client.property?.title || 'N/A'}
                      </Typography>
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={client.status}
                      onChange={(e) => handleClientStatusUpdate(client._id, e.target.value)}
                    >
                      <MenuItem value="new">New</MenuItem>
                      <MenuItem value="contacted">Contacted</MenuItem>
                      <MenuItem value="viewing_scheduled">Viewing Scheduled</MenuItem>
                      <MenuItem value="interested">Interested</MenuItem>
                      <MenuItem value="not_interested">Not Interested</MenuItem>
                      <MenuItem value="closed">Closed</MenuItem>
                    </Select>
                  </FormControl>
                  <Chip
                    label={client.priority}
                    color={getPriorityColor(client.priority)}
                    size="small"
                  />
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {activeTab === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Viewing Management
          </Typography>
          <List>
            {upcomingViewings.map((viewing) => (
              <ListItem key={viewing._id}>
                <ListItemAvatar>
                  <Avatar>
                    <ViewingIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={viewing.property?.title || 'Property'}
                  secondary={
                    <Box>
                      <Typography variant="body2">
                        Client: {viewing.client?.name || 'Unknown'}
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(viewing.scheduledDateTime)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Duration: {viewing.duration} minutes
                      </Typography>
                    </Box>
                  }
                />
                <Chip
                  label={viewing.status}
                  color={viewing.status === 'confirmed' ? 'success' : 'warning'}
                  size="small"
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Property Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handlePropertyMenuClose}
      >
        <MenuItem onClick={() => navigate(`/properties/${selectedProperty?._id}`)}>
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handlePropertyEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handlePropertyDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Property Dialog */}
      <Dialog
        open={propertyDialog.open}
        onClose={() => setPropertyDialog({ open: false, property: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {propertyDialog.property ? 'Edit Property' : 'Add New Property'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Property Title"
                value={propertyForm.title}
                onChange={(e) => setPropertyForm(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={propertyForm.price}
                onChange={(e) => setPropertyForm(prev => ({ ...prev, price: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Property Type</InputLabel>
                <Select
                  value={propertyForm.type}
                  label="Property Type"
                  onChange={(e) => setPropertyForm(prev => ({ ...prev, type: e.target.value }))}
                >
                  <MenuItem value="house">House</MenuItem>
                  <MenuItem value="apartment">Apartment</MenuItem>
                  <MenuItem value="condo">Condo</MenuItem>
                  <MenuItem value="townhouse">Townhouse</MenuItem>
                  <MenuItem value="villa">Villa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Bedrooms"
                type="number"
                value={propertyForm.bedrooms}
                onChange={(e) => setPropertyForm(prev => ({ ...prev, bedrooms: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Bathrooms"
                type="number"
                value={propertyForm.bathrooms}
                onChange={(e) => setPropertyForm(prev => ({ ...prev, bathrooms: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Area (sq ft)"
                type="number"
                value={propertyForm.area}
                onChange={(e) => setPropertyForm(prev => ({ ...prev, area: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={propertyForm.location.address}
                onChange={(e) => setPropertyForm(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, address: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={propertyForm.location.city}
                onChange={(e) => setPropertyForm(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, city: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="State"
                value={propertyForm.location.state}
                onChange={(e) => setPropertyForm(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, state: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Zip Code"
                value={propertyForm.location.zipCode}
                onChange={(e) => setPropertyForm(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, zipCode: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={propertyForm.description}
                onChange={(e) => setPropertyForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPropertyDialog({ open: false, property: null })}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handlePropertySubmit}>
            {propertyDialog.property ? 'Update' : 'Create'} Property
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
