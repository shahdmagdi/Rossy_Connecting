import API from './api';

const detectionService = {

  // ══════════════════════════════════════════════════════════
  //  POST /api/detection/upload  (single modality — private)
  // ══════════════════════════════════════════════════════════
  uploadScan: async (imageFile, imageType) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('image_type', imageType);
      const res = await API.post('/detection/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Scan upload failed.');
    }
  },

  // ══════════════════════════════════════════════════════════
  //  POST /api/detection/upload  (multimodal — private)
  //  Sends both ultrasound_image + mammogram_image
  // ══════════════════════════════════════════════════════════
  uploadMultimodalScan: async (ultrasoundFile, mammogramFile) => {
    try {
      const formData = new FormData();
      formData.append('ultrasound_image', ultrasoundFile);
      formData.append('mammogram_image', mammogramFile);
      const res = await API.post('/detection/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000,
      });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Multimodal scan upload failed.');
    }
  },

  // ══════════════════════════════════════════════════════════
  //  POST /api/detection/upload-with-doctor  (single — shared)
  // ══════════════════════════════════════════════════════════
  uploadScanWithDoctor: async (imageFile, imageType) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('image_type', imageType);
      const res = await API.post('/detection/upload-with-doctor', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Scan upload failed.');
    }
  },

  // ══════════════════════════════════════════════════════════
  //  POST /api/detection/upload-with-doctor  (multimodal — shared)
  //  Sends both ultrasound_image + mammogram_image
  // ══════════════════════════════════════════════════════════
  uploadMultimodalScanWithDoctor: async (ultrasoundFile, mammogramFile) => {
    try {
      const formData = new FormData();
      formData.append('ultrasound_image', ultrasoundFile);
      formData.append('mammogram_image', mammogramFile);
      const res = await API.post('/detection/upload-with-doctor', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000,
      });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Multimodal scan upload failed.');
    }
  },

  // ══════════════════════════════════════════════════════════
  //  GET /api/detection/history
  // ══════════════════════════════════════════════════════════
  getScanHistory: async (imageType = null) => {
    try {
      const params = imageType ? { type: imageType } : {};
      const res = await API.get('/detection/history', { params });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch scan history.');
    }
  },

  // ══════════════════════════════════════════════════════════
  //  GET /api/detection/<scan_id>
  // ══════════════════════════════════════════════════════════
  getScanById: async (scanId) => {
    try {
      const res = await API.get(`/detection/${scanId}`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch scan.');
    }
  },

  // ══════════════════════════════════════════════════════════
  //  GET /api/detection/patient/<patient_id>  (doctor view)
  // ══════════════════════════════════════════════════════════
  getPatientScans: async (patientId, imageType = null) => {
    try {
      const params = imageType ? { type: imageType } : {};
      const res = await API.get(`/detection/patient/${patientId}`, { params });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch patient scans.');
    }
  },

  // ══════════════════════════════════════════════════════════
  //  DELETE /api/detection/<scan_id>
  // ══════════════════════════════════════════════════════════
  deleteScan: async (scanId) => {
    try {
      const res = await API.delete(`/detection/${scanId}`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete scan.');
    }
  },
};

export default detectionService;