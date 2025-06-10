import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Set the token in the API instance
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token and get user data
          const response = await api.get('/auth/verify');
          console.log('Auth verify response data:', JSON.stringify(response.data, null, 2));
          
          // Use the nested user object from the response
          if (response.data.user) {
            setUser(response.data.user);
            console.log('User data set:', response.data.user);
          } else {
            console.warn('User data not found in response:', response.data);
          }
          setError(null);
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setError(error.response?.data?.detail || 'Session expired. Please login again.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      // Store token and update API instance
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Use the nested user object if it exists
      setUser(user || response.data.user);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.response?.data?.detail || 'Login failed. Please check your credentials.');
      return false;
    }
  };

  const signup = async (userData) => {
    try {
      setError(null);
      console.log('Attempting signup with data:', userData);
      const response = await api.post('/auth/signup', userData);
      console.log('Signup response:', response.data);
      const { token, user } = response.data;
      
      // Store token and update API instance
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      return true;
    } catch (error) {
      console.error('Signup failed:', error.response?.data || error);
      setError(error.response?.data?.detail || 'Signup failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 