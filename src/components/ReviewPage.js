import React, { useState } from "react";
import { createHousehold } from "../services/householdService";
import { useNavigate } from "react-router-dom";
import "../styles/global.css";
import "../styles/reviewPage.css"; // اضافه کردن این خط


const ReviewPage = ({ householdData, individuals, customRelation, handlePreviousStep }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setMessage("");
    const payload = {
      householdData,
      individuals: individuals.map((individual) => ({
        ...individual,
        carDetails: individual.hasCarOwnership === "true" ? individual.carDetails : [],
      })),
    };

    try {
      const responseData = await createHousehold(payload);
      console.log("اطلاعات با موفقیت ارسال شد:", responseData);
      setMessageType("success");
      setMessage("اطلاعات با موفقیت ثبت شد!");
      
      navigate("/household/details");
    } catch (error) {
      console.error("خطا در ارتباط با سرور:", error);
      setMessageType("error");
      setMessage("خطایی رخ داد. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-page">
      <h2>بررسی و تایید نهایی اطلاعات</h2>
      
      {/* اطلاعات کلی خانوار */}
      <div className="info-box" style={{ marginBottom: "30px" }}>
        <h3>اطلاعات کلی خانوار</h3>
        <p><strong>آدرس:</strong> {householdData.address}</p>
        <p><strong>کد پستی:</strong> {householdData.postCode || "ثبت نشده"}</p>
        <p><strong>تعداد اعضای خانوار:</strong> {householdData.householdCount}</p>
        <p><strong>تعداد ماشین‌ها:</strong> {householdData.carCount}</p>
        <p><strong>تعداد پارکینگ‌های در اختیار:</strong> {householdData.parkingSpacesCount}</p>
      </div>

      {/* اطلاعات اعضای خانوار در کاردهای زیبا */}
      <div className="individuals-review">
        <h3>اطلاعات اعضای خانوار</h3>
        <div className="individuals-grid">
          {individuals.map((individual, index) => (
            <div key={index} className="individual-card">
              <div className="card-header">
                <h4>عضو {index + 1}</h4>
              </div>
              <div className="card-body">
                <div className="info-row">
                  <span className="info-label">جنسیت:</span>
                  <span className="info-value">{individual.gender}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">تحصیلات:</span>
                  <span className="info-value">{individual.education}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">شغل:</span>
                  <span className="info-value">{individual.job}</span>
                </div>
                {individual.workStartHour?.hour && individual.workStartHour?.minute && (
                  <div className="info-row">
                    <span className="info-label">ساعت شروع کار:</span>
                    <span className="info-value">
                      {individual.workStartHour.hour}:{individual.workStartHour.minute} {individual.workStartHour.period}
                    </span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">گواهی‌نامه:</span>
                  <span className="info-value">{individual.hasDrivingLicense === "true" ? "دارد" : "ندارد"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">ماشین شخصی:</span>
                  <span className="info-value">{individual.hasCarOwnership === "true" ? "دارد" : "ندارد"}</span>
                </div>
                {individual.hasCarOwnership === "true" && (
                  <div className="car-details">
                    <div className="info-row">
                      <span className="info-label">نوع خودرو:</span>
                      <span className="info-value">{individual.carDetails?.carType}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">نام خودرو:</span>
                      <span className="info-value">{individual.carDetails?.carName}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">سال تولید:</span>
                      <span className="info-value">{individual.carDetails?.carYear}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">نوع سوخت:</span>
                      <span className="info-value">{individual.carDetails?.fuelType}</span>
                    </div>
                  </div>
                )}
                {individual.income && (
                  <div className="info-row">
                    <span className="info-label">درآمد ماهانه:</span>
                    <span className="info-value">{individual.income}</span>
                  </div>
                )}
                {individual.expenses && (
                  <div className="info-row">
                    <span className="info-label">هزینه ماهانه:</span>
                    <span className="info-value">{individual.expenses}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">نسبت با خانوار:</span>
                  <span className="info-value">
                    {individual.relationWithHouseHold === "other" ? customRelation : individual.relationWithHouseHold}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* نمایش پیام‌ها */}
      {message && (
        <div className={`message-box ${messageType}`}>
          <p>{message}</p>
        </div>
      )}

      {/* دکمه‌های نهایی */}
      <div className="buttons-container" style={{ marginTop: "30px" }}>
        <button onClick={handlePreviousStep} disabled={isSubmitting}>
          بازگشت به ویرایش
        </button>
        <button onClick={handleFinalSubmit} disabled={isSubmitting} className="submit-button">
          {isSubmitting ? "لطفاً صبر کنید..." : "تایید و ثبت نهایی"}
        </button>
      </div>
    </div>
  );
};

export default ReviewPage;