import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check session on start
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          const { data } = await api.get('/auth/me');
          if (data.success) {
            const updatedProfile = { id: data._id, name: data.name, email: data.email, role: data.role, tier: data.tier };
            setUser(updatedProfile);
            localStorage.setItem('user', JSON.stringify(updatedProfile));
          }
        } catch (error) {
          console.error('Failed to verify token', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email: email.trim().toLowerCase(), password });
      if (data.success) {
        localStorage.setItem('token', data.token);
        const userProfile = { id: data._id, name: data.name, email: data.email, role: data.role, tier: data.tier };
        localStorage.setItem('user', JSON.stringify(userProfile));
        setUser(userProfile);
        return { success: true };
      }
      return { success: false, message: data.message || 'Login failed.' };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check credentials.',
      };
    } finally {
      setLoading(false);
    }
  };

  // Step 1 of Register: Request OTP
  const sendRegisterOTP = async (email) => {
    try {
      const { data } = await api.post('/auth/register/send-otp', { email: email.trim().toLowerCase() });
      return {
        success: Boolean(data.success),
        message: data.message,
        deliveryMode: data.deliveryMode,
        previewUrl: data.previewUrl,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send verification code. Try again.',
      };
    }
  };
  // Step 2 of Register: Verify OTP and create profile
  const verifyRegisterOTP = async (name, email, password, role, tier, otp) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register/verify-otp', { name, email: email.trim().toLowerCase(), password, role, tier, otp: otp.trim() });
      if (data.success) {
        localStorage.setItem('token', data.token);
        const userProfile = { id: data._id, name: data.name, email: data.email, role: data.role, tier: data.tier };
        localStorage.setItem('user', JSON.stringify(userProfile));
        setUser(userProfile);
        return { success: true };
      }
      return { success: false, message: data.message || 'Verification failed.' };
    } catch (error) {
      console.error('Verify Register OTP error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid or expired code. Please try again.',
      };
    } finally {
      setLoading(false);
    }
  };

  // Step 1 of Forgot Password: Request reset OTP
  const sendForgotPasswordOTP = async (email) => {
    try {
      const { data } = await api.post('/auth/forgot-password/send-otp', { email: email.trim().toLowerCase() });
      return {
        success: Boolean(data.success),
        message: data.message,
        deliveryMode: data.deliveryMode,
        previewUrl: data.previewUrl,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Email not found or error occurred.',
      };
    }
  };
  // Step 2 of Forgot Password: Verify OTP and save new password
  const resetPassword = async (email, otp, newPassword) => {
    try {
      const { data } = await api.post('/auth/forgot-password/reset', { email: email.trim().toLowerCase(), otp: otp.trim(), newPassword });
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Reset Password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Verification failed. Try again.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      sendRegisterOTP, 
      verifyRegisterOTP, 
      sendForgotPasswordOTP, 
      resetPassword, 
      logout 
    }}>
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






