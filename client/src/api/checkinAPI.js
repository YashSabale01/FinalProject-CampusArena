import axiosInstance from './axiosInstance';

export const checkinAPI = {
  generateQR: (eventId) => axiosInstance.get(`/checkin/generate/${eventId}`),
  processCheckIn: (qrData, userId) => axiosInstance.post('/checkin/process', { qrData, userId }),
  getStats: (eventId) => axiosInstance.get(`/checkin/stats/${eventId}`)
};