import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/global.css";
import { FiMapPin } from "react-icons/fi";
import ReviewPage from "./ReviewPage"; // ایمپورت کامپوننت جدید

const HouseholdForm = () => {
  const [step, setStep] = useState(1); // مرحله فعلی
  const [showMap, setShowMap] = useState(false); // نمایش یا عدم نمایش نقشه
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 37.5553, // ارومیه
    lng: 45.0725, // ارومیه
  });
  const [householdData, setHouseholdData] = useState({
    address: "",
    householdCount: "", // تعداد اعضای خانوار
    carCount: "", // تعداد ماشین‌ها
    parkingSpacesCount: "", // تعداد پارکینگ‌های در اختیار
    postCode: "",
  });

  const [individuals, setIndividuals] = useState([]); // اطلاعات افراد خانوار
  const [householdCountError, setHouseholdCountError] = useState(""); // خطای تعداد اعضای خانوار
  const [carCountError, setCarCountError] = useState(""); // خطای تعداد ماشین‌ها
  const [parkingSpacesError, setParkingSpacesError] = useState(""); // خطای تعداد پارکینگ‌های در اختیار
  const [customRelation, setCustomRelation] = useState(""); // ذخیره مقدار وارد شده توسط کاربر برای گزینه "سایر"
  const [carYearError, setCarYearError] = useState(""); // خطای سال ماشین
  const [postCodeError, setPostCodeError] = useState(""); // خطای کد پستی خانوار

  const [currentMemberIndex, setCurrentMemberIndex] = useState(0); // شاخص فرد فعلی که اطلاعاتش وارد می‌شود
  const [workStartHourError, setWorkStartHourError] = useState(""); // خطای ساعت شروع کار

  // تابع تبدیل اعداد فارسی به انگلیسی
// تابع تبدیل اعداد فارسی به انگلیسی - نسخه اصلاح شده
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

  // تبدیل اعداد فارسی به انگلیسی برای تمام فیلدهای عددی
  const convertedValue = convertToEnglishNumbers(value);

  if (name === "householdCount") {
    // اگر فیلد خالی باشد یا نامعتبر باشد
    if (!value.trim() || isNaN(convertedValue) || parseInt(convertedValue) < 1) {
      setHouseholdCountError("لطفاً عددی بزرگتر یا مساوی 1 وارد کنید.");
      setIndividuals([]); // اگر مقدار نامعتبر باشد یا فیلد خالی باشد، آرایه افراد پاک شود
    } else {
      setHouseholdCountError(""); // پاک کردن پیام خطا
      setIndividuals(new Array(parseInt(convertedValue)).fill({ // ایجاد آرایه به اندازه تعداد اعضا
        hasDrivingLicense: "",
        hasCarOwnership: "",
        relationWithHouseHold: "",
        gender: "", // فیلد ضروری جنسیت
        education: "",
        job: "",
        workStartHour: { hour: "", minute: "", period: "" }, // فیلد جدید برای ساعت شروع کار
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
    // ولیدیشن برای تعداد ماشین‌ها: باید عدد و بزرگتر یا مساوی صفر باشد
    if (!value.trim() || isNaN(convertedValue) || parseInt(convertedValue) < 0) {
      setCarCountError("لطفاً عددی بزرگتر یا مساوی 0 وارد کنید.");
    } else {
      setCarCountError(""); // پاک کردن پیام خطا
    }
  }

  if (name === "parkingSpacesCount") {
    // ولیدیشن برای تعداد پارکینگ‌ها: باید عدد و بزرگتر یا مساوی صفر باشد
    if (!value.trim() || isNaN(convertedValue) || parseInt(convertedValue) < 0) {
      setParkingSpacesError("لطفاً عددی بزرگتر یا مساوی 0 وارد کنید.");
    } else {
      setParkingSpacesError(""); // پاک کردن پیام خطا
    }
  }

  if (name === "postCode") {
    // اگر فیلد خالی است، چون اختیاری است خطایی ندارد
    if (!value.trim()) {
      setPostCodeError("");
    } else if (!/^\d{10}$/.test(convertedValue)) {
      setPostCodeError("کد پستی باید عددی ۱۰ رقمی باشد.");
    } else {
      setPostCodeError("");
    }
  }
  
  // مقدار تبدیل شده را در فیلد نمایش می‌دهیم
  setHouseholdData({ ...householdData, [name]: convertedValue });
};

  const handleIndividualChange = (e) => {
    const { name, value } = e.target;
  
    const updatedIndividuals = [...individuals];
  
    if (name === "hour" || name === "minute" || name === "period") {
      // فقط برای ساعت و دقیقه تبدیل عدد انجام شود
      if (name === "hour" || name === "minute") {
        const convertedValue = convertToEnglishNumbers(value);
        
        updatedIndividuals[currentMemberIndex].workStartHour = {
          ...updatedIndividuals[currentMemberIndex].workStartHour,
          [name]: convertedValue,
        };
      } else {
        // برای period فقط مقدار را ذخیره کن
        updatedIndividuals[currentMemberIndex].workStartHour = {
          ...updatedIndividuals[currentMemberIndex].workStartHour,
          [name]: value,
        };
      }
      
      setWorkStartHourError(""); // پاک کردن هرگونه خطا
    } else {
      // برای سایر فیلدها
      updatedIndividuals[currentMemberIndex] = {
        ...updatedIndividuals[currentMemberIndex],
        [name]: value,
      };
    }
  
    setIndividuals(updatedIndividuals);
  
    // بقیه کد...
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
      // حذف شرط اجباری برای درآمد و هزینه
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
  const handleNextStep = () => {
    if (step === 1 && isStep1Valid()) {
      setStep(2);
    } else if (step === 2) {
      if (currentMemberIndex + 1 === individuals.length) {
        setStep(3);
      } else {
        setCurrentMemberIndex(currentMemberIndex + 1);
      }
    }
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
      // بررسی چهار رقمی بودن سال خودرو
      const convertedValue = convertToEnglishNumbers(value);
      const numericValue = parseInt(convertedValue, 10);

      if (!value.trim()) {
        setCarYearError("لطفاً سال خودرو را وارد کنید."); // نمایش خطا برای مقدار خالی
      } else if (isNaN(numericValue) || numericValue <= 0) {
        setCarYearError("لطفاً یک عدد معتبر وارد کنید."); // نمایش خطا برای مقدار نامعتبر
      } else if (convertedValue.length !== 4) {
        setCarYearError("سال خودرو باید چهار رقمی باشد."); // نمایش خطا برای چهار رقمی نبودن
      } else {
        setCarYearError(""); // پاک کردن خطا در صورت معتبر بودن
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
        pointerEvents: "none", // جلوگیری از تداخل با کلیک
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)"
      }} />
</div>
<label>کد پستی خانوار:</label>
    <input
      type="text"
      name="postCode"
      placeholder="کد پستی را وارد کنید"
  value={householdData.postCode}
  onChange={handleHouseholdChange}
/>
{postCodeError && <p className="error">{postCodeError}</p>}
          {/* فیلد تعداد اعضای خانوار */}
          <label>تعداد اعضای خانوار: <span style={{ color: "red" }}>*</span></label>
          <input
            type="text"
            name="householdCount"
            placeholder="تعداد اعضای خانوار"
            value={householdData.householdCount}
            onChange={handleHouseholdChange}
          />
          {householdCountError && <p className="error">{householdCountError}</p>}

          {/* فیلد تعداد ماشین‌ها */}
          <label>تعداد ماشین‌ها: <span style={{ color: "red" }}>*</span></label>
          <input
            type="text"
            name="carCount"
            placeholder="تعداد ماشین‌ها"
            value={householdData.carCount}
            onChange={handleHouseholdChange}
          />
          {carCountError && <p className="error">{carCountError}</p>}

          {/* فیلد تعداد پارکینگ‌های در اختیار */}
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
          <h3>اطلاعات عضو {currentMemberIndex + 1}:</h3>

          {/* فیلد جنسیت */}
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
        maxLength="2"
      />
      <span>:</span>
      <input
        type="text"
        name="minute"
        placeholder="دقیقه"
        value={individuals[currentMemberIndex]?.workStartHour?.minute || ""}
        onChange={handleIndividualChange}
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
              {carYearError && <p className="error">{carYearError}</p>} {/* نمایش خطا */}

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
              if (currentMemberIndex === parseInt(householdData.householdCount)) {
                setStep(3);
              } else {
                handleNextStep();
              }
            }} disabled={!isStep2Valid()} // دکمه تنها در صورتی فعال است که تمام فیلدها معتبر باشند
            >
              {currentMemberIndex + 1 === parseInt(householdData.householdCount)
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
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // نقشه OpenStreetMap
            />
            <Marker position={selectedLocation}></Marker>
            <MapClickHandler />
          </MapContainer>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default HouseholdForm;