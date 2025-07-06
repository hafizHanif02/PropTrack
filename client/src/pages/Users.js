import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Fade,
  useTheme,
  useMediaQuery,
  Skeleton,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AdminPanelSettings as AdminIcon,
  Group as GroupIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import axios from 'axios';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/users');
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to fetch users. Make sure the server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getStats = () => {
    const totalUsers = users.length;
    const adminUsers = users.filter(user => user.role === 'admin').length;
    const regularUsers = users.filter(user => user.role === 'user').length;
    const recentUsers = users.filter(user => {
      const userDate = new Date(user.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return userDate > weekAgo;
    }).length;

    return { totalUsers, adminUsers, regularUsers, recentUsers };
  };

  const stats = getStats();

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Fade in={true} timeout={600}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              Users Management
            </Typography>
            
            {/* Stats Cards Skeleton */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[1, 2, 3, 4].map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item}>
                  <Card>
                    <CardContent>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Skeleton variant="text" height={30} sx={{ mt: 2 }} />
                      <Skeleton variant="text" height={20} width="60%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            {/* Table Skeleton */}
            <Paper>
              <Box sx={{ p: 3 }}>
                <Skeleton variant="text" height={40} width="30%" />
                <Box sx={{ mt: 2 }}>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Skeleton variant="text" height={20} width="20%" />
                      <Skeleton variant="text" height={20} width="30%" />
                      <Skeleton variant="text" height={20} width="15%" />
                      <Skeleton variant="text" height={20} width="20%" />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Box>
        </Fade>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Fade in={true} timeout={600}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              Users Management
            </Typography>
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          </Box>
        </Fade>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Fade in={true} timeout={600}>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              sx={{ fontWeight: 700, color: 'primary.main' }}
            >
              Users Management
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Manage and monitor all registered users in the system
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
                        Total Users
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.totalUsers}
                      </Typography>
                    </Box>
                    <GroupIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                        Admin Users
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.adminUsers}
                      </Typography>
                    </Box>
                    <AdminIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
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
                        Regular Users
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.regularUsers}
                      </Typography>
                    </Box>
                    <PersonIcon sx={{ fontSize: 40, color: 'info.main' }} />
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
                        New This Week
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.recentUsers}
                      </Typography>
                    </Box>
                    <TrendingIcon sx={{ fontSize: 40, color: 'success.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Users Table */}
          <Paper 
            sx={{ 
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                All Users ({users.length})
              </Typography>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow 
                      key={user._id}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: 'grey.50',
                        },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: user.role === 'admin' ? 'secondary.main' : 'primary.main',
                              width: 40,
                              height: 40,
                            }}
                          >
                            {user.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {user._id.slice(-8)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {user.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role} 
                          size="small" 
                          color={user.role === 'admin' ? 'secondary' : 'primary'}
                          sx={{ 
                            fontWeight: 600,
                            textTransform: 'capitalize',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(user.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Send Email">
                            <IconButton size="small" color="primary">
                              <EmailIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Contact">
                            <IconButton size="small" color="secondary">
                              <PhoneIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Fade>
    </Container>
  );
};

export default Users;
