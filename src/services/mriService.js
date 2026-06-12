import API from './api';

const mriService = {

  // ══════════════════════════════════════════════════════════
  //  POST /api/mri/upload/<patient_id>
  //  Doctor uploads NIfTI MRI files for their assigned patient
  //
  //  form-data:
  //    acq0: file  (.nii or .nii.gz) — REQUIRED
  //    acq2: file  (.nii or .nii.gz) — REQUIRED
  //    acq1: file  (.nii or .nii.gz) — OPTIONAL
  // ══════════════════════════════════════════════════════════
  uploadMri: async (patientId, acq0File, acq2File, acq1File = null) => {
    try {
      const formData = new FormData();
      formData.append('acq0', acq0File);
      formData.append('acq2', acq2File);
      if (acq1File) formData.append('acq1', acq1File);

      const res = await API.post(`/mri/upload/${patientId}`, formData, {
        
        timeout: 600000, // 10 min — MRI inference is slow
      });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'MRI upload failed.');
    }
  },

  // ══════════════════════════════════════════════════════════
  //  GET /api/mri/patient/<patient_id>
  //  Doctor views all MRI scans for their assigned patient
  // ══════════════════════════════════════════════════════════
  getPatientMriScans: async (patientId) => {
    try {
      const res = await API.get(`/mri/patient/${patientId}`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch MRI scans.');
    }
  },

  // ══════════════════════════════════════════════════════════
  //  GET /api/mri/<scan_id>
  //  Doctor views a single MRI scan result
  // ══════════════════════════════════════════════════════════
  getMriScan: async (scanId) => {
    try {
      const res = await API.get(`/mri/${scanId}`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch MRI scan.');
    }
  },

  // ══════════════════════════════════════════════════════════
  //  DELETE /api/mri/<scan_id>
  //  Doctor deletes an MRI scan
  // ══════════════════════════════════════════════════════════
  deleteMriScan: async (scanId) => {
    try {
      const res = await API.delete(`/mri/${scanId}`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete MRI scan.');
    }
  },
};

export default mriService;