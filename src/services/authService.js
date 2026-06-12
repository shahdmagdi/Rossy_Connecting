import API from './api';

export const USER_STATUS = {
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  PENDING_ADMIN_APPROVAL: 'PENDING_ADMIN_APPROVAL',
  ACTIVE: 'ACTIVE',
  REJECTED: 'REJECTED',
};

const authService = {

  // ================= DOCTOR ASSIGNMENT =================

  getDoctors: async () => {
    const res = await API.get('/doctors');
    return res;
  },

  requestDoctor: async (doctorId) => {
    const res = await API.post(`/doctors/${doctorId}/request`);
    return res;
  },

  getPatientRequests: async () => {
    try {
      const res = await API.get('/patient/requests');
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch requests.');
    }
  },

  cancelPatientRequest: async (assignmentId) => {
    try {
      const res = await API.delete(`/patient/requests/${assignmentId}`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel request.');
    }
  },

  getMyDoctor: async () => {
    try {
      const res = await API.get('/patient/my-doctor');
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch doctor.');
    }
  },

  removeMyDoctor: async () => {
    try {
      const res = await API.delete('/patient/doctor');
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove doctor.');
    }
  },

  // ================= AUTH =================

  registerPatient: async (data) => {
    try {
      const res = await API.post('/auth/patient/signup', data);
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        'Registration failed. Please try again.';
      throw new Error(message);
    }
  },

  registerDoctor: async (data) => {
    try {
      const res = await API.post('/auth/doctor/signup', data);
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        'Registration failed. Please try again.';
      throw new Error(message);
    }
  },

  // ── UPDATED: returns consent_required payload instead of throwing ──
  login: async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      return res.data;
    } catch (error) {
      const data = error.response?.data;

      // Patient hasn't accepted consent yet — return data, don't throw
      if (data?.consent_required) {
        return data;  // { success: false, consent_required: true, temp_token, user }
      }

      const message = data?.message || 'Login failed. Please try again.';
      const err = new Error(message);
      err.responseData = data;
      throw err;
    }
  },

  // ── NEW: accept patient T&C consent using temp_token ──
  acceptConsent: async (tempToken) => {
    try {
      const res = await API.post(
        '/auth/patient/consent',
        {},
        {
          headers:         { Authorization: `Bearer ${tempToken}` },
          withCredentials: true,
        }
      );
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to accept consent. Please try again.';
      throw new Error(message);
    }
  },

  verifyPatientEmail: async (code) => {
    try {
      const res = await API.post('/auth/patient/verify-email', { code });
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Verification failed.';
      throw new Error(message);
    }
  },

  verifyDoctorEmail: async (code) => {
    try {
      const res = await API.post('/auth/doctor/verify-email', { code });
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Verification failed.';
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

  checkApprovalStatus: async () => {
    try {
      const res = await API.get('/auth/doctor/approval-status');
      if (res.data.success && res.data.user) {
        return res.data.user;
      }
      return null;
    } catch (error) {
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

  // ================= RESET PASSWORD FLOW =================

  forgotPassword: async (email) => {
    try {
      const res = await API.post(
        '/account/forgot-password',
        { email },
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send reset code.');
    }
  },

  resetPassword: async (code, new_password, confirm_password) => {
    try {
      const res = await API.post(
        '/account/reset-password',
        { code, new_password, confirm_password },
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reset password.');
    }
  },

  resendResetCode: async () => {
    try {
      const res = await API.post(
        '/account/resend-reset-code',
        {},
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to resend reset code.');
    }
  },

  // ================= DELETE ACCOUNT =================

  deleteAccount: async (password) => {
    try {
      const res = await API.delete('/account/delete', {
        data: { password },
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete account.');
    }
  },

};

export default authService;