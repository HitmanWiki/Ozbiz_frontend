import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { 
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch { 
      return null; 
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(res => { 
          setUser(res.data); 
          localStorage.setItem('user', JSON.stringify(res.data)); 
        })
        .catch(() => { 
          localStorage.removeItem('token'); 
          localStorage.removeItem('user'); 
          setUser(null); 
        })
        .finally(() => setLoading(false));
    } else { 
      setLoading(false); 
    }
  }, []);

  const _saveSession = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    _saveSession(res.data.token, res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (data) => {
    const res = await api.post('/auth/register', data);
    _saveSession(res.data.token, res.data.user);
    return res.data.user;
  }, []);

  const googleLogin = useCallback(async (credential, userType = 'consumer') => {
    const res = await api.post('/auth/google', { credential, userType });
    _saveSession(res.data.token, res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  // User type checks
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isConsumer = user?.userType === 'consumer' || user?.userType === 'both';
  const isVendor = user?.userType === 'vendor' || user?.userType === 'both';
  const canListBusiness = isVendor || isAdmin;
  const canAccessVendorDashboard = isVendor || isAdmin;
  
  // Subscription info
  const subscriptionPlan = user?.subscriptionPlan || 'free';
  const isSubscriptionActive = user?.subscriptionExpiresAt 
    ? new Date(user.subscriptionExpiresAt) > new Date() 
    : true;

  // Update profile (including vendor fields)
  const updateProfile = useCallback(async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    const updatedUser = { ...user, ...res.data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  }, [user]);

  // Upgrade to vendor
  const upgradeToVendor = useCallback(async (businessData) => {
    const res = await api.post('/auth/upgrade-to-vendor', businessData);
    const updatedUser = { ...user, ...res.data.user };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  }, [user]);

  // Change password
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    await api.put('/auth/password', { currentPassword, newPassword });
  }, []);

  // Update notification settings
  const updateNotificationSettings = useCallback(async (settings) => {
    const res = await api.put('/user/notification-settings', settings);
    return res.data;
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      googleLogin, 
      logout,
      updateProfile,
      changePassword,
      upgradeToVendor,
      updateNotificationSettings,
      // User type helpers
      isAdmin,
      isConsumer,
      isVendor,
      canListBusiness,
      canAccessVendorDashboard,
      // Subscription helpers
      subscriptionPlan,
      isSubscriptionActive
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};