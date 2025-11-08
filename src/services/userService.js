import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL
const userService = {
  getPassword: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/user/get-password`, data, {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response.data;
    } catch (err) {
      console.error('Error in getPassword:', err.response?.data || err.message);
      throw new Error(err.response?.data?.msg || 'خطایی رخ داد.');
    }
  },

   login : async (payload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error(`خطا در ارسال اطلاعات: ${response.statusText}`);
      }
  
      const responseData = await response.json();
      console.log(responseData.data)
      const { accessToken, refreshToken } = responseData.data; // استخراج توکن‌ها
  
      // ذخیره توکن‌ها در Local Storage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
  
      return responseData;
    } catch (error) {
      console.error("خطا در لاگین:", error);
      throw error;
    }
  
  }
}

export default userService;