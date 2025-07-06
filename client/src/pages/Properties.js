import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Pagination,
  CircularProgress,
  Alert,
  Paper,
  Collapse,
  IconButton,
  Drawer,
  Slider,
  Fade,
  Zoom,
  useMediaQuery,
  useTheme,
  Skeleton,
  Tooltip,
  Fab,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Bed as BedIcon,
  Bathroom as BathroomIcon,
  SquareFoot as AreaIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Tune as TuneIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchProperties, setFilters, clearFilters } from '../store/slices/propertySlice';

const Properties = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { 
    properties, 
    pagination, 
    filters, 
    isLoading, 
    error 
  } = useSelector((state) => state.properties);

  const [localFilters, setLocalFilters] = useState(filters);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [areaRange, setAreaRange] = useState([0, 5000]);
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    dispatch(fetchProperties(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
    setLocalFilters(prev => ({ 
      ...prev, 
      minPrice: newValue[0], 
      maxPrice: newValue[1] 
    }));
  };

  const handleAreaRangeChange = (event, newValue) => {
    setAreaRange(newValue);
    setLocalFilters(prev => ({ 
      ...prev, 
      minArea: newValue[0], 
      maxArea: newValue[1] 
    }));
  };

  const applyFilters = () => {
    dispatch(setFilters(localFilters));
    setFilterDrawerOpen(false);
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
    setPriceRange([0, 10000000]);
    setAreaRange([0, 5000]);
    dispatch(clearFilters());
    setFilterDrawerOpen(false);
  };

  const handlePageChange = (event, page) => {
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

  const getPropertyTypeColor = (type) => {
    const colors = {
      house: 'primary',
      apartment: 'secondary',
      condo: 'success',
      townhouse: 'warning',
      villa: 'info',
      penthouse: 'error',
      studio: 'default',
    };
    return colors[type] || 'default';
  };

  const PropertyCard = ({ property, index }) => {
    const isFavorite = favorites.has(property._id);
    
    return (
      <Zoom in={true} timeout={600 + index * 100}>
        <Grid item xs={12} sm={6} lg={viewMode === 'grid' ? 4 : 6}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              borderRadius: 3,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.15)',
                '& .property-image': {
                  transform: 'scale(1.1)',
                },
                '& .property-actions': {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
            }}
          >
            <Box 
              sx={{ 
                position: 'relative', 
                overflow: 'hidden',
                height: viewMode === 'grid' ? (isMobile ? 200 : 240) : (isMobile ? 180 : 200),
              }}
              onClick={() => navigate(`/properties/${property._id}`)}
            >
              <CardMedia
                component="img"
                height="100%"
                image={property.images?.[0] || '/placeholder-property.jpg'}
                alt={property.title}
                className="property-image"
                sx={{ 
                  objectFit: 'cover',
                  transition: 'transform 0.6s ease-in-out',
                }}
              />
              
              {/* Property Actions Overlay */}
              <Box
                className="property-actions"
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  opacity: 0,
                  transform: 'translateY(-10px)',
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(property._id);
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
                    size="small"
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

              {/* Property Badges */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Chip
                  label={property.type}
                  color={getPropertyTypeColor(property.type)}
                  size="small"
                  sx={{ 
                    fontWeight: 600,
                    fontSize: isMobile ? '0.7rem' : '0.75rem',
                  }}
                />
                {property.featured && (
                  <Chip
                    icon={<StarIcon />}
                    label="Featured"
                    color="warning"
                    size="small"
                    sx={{ 
                      fontWeight: 600,
                      fontSize: isMobile ? '0.7rem' : '0.75rem',
                    }}
                  />
                )}
              </Box>

              {/* Price Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  backgroundColor: 'rgba(44, 62, 80, 0.9)',
                  color: 'white',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Typography 
                  variant={isMobile ? "body1" : "h6"} 
                  sx={{ fontWeight: 700 }}
                >
                  {formatPrice(property.price)}
                </Typography>
              </Box>
            </Box>
            
            <CardContent sx={{ flexGrow: 1, p: isMobile ? 2 : 3 }}>
              <Typography 
                variant="h6" 
                component="h3" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: isMobile ? '1rem' : '1.25rem',
                }}
              >
                {property.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {property.location?.city}, {property.location?.state}
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                gap: isMobile ? 2 : 3, 
                mb: 2,
                flexWrap: isMobile ? 'wrap' : 'nowrap',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BedIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BathroomIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AreaIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {property.area} sq ft
                  </Typography>
                </Box>
              </Box>
              
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.5,
                }}
              >
                {property.description}
              </Typography>
            </CardContent>
            
            <CardActions sx={{ p: isMobile ? 2 : 3, pt: 0 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate(`/properties/${property._id}`)}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #2C3E50 30%, #34495E 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1A252F 30%, #2C3E50 90%)',
                  },
                }}
              >
                View Details
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Zoom>
    );
  };

  const FilterPanel = () => (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Filter Properties
        </Typography>
        <IconButton onClick={() => setFilterDrawerOpen(false)}>
          <ClearIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Search */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Search properties..."
            value={localFilters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Grid>

        {/* Property Type */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Property Type</InputLabel>
            <Select
              value={localFilters.type}
              label="Property Type"
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="house">House</MenuItem>
              <MenuItem value="apartment">Apartment</MenuItem>
              <MenuItem value="condo">Condo</MenuItem>
              <MenuItem value="townhouse">Townhouse</MenuItem>
              <MenuItem value="villa">Villa</MenuItem>
              <MenuItem value="penthouse">Penthouse</MenuItem>
              <MenuItem value="studio">Studio</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Sort */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={localFilters.sort}
              label="Sort By"
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <MenuItem value="-createdAt">Newest First</MenuItem>
              <MenuItem value="createdAt">Oldest First</MenuItem>
              <MenuItem value="price">Price: Low to High</MenuItem>
              <MenuItem value="-price">Price: High to Low</MenuItem>
              <MenuItem value="bedrooms">Bedrooms</MenuItem>
              <MenuItem value="-bedrooms">Bedrooms (Desc)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Price Range */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
          </Typography>
          <Slider
            value={priceRange}
            onChange={handlePriceRangeChange}
            valueLabelDisplay="auto"
            min={0}
            max={10000000}
            step={100000}
            valueLabelFormat={(value) => formatPrice(value)}
            sx={{ mt: 2 }}
          />
        </Grid>

        {/* Advanced Filters Toggle */}
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            endIcon={showAdvancedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ borderRadius: 2 }}
          >
            Advanced Filters
          </Button>
        </Grid>

        {/* Advanced Filters */}
        <Collapse in={showAdvancedFilters} sx={{ width: '100%' }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Location */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={localFilters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={localFilters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
              />
            </Grid>

            {/* Bedrooms */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Min Bedrooms"
                type="number"
                value={localFilters.minBedrooms}
                onChange={(e) => handleFilterChange('minBedrooms', e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Max Bedrooms"
                type="number"
                value={localFilters.maxBedrooms}
                onChange={(e) => handleFilterChange('maxBedrooms', e.target.value)}
              />
            </Grid>

            {/* Bathrooms */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Min Bathrooms"
                type="number"
                value={localFilters.minBathrooms}
                onChange={(e) => handleFilterChange('minBathrooms', e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Max Bathrooms"
                type="number"
                value={localFilters.maxBathrooms}
                onChange={(e) => handleFilterChange('maxBathrooms', e.target.value)}
              />
            </Grid>

            {/* Area Range */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Area Range: {areaRange[0]} - {areaRange[1]} sq ft
              </Typography>
              <Slider
                value={areaRange}
                onChange={handleAreaRangeChange}
                valueLabelDisplay="auto"
                min={0}
                max={5000}
                step={100}
                sx={{ mt: 2 }}
              />
            </Grid>
          </Grid>
        </Collapse>

        {/* Filter Actions */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={clearAllFilters}
              fullWidth
              sx={{ borderRadius: 2 }}
            >
              Clear All
            </Button>
            <Button
              variant="contained"
              onClick={applyFilters}
              fullWidth
              sx={{
                borderRadius: 2,
                background: 'linear-gradient(45deg, #2C3E50 30%, #34495E 90%)',
              }}
            >
              Apply Filters
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Fade in={true} timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ fontWeight: 700, color: 'primary.main' }}
          >
            Property Listings
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Discover your perfect home from our extensive collection of properties across UAE
          </Typography>
        </Box>
      </Fade>

      {/* Controls */}
      <Fade in={true} timeout={1000}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          mb: 3,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 2 : 0,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {pagination?.totalProperties || 0} Properties Found
            </Typography>
            {isLoading && <CircularProgress size={24} />}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                <IconButton
                  onClick={() => setViewMode('grid')}
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                >
                  <ViewModuleIcon />
                </IconButton>
                <IconButton
                  onClick={() => setViewMode('list')}
                  color={viewMode === 'list' ? 'primary' : 'default'}
                >
                  <ViewListIcon />
                </IconButton>
              </Box>
            )}
            
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setFilterDrawerOpen(true)}
              sx={{ 
                borderRadius: 2,
                minWidth: isMobile ? '100px' : '120px',
              }}
            >
              Filters
            </Button>
          </Box>
        </Box>
      </Fade>

      {/* Properties Grid */}
      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
            <Grid item xs={12} sm={6} lg={viewMode === 'grid' ? 4 : 6} key={item}>
              <Card sx={{ height: 400 }}>
                <Skeleton variant="rectangular" height={240} />
                <CardContent>
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={20} width="60%" />
                  <Skeleton variant="text" height={25} width="40%" />
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Skeleton variant="text" height={20} width="30%" />
                    <Skeleton variant="text" height={20} width="30%" />
                    <Skeleton variant="text" height={20} width="30%" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          <Grid container spacing={3}>
            {(properties || []).map((property, index) => (
              <PropertyCard 
                key={property._id} 
                property={property} 
                index={index} 
              />
            ))}
          </Grid>

          {/* Pagination */}
          {pagination?.totalPages > 1 && (
            <Fade in={true} timeout={1200}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: 2,
                      fontWeight: 600,
                    },
                  }}
                />
              </Box>
            </Fade>
          )}

          {/* No Results */}
          {(!properties || properties.length === 0) && !isLoading && (
            <Fade in={true} timeout={800}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  No properties found
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Try adjusting your search criteria or clearing filters
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={clearAllFilters}
                  sx={{ mt: 2, borderRadius: 2 }}
                >
                  Clear All Filters
                </Button>
              </Box>
            </Fade>
          )}
        </>
      )}

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 } }
        }}
      >
        <FilterPanel />
      </Drawer>

      {/* Mobile Filter FAB */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="filters"
          onClick={() => setFilterDrawerOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            background: 'linear-gradient(45deg, #2C3E50 30%, #34495E 90%)',
          }}
        >
          <TuneIcon />
        </Fab>
      )}
    </Container>
  );
};

export default Properties; 