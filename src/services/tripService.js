// src/services/tripService.js
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
  
  // برگرداندن response اصلی برای ادامه پردازش
  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    data: data
  };
};

export const sendTripsToAPI = async ({ memberId, trips }) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("توکن یافت نشد. لطفاً دوباره وارد شوید.");

    const formattedData = {
      userId: memberId,
      trips: trips.map(trip => ({
        departure: {
          time: trip.departure.time,
          location: trip.departure.location,
        },
        destination: {
          time: trip.destination.time,
          location: trip.destination.location,
        },
        purpose: trip.purpose,
        transportationMode: trip.transportationMode,
        parking: trip.parking,
        parkingFee: Number(trip.parkingFee) || 0,
        tripFee: Number(trip.tripFee) || 0,
      })),
    };

    console.log("📦 داده ارسالی به بک‌اند:", formattedData);

    const response = await fetch(`${API_BASE_URL}/trip/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-token": token,
      },
      body: JSON.stringify(formattedData),
    });

    const checkedResponse = await checkFetchAuth(response);

    if (!checkedResponse.ok) {
      console.error("❌ جزئیات خطا از سرور:", checkedResponse.data);
      throw new Error(`خطای سرور: ${checkedResponse.data?.message || checkedResponse.statusText}`);
    }

    console.log("✅ پاسخ سرور:", checkedResponse.data);
    return checkedResponse.data;
  } catch (error) {
    console.error("🚨 Error:", error);
    throw error;
  }
};

export const sendNoTripStatus = async (memberId) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("توکن یافت نشد. لطفاً دوباره وارد شوید.");

    const response = await fetch(`${API_BASE_URL}/user/no-trip`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-token": token,
      },
      body: JSON.stringify({ userId: memberId }),
    });

    const checkedResponse = await checkFetchAuth(response);

    if (!checkedResponse.ok) {
      console.error("❌ جزئیات خطا از سرور:", checkedResponse.data);
      throw new Error(`خطای سرور: ${checkedResponse.data?.message || checkedResponse.statusText}`);
    }

    console.log("✅ پاسخ سرور برای no-trip:", checkedResponse.data);
    return checkedResponse.data;
  } catch (error) {
    console.error("🚨 Error in sendNoTripStatus:", error);
    throw error;
  }
};

export const sendNotInCityStatus = async (memberId) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("توکن یافت نشد. لطفاً دوباره وارد شوید.");

    const response = await fetch(`${API_BASE_URL}/user/no-in-city`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-token": token,
      },
      body: JSON.stringify({ userId: memberId }),
    });

    const checkedResponse = await checkFetchAuth(response);

    if (!checkedResponse.ok) {
      console.error("❌ جزئیات خطا از سرور:", checkedResponse.data);
      throw new Error(`خطای سرور: ${checkedResponse.data?.message || checkedResponse.statusText}`);
    }

    console.log("✅ پاسخ سرور برای no-in-city:", checkedResponse.data);
    return checkedResponse.data;
  } catch (error) {
    console.error("🚨 Error in sendNotInCityStatus:", error);
    throw error;
  }
};