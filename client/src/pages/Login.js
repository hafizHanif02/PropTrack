import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  Fade,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container component="main" maxWidth="sm">
        <Fade in={true} timeout={800}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Logo */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 4,
                color: 'white',
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <HomeIcon sx={{ fontSize: 30 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  PropTrack
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  UAE Real Estate Platform
                </Typography>
              </Box>
            </Box>

            <Paper 
              elevation={0} 
              sx={{ 
                padding: { xs: 3, sm: 4 }, 
                width: '100%',
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0px 20px 60px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Typography 
                component="h1" 
                variant="h4" 
                align="center" 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 3,
                }}
              >
                Welcome Back
              </Typography>
              
              <Typography 
                variant="body1" 
                align="center" 
                color="text.secondary" 
                sx={{ mb: 4 }}
              >
                Sign in to access your dashboard and manage properties
              </Typography>
              
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                  }}
                >
                  {error}
                </Alert>
              )}
              
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                {/* Development Helper */}
                {process.env.NODE_ENV === 'development' && (
                  <Alert 
                    severity="info" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Development Mode:</strong> Use test credentials
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setEmail('agent@proptrack.com');
                        setPassword('password123');
                      }}
                      sx={{ mt: 1 }}
                    >
                      Fill Test Credentials
                    </Button>
                  </Alert>
                )}
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ 
                    mt: 2, 
                    mb: 3,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #2C3E50 30%, #34495E 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1A252F 30%, #2C3E50 90%)',
                    },
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
                
                <Box textAlign="center">
                  <MuiLink 
                    component={Link} 
                    to="/register" 
                    variant="body1"
                    sx={{ 
                      color: 'primary.main',
                      textDecoration: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Don't have an account? Sign Up
                  </MuiLink>
                </Box>
                
                <Box textAlign="center" sx={{ mt: 2 }}>
                  <MuiLink 
                    component={Link} 
                    to="/" 
                    variant="body2"
                    sx={{ 
                      color: 'text.secondary',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    ← Back to Home
                  </MuiLink>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;
