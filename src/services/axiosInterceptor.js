// src/services/axiosInterceptor.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// تابع برای بررسی وضعیت احراز هویت
const checkAuthAndRedirect = (response) => {
  if (response.data && response.data.isAuth !== undefined && response.data.isAuth !== 0) {
    // پاک کردن توکن‌ها از localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    
    // انتقال به صفحه لاگین
    window.location.href = "/login";
    throw new Error("احراز هویت ناموفق. لطفاً مجدداً وارد شوید.");
  }
  return response;
};

// تابع برای مدیریت خطاها
const handleAuthError = (error) => {
  if (error.response && error.response.status === 401) {
    // پاک کردن توکن‌ها از localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    
    // انتقال به صفحه لاگین
    window.location.href = "/login";
  }
  return Promise.reject(error);
};

// اضافه کردن interceptor برای درخواست‌ها
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["x-token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// اضافه کردن interceptor برای پاسخ‌ها
axios.interceptors.response.use(
  (response) => {
    return checkAuthAndRedirect(response);
  },
  (error) => {
    return handleAuthError(error);
  }
);

export default axios;