import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sendTripsToAPI } from "../services/tripService"; // فرض بر این است که فایل tripService موجود است
import '../styles/global.css';
import '../styles/PreviewTrips.css';

const PreviewTripsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const trips = location.state?.trips || [];
  const memberId = location.state?.memberId;

  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 
  const [successMessage, setSuccessMessage] = useState(""); 
  const [showConfirmModal, setShowConfirmModal] = useState(false); 

  // تابع کمکی برای بررسی اینکه سفر خالی نیست
  const isTripFilled = (trip) => {
    return (
      trip.departure.location?.trim() ||
      trip.destination.location?.trim() ||
      trip.purpose?.trim() ||
      trip.transportationMode?.trim() ||
      trip.tripFee?.trim() ||
      (trip.parking && trip.parkingFee?.trim())
    );
  };

  // فقط سفرهای پر شده را برای نمایش فیلتر می‌کنیم
  const filledTrips = trips.filter(isTripFilled);

  const handleSubmitTrips = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("توکن یافت نشد! لطفاً وارد حساب کاربری خود شوید.");
      }

      // فقط سفرهای پر شده ارسال شوند
      const tripsToSend = trips.filter(isTripFilled);

      if (tripsToSend.length === 0) {
        throw new Error("هیچ سفری برای ارسال وجود ندارد!");
      }

      const response = await sendTripsToAPI({ trips: tripsToSend, memberId }, token);
      console.log("پاسخ از سرور:", response);

      setSuccessMessage("سفرها با موفقیت ثبت شدند!");
      setTimeout(() => {
        navigate(`/household/details`, { state: { response } });
      }, 2000);
    } catch (err) {
      console.error("خطا در ارسال داده‌ها:", err);
      setError(err.message || "خطای ارسال داده‌ها.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    setShowConfirmModal(false); 
    handleSubmitTrips(); 
  };

  const handleCancel = () => {
    setShowConfirmModal(false); 
  };

  return (
    <div className="preview-trips-container">
      <div className="preview-trips-wrapper">
        <h1>مشاهده سفرها</h1>

        {filledTrips.length === 0 && <p>هیچ سفری برای نمایش وجود ندارد.</p>}

        {filledTrips.map((trip, index) => (
  <div key={index} className="trip-item">
    <p><strong>سفر شماره {trip.tripNumber}</strong></p>
    <p><strong>مبدا:</strong> {trip.departure.location}</p>
    <p><strong>زمان حرکت:</strong> {trip.departure.time.hour}:{trip.departure.time.minute} {trip.departure.time.period}</p>
    <p><strong>مقصد:</strong> {trip.destination.location}</p>
    <p><strong>زمان رسیدن:</strong> {trip.destination.time.hour}:{trip.destination.time.minute} {trip.destination.time.period}</p>
    <p><strong>هدف سفر:</strong> {trip.purpose}</p>
    <p><strong>نوع حمل و نقل:</strong> {trip.transportationMode}</p>
    
    {/* 🔽 این بخش اصلاح شده */}
    {trip.transportationMode === "خودروی شخصی (راننده بودم)" && trip.parking && (
      <div className="parking-details">
        <p><strong>پارکینگ:</strong> {trip.parking}</p>
        {trip.parking !== "پارکینگ شخصی" && trip.parkingFee && (
          <p><strong>هزینه پارکینگ:</strong> {trip.parkingFee} هزار تومان</p>
        )}
      </div>
    )}
    
    <p><strong>هزینه سفر:</strong> {trip.tripFee} هزار تومان</p>
  </div>
))}


<div className="actions">


  <button 
    onClick={() => setShowConfirmModal(true)}
    disabled={loading || successMessage} // اضافه شدن شرط successMessage
  >
    {loading ? "در حال ارسال..." : successMessage ? successMessage : "تایید و نهایی کردن"}
  </button>
  <button
    onClick={() => {
      const lastFilledIndex = trips
        .map((trip, index) => ({ trip, index }))
        .filter(({ trip }) => {
          return (
            trip.departure.location?.trim() ||
            trip.destination.location?.trim() ||
            trip.purpose?.trim() ||
            trip.transportationMode?.trim() ||
            trip.tripFee?.trim() ||
            (trip.parking && trip.parkingFee?.trim())
          );
        })
        .map(({ index }) => index)
        .pop();

      const targetIndex = lastFilledIndex !== undefined ? lastFilledIndex : trips.length - 1;

      navigate(`/trips/${memberId}/add`, {
        state: { trips, memberId, currentTripIndex: targetIndex },
      });
    }}
    disabled={loading || successMessage} // اضافه شدن شرط successMessage
  >
    صفحه ی قبلی
  </button>
</div>


        {error && (
          <div className="message-box error">
            <p>خطا: {error}</p>
          </div>
        )}

        {successMessage && (
          <div className="message-box success">
            <p>{successMessage}</p>
          </div>
        )}

        {showConfirmModal && (
          <div className="confirm-modal">
            <div className="modal-content">
              <p>آیا از تایید اطلاعات سفر اطمینان دارید؟</p>
              <p style={{ fontSize: "14px", color: "#666" }}>
                (در صورت تایید نهایی قادر به ویرایش سفرها نخواهید بود)
              </p>
              <div className="modal-actions">
                <button onClick={handleConfirm} className="modal-button confirm">
                  بله
                </button>
                <button onClick={handleCancel} className="modal-button cancel">
                  خیر
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewTripsPage;
