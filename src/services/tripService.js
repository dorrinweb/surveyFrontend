export const sendTripsToAPI = async ({ memberId, trips }) => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  try {
    // گرفتن توکن از localStorage
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("توکن یافت نشد. لطفاً دوباره وارد شوید.");

    // ساختار جدید مطابق فرمت مورد نظر بک‌اند
    const formattedData = {
      userId: memberId,
      trips: trips.map(trip => ({
        departure: {
          time:trip.departure.time,
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

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ جزئیات خطا از سرور:", errorData);
      throw new Error(`خطای سرور: ${errorData.message || response.statusText}`);
    }

    const responseData = await response.json();
    console.log("✅ پاسخ سرور:", responseData);
    return responseData;
  } catch (error) {
    console.error("🚨 Error:", error);
    throw error;
  }
};
export const sendNoTripStatus = async (memberId) => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ جزئیات خطا از سرور:", errorData);
      throw new Error(`خطای سرور: ${errorData.message || response.statusText}`);
    }

    const responseData = await response.json();
    console.log("✅ پاسخ سرور برای no-trip:", responseData);
    return responseData;
  } catch (error) {
    console.error("🚨 Error in sendNoTripStatus:", error);
    throw error;
  }
};

export const sendNotInCityStatus = async (memberId) => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ جزئیات خطا از سرور:", errorData);
      throw new Error(`خطای سرور: ${errorData.message || response.statusText}`);
    }

    const responseData = await response.json();
    console.log("✅ پاسخ سرور برای no-in-city:", responseData);
    return responseData;
  } catch (error) {
    console.error("🚨 Error in sendNotInCityStatus:", error);
    throw error;
  }
};