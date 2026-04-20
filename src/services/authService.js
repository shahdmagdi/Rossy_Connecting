import API from './api';

export const USER_STATUS = {
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  PENDING_ADMIN_APPROVAL: 'PENDING_ADMIN_APPROVAL',
  ACTIVE: 'ACTIVE',
  REJECTED: 'REJECTED',
};

const authService = {
  registerPatient: async (data) => {
    try {
      const res = await API.post('/auth/patient/signup', data);
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message
        || error.response?.data?.errors?.[0]
        || 'Registration failed. Please try again.';
      throw new Error(message);
    }
  },

  registerDoctor: async (data) => {
    try {
      const res = await API.post('/auth/doctor/signup', data);
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message
        || error.response?.data?.errors?.[0]
        || 'Registration failed. Please try again.';
      throw new Error(message);
    }
  },

  login: async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      throw new Error(message);
    }
  },

  verifyPatientEmail: async (code) => {
    try {
      const res = await API.post('/auth/patient/verify-email', { code });
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Verification failed.';
      throw new Error(message);
    }
  },

  verifyDoctorEmail: async (code) => {
    try {
      const res = await API.post('/auth/doctor/verify-email', { code });
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Verification failed.';
      throw new Error(message);
    }
  },

  resendPatientCode: async () => {
    try {
      const res = await API.post('/auth/patient/resend-code');
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to resend code.');
    }
  },

  resendDoctorCode: async () => {
    try {
      const res = await API.post('/auth/doctor/resend-code');
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to resend code.');
    }
  },

  logout: async () => {
    try {
      await API.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('pendingUser');
    }
  },

  // called by AuthContext → PendingApproval page
  // asks the backend if the doctor has been approved yet
  checkApprovalStatus: async () => {
    try {
      const res = await API.get('/auth/doctor/approval-status');
      if (res.data.success && res.data.user) {
        return res.data.user;
      }
      return null;
    } catch (error) {
      // if backend route doesn't exist yet (404), return stored user
      if (error.response?.status === 404) {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
      }
      throw new Error(error.response?.data?.message || 'Failed to check approval status.');
    }
  },

  checkVerificationStatus: async () => {
    try {
      const res = await API.get('/auth/verification-status');
      if (res.data.success && res.data.user) {
        return res.data.user;
      }
      return null;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to check verification status.');
    }
  },

  isLoggedIn: () => !!localStorage.getItem('user'),

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getUserRole: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user)?.role : null;
  },

  forgotPassword: async (email) => {
    try {
      const res = await API.post('/auth/forgot-password', { email });
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email.';
      throw new Error(message);
    }
  },

  resetPassword: async (token, password) => {
    try {
      const res = await API.post('/auth/reset-password', { token, password });
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password.';
      throw new Error(message);
    }
  },
};

export default authService;