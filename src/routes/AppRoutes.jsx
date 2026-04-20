// This handles all navigation in your app
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Public Pages
import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import RoleSelection from '../pages/public/RoleSelection';
import Register from '../pages/public/Register';
import EmailVerification from '../pages/public/EmailVerification';
import ForgotPassword from '../pages/public/ForgotPassword';
import ResetPassword from '../pages/public/ResetPassword';
import PendingApproval from '../pages/public/PendingApproval';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';

// Patient Pages
import PatientDashboard from '../pages/patient/PatientDashboard';
import PatientLayout from '../pages/patient/PatientLayout';
import Visits from '../pages/patient/Visits';
import Doctor from '../pages/patient/Doctor';
import History from '../pages/patient/History';
import CarePlan from '../pages/patient/CarePlan';
import Chatbot from '../pages/patient/Chatbot';

// Doctor Pages
import DoctorLayout from '../pages/doctor/DoctorLayout';
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import MyPatients from '../pages/doctor/MyPatients';
import PatientDetails from '../pages/doctor/PatientDetails';
import Diagnosis from '../pages/doctor/Diagnosis';
import CarePlans from '../pages/doctor/CarePlans';
import ClinicalNotes from '../pages/doctor/ClinicalNotes';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoggedIn, isApproved } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Check for role
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  // Check for doctor approval
  if (user?.role === 'doctor' && !isApproved) {
    return <Navigate to="/pending-approval" replace />;
  }

  return children;
};

// Public Route - redirect if already logged in
const PublicRoute = ({ children }) => {
  const { isLoggedIn, isApproved, user } = useAuth();

  if (isLoggedIn) {
    // If doctor and not approved, go to pending approval
    if (user?.role === 'doctor' && !isApproved) {
      return <Navigate to="/pending-approval" replace />;
    }
    // Otherwise redirect to role-based dashboard
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user?.role === 'doctor') {
      return <Navigate to="/doctor/dashboard" replace />;
    }
    return <Navigate to="/patient/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <Home />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/role-selection" 
          element={
            <PublicRoute>
              <RoleSelection />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/verify-email" 
          element={
            <PublicRoute>
              <EmailVerification />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/reset-password" 
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/pending-approval" 
          element={<PendingApproval />} 
        />
        
        <Route path="/home" element={<Navigate to="/" replace />} />
        
        <Route path="/" element={<Navigate to="/" replace />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* TODO: Add more routes as you build them */}
        
        {/* Patient Routes with Layout (navbar) */}
        <Route 
          path="/patient" 
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="visits" element={<Visits />} />
          <Route path="doctor" element={<Doctor />} />
          <Route path="history" element={<History />} />
          <Route path="care-plan" element={<CarePlan />} />
          <Route path="chatbot" element={<Chatbot />} />
        </Route>
        
        {/* Doctor Routes with Layout */}
        <Route 
          path="/doctor" 
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="patients" element={<MyPatients />} />
          <Route path="patients/:id" element={<PatientDetails />} />
          <Route path="diagnosis" element={<Diagnosis />} />
          <Route path="care-plans" element={<CarePlans />} />
          <Route path="notes" element={<ClinicalNotes />} />
        </Route>

        {/* Catch all - 404 */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
