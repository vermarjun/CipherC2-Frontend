import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import api from '../api';  // Import the configured api instance
import FingerprintJS from '@fingerprintjs/fingerprintjs';

const UserActivityContext = createContext();

export const useUserActivity = () => {
  const context = useContext(UserActivityContext);
  if (!context) {
    throw new Error('useUserActivity must be used within a UserActivityProvider');
  }
  return context;
};

export const UserActivityProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [deviceFingerprint, setDeviceFingerprint] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const sessionStartTime = useRef(Date.now());
  const lastActiveTime = useRef(Date.now());
  const activityTimeout = useRef(null);

  // Initialize device fingerprint
  useEffect(() => {
    const initFingerprint = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setDeviceFingerprint(result.visitorId);
    };
    initFingerprint();
  }, []);

  // Track user activity
  useEffect(() => {
    if (!user || !token) return;

    const updateActivity = async () => {
      if (!isActive) return;

      const now = Date.now();
      const duration = (now - lastActiveTime.current) / (1000 * 60 * 60); // Convert to hours
      
      try {
        await api.post('/api/user/activity', {
          duration,
          deviceFingerprint,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Error updating user activity:', error);
      }

      lastActiveTime.current = now;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsActive(false);
        updateActivity();
      } else {
        setIsActive(true);
        sessionStartTime.current = Date.now();
        updateActivity();
      }
    };

    const handleBeforeUnload = () => {
      updateActivity();
    };

    // Set up activity tracking
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Update activity every 5 minutes while active
    const activityInterval = setInterval(() => {
      if (isActive) {
        updateActivity();
      }
    }, 5 * 60 * 1000);

    // Initial activity update
    updateActivity();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(activityInterval);
      // Final activity update on unmount
      updateActivity();
    };
  }, [user, token, deviceFingerprint, isActive]);

  // Track page visits
  useEffect(() => {
    if (!user || !token) return;

    const logPageVisit = async () => {
      try {
        await api.post('/api/user/page-visit', {
          url: window.location.pathname,
          timestamp: new Date().toISOString()
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Error logging page visit:', error);
      }
    };

    logPageVisit();
  }, [user, token, window.location.pathname]);

  // Track user actions
  const logAction = async (action, details) => {
    if (!user || !token) return;

    try {
      await api.post('/api/user/action', {
        action,
        details,
        timestamp: new Date().toISOString()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error logging user action:', error);
    }
  };

  // Track API calls
  useEffect(() => {
    if (!user || !token) return;

    const originalRequest = api.request;
    api.request = async (config) => {
      try {
        // Log API call before it happens
        await api.post('/api/user/api-call', {
          route: config.url,
          method: config.method?.toUpperCase() || 'GET',
          payload: config.data,
          timestamp: new Date().toISOString()
        });

        // Make the actual API call
        return await originalRequest(config);
      } catch (error) {
        console.error('Error logging API call:', error);
        return originalRequest(config);
      }
    };

    return () => {
      api.request = originalRequest;
    };
  }, [user, token]);

  useEffect(() => {
    let heartbeatInterval;
    let lastHeartbeat = 0;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 5000; // 5 seconds
    const HEARTBEAT_INTERVAL = 60000; // 1 minute

    const sendHeartbeat = async () => {
      // Check if we should send heartbeat before making the request
      const now = Date.now();
      if (now - lastHeartbeat < HEARTBEAT_INTERVAL) {
        return;
      }

      try {
        const response = await api.post('/api/user/heartbeat', {
          deviceFingerprint: deviceFingerprint || navigator.userAgent
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.status === 'success') {
          lastHeartbeat = now;
          retryCount = 0; // Reset retry count on success
          console.log('Heartbeat sent successfully');
        }
      } catch (error) {
        console.error('Error sending heartbeat:', error);
        
        // Implement exponential backoff for retries
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          const backoffDelay = RETRY_DELAY * Math.pow(2, retryCount - 1);
          console.log(`Retrying heartbeat in ${backoffDelay}ms (attempt ${retryCount}/${MAX_RETRIES})`);
          setTimeout(sendHeartbeat, backoffDelay);
        } else {
          console.error('Max retry attempts reached for heartbeat');
          retryCount = 0; // Reset for next interval
        }
      }
    };

    // Start heartbeat when component mounts
    const startHeartbeat = () => {
      if (!token) return; // Don't start if no token
      
      // Send initial heartbeat
      sendHeartbeat();
      
      // Set up interval for subsequent heartbeats
      heartbeatInterval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
    };

    // Stop heartbeat when component unmounts
    const stopHeartbeat = () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
    };

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsActive(false);
        stopHeartbeat();
      } else {
        setIsActive(true);
        startHeartbeat();
      }
    };

    // Start heartbeat if user is active and has token
    if (isActive && token) {
      startHeartbeat();
    }

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      stopHeartbeat();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, deviceFingerprint, token]); // Added token to dependencies

  const value = {
    logAction,
    deviceFingerprint,
    isActive
  };

  return (
    <UserActivityContext.Provider value={value}>
      {children}
    </UserActivityContext.Provider>
  );
}; 