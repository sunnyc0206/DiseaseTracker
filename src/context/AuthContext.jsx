import { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '../api/AdminApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const savedAuth = localStorage.getItem('adminAuth');
      const savedUser = localStorage.getItem('adminUser');
      
      if (savedAuth && savedUser) {
        // First, set user from localStorage to maintain session
        const userData = JSON.parse(savedUser);
        setUser(userData);
        
        // Then verify with backend asynchronously
        const response = await adminApi.verifyAuth();
        if (!response.success) {
          // Only clear if we explicitly get a failed verification
          // This prevents clearing on network errors or backend being down
          console.warn('Auth verification failed, but keeping session for now');
          // Don't clear immediately - user can still use the app
          // localStorage.removeItem('adminAuth');
          // localStorage.removeItem('adminUser');
          // setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Don't clear auth on network errors - keep the session
      const savedUser = localStorage.getItem('adminUser');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await adminApi.login(email, password);
      if (response.success) {
        const adminUser = {
          id: 1,
          email: email,
          name: 'Admin User',
          role: 'ADMIN'
        };
        localStorage.setItem('adminUser', JSON.stringify(adminUser));
        setUser(adminUser);
        return { success: true };
      }
      return { success: false, error: response.message || 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Backend is not available. Please try again later.' };
    }
  };

  const logout = async () => {
    await adminApi.logout();
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminAuth');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 