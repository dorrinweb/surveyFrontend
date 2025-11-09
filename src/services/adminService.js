// src/services/adminService.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const adminService = {
    getStats: async () => {
        try {
          const token = localStorage.getItem("accessToken");
          const response = await axios.get(`${API_BASE_URL}/admin/get-stats`, {
            headers: {
              "accept": "application/json",
              "x-token": token,
            },
          });
          
          // لاگ پاسخ برای دیباگ
          console.log('Stats API raw response:', response.data);
          return response.data;
        } catch (error) {
          console.error('Error fetching stats:', error);
          throw error;
        }
      },

  getUsers: async (page = 1, limit = 10) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${API_BASE_URL}/admin/get-users?page=${page}&limit=${limit}`, {
        headers: {
          "accept": "application/json",
          "x-token": token,
        },
      });
      console.log('Users API Response:', response.data);
      
      // تطبیق با فرمت پاسخ API
      if (response.data && response.data.code === 0) {
        return {
          data: response.data.data, // آرایه کاربران
          total: response.data.total, // تعداد کل
          page: response.data.page, // صفحه فعلی
          limit: response.data.limit // تعداد در هر صفحه
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
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${API_BASE_URL}/admin/get-households?page=${page}&limit=${limit}`, {
        headers: {
          "accept": "application/json",
          "x-token": token,
        },
      });
      console.log('Household API Response:', response.data);
      
      // تطبیق با فرمت پاسخ API
      if (response.data && response.data.code === 0) {
        
        return {
          data: response.data.data, // آرایه خانوارها
          total: response.data.total, // تعداد کل
          page: response.data.page, // صفحه فعلی
          limit: response.data.limit // تعداد در هر صفحه
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
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${API_BASE_URL}/admin/get-trips/?page=${page}&limit=${limit}`, {
        headers: {
          "accept": "application/json",
          "x-token": token,
        },
      });
      console.log('Trips API Response:', response.data);
      
      // تطبیق با فرمت پاسخ API
      if (response.data && response.data.code === 0) {
        return {
          data: response.data.data, // آرایه سفرها
          total: response.data.total, // تعداد کل
          page: response.data.page, // صفحه فعلی
          limit: response.data.limit // تعداد در هر صفحه
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