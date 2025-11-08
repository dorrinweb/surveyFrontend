import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUserTrips } from "../services/householdService";
import { sendNoTripStatus, sendNotInCityStatus } from "../services/tripService";
import "../styles/global.css";
import "../styles/TripsPage.css";

const TripsPage = () => {
  const { memberId } = useParams();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  console.log(setUserStatus)
  const navigate = useNavigate();

  useEffect(() => {
    const getTrips = async () => {
      try {
        const response = await fetchUserTrips(memberId);
        console.log("داده‌های دریافتی:", response.data);
        
        const userData = response.data;
        
        // بررسی وضعیت کاربر
        if (userData.noTrip === true) {
          setUserStatus('noTrip');
        } else if (userData.noInCity === true) {
          setUserStatus('notInCity');
        } else {
          // اگر وضعیتی ثبت نکرده، سفرها را نمایش بده
          setTrips(userData.trips || []);
        }
        
      } catch (err) {
        console.error("خطا در دریافت اطلاعات:", err);
        setError("خطایی رخ داد. لطفاً دوباره تلاش کنید.");
      } finally {
        setLoading(false);
      }
    };

    getTrips();
  }, [memberId]);

  const handleAddTrip = () => {
    navigate(`/trips/${memberId}/add`);
  };

  const handleBack = () => {
    navigate("/household/details");
  };

  const handleNoTrip = () => {
    setSelectedAction('noTrip');
    setShowConfirmModal(true);
  };

  const handleNotInCity = () => {
    setSelectedAction('notInCity');
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    setShowConfirmModal(false);
    setActionLoading(true);
    
    try {
      if (selectedAction === 'noTrip') {
        await sendNoTripStatus(memberId);
        setUserStatus('noTrip');
      } else if (selectedAction === 'notInCity') {
        await sendNotInCityStatus(memberId);
        setUserStatus('notInCity');
      }
    } catch (err) {
      console.error(`خطا در ثبت وضعیت:`, err);
      setError("خطا در ثبت اطلاعات. لطفاً دوباره تلاش کنید.");
    } finally {
      setActionLoading(false);
      setSelectedAction(null);
    }
  };

  const cancelAction = () => {
    setShowConfirmModal(false);
    setSelectedAction(null);
  };

  const handleShowOptions = () => {
    setShowOptions(true);
  };

  const handleHideOptions = () => {
    setShowOptions(false);
  };

  // محتوای صفحه بر اساس وضعیت کاربر
  const renderContent = () => {
    // اگر کاربر وضعیتی ثبت کرده باشد
    if (userStatus === 'noTrip') {
      return (
        <div className="status-view">
          <div className="status-card no-trip-status">
            <div className="status-icon">🏠</div>
            <div className="status-content">
              <h3>شما تأیید کرده‌اید که این عضو هیچ سفری نداشته‌است</h3>
              <div className="status-note">
                <span>⚠️ این وضعیت قابل تغییر نیست</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (userStatus === 'notInCity') {
      return (
        <div className="status-view">
          <div className="status-card not-in-city-status">
            <div className="status-icon">✈️</div>
            <div className="status-content">
              <h3>در شهر نبوده‌است</h3>
              <p>بر اساس اطلاعات ثبت شده، این عضو خانوار در شهر نبوده‌است </p>
              <div className="status-note">
                <span>⚠️ این وضعیت قابل تغییر نیست</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // اگر کاربر وضعیتی ثبت نکرده و سفر دارد
    if (trips.length > 0) {
      return (
        <div className="trips-list">
          {trips.map((trip, index) => (
            <div key={trip.id || index} className="trip-card">
              <div className="trip-card-header">
                <h3>🚗 سفر شماره {trip.tripNumber}</h3>
              </div>
              <div className="trip-card-body">
                <div className="trip-info-row">
                  <span className="trip-info-label">📍 مبدا:</span>
                  <span className="trip-info-value">{trip.departure.location}</span>
                </div>
                <div className="trip-info-row">
                  <span className="trip-info-label">🕒 زمان حرکت:</span>
                  <span className="trip-info-value">
                    {`${trip.departure.time.hour}:${trip.departure.time.minute} ${trip.departure.time.period}`}
                  </span>
                </div>
                <div className="trip-info-row">
                  <span className="trip-info-label">🎯 مقصد:</span>
                  <span className="trip-info-value">{trip.destination.location}</span>
                </div>
                <div className="trip-info-row">
                  <span className="trip-info-label">🕓 زمان رسیدن:</span>
                  <span className="trip-info-value">
                    {`${trip.destination.time.hour}:${trip.destination.time.minute} ${trip.destination.time.period}`}
                  </span>
                </div>
                <div className="trip-info-row">
                  <span className="trip-info-label">🎯 هدف سفر:</span>
                  <span className="trip-info-value">{trip.purpose}</span>
                </div>
                <div className="trip-info-row">
                  <span className="trip-info-label">🚘 حمل و نقل:</span>
                  <span className="trip-info-value">{trip.transportationMode}</span>
                </div>
                <div className="trip-info-row">
                  <span className="trip-info-label">🅿️ پارکینگ:</span>
                  <span className="trip-info-value">{trip.parking}</span>
                </div>
                <div className="trip-info-row">
                  <span className="trip-info-label">💰 هزینه پارکینگ:</span>
                  <span className="trip-info-value">{trip.parkingFee} تومان</span>
                </div>
                <div className="trip-info-row">
                  <span className="trip-info-label">💸 هزینه سفر:</span>
                  <span className="trip-info-value">{trip.tripFee} تومان</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // اگر کاربر وضعیتی ثبت نکرده و سفر هم ندارد
    return (
      <div className="no-trips-container">
        <div className="no-trips-card">
          <div className="no-trips-icon">📭</div>
          <p className="no-trips-message">هیچ سفری برای این عضو ثبت نشده است</p>
          
          {!showOptions ? (
            <div className="primary-actions">
              <button onClick={handleAddTrip} className="add-trip-button primary">
                ➕ ثبت سفر جدید
              </button>
              <button onClick={handleShowOptions} className="alternative-options-button">
                ❓ گزینه‌های دیگر
              </button>
            </div>
          ) : (
            <div className="alternative-options">
              <div className="options-header">
                <button onClick={handleHideOptions} className="back-options-button">
                  ↩️ بازگشت
                </button>
                <h4>انتخاب گزینه مناسب</h4>
              </div>
              
              <div className="option-cards">
                <div className="option-card">
                  <div className="option-icon">🏠</div>
                  <div className="option-content">
                    <h5>هیچ سفری نداشته است</h5>
                    <p>این عضو خانوار در شهر بوده است اما سفر خاصی انجام نداده است</p>
                    <button 
                      onClick={handleNoTrip} 
                      className="option-button"
                      disabled={actionLoading}
                    >
                      {actionLoading ? "⏳ در حال ثبت..." : "✅ تأیید و ادامه"}
                    </button>
                  </div>
                </div>
                
                <div className="option-card">
                  <div className="option-icon">✈️</div>
                  <div className="option-content">
                    <h5>در شهر نبوده است</h5>
                    <p>این عضو خانوار به مسافرت رفته یا خارج از شهر بوده است</p>
                    <button 
                      onClick={handleNotInCity} 
                      className="option-button"
                      disabled={actionLoading}
                    >
                      {actionLoading ? "⏳ در حال ثبت..." : "✅ تأیید و ادامه"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="trips-page-container">
        <div className="trips-content-box">
          <div className="loading-container">
            <p className="loading-message">🔄 در حال بارگذاری...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trips-page-container">
        <div className="trips-content-box">
          <div className="error-container">
            <p className="error-message">❌ {error}</p>
            <button onClick={handleBack} className="back-button">
              ↩️ بازگشت
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trips-page-container">
      <div className="trips-content-box">
        <h2> 🚎 لیست سفرهای عضو</h2>
        
        {renderContent()}

        <div className="actions-container">
          <button onClick={handleBack} className="back-button">
            ↩️ بازگشت به صفحه جزئیات
          </button>
        </div>
      </div>

      {/* مدال تأیید */}
      {showConfirmModal && (
        <div className="confirm-modal">
          <div className="modal-content">
            <div className="simple-modal-icon">⚠️</div>
            <h3>تأیید نهایی</h3>
            <p>
              {selectedAction === 'noTrip' 
                ? "آیا مطمئن هستید که این عضو خانوار هیچ سفری نداشته‌است؟ این عمل قابل بازگشت نیست."
                : "آیا مطمئن هستید که این عضو خانوار در شهر نبوده‌است؟ این عمل قابل بازگشت نیست."
              }
            </p>
            <div className="simple-modal-actions">
              <button 
                onClick={cancelAction} 
                className="simple-modal-btn simple-modal-cancel"
                disabled={actionLoading}
              >
                انصراف
              </button>
              <button 
                onClick={confirmAction} 
                className="simple-modal-btn simple-modal-confirm"
                disabled={actionLoading}
              >
                {actionLoading ? "⏳ در حال ثبت..." : "تأیید"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripsPage;