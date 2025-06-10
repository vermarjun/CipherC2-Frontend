import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import { format, formatDistanceToNow } from 'date-fns';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const UserActivityDashboard = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [activityData, setActivityData] = useState({
    totalActiveHours: 0,
    lastActive: null,
    locations: [],
    actions: [],
    pageVisits: [],
    apiCalls: [],
    failedLogins: [],
    sessions: []
  });

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const response = await axios.get('/api/user/activity/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActivityData(response.data);
      } catch (error) {
        console.error('Error fetching activity data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [token]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Activity Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Active Hours
              </Typography>
              <Typography variant="h4">
                {activityData.totalActiveHours.toFixed(1)}h
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Last Active
              </Typography>
              <Typography variant="h4">
                {activityData.lastActive ? formatDistanceToNow(new Date(activityData.lastActive)) : 'Never'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Sessions
              </Typography>
              <Typography variant="h4">
                {activityData.sessions.filter(s => s.isActive).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different activity types */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Locations" />
          <Tab label="Activity Timeline" />
          <Tab label="Page Visits" />
          <Tab label="API Calls" />
          <Tab label="Security" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Location</TableCell>
                      <TableCell>Last Seen</TableCell>
                      <TableCell>IP Address</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activityData.locations.map((location, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {location.city}, {location.country}
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(location.timestamp))}
                        </TableCell>
                        <TableCell>{location.ip}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ height: 400 }}>
                <MapContainer
                  center={[0, 0]}
                  zoom={2}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {activityData.locations.map((location, index) => (
                    location.latitude && location.longitude && (
                      <Marker
                        key={index}
                        position={[location.latitude, location.longitude]}
                      >
                        <Popup>
                          {location.city}, {location.country}<br />
                          Last seen: {formatDistanceToNow(new Date(location.timestamp))}
                        </Popup>
                      </Marker>
                    )
                  ))}
                </MapContainer>
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Timeline>
            {activityData.actions.map((action, index) => (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  <TimelineDot color="primary" />
                  {index < activityData.actions.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="h6">{action.action}</Typography>
                  <Typography>{action.details}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {formatDistanceToNow(new Date(action.timestamp))}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}

        {activeTab === 2 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Page</TableCell>
                  <TableCell>Last Visited</TableCell>
                  <TableCell>Visit Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activityData.pageVisits.map((visit, index) => (
                  <TableRow key={index}>
                    <TableCell>{visit.url}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(visit.timestamp))}
                    </TableCell>
                    <TableCell>{visit.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab === 3 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Endpoint</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Last Called</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activityData.apiCalls.map((call, index) => (
                  <TableRow key={index}>
                    <TableCell>{call.route}</TableCell>
                    <TableCell>
                      <Chip
                        label={call.method}
                        color={
                          call.method === 'GET' ? 'success' :
                          call.method === 'POST' ? 'primary' :
                          call.method === 'PUT' ? 'warning' :
                          call.method === 'DELETE' ? 'error' : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(call.timestamp))}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={call.status}
                        color={call.status < 400 ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab === 4 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Failed Login Attempts
                  </Typography>
                  <List>
                    {activityData.failedLogins.map((attempt, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText
                            primary={`Failed login from ${attempt.ip}`}
                            secondary={
                              <>
                                {attempt.reason}<br />
                                {formatDistanceToNow(new Date(attempt.timestamp))}
                              </>
                            }
                          />
                        </ListItem>
                        {index < activityData.failedLogins.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Active Sessions
                  </Typography>
                  <List>
                    {activityData.sessions.map((session, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText
                            primary={`Session from ${session.ip}`}
                            secondary={
                              <>
                                Device: {session.userAgent}<br />
                                Started: {formatDistanceToNow(new Date(session.startedAt))}
                              </>
                            }
                          />
                          <Chip
                            label={session.isActive ? 'Active' : 'Inactive'}
                            color={session.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </ListItem>
                        {index < activityData.sessions.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default UserActivityDashboard; 