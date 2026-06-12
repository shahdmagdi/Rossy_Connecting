import API from './api';

const segmentationService = {

  /**
   * Request segmentation for a scan (ultrasound or mammogram).
   * Doctor only. Returns cached result if already exists.
   * POST /api/segmentation/:scanId
   */
  getSegmentation: async (scanId) => {
    try {
      const res = await API.post(`/segmentation/${scanId}`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to run segmentation.');
    }
  },

  /**
   * Delete segmentation result for a scan.
   * Doctor only. Can be re-requested afterwards.
   * DELETE /api/segmentation/:scanId
   */
  deleteSegmentation: async (scanId) => {
    try {
      const res = await API.delete(`/segmentation/${scanId}`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete segmentation.');
    }
  },

};

export default segmentationService;