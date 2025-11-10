// src/services/householdService.js
import axios from "./axiosInterceptor";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// تابع کمکی برای بررسی وضعیت احراز هویت در پاسخ‌های fetch
const checkFetchAuth = async (response) => {
  const data = await response.json();
  
  if (data && data.isAuth !== undefined && data.isAuth !== 0) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
    throw new Error("احراز هویت ناموفق. لطفاً مجدداً وارد شوید.");
  }
  
  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    data: data
  };
};

export const createHousehold = async (payload) => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    const response = await fetch(`${API_BASE_URL}/household/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-token": accessToken,
        "accept": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const checkedResponse = await checkFetchAuth(response);

    if (!checkedResponse.ok) {
      throw new Error(`خطا در ارسال اطلاعات: ${checkedResponse.statusText}`);
    }

    return checkedResponse.data;
  } catch (error) {
    console.error("خطا در ارتباط با سرور:", error);
    throw error;
  }
};

export const fetchHouseholdDetails = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/household/my-household`);
    return response.data;
  } catch (error) {
    console.error("خطا در ارتباط با سرور:", error);
    throw error;
  }
};

export const fetchUserTrips = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/trip/user-trips/${userId}`);
    return response.data;
  } catch (error) {
    console.error("خطا در دریافت سفرهای عضو:", error);
    throw error;
  }
};