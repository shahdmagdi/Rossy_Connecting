import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]           = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading]     = useState(true);

  const getIsVerified = (u) => {
    if (!u) return false;
    return u.email_verified === true;
  };

  const getIsApproved = (u) => {
    if (!u) return false;
    if (u.role === 'patient' || u.role === 'admin') return true;
    if (u.role === 'doctor') return u.verification_status === 'verified';
    return false;
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setIsLoggedIn(true);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Called AFTER successful login with the user object from Flask
  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('user');
    localStorage.removeItem('pendingUser');
    setUser(null);
    setIsLoggedIn(false);
  };

  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const checkApprovalStatus = async () => {
    try {
      const updatedUser = await authService.checkApprovalStatus();
      if (updatedUser) {
        updateUser(updatedUser);
        return updatedUser;
      }
      return null;
    } catch (error) {
      console.error('Approval check error:', error);
      return null;
    }
  };

  const checkVerificationStatus = async () => {
    try {
      const updatedUser = await authService.checkVerificationStatus();
      if (updatedUser) {
        updateUser(updatedUser);
        return updatedUser;
      }
      return null;
    } catch (error) {
      console.error('Verification check error:', error);
      return null;
    }
  };

  const value = {
    user,
    isLoggedIn,
    loading,
    isVerified:  getIsVerified(user),
    isApproved:  getIsApproved(user),
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    checkApprovalStatus,
    checkVerificationStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};