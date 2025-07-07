import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Fade,
  Slide,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
    navigate('/');
      handleProfileMenuClose();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'Properties', path: '/properties', icon: <SearchIcon /> },
    ...(currentUser ? [
      { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    ] : []),
  ];

  const authItems = currentUser ? [
    { text: 'Profile', path: '/profile', icon: <PersonIcon /> },
    { text: 'Logout', action: handleLogout, icon: <LogoutIcon /> },
  ] : [
    { text: 'Login', path: '/login', icon: <LoginIcon /> },
    { text: 'Sign Up', path: '/register', icon: <PersonAddIcon /> },
  ];

  const NavButton = ({ item, mobile = false }) => {
    const isActive = item.path && isActiveRoute(item.path);
    
    if (mobile) {
  return (
        <ListItem
          button
          component={item.path ? Link : 'div'}
          to={item.path}
          onClick={item.action || (() => setMobileOpen(false))}
          sx={{
            borderRadius: 2,
            mx: 1,
            mb: 1,
            backgroundColor: isActive ? 'primary.main' : 'transparent',
            color: isActive ? 'white' : 'inherit',
            '&:hover': {
              backgroundColor: isActive ? 'primary.dark' : 'grey.100',
            },
          }}
        >
          <ListItemIcon sx={{ color: isActive ? 'white' : 'inherit' }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      );
    }

    return (
      <Button
        component={item.path ? Link : 'div'}
        to={item.path}
        onClick={item.action}
        color="inherit"
        sx={{
          mx: 1,
          borderRadius: 2,
          px: 2,
          py: 1,
          fontWeight: 600,
          textTransform: 'none',
          position: 'relative',
          color: isActive ? 'primary.main' : 'text.primary',
          backgroundColor: isActive ? 'rgba(44, 62, 80, 0.1)' : 'transparent',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(44, 62, 80, 0.1)',
            transform: 'translateY(-1px)',
          },
          '&::after': isActive ? {
            content: '""',
            position: 'absolute',
            bottom: -2,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            height: 2,
            backgroundColor: 'primary.main',
            borderRadius: 1,
          } : {},
        }}
      >
        {item.text}
              </Button>
    );
  };

  const drawer = (
    <Box sx={{ width: 280, height: '100%', backgroundColor: 'background.paper' }}>
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            PropTrack
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            UAE Real Estate
          </Typography>
        </Box>
              <IconButton
                color="inherit"
          onClick={handleDrawerToggle}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 2 }}>
        {currentUser && (
          <Box
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              backgroundColor: 'grey.50',
              textAlign: 'center',
            }}
          >
            <Avatar
              sx={{
                width: 60,
                height: 60,
                mx: 'auto',
                mb: 1,
                backgroundColor: 'primary.main',
                fontSize: '1.5rem',
                fontWeight: 600,
              }}
            >
              {currentUser.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {currentUser.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentUser.email}
            </Typography>
          </Box>
        )}

        <List>
          {navigationItems.map((item) => (
            <NavButton key={item.text} item={item} mobile />
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <List>
          {authItems.map((item) => (
            <NavButton key={item.text} item={item} mobile />
          ))}
        </List>

        {!currentUser && (
          <Box sx={{ p: 2, mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Need help?
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <IconButton size="small" color="primary">
                <PhoneIcon />
              </IconButton>
              <IconButton size="small" color="primary">
                <EmailIcon />
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <Slide direction="down" in={true} timeout={800}>
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            backgroundColor: scrolled 
              ? 'rgba(255, 255, 255, 0.95)' 
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderBottom: scrolled ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
            transition: 'all 0.3s ease-in-out',
            boxShadow: scrolled 
              ? '0px 2px 20px rgba(0, 0, 0, 0.1)' 
              : '0px 2px 10px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
            {/* Logo */}
            <Fade in={true} timeout={1000}>
              <Box
                component={Link}
                to="/"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.2rem',
                  }}
                >
                  P
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{
                      fontWeight: 700,
                      color: 'primary.main',
                      lineHeight: 1,
                    }}
                  >
                    PropTrack
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.7rem',
                      lineHeight: 1,
                    }}
                  >
                    UAE Real Estate
                  </Typography>
                </Box>
              </Box>
            </Fade>

            <Box sx={{ flexGrow: 1 }} />

            {/* Desktop Navigation */}
            {!isMobile && (
              <Fade in={true} timeout={1200}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {navigationItems.map((item) => (
                    <NavButton key={item.text} item={item} />
                  ))}

                  {currentUser ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                      <IconButton
                        color="primary"
                        sx={{ mr: 1 }}
                      >
                        <Badge badgeContent={3} color="error">
                          <NotificationsIcon />
                        </Badge>
                      </IconButton>
                      <IconButton
                        onClick={handleProfileMenuOpen}
                        sx={{
                          p: 0,
                          ml: 1,
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: 'primary.main',
                            fontWeight: 600,
                          }}
                        >
                          {currentUser.name?.charAt(0).toUpperCase()}
                        </Avatar>
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                      <Button
                        component={Link}
                        to="/login"
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          borderWidth: 2,
                          fontWeight: 600,
                          '&:hover': { borderWidth: 2 },
                        }}
                      >
                Login
              </Button>
                      <Button
                        component={Link}
                        to="/register"
                        variant="contained"
                        sx={{
                          borderRadius: 2,
                          fontWeight: 600,
                          background: 'linear-gradient(45deg, #2C3E50 30%, #34495E 90%)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #1A252F 30%, #2C3E50 90%)',
                          },
                        }}
                      >
                        Sign Up
              </Button>
                    </Box>
          )}
        </Box>
              </Fade>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                color="primary"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
      </Toolbar>
    </AppBar>
      </Slide>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            borderRadius: 2,
            minWidth: 200,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {currentUser?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentUser?.email}
          </Typography>
        </Box>
        <MenuItem
          component={Link}
          to="/profile"
          onClick={handleProfileMenuClose}
          sx={{ py: 1.5 }}
        >
          <PersonIcon sx={{ mr: 2 }} />
          Profile
        </MenuItem>
        <MenuItem
          component={Link}
          to="/dashboard"
          onClick={handleProfileMenuClose}
          sx={{ py: 1.5 }}
        >
          <DashboardIcon sx={{ mr: 2 }} />
          Dashboard
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
          <LogoutIcon sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Spacer for fixed AppBar */}
      <Toolbar />
    </>
  );
};

export default Navbar;
