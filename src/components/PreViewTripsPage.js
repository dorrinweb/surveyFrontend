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
    <p>مبدا: {trip.departure.location}</p>
    <p>زمان حرکت: {trip.departure.time.hour}:{trip.departure.time.minute} {trip.departure.time.period}</p>
    <p>مقصد: {trip.destination.location}</p>
    <p>زمان رسیدن: {trip.destination.time.hour}:{trip.destination.time.minute} {trip.destination.time.period}</p>
    <p>هدف سفر: {trip.purpose}</p>
    <p>نوع حمل و نقل: {trip.transportationMode}</p>
    {trip.transportationMode === "خودروی شخصی راننده (من)" && (
      <>
        <p>پارکینگ: {trip.parking}</p>
        {trip.parking !== "پارکینگ شخصی" && <p>هزینه پارکینگ: {trip.parkingFee}</p>}
      </>
    )}
    <p>هزینه سفر: {trip.tripFee}</p>
  </div>
))}


<div className="actions">
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

  <button
    onClick={() => setShowConfirmModal(true)}
    disabled={loading || successMessage} // اضافه شدن شرط successMessage
  >
    {loading ? "در حال ارسال..." : successMessage ? successMessage : "تایید و نهایی کردن"}
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
