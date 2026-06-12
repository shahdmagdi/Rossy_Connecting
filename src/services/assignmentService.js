import api from "./api";

// ══════════════════════════════════════════
//  DOCTOR ROUTES
// ══════════════════════════════════════════

/**
 * GET /api/doctor/requests
 * Fetch all PENDING patient assignment requests for the logged-in doctor.
 */
export const getDoctorPendingRequests = async () => {
  const response = await api.get("/doctor/requests");
  return response.data; // { success, count, requests: [...] }
};

/**
 * GET /api/doctor/my-patients
 * Fetch all ACCEPTED (assigned) patients for the logged-in doctor.
 */
export const getMyAssignedPatients = async () => {
  const response = await api.get("/doctor/my-patients");
  return response.data; // { success, count, patients: [...] }
};

/**
 * GET /api/doctor/my-patients/:patientId
 * Fetch full profile of one assigned patient.
 */
export const getPatientProfile = async (patientId) => {
  const response = await api.get(`/doctor/my-patients/${patientId}`);
  return response.data; // { success, patient: {...} }
};

/**
 * PUT /api/doctor/requests/:assignmentId/accept
 * Accept a patient's assignment request.
 */
export const acceptAssignmentRequest = async (assignmentId) => {
  const response = await api.put(`/doctor/requests/${assignmentId}/accept`);
  return response.data; // { success, message, assignment }
};

/**
 * PUT /api/doctor/requests/:assignmentId/reject
 * Reject a patient's assignment request.
 */
export const rejectAssignmentRequest = async (assignmentId) => {
  const response = await api.put(`/doctor/requests/${assignmentId}/reject`);
  return response.data; // { success, message, assignment }
};

// ══════════════════════════════════════════
//  PATIENT ROUTES
// ══════════════════════════════════════════

/**
 * GET /api/patient/my-doctor
 * Patient fetches their assigned doctor's full profile.
 */
export const getMyAssignedDoctor = async () => {
  const response = await api.get("/patient/my-doctor");
  return response.data; // { success, doctor: {...} }
};

/**
 * GET /api/doctors
 * Fetch all verified, active doctors (for patients to browse).
 */
export const getAllDoctors = async () => {
  const response = await api.get("/doctors");
  return response.data; // { success, count, doctors: [...] }
};

/**
 * POST /api/doctors/:doctorId/request
 * Patient sends an assignment request to a specific doctor.
 */
export const requestDoctorAssignment = async (doctorId) => {
  const response = await api.post(`/doctors/${doctorId}/request`);
  return response.data;
};

/**
 * GET /api/patient/requests
 * Patient fetches their own assignment requests.
 */
export const getMyRequests = async () => {
  const response = await api.get("/patient/requests");
  return response.data;
};

/**
 * DELETE /api/patient/requests/:assignmentId
 * Patient cancels a pending assignment request.
 */
export const cancelAssignmentRequest = async (assignmentId) => {
  const response = await api.delete(`/patient/requests/${assignmentId}`);
  return response.data;
};

/**
 * DELETE /api/patient/doctor
 * Patient removes their currently assigned doctor.
 */
export const removeAssignedDoctor = async () => {
  const response = await api.delete("/patient/doctor");
  return response.data;
};