import API from './api';

// ══════════════════════════════════════════════════════════
//  STAGING SERVICE
//  Wraps all /api/staging endpoints.
//  Doctor-only — all calls require a valid JWT with role=doctor.
// ══════════════════════════════════════════════════════════

const stagingService = {

  // ── GET /api/staging/patient/<patient_id>/all ──────────
  // List all staging records for a patient (newest first)
  // Returns: { success, count, data: [...] }
  getPatientStagings: async (patientId) => {
    try {
      const res = await API.get(`/staging/patient/${patientId}/all`);
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch staging records.'
      );
    }
  },

  // ── GET /api/staging/<staging_id> ─────────────────────
  // Fetch a single staging record by ID
  // Returns: { success, data: { id, staging, ... } }
  getStagingById: async (stagingId) => {
    try {
      const res = await API.get(`/staging/${stagingId}`);
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch staging record.'
      );
    }
  },

  // ── POST /api/staging/patient/<patient_id> ─────────────
  // Create a new staging record and run AJCC 8th ed. algorithm
  //
  // Body fields (all optional except tumor_size OR no_primary_tumour):
  //   tumor_size         (float, cm)   — required unless no_primary_tumour=true
  //   no_primary_tumour  (bool)        — set true for T0 cases
  //   lymphadenopathy    (float)       — 0 / 0.5 / 1 / 2 / 3
  //   metastatic         (int)         — 0 / 1
  //   skin_nipple        (int)         — 0 / 1
  //   pec_chest          (int)         — 0 / 1
  //   er                 (int)         — 0 / 1
  //   pr                 (int)         — 0 / 1
  //   her2               (int)         — 0 / 1 / 2
  //   histologic_grade   (int)         — 1 / 2 / 3
  //   detection_scan_id  (uuid string) — optional link to detection scan
  //   mri_scan_id        (uuid string) — optional link to MRI scan
  //
  // Returns: { success, message, data: { id, staging, ... } }
  createStaging: async (patientId, body) => {
    try {
      const res = await API.post(`/staging/patient/${patientId}`, body);
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to create staging record.'
      );
    }
  },

  // ── PUT /api/staging/<staging_id> ─────────────────────
  // Partial update — only send fields you want to change.
  // Re-runs the AJCC algorithm after update.
  // Returns: { success, message, data: { id, staging, ... } }
  updateStaging: async (stagingId, body) => {
    try {
      const res = await API.put(`/staging/${stagingId}`, body);
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to update staging record.'
      );
    }
  },

  // ── DELETE /api/staging/<staging_id> ──────────────────
  // Delete a staging record (only the creating doctor can do this)
  // Returns: { success, message }
  deleteStaging: async (stagingId) => {
    try {
      const res = await API.delete(`/staging/${stagingId}`);
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete staging record.'
      );
    }
  },
};

export default stagingService;