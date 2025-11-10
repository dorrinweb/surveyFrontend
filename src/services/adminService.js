// src/services/adminService.js
import axios from "./axiosInterceptor"; // import از فایل interceptor

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const adminService = {
  getStats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/get-stats`);
      console.log('Stats API raw response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  getUsers: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/get-users?page=${page}&limit=${limit}`);
      console.log('Users API Response:', response.data);
      
      if (response.data && response.data.code === 0) {
        return {
          data: response.data.data,
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit
        };
      } else {
        throw new Error(response.data?.msg || 'خطا در دریافت کاربران');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getHouseholds: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/get-households?page=${page}&limit=${limit}`);
      console.log('Household API Response:', response.data);
      
      if (response.data && response.data.code === 0) {
        return {
          data: response.data.data,
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit
        };
      } else {
        throw new Error(response.data?.msg || 'خطا در دریافت خانوارها');
      }
    } catch (error) {
      console.error('Error fetching households:', error);
      throw error;
    }
  },

  getTrips: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/get-trips/?page=${page}&limit=${limit}`);
      console.log('Trips API Response:', response.data);
      
      if (response.data && response.data.code === 0) {
        return {
          data: response.data.data,
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit
        };
      } else {
        throw new Error(response.data?.msg || 'خطا در دریافت سفرها');
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      throw error;
    }
  }
};

export default adminService;