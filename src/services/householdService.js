import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const createHousehold = async (payload) => {
  try {
    // دریافت توکن از Local Storage
    const accessToken = localStorage.getItem("accessToken");

    const response = await fetch(`${API_BASE_URL}/household/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-token": accessToken, // توکن به صورت داینامیک در هدر قرار می‌گیرد
        "accept": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`خطا در ارسال اطلاعات: ${response.statusText}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("خطا در ارتباط با سرور:", error);
    throw error;
  }
};

export const fetchHouseholdDetails = async () => {
  try {
    const token = localStorage.getItem("accessToken"); // دریافت توکن از Local Storage
    const response = await axios.get(`${API_BASE_URL}/household/my-household`, {
      headers: {
        "accept": "application/json",
        "x-token": token, // ارسال توکن در هدر درخواست
      },
    });
    return response.data; // بازگرداندن پاسخ API
  } catch (error) {
    console.error("خطا در ارتباط با سرور:", error);
    throw error; // ارسال خطا به کامپوننت
  }
};

export const fetchUserTrips = async (userId) => {
  try {
    const token = localStorage.getItem("accessToken"); // دریافت توکن از Local Storage
    const response = await axios.get(`${API_BASE_URL}/trip/user-trips/${userId}`, {
      headers: {
        "accept": "application/json",
        "x-token": token, // ارسال توکن در هدر
      },
    });
    return response.data; // بازگرداندن داده‌های پاسخ
  } catch (error) {
    console.error("خطا در دریافت سفرهای عضو:", error);
    throw error; // ارسال خطا به کامپوننت
  }
};
