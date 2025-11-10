import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/global.css";
import "../styles/HouseholdForm.css";

import { FiMapPin } from "react-icons/fi";
import ReviewPage from "./ReviewPage";

const HouseholdForm = () => {
  const [step, setStep] = useState(1);
  const [showMap, setShowMap] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false); // مدال راهنما بعد از مرحله 1
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 37.5553,
    lng: 45.0725,
  });
  const [householdData, setHouseholdData] = useState({
    address: "",
    householdCount: "",
    carCount: "",
    parkingSpacesCount: "",
    postCode: "",
  });

  const [individuals, setIndividuals] = useState([]);
  const [householdCountError, setHouseholdCountError] = useState("");
  const [carCountError, setCarCountError] = useState("");
  const [parkingSpacesError, setParkingSpacesError] = useState("");
  const [customRelation, setCustomRelation] = useState("");
  const [carYearError, setCarYearError] = useState("");
  const [postCodeError, setPostCodeError] = useState("");
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const [workStartHourError, setWorkStartHourError] = useState("");

  // تابع تبدیل اعداد فارسی به انگلیسی
  const convertToEnglishNumbers = (str) => {
    if (str === null || str === undefined) return '';
    const stringValue = String(str);
    
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    
    let result = stringValue;
    for (let i = 0; i < 10; i++) {
      const regex = new RegExp(persianNumbers[i], 'g');
      result = result.replace(regex, englishNumbers[i]);
    }
    return result;
  };

  const handleHouseholdChange = (e) => {
    const { name, value } = e.target;
    const convertedValue = convertToEnglishNumbers(value);

    if (name === "householdCount") {
      if (!value.trim() || isNaN(convertedValue) || parseInt(convertedValue) < 1) {
        setHouseholdCountError("لطفاً عددی بزرگتر یا مساوی 1 وارد کنید.");
        setIndividuals([]);
      } else {
        setHouseholdCountError("");
        setIndividuals(new Array(parseInt(convertedValue)).fill({
          hasDrivingLicense: "",
          hasCarOwnership: "",
          relationWithHouseHold: "",
          gender: "",
          education: "",
          job: "",
          workStartHour: { hour: "", minute: "", period: "" },
          carDetails: {
            carType: "",
            carName: "",
            carYear: "",
            fuelType: "",
          },
          income: "",
          expenses: "",
        }));
      }
    }

    if (name === "carCount") {
      if (!value.trim() || isNaN(convertedValue) || parseInt(convertedValue) < 0) {
        setCarCountError("لطفاً عددی بزرگتر یا مساوی 0 وارد کنید.");
      } else {
        setCarCountError("");
      }
    }

    if (name === "parkingSpacesCount") {
      if (!value.trim() || isNaN(convertedValue) || parseInt(convertedValue) < 0) {
        setParkingSpacesError("لطفاً عددی بزرگتر یا مساوی 0 وارد کنید.");
      } else {
        setParkingSpacesError("");
      }
    }

    if (name === "postCode") {
      if (!value.trim()) {
        setPostCodeError("");
      } else if (!/^\d{10}$/.test(convertedValue)) {
        setPostCodeError("کد پستی باید عددی ۱۰ رقمی باشد.");
      } else {
        setPostCodeError("");
      }
    }
    
    setHouseholdData({ ...householdData, [name]: convertedValue });
  };

  const handleIndividualChange = (e) => {
    const { name, value } = e.target;
    const updatedIndividuals = [...individuals];

    if (name === "hour" || name === "minute" || name === "period") {
      if (name === "hour" || name === "minute") {
        const convertedValue = convertToEnglishNumbers(value);
        updatedIndividuals[currentMemberIndex].workStartHour = {
          ...updatedIndividuals[currentMemberIndex].workStartHour,
          [name]: convertedValue,
        };
      } else {
        updatedIndividuals[currentMemberIndex].workStartHour = {
          ...updatedIndividuals[currentMemberIndex].workStartHour,
          [name]: value,
        };
      }
      setWorkStartHourError("");
    } else {
      updatedIndividuals[currentMemberIndex] = {
        ...updatedIndividuals[currentMemberIndex],
        [name]: value,
      };
    }

    setIndividuals(updatedIndividuals);
  };

  const handleKeyPress = (e) => {
    const key = e.key;
    const allowedKeys = [
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      '۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹',
      'Backspace', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Delete'
    ];
    
    if (!allowedKeys.includes(key)) {
      e.preventDefault();
      return false;
    }
    return true;
  };

  const isStep1Valid = () => {
    return (
      householdData.householdCount &&
      householdData.carCount &&
      householdData.parkingSpacesCount &&
      !householdCountError &&
      !carCountError &&
      !parkingSpacesError &&
      !postCodeError && 
      householdData.address
    );
  };

  const isStep2Valid = () => {
    const currentMember = individuals[currentMemberIndex];
  
    return (
      currentMember?.hasDrivingLicense !== "" &&
      currentMember?.hasCarOwnership !== "" &&
      currentMember?.relationWithHouseHold !== "" &&
      currentMember?.gender !== "" &&
      currentMember?.education !== "" &&
      currentMember?.job !== "" &&
      (currentMember?.relationWithHouseHold !== "other" || customRelation !== "") &&
      (currentMember?.hasCarOwnership !== "true" || (
        currentMember?.carDetails?.carType &&
        currentMember?.carDetails?.carName &&
        currentMember?.carDetails?.carYear &&
        !carYearError &&
        currentMember?.carDetails?.fuelType
      ))
    );
  };

  // تغییر در تابع handleNextStep برای نمایش مدال بعد از مرحله 1
  const handleNextStep = () => {
    if (step === 1 && isStep1Valid()) {
      // نمایش مدال راهنما قبل از رفتن به مرحله 2
      setShowInfoModal(true);
    } else if (step === 2) {
      if (currentMemberIndex + 1 === individuals.length) {
        setStep(3);
      } else {
        setCurrentMemberIndex(currentMemberIndex + 1);
      }
    }
  };

  // تابع برای ادامه به مرحله 2 بعد از تأیید کاربر
  const handleContinueToStep2 = () => {
    setShowInfoModal(false);
    setStep(2);
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      if (step === 2 && currentMemberIndex > 0) {
        setCurrentMemberIndex(currentMemberIndex - 1);
      } else {
        setStep(step - 1);
      }
    }
  };

  const handleFinalSubmit = () => {
    alert("اطلاعات ثبت شد!");
  };

  const handleMapClick = (event) => {
    const { lat, lng } = event.latlng;
    setSelectedLocation({ lat, lng });
    setHouseholdData({
      ...householdData,
      address: `Latitude: ${lat}, Longitude: ${lng}`,
    });
    setShowMap(false);
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  const handleCarDetailsChange = (e) => {
    const { name, value } = e.target;
    const updatedIndividuals = [...individuals];

    if (name === "carYear") {
      const convertedValue = convertToEnglishNumbers(value);
      const numericValue = parseInt(convertedValue, 10);

      if (!value.trim()) {
        setCarYearError("لطفاً سال خودرو را وارد کنید.");
      } else if (isNaN(numericValue) || numericValue <= 0) {
        setCarYearError("لطفاً یک عدد معتبر وارد کنید.");
      } else if (convertedValue.length !== 4) {
        setCarYearError("سال خودرو باید چهار رقمی باشد.");
      } else {
        setCarYearError("");
      }

      updatedIndividuals[currentMemberIndex].carDetails = {
        ...updatedIndividuals[currentMemberIndex].carDetails,
        carYear: convertedValue,
      };
    } else {
      updatedIndividuals[currentMemberIndex].carDetails = {
        ...updatedIndividuals[currentMemberIndex].carDetails,
        [name]: value,
      };
    }

    setIndividuals(updatedIndividuals);
  };

  return (
    <div className="form-container">
      <h2>ثبت خانوار</h2>

      {step === 1 && (
        <div>
          {/* بخش آدرس */}
          <label>آدرس خانوار: <span style={{ color: "red" }}>*</span></label>
          <div className="location-field" onClick={() => setShowMap(true)}>
            <input
              type="text"
              name="address"
              placeholder="انتخاب موقعیت خانوار"
              value={householdData.address}
              readOnly
            />
            <FiMapPin className="location-icon" style={{ 
              pointerEvents: "none",
              position: "absolute",
              right: "4px",
              top: "36%",
              transform: "translateY(-50%)"
            }} />
          </div>

          {/* بخش کد پستی */}
          <label>کد پستی خانوار:</label>
          <input
            type="text"
            name="postCode"
            placeholder="کد پستی را وارد کنید"
            value={householdData.postCode}
            onChange={handleHouseholdChange}
          />
          {postCodeError && <p className="error">{postCodeError}</p>}

          {/* بخش تعداد اعضای خانوار */}
          <label>تعداد اعضای خانوار: <span style={{ color: "red" }}>*</span></label>
          <input
            type="text"
            name="householdCount"
            placeholder="تعداد اعضای خانوار"
            value={householdData.householdCount}
            onChange={handleHouseholdChange}
          />
          {householdCountError && <p className="error">{householdCountError}</p>}

          {/* بخش تعداد ماشین‌ها */}
          <label>تعداد ماشین‌ها: <span style={{ color: "red" }}>*</span></label>
          <input
            type="text"
            name="carCount"
            placeholder="تعداد ماشین‌ها"
            value={householdData.carCount}
            onChange={handleHouseholdChange}
          />
          {carCountError && <p className="error">{carCountError}</p>}

          {/* بخش تعداد پارکینگ‌ها */}
          <label>تعداد پارکینگ‌های در اختیار: <span style={{ color: "red" }}>*</span></label>
          <input
            type="text"
            name="parkingSpacesCount"
            placeholder="تعداد پارکینگ‌های در اختیار"
            value={householdData.parkingSpacesCount}
            onChange={handleHouseholdChange}
          />
          {parkingSpacesError && <p className="error">{parkingSpacesError}</p>}
          
          <div style={{ marginTop: "20px" }}></div>

          {/* دکمه مرحله بعد */}
          {isStep1Valid() && (
            <button onClick={handleNextStep}>
              مرحله بعد
            </button>
          )}
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="info-banner">
      <div className="info-banner-content">
        <h4>📢 ضمن تشکر از مشارکت شما</h4>
        <p>
          اطلاعات این فرم صرفاً برای مدیریت وضعیت ترافیک و 
          بهبود امکانات حمل و نقلی شهر ارومیه است و استفاده دیگری نخواهد داشت.
        </p>
      </div>
    </div>
          <h3>اطلاعات عضو {currentMemberIndex + 1} از {individuals.length}</h3>

          {/* فیلدهای اطلاعات فردی */}
          <label>جنسیت: <span style={{ color: "red" }}>*</span></label>
          <select
            name="gender"
            value={individuals[currentMemberIndex]?.gender || ""}
            onChange={handleIndividualChange}
          >
            <option value="">انتخاب کنید</option>
            <option value="مرد">مرد</option>
            <option value="زن">زن</option>
          </select>

          <label>تحصیلات: <span style={{ color: "red" }}>*</span></label>
          <select
            name="education"
            value={individuals[currentMemberIndex]?.education || ""}
            onChange={handleIndividualChange}
          >
            <option value="">انتخاب کنید</option>
            <option value="بی‌سواد">بی‌سواد</option>
            <option value="ابتدایی">ابتدایی</option>
            <option value="راهنمایی">راهنمایی</option>
            <option value="دیپلم">دیپلم</option>
            <option value="دانشجو">دانشجو</option>
            <option value="فوق‌دیپلم">فوق‌دیپلم</option>
            <option value="لیسانس">لیسانس</option>
            <option value="فوق‌لیسانس">فوق‌لیسانس</option>
            <option value="دکترا">دکترا</option>
            <option value="سایر">سایر</option>
          </select>

          <label>شغل: <span style={{ color: "red" }}>*</span></label>
          <select
            name="job"
            value={individuals[currentMemberIndex]?.job || ""}
            onChange={handleIndividualChange}
          >
            <option value="">انتخاب کنید</option>
            <option value="دانش‌آموز">دانش‌آموز</option>
            <option value="کارگر ساده">کارگر ساده</option>
            <option value="کارگر ماهر">کارگر ماهر</option>
            <option value="کارمند دولتی">کارمند دولتی</option>
            <option value="کارمند خصوصی">کارمند خصوصی</option>
            <option value="کشاورز">کشاورز</option>
            <option value="بازنشسته">بازنشسته</option>
            <option value="بیکار">بیکار</option>
            <option value="خانه‌دار">خانه‌دار</option>
            <option value="سایر">سایر</option>
          </select>

          <div>
            <label>ساعت شروع کار:</label>
            <div className="time-fields">
              <input
                type="text"
                name="hour"
                placeholder="ساعت"
                value={individuals[currentMemberIndex]?.workStartHour?.hour || ""}
                onChange={handleIndividualChange}
                onKeyPress={handleKeyPress}
                maxLength="2"
              />
              <span>:</span>
              <input
                type="text"
                name="minute"
                placeholder="دقیقه"
                value={individuals[currentMemberIndex]?.workStartHour?.minute || ""}
                onChange={handleIndividualChange}
                onKeyPress={handleKeyPress}
                maxLength="2"
              />
              <select
                name="period"
                value={individuals[currentMemberIndex]?.workStartHour?.period || ""}
                onChange={handleIndividualChange}
              >
                <option value="">زمان</option>
                <option value="صبح">صبح</option>
                <option value="عصر">عصر</option>
              </select>
            </div>
            {workStartHourError && <p className="error">{workStartHourError}</p>}
          </div>

          <label>گواهی‌نامه: <span style={{ color: "red" }}>*</span></label>
          <select
            name="hasDrivingLicense"
            value={individuals[currentMemberIndex]?.hasDrivingLicense || ""}
            onChange={handleIndividualChange}
          >
            <option value="">انتخاب کنید</option>
            <option value="true">دارد</option>
            <option value="false">ندارد</option>
          </select>

          <label>ماشین شخصی در اختیار دارد؟ <span style={{ color: "red" }}>*</span></label>
          <select
            name="hasCarOwnership"
            value={individuals[currentMemberIndex]?.hasCarOwnership || ""}
            onChange={handleIndividualChange}
          >
            <option value="">انتخاب کنید</option>
            <option value="true">بله</option>
            <option value="false">خیر</option>
          </select>

          {individuals[currentMemberIndex]?.hasCarOwnership === "true" && (
            <div>
              <label>نوع خودرو: <span style={{ color: "red" }}>*</span></label>
              <select
                name="carType"
                value={individuals[currentMemberIndex]?.carDetails?.carType || ""}
                onChange={handleCarDetailsChange}
              >
                <option value="">انتخاب کنید</option>
                <option value="سواری">سواری</option>
                <option value="وانت">وانت</option>
                <option value="نیمه‌سنگین">نیمه‌سنگین</option>
                <option value="سنگین">سنگین</option>
              </select>

              <label>نام خودرو: <span style={{ color: "red" }}>*</span></label>
              <input
                type="text"
                name="carName"
                placeholder="نام خودرو"
                value={individuals[currentMemberIndex]?.carDetails?.carName || ""}
                onChange={handleCarDetailsChange}
              />

              <label>سال تولید خودرو: <span style={{ color: "red" }}>*</span></label>
              <input
                type="text"
                name="carYear"
                placeholder="سال تولید خودرو"
                value={individuals[currentMemberIndex]?.carDetails?.carYear || ""}
                onChange={handleCarDetailsChange}
              />
              {carYearError && <p className="error">{carYearError}</p>}

              <label>نوع سوخت خودرو: <span style={{ color: "red" }}>*</span></label>
              <select
                name="fuelType"
                value={individuals[currentMemberIndex]?.carDetails?.fuelType || ""}
                onChange={handleCarDetailsChange}
              >
                <option value="">انتخاب کنید</option>
                <option value="بنزین">بنزین</option>
                <option value="گازوئیل">گازوئیل</option>
                <option value="گاز">گاز</option>
                <option value="برق">برق</option>
                <option value="هیبریدی">هیبریدی</option>
              </select>
            </div>
          )}

          <label>میزان درآمد ماهانه (میلیون تومان):</label>
          <select
            name="income"
            value={individuals[currentMemberIndex]?.income || ""}
            onChange={handleIndividualChange}
          >
            <option value="">انتخاب کنید</option>
            <option value="زیر ۱۰ میلیون تومان">زیر ۱۰ میلیون تومان</option>
            <option value="بین ۱۰ تا ۲۰ میلیون تومان">بین ۱۰ تا ۲۰ میلیون تومان</option>
            <option value="بین ۲۰ تا ۳۰ میلیون تومان">بین ۲۰ تا ۳۰ میلیون تومان</option>
            <option value="بیشتر از ۳۰ میلیون تومان">بیشتر از ۳۰ میلیون تومان</option>
          </select>

          <label>میزان هزینه ماهانه (میلیون تومان):</label>
          <select
            name="expenses"
            value={individuals[currentMemberIndex]?.expenses || ""}
            onChange={handleIndividualChange}
          >
            <option value="">انتخاب کنید</option>
            <option value="زیر ۱۰ میلیون تومان">زیر ۱۰ میلیون تومان</option>
            <option value="بین ۱۰ تا ۲۰ میلیون تومان">بین ۱۰ تا ۲۰ میلیون تومان</option>
            <option value="بین ۲۰ تا ۳۰ میلیون تومان">بین ۲۰ تا ۳۰ میلیون تومان</option>
            <option value="بیشتر از ۳۰ میلیون تومان">بیشتر از ۳۰ میلیون تومان</option>
          </select>

          <div style={{ marginTop: "20px" }}></div>

          <label>نسبت با خانوار: <span style={{ color: "red" }}>*</span></label>
          <select
            name="relationWithHouseHold"
            value={individuals[currentMemberIndex]?.relationWithHouseHold || ""}
            onChange={handleIndividualChange}
          >
            <option value="">انتخاب کنید</option>
            <option value="پدر">پدر</option>
            <option value="مادر">مادر</option>
            <option value="پسر">پسر</option>
            <option value="دختر">دختر</option>
            <option value="other">سایر</option>
          </select>

          {individuals[currentMemberIndex]?.relationWithHouseHold === "other" && (
            <input
              type="text"
              name="customRelation"
              placeholder="نسبت خود را وارد کنید"
              value={customRelation}
              onChange={(e) => setCustomRelation(e.target.value)}
            />
          )}
          <div style={{ marginTop: "20px" }}></div>

          <button onClick={handlePreviousStep}>مرحله قبل</button>
          {isStep2Valid() && (
            <button onClick={() => {
              if (currentMemberIndex + 1 === individuals.length) {
                setStep(3);
              } else {
                handleNextStep();
              }
            }} disabled={!isStep2Valid()}>
              {currentMemberIndex + 1 === individuals.length
                ? "مشاهده اطلاعات و تایید نهایی"
                : `ادامه: اطلاعات عضو ${currentMemberIndex + 2}`}
            </button>
          )}
        </div>
      )}

      {step === 3 && (
        <ReviewPage 
          householdData={householdData} 
          individuals={individuals}
          customRelation={customRelation} 
          handlePreviousStep={handlePreviousStep}
          handleFinalSubmit={handleFinalSubmit}
        />
      )}

      {/* مدال نقشه */}
      <Modal show={showMap} onHide={() => setShowMap(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>انتخاب موقعیت مکانی</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MapContainer
            center={selectedLocation}
            zoom={12}
            style={{ height: "80vh", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedLocation}></Marker>
            <MapClickHandler />
          </MapContainer>
        </Modal.Body>
      </Modal>

      {/* مدال راهنما بعد از مرحله 1 */}
      <Modal show={showInfoModal} onHide={() => setShowInfoModal(false)} centered>
        <Modal.Header >
          <Modal.Title>📋 تأیید اطلاعات خانوار</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="info-modal-content">
            <h4>لطفاً اطلاعات وارد شده را بررسی کنید:</h4>
            <div className="info-summary">
              <p><strong>تعداد اعضای خانوار:</strong> {householdData.householdCount} نفر</p>
              <p><strong>تعداد ماشین‌ها:</strong> {householdData.carCount} دستگاه</p>
              <p><strong>تعداد پارکینگ‌ها:</strong> {householdData.parkingSpacesCount} جای پارک</p>
            </div>
            <div className="info-reminder">
              <p>✅ <strong>توجه:</strong> تعداد اعضای خانوار باید شامل <strong>همه افرادی</strong> باشد که در این خانوار زندگی می‌کنند (پدر، مادر، فرزندان و سایر اعضای دائمی)</p>
            </div>
            <p>آیا اطلاعات فوق صحیح است؟</p>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ justifyContent: 'space-between' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setShowInfoModal(false);
              setStep(1); // بازگشت به مرحله 1 برای اصلاح
            }}
          >
            ✏️ اصلاح می‌کنم
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleContinueToStep2}
          >
            ✅ درست است، ادامه می‌دهم
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HouseholdForm;