import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const UserActivityDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [activityData, setActivityData] = useState({
    totalActiveHours: 0,
    lastActive: null,
    activeSessions: 0,
    locations: [],
    pageVisits: [],
    apiCalls: [],
    failedLogins: [],
    activeSessionsList: [],
  });

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const response = await fetch('/api/user/activity/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch activity data');
        const data = await response.json();
        setActivityData(data);
      } catch (error) {
        console.error('Error fetching activity data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderSummaryCards = () => (
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
              {activityData.lastActive ? formatDistanceToNow(new Date(activityData.lastActive), { addSuffix: true }) : 'Never'}
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
              {activityData.activeSessions}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderLocationsTab = () => (
    <Box sx={{ height: 400 }}>
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
          <Marker
            key={index}
            position={[location.latitude, location.longitude]}
          >
            <Popup>
              <Typography variant="subtitle2">
                {location.city}, {location.country}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Last seen: {format(new Date(location.lastSeen), 'PPp')}
              </Typography>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );

  const renderPageVisitsTab = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Page</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Last Visit</TableCell>
            <TableCell>Device</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {activityData.pageVisits.map((visit, index) => (
            <TableRow key={index}>
              <TableCell>{visit.url}</TableCell>
              <TableCell>{visit.duration}s</TableCell>
              <TableCell>{format(new Date(visit.timestamp), 'PPp')}</TableCell>
              <TableCell>{visit.deviceInfo}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderApiCallsTab = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Endpoint</TableCell>
            <TableCell>Method</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Timestamp</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {activityData.apiCalls.map((call, index) => (
            <TableRow key={index}>
              <TableCell>{call.endpoint}</TableCell>
              <TableCell>{call.method}</TableCell>
              <TableCell>
                <Chip
                  label={call.status}
                  color={call.status < 400 ? 'success' : 'error'}
                  size="small"
                />
              </TableCell>
              <TableCell>{format(new Date(call.timestamp), 'PPp')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderSecurityTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Failed Login Attempts
            </Typography>
            <List>
              {activityData.failedLogins.map((attempt, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`IP: ${attempt.ipAddress}`}
                    secondary={`${format(new Date(attempt.timestamp), 'PPp')} - ${attempt.reason}`}
                  />
                </ListItem>
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
              {activityData.activeSessionsList.map((session, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`Device: ${session.deviceInfo}`}
                    secondary={`Started: ${format(new Date(session.startedAt), 'PPp')} - IP: ${session.ipAddress}`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Activity Dashboard
      </Typography>
      
      {renderSummaryCards()}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Locations" />
          <Tab label="Page Visits" />
          <Tab label="API Calls" />
          <Tab label="Security" />
        </Tabs>
      </Box>

      {activeTab === 0 && renderLocationsTab()}
      {activeTab === 1 && renderPageVisitsTab()}
      {activeTab === 2 && renderApiCallsTab()}
      {activeTab === 3 && renderSecurityTab()}
    </Box>
  );
};

export default UserActivityDashboard; 