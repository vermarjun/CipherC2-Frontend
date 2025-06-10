import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const DashboardContext = createContext();

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export function DashboardProvider({ children }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [operators, setOperators] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState({
    sessions: false,
    operators: false,
    jobs: false
  });

  // Cache timestamps and data
  const cacheRef = useRef({
    sessions: { timestamp: 0, data: null },
    operators: { timestamp: 0, data: null },
    jobs: { timestamp: 0, data: null }
  });

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const connectionCheckInterval = useRef(null);

  // Check connection state
  const checkConnection = useCallback(async () => {
    try {
      const response = await api.get('/connected');
      setIsConnected(response.data);
      return response.data;
    } catch (error) {
      console.error('Error checking connection state:', error);
      setIsConnected(false);
      return false;
    }
  }, []);

  // Smart fetch function with caching
  const smartFetch = useCallback(async (endpoint, cacheKey) => {
    const now = Date.now();
    const cache = cacheRef.current[cacheKey];

    // Return cached data if it's still valid
    if (cache && (now - cache.timestamp < CACHE_DURATION)) {
      return cache.data;
    }

    setIsLoading(prev => ({ ...prev, [cacheKey]: true }));
    try {
      const res = await api.get(endpoint);
      if (res.status === 200 && !res.data.error) {
        // Update cache
        cacheRef.current[cacheKey] = {
          timestamp: now,
          data: res.data
        };
        return res.data;
      }
    } catch (error) {
      console.error(`Error fetching ${cacheKey}:`, error);
      // Return cached data even if expired in case of error
      return cache?.data;
    } finally {
      setIsLoading(prev => ({ ...prev, [cacheKey]: false }));
    }
  }, []);

  const fetchSessions = useCallback(async (force = false) => {
    const data = await smartFetch('/sessions', 'sessions');
    if (data) setSessions(data);
  }, [smartFetch]);

  const fetchOperators = useCallback(async (force = false) => {
    const data = await smartFetch('/operators', 'operators');
    if (data) setOperators(data);
  }, [smartFetch]);

  const fetchJobs = useCallback(async (force = false) => {
    const data = await smartFetch('/jobs', 'jobs');
    if (data) setJobs(data);
  }, [smartFetch]);

  // Initial data fetch and connection check
  useEffect(() => {
    if (user) {
      // Initial connection check
      checkConnection();

      // Set up connection check interval (every 30 seconds)
      connectionCheckInterval.current = setInterval(checkConnection, 30000);

      // Initial data fetch
      fetchSessions();
      fetchOperators();
      fetchJobs();

      // Set up smart polling intervals
      const sessionsInterval = setInterval(() => fetchSessions(), 30000);
      const operatorsInterval = setInterval(() => fetchOperators(), 60000); // Less frequent for operators
      const jobsInterval = setInterval(() => fetchJobs(), 30000);

      return () => {
        clearInterval(connectionCheckInterval.current);
        clearInterval(sessionsInterval);
        clearInterval(operatorsInterval);
        clearInterval(jobsInterval);
      };
    }
  }, [user, checkConnection, fetchSessions, fetchOperators, fetchJobs]);

  // Force refresh function that bypasses cache
  const forceRefresh = useCallback(async (type) => {
    switch (type) {
      case 'sessions':
        cacheRef.current.sessions.timestamp = 0;
        await fetchSessions(true);
        break;
      case 'operators':
        cacheRef.current.operators.timestamp = 0;
        await fetchOperators(true);
        break;
      case 'jobs':
        cacheRef.current.jobs.timestamp = 0;
        await fetchJobs(true);
        break;
      case 'all':
        cacheRef.current = {
          sessions: { timestamp: 0, data: null },
          operators: { timestamp: 0, data: null },
          jobs: { timestamp: 0, data: null }
        };
        await Promise.all([
          fetchSessions(true),
          fetchOperators(true),
          fetchJobs(true)
        ]);
        break;
    }
  }, [fetchSessions, fetchOperators, fetchJobs]);

  const value = {
    sessions,
    operators,
    jobs,
    isLoading,
    isConnected,
    refreshSessions: () => forceRefresh('sessions'),
    refreshOperators: () => forceRefresh('operators'),
    refreshJobs: () => forceRefresh('jobs'),
    refreshAll: () => forceRefresh('all'),
    checkConnection
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
} 