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
import DeleteAccount from "../pages/public/DeleteAccount";
import ConsentPage from "../pages/public/ConsentPage";
import ProtectedRoute from "../components/ProtectedRoute";

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
import Requests from '../pages/patient/Requests';

// Doctor Pages
import DoctorLayout from '../pages/doctor/DoctorLayout';
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import MyPatients from '../pages/doctor/MyPatients';
import PatientDetails from '../pages/doctor/PatientDetails';
//import Diagnosis from '../pages/doctor/Diagnosis';
import ClinicalNotes from '../pages/doctor/ClinicalNotes';
import PatientRequests from '../pages/doctor/PatientRequests';
import DoctorCarePlansPage from '../pages/doctor/DoctorCarePlansPage';


// ── REMOVED: CarePlans standalone import ──
// DoctorCarePlanTab is a tab inside PatientDetails, not a standalone page.
// Importing it here as a route gave it no patientId, causing undefined errors.


// Public Route - redirect if already logged in
const PublicRoute = ({ children }) => {
  const { isLoggedIn, isApproved, user } = useAuth();

  if (isLoggedIn) {
    if (user?.role === 'doctor' && !isApproved) {
      return <Navigate to="/pending-approval" replace />;
    }
    if (user?.role === 'admin')  return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
    return <Navigate to="/patient/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/role-selection" element={<PublicRoute><RoleSelection /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/verify-email" element={<PublicRoute><EmailVerification /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/pending-approval" element={<PendingApproval />} />
        <Route path="/consent" element={<ConsentPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/" element={<Navigate to="/" replace />} />
        <Route
          path="/delete-account"
          element={<ProtectedRoute><DeleteAccount /></ProtectedRoute>}
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>}
        />

        {/* Patient Routes */}
        <Route
          path="/patient"
          element={<ProtectedRoute allowedRoles={['patient']}><PatientLayout /></ProtectedRoute>}
        >
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="visits"    element={<Visits />} />
          <Route path="doctor"    element={<Doctor />} />
          <Route path="history"   element={<History />} />
          <Route path="care-plan" element={<CarePlan />} />
          <Route path="chatbot"   element={<Chatbot />} />
          <Route path="requests"  element={<Requests />} />
        </Route>

        {/* Doctor Routes */}
        <Route
          path="/doctor"
          element={<ProtectedRoute allowedRoles={['doctor']}><DoctorLayout /></ProtectedRoute>}
        >
          <Route path="dashboard"        element={<DoctorDashboard />} />
          <Route path="patients"         element={<MyPatients />} />
          <Route path="patients/:id"     element={<PatientDetails />} />
          
          {/* care-plans route removed — care plans live inside PatientDetails tabs */}
          <Route path="care-plans" element={<DoctorCarePlansPage />} />
          <Route path="notes"            element={<ClinicalNotes />} />
          <Route path="patient-requests" element={<PatientRequests />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;