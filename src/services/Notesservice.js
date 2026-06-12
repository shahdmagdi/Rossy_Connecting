import api from "./api";

// ═══════════════════════════════════════════════
//  DOCTOR — NOTES & CARE PLANS
// ═══════════════════════════════════════════════

/**
 * Create a private note for a patient.
 * POST /api/doctor/patients/:patientId/notes
 */
// and the same for createNote:
export const createNote = async (patientId, data) => {
  const res = await api.post(
    `/doctor/patients/${patientId}/notes`,
    { ...data, visibility: "private" }
  );
  return res.data;
};
/**
 * Create a shared care plan for a patient.
 * POST /api/doctor/patients/:patientId/notes?visibility=shared
 */
// ✅ Fix — visibility in body
export const createCarePlan = async (patientId, data) => {
  const res = await api.post(
    `/doctor/patients/${patientId}/notes`,
    { ...data, visibility: "shared" }
  );
  return res.data;
};

/**
 * Get all notes for a patient (doctor view).
 * GET /api/doctor/patients/:patientId/notes
 * Optional: visibility = "private" | "shared"
 */
export const getPatientNotes = async (patientId, visibility = null) => {
  const params = visibility ? { visibility } : {};
  const res = await api.get(`/doctor/patients/${patientId}/notes`, { params });
  return res.data;
};

/**
 * Get a single note by id (doctor view).
 * GET /api/doctor/notes/:noteId
 */
export const getNoteById = async (noteId) => {
  const res = await api.get(`/doctor/notes/${noteId}`);
  return res.data;
};

/**
 * Update a note (doctor).
 * PUT /api/doctor/notes/:noteId
 * Body: { title?, content?, visibility?, scan_id? }
 */
export const updateNote = async (noteId, data) => {
  const res = await api.put(`/doctor/notes/${noteId}`, data);
  return res.data;
};

/**
 * Delete a note (doctor).
 * DELETE /api/doctor/notes/:noteId
 */
export const deleteNote = async (noteId) => {
  const res = await api.delete(`/doctor/notes/${noteId}`);
  return res.data;
};

// ═══════════════════════════════════════════════
//  PATIENT — CARE PLANS
// ═══════════════════════════════════════════════

/**
 * Patient gets all their care plans.
 * GET /api/patient/care-plans
 */
export const getMyCarePlans = async () => {
  const res = await api.get("/patient/care-plans");
  return res.data;
};

/**
 * Patient gets a single care plan by id.
 * GET /api/patient/care-plans/:noteId
 */
export const getCarePlanById = async (noteId) => {
  const res = await api.get(`/patient/care-plans/${noteId}`);
  return res.data;
};

// ═══════════════════════════════════════════════
//  NOTIFICATIONS
// ═══════════════════════════════════════════════

/**
 * Get all notifications for the logged-in user.
 * GET /api/notifications
 * Optional: unreadOnly = true
 */
export const getNotifications = async (unreadOnly = false) => {
  const params = unreadOnly ? { unread: "true" } : {};
  const res = await api.get("/notifications", { params });
  return res.data;
};

/**
 * Mark a single notification as read.
 * PUT /api/notifications/:id/read
 */
export const markNotificationRead = async (notificationId) => {
  const res = await api.put(`/notifications/${notificationId}/read`);
  return res.data;
};

/**
 * Mark all notifications as read.
 * PUT /api/notifications/read-all
 */
export const markAllNotificationsRead = async () => {
  const res = await api.put("/notifications/read-all");
  return res.data;
};