import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Skeleton,
  Paper,
  Avatar,
  Rating,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fab,
  Zoom,
  Fade,
  Slide,
  useMediaQuery,
  useTheme,
  ImageList,
  ImageListItem,
  Tooltip,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Bed as BedIcon,
  Bathroom as BathroomIcon,
  SquareFoot as AreaIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  PhotoCamera as PhotoCameraIcon,
  Map as MapIcon,
  ExpandMore as ExpandMoreIcon,
  Star as StarIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Home as HomeIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  LocalOffer as LocalOfferIcon,
  Security as SecurityIcon,
  Wifi as WifiIcon,
  Pool as PoolIcon,
  FitnessCenter as GymIcon,
  LocalParking as ParkingIcon,
  Balcony as BalconyIcon,
  Kitchen as KitchenIcon,
  Bathtub as BathtubIcon,
  AcUnit as AcIcon,
  Elevator as ElevatorIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { fetchPropertyById, fetchSimilarProperties, clearError } from '../store/slices/propertySlice';
import { createClientInquiry } from '../store/slices/clientSlice';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { 
    currentProperty, 
    similarProperties, 
    isLoading, 
    error 
  } = useSelector((state) => state.properties);
  
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [tabValue, setTabValue] = useState(0);
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
    }
  }, [dispatch, currentProperty]);

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

  const getAmenityIcon = (amenity) => {
    const icons = {
      'swimming pool': <PoolIcon />,
      'gym': <GymIcon />,
      'parking': <ParkingIcon />,
      'balcony': <BalconyIcon />,
      'kitchen': <KitchenIcon />,
      'wifi': <WifiIcon />,
      'security': <SecurityIcon />,
      'elevator': <ElevatorIcon />,
      'air conditioning': <AcIcon />,
      'bathtub': <BathtubIcon />,
    };
    return icons[amenity.toLowerCase()] || <CheckCircleIcon />;
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`property-tabpanel-${index}`}
      aria-labelledby={`property-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  const ImageGallery = () => (
    <Box sx={{ position: 'relative', mb: 4 }}>
      <Grid container spacing={2}>
        {/* Main Image */}
        <Grid item xs={12} md={8}>
          <Card 
            sx={{ 
              position: 'relative', 
              overflow: 'hidden',
              cursor: 'pointer',
              '&:hover .image-overlay': {
                opacity: 1,
              },
            }}
            onClick={() => setImageDialogOpen(true)}
          >
            <CardMedia
              component="img"
              height={isMobile ? 300 : 500}
              image={currentProperty?.images?.[selectedImage] || '/placeholder-property.jpg'}
              alt={currentProperty?.title}
              sx={{ 
                objectFit: 'cover',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            />
            <Box
              className="image-overlay"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.3s ease-in-out',
              }}
            >
              <IconButton
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    backgroundColor: 'white',
                  },
                }}
              >
                <PhotoCameraIcon />
              </IconButton>
            </Box>
            
            {/* Image Actions */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                display: 'flex',
                gap: 1,
              }}
            >
              <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFavorite(!isFavorite);
                  }}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': {
                      backgroundColor: 'white',
                    },
                  }}
                >
                  {isFavorite ? (
                    <FavoriteIcon sx={{ color: 'error.main' }} />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title="Share property">
                <IconButton
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': {
                      backgroundColor: 'white',
                    },
                  }}
                >
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Image Counter */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                px: 2,
                py: 1,
                borderRadius: 2,
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {selectedImage + 1} / {currentProperty?.images?.length || 1}
            </Box>
          </Card>
        </Grid>

        {/* Thumbnail Images */}
        <Grid item xs={12} md={4}>
          <Box sx={{ height: isMobile ? 'auto' : 500, overflow: 'hidden' }}>
            <ImageList 
              sx={{ 
                width: '100%', 
                height: isMobile ? 200 : 500,
                overflow: 'auto',
              }} 
              cols={isMobile ? 4 : 2}
              rowHeight={isMobile ? 80 : 120}
            >
              {currentProperty?.images?.map((image, index) => (
                <ImageListItem 
                  key={index}
                  sx={{
                    cursor: 'pointer',
                    opacity: selectedImage === index ? 1 : 0.7,
                    border: selectedImage === index ? '3px solid' : 'none',
                    borderColor: 'primary.main',
                    borderRadius: 1,
                    overflow: 'hidden',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      opacity: 1,
                      transform: 'scale(1.05)',
                    },
                  }}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={image}
                    alt={`Property ${index + 1}`}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" height={60} width="60%" />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Skeleton variant="text" height={30} width="20%" />
              <Skeleton variant="text" height={30} width="20%" />
              <Skeleton variant="text" height={30} width="20%" />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error && error !== 'Failed to load similar properties') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/properties')}
        >
          Back to Properties
        </Button>
      </Container>
    );
  }

  if (!currentProperty) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">Property not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Fade in={true} timeout={600}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <MuiLink
            component={Link}
            to="/"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </MuiLink>
          <MuiLink
            component={Link}
            to="/properties"
            color="inherit"
          >
            Properties
          </MuiLink>
          <Typography color="text.primary">
            {currentProperty.title}
          </Typography>
        </Breadcrumbs>
      </Fade>

      {/* Back Button */}
      <Fade in={true} timeout={800}>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/properties')}
            sx={{ borderRadius: 2 }}
          >
            Back to Properties
          </Button>
        </Box>
      </Fade>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          <Slide direction="up" in={true} timeout={1000}>
            <Box>
              {/* Image Gallery */}
              <ImageGallery />

              {/* Property Info */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Chip
                    label={currentProperty.type}
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  />
                  {currentProperty.featured && (
                    <Chip
                      icon={<StarIcon />}
                      label="Featured"
                      color="warning"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                  <Chip
                    label={currentProperty.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                    color="secondary"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>

                <Typography 
                  variant="h3" 
                  component="h1" 
                  gutterBottom 
                  sx={{ fontWeight: 700, color: 'primary.main' }}
                >
                  {currentProperty.title}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="h6" color="text.secondary">
                    {currentProperty.location?.address}, {currentProperty.location?.city}, {currentProperty.location?.state}
                  </Typography>
                </Box>

                <Typography 
                  variant="h4" 
                  color="primary" 
                  sx={{ fontWeight: 700, mb: 4 }}
                >
                  {formatPrice(currentProperty.price)}
                  {currentProperty.listingType === 'rent' && (
                    <Typography component="span" variant="h6" color="text.secondary">
                      /month
                    </Typography>
                  )}
                </Typography>

                {/* Key Features */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={6} sm={3}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        backgroundColor: 'grey.50',
                        borderRadius: 3,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                          transform: 'translateY(-4px)',
                        },
                      }}
                    >
                      <BedIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {currentProperty.bedrooms}
                      </Typography>
                      <Typography variant="body2">
                        Bedroom{currentProperty.bedrooms !== 1 ? 's' : ''}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        backgroundColor: 'grey.50',
                        borderRadius: 3,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                          transform: 'translateY(-4px)',
                        },
                      }}
                    >
                      <BathroomIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {currentProperty.bathrooms}
                      </Typography>
                      <Typography variant="body2">
                        Bathroom{currentProperty.bathrooms !== 1 ? 's' : ''}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        backgroundColor: 'grey.50',
                        borderRadius: 3,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                          transform: 'translateY(-4px)',
                        },
                      }}
                    >
                      <AreaIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {currentProperty.area}
                      </Typography>
                      <Typography variant="body2">
                        Sq Ft
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        backgroundColor: 'grey.50',
                        borderRadius: 3,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                          transform: 'translateY(-4px)',
                        },
                      }}
                    >
                      <CalendarIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {new Date(currentProperty.createdAt).getFullYear()}
                      </Typography>
                      <Typography variant="body2">
                        Listed
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs 
                  value={tabValue} 
                  onChange={(e, newValue) => setTabValue(newValue)}
                  variant={isMobile ? 'scrollable' : 'standard'}
                  scrollButtons="auto"
                  sx={{
                    '& .MuiTab-root': {
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                    },
                  }}
                >
                  <Tab label="Overview" />
                  <Tab label="Amenities" />
                  <Tab label="Location" />
                  <Tab label="Similar Properties" />
                </Tabs>
              </Box>

              {/* Tab Panels */}
              <TabPanel value={tabValue} index={0}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Property Description
                </Typography>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                  {currentProperty.description}
                </Typography>
                
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 4 }}>
                  Property Details
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                      <Typography variant="body1" color="text.secondary">Property Type:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {currentProperty.type}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                      <Typography variant="body1" color="text.secondary">Area:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {currentProperty.area} sq ft
                      </Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                      <Typography variant="body1" color="text.secondary">Bedrooms:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {currentProperty.bedrooms}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                      <Typography variant="body1" color="text.secondary">Bathrooms:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {currentProperty.bathrooms}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                      <Typography variant="body1" color="text.secondary">Status:</Typography>
                      <Chip
                        label={currentProperty.status}
                        color={currentProperty.status === 'available' ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                      <Typography variant="body1" color="text.secondary">Listing Type:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        For {currentProperty.listingType === 'sale' ? 'Sale' : 'Rent'}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                      <Typography variant="body1" color="text.secondary">City:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {currentProperty.location?.city}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                      <Typography variant="body1" color="text.secondary">State:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {currentProperty.location?.state}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Amenities & Features
                </Typography>
                <Grid container spacing={2}>
                  {currentProperty.amenities?.map((amenity, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: 'grey.50',
                          borderRadius: 2,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        {getAmenityIcon(amenity)}
                        <Typography variant="body1" sx={{ ml: 2, fontWeight: 500 }}>
                          {amenity}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Location & Neighborhood
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" paragraph>
                    <strong>Address:</strong> {currentProperty.location?.address}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>City:</strong> {currentProperty.location?.city}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>State:</strong> {currentProperty.location?.state}
                  </Typography>
                  {currentProperty.location?.zipCode && (
                    <Typography variant="body1" paragraph>
                      <strong>ZIP Code:</strong> {currentProperty.location.zipCode}
                    </Typography>
                  )}
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<MapIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  View on Map
                </Button>
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Similar Properties
                </Typography>
                <Grid container spacing={3}>
                  {similarProperties?.map((property, index) => (
                    <Grid item xs={12} sm={6} md={4} key={property._id}>
                      <Zoom in={true} timeout={600 + index * 100}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.15)',
                            },
                          }}
                          onClick={() => navigate(`/properties/${property._id}`)}
                        >
                          <CardMedia
                            component="img"
                            height="200"
                            image={property.images?.[0] || '/placeholder-property.jpg'}
                            alt={property.title}
                          />
                          <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                              {property.title}
                            </Typography>
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                              {formatPrice(property.price)}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                {property.bedrooms} bed
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {property.bathrooms} bath
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {property.area} sq ft
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Zoom>
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>
            </Box>
          </Slide>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Slide direction="left" in={true} timeout={1200}>
            <Box sx={{ position: 'sticky', top: 100 }}>
              {/* Contact Card */}
              <Card sx={{ mb: 3, borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    Interested in this property?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Get in touch with us for more information or to schedule a viewing.
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<PhoneIcon />}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        background: 'linear-gradient(45deg, #2C3E50 30%, #34495E 90%)',
                      }}
                    >
                      Call Now
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<EmailIcon />}
                      onClick={() => setInquiryDialogOpen(true)}
                      sx={{ py: 1.5, borderRadius: 2 }}
                    >
                      Email
                    </Button>
                  </Box>
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ScheduleIcon />}
                    sx={{ py: 1.5, borderRadius: 2 }}
                  >
                    Schedule Viewing
                  </Button>
                </CardContent>
              </Card>

              {/* Agent Info */}
              <Card sx={{ mb: 3, borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Listed by Agent
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 60, height: 60, mr: 2, backgroundColor: 'primary.main' }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        John Smith
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Senior Real Estate Agent
                      </Typography>
                      <Rating value={4.8} readOnly precision={0.1} size="small" />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Experienced agent with 10+ years in UAE real estate market.
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ borderRadius: 2 }}
                  >
                    View Agent Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<LocalOfferIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      Make an Offer
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<InfoIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      Request Info
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<ShareIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      Share Property
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Slide>
        </Grid>
      </Grid>

      {/* Inquiry Dialog */}
      <Dialog 
        open={inquiryDialogOpen} 
        onClose={() => setInquiryDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Send Inquiry
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Get more information about this property
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={inquiryForm.name}
                onChange={(e) => setInquiryForm({...inquiryForm, name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={inquiryForm.email}
                onChange={(e) => setInquiryForm({...inquiryForm, email: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={inquiryForm.phone}
                onChange={(e) => setInquiryForm({...inquiryForm, phone: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={4}
                value={inquiryForm.message}
                onChange={(e) => setInquiryForm({...inquiryForm, message: e.target.value})}
                placeholder="I'm interested in this property. Please provide more details..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setInquiryDialogOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleInquirySubmit}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(45deg, #2C3E50 30%, #34495E 90%)',
            }}
          >
            Send Inquiry
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Gallery Dialog */}
      <Dialog 
        open={imageDialogOpen} 
        onClose={() => setImageDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Property Gallery</Typography>
          <IconButton onClick={() => setImageDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center' }}>
            <img
              src={currentProperty?.images?.[selectedImage]}
              alt={`Property ${selectedImage + 1}`}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '70vh',
                objectFit: 'contain',
              }}
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              {currentProperty?.images?.map((image, index) => (
                <Box
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  sx={{
                    width: 80,
                    height: 60,
                    cursor: 'pointer',
                    border: selectedImage === index ? '2px solid' : '1px solid',
                    borderColor: selectedImage === index ? 'primary.main' : 'grey.300',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Mobile Contact FAB */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="contact"
          onClick={() => setInquiryDialogOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            background: 'linear-gradient(45deg, #2C3E50 30%, #34495E 90%)',
          }}
        >
          <EmailIcon />
        </Fab>
      )}
    </Container>
  );
};

export default PropertyDetail; 