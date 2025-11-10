import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/global.css";
import "../styles/AddTripForm.css";
import { FiMapPin } from "react-icons/fi";
import { useNavigate, useLocation, useParams } from "react-router-dom";

const AddTripForm = () => {
  const location = useLocation();
  const { memberId } = useParams();
  const navigate = useNavigate();

  // گزینه‌های هدف سفر
  const purposeOptions = [
    "تغییر وسیله (از تاکسی به اتوبوس یا غیره)",
    "شغلی",
    "خرید", 
    "دریافت خدمات", 
    "دیدار آشنایان و نزدیکان", 
    "همراهی و رساندن دیگران", 
    "پزشکی", 
    "مذهبی",
    "مراجعه به ادارات",
    "تحصیلی",
    "تفریح و ورزش",
    "بازگشت به خانه",
   "سایر"
  ];
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingTrips, setPendingTrips] = useState(null);
  const initialTrips = location.state?.trips || [
    {
      tripNumber: 1,
      userId: memberId,
      departure: { time: { hour: "", minute: "", period: "" }, location: "" },
      destination: { time: { hour: "", minute: "", period: "" }, location: "" },
      purpose: "",
      customPurpose: "", // فیلد جدید برای سایر
      transportationMode: "",
      parking: "",
      parkingFee: "",
      tripFee: "",
    },
  ];

  const [trips, setTrips] = useState(initialTrips);
  const [currentTripIndex, setCurrentTripIndex] = useState(initialTrips.length - 1);
  const [currentTrip, setCurrentTrip] = useState(initialTrips[initialTrips.length - 1]);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 37.5485,
    lng: 45.0691,
  });
  const [activeField, setActiveField] = useState("");
  const [errors, setErrors] = useState({});
  
// این useEffect را بعد از stateها اضافه کنید
React.useEffect(() => {
  // هر بار که currentTrip تغییر کرد، آن را در آرایه trips ذخیره کن
  if (currentTripIndex >= 0 && currentTripIndex < trips.length) {
    const updatedTrips = [...trips];
    updatedTrips[currentTripIndex] = currentTrip;
    setTrips(updatedTrips);
  }
}, [currentTrip]); // فقط وقتی currentTrip تغییر کرد اجرا شود
  // تبدیل اعداد فارسی به انگلیسی
  const convertToEnglishNumbers = (str) => {
    if (!str) return "";
    const persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
    const englishNumbers = ["0","1","2","3","4","5","6","7","8","9"];
    let result = str;
    for (let i = 0; i < 10; i++) {
      result = result.replace(persianNumbers[i], englishNumbers[i]);
    }
    return result;
  };
  const handleConfirm = () => {
    if (pendingTrips) {
      navigate("/previewtrips", { state: pendingTrips });
    }
    setShowConfirmModal(false);
    setPendingTrips(null);
  };
  
  const handleCancel = () => {
    setShowConfirmModal(false);
    setPendingTrips(null);
  };
  
  // تغییر فیلدهای فرم
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    const [field, subField, subSubField] = name.split(".");

    let convertedValue = value;
    const numberFields = [
      "departure.time.hour",
      "departure.time.minute",
      "destination.time.hour",
      "destination.time.minute",
      "tripFee",
      "parkingFee"
    ];

    if (numberFields.includes(name)) {
      convertedValue = convertToEnglishNumbers(convertedValue);
      convertedValue = convertedValue.replace(/\D/g, "");
    } else {
      convertedValue = convertToEnglishNumbers(convertedValue);
    }

    let updatedTrip;
    if ((field === "departure" || field === "destination") && subField === "time" && subSubField) {
      updatedTrip = {
        ...currentTrip,
        [field]: {
          ...currentTrip[field],
          time: {
            ...currentTrip[field].time,
            [subSubField]: convertedValue || "",
          },
        },
      };
    } else if (field === "departure" || field === "destination") {
      updatedTrip = {
        ...currentTrip,
        [field]: {
          ...currentTrip[field],
          [subField]: convertedValue || "",
        },
      };
    } else {
      updatedTrip = {
        ...currentTrip,
        [name]: convertedValue || "",
      };
    }

    // اگر هدف سفر تغییر کرد و "سایر" نیست، customPurpose را پاک کن
    if (name === "purpose" && convertedValue !== "سایر") {
      updatedTrip.customPurpose = "";
    }

    setCurrentTrip(updatedTrip);

    // حذف خطاها
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };

      if (name === "departure.location" && updatedTrip.departure.location.trim() !== "") {
        delete newErrors["departure.location"];
      }
      if (name === "destination.location" && updatedTrip.destination.location.trim() !== "") {
        delete newErrors["destination.location"];
      }

      const depTime = updatedTrip.departure.time || {};
      if (depTime.hour && depTime.minute && depTime.period) {
        delete newErrors["departure.time"];
      }

      const destTime = updatedTrip.destination.time || {};
      if (destTime.hour && destTime.minute && destTime.period) {
        delete newErrors["destination.time"];
      }

      if (name === "purpose" && updatedTrip.purpose.trim() !== "") {
        delete newErrors["purpose"];
      }

      if (name === "transportationMode" && updatedTrip.transportationMode.trim() !== "") {
        delete newErrors["transportationMode"];
      }
      if (name === "tripFee" && (updatedTrip.tripFee.trim() === "" || parseFloat(updatedTrip.tripFee) >= 0)) {
        delete newErrors["tripFee"];
      }
      if (
        name === "parkingFee" &&
        updatedTrip.parking &&
        updatedTrip.parking !== "پارکینگ شخصی" &&
        updatedTrip.parkingFee.trim() !== "" &&
        parseFloat(updatedTrip.parkingFee) >= 0
      ) {
        delete newErrors["parkingFee"];
      }

      return newErrors;
    });
  };

  // تابع برای گرفتن مقدار نمایشی هدف سفر
  const getPurposeDisplayValue = () => {
    if (currentTrip.purpose === "سایر" && currentTrip.customPurpose) {
      return currentTrip.customPurpose;
    }
    return currentTrip.purpose;
  };

  const validateCurrentTrip = (trip) => {
    const newErrors = {};
  
    // اعتبارسنجی مبدا
    if (trip.tripNumber === 1 && !trip.departure.location.trim()) {
      newErrors["departure.location"] = "مبدا الزامی است";
    }
  
    // اعتبارسنجی مقصد
    if (!trip.destination.location.trim()) {
      newErrors["destination.location"] = "مقصد الزامی است";
    }
  
    // اعتبارسنجی زمان حرکت
    const depTime = trip.departure.time || {};
    if (!depTime.hour || !depTime.minute || !depTime.period) {
      newErrors["departure.time"] = "زمان حرکت کامل الزامی است";
    }
  
    // اعتبارسنجی زمان رسیدن
    const destTime = trip.destination.time || {};
    if (!destTime.hour || !destTime.minute || !destTime.period) {
      newErrors["destination.time"] = "زمان رسیدن کامل الزامی است";
    }
  
    // اعتبارسنجی هدف سفر
    if (!trip.purpose.trim()) {
      newErrors["purpose"] = "هدف سفر الزامی است";
    } else if (trip.purpose === "سایر" && !trip.customPurpose.trim()) {
      newErrors["purpose"] = "لطفا هدف سفر را مشخص کنید";
    }
  
    // اعتبارسنجی نوع حمل و نقل
    if (!trip.transportationMode.trim()) {
      newErrors["transportationMode"] = "نوع حمل و نقل الزامی است";
    }
  
// اعتبارسنجی هزینه سفر (اجباری نیست)
if (trip.tripFee.trim() !== "" && parseFloat(trip.tripFee) < 0) {
  newErrors["tripFee"] = "هزینه سفر نمی‌تواند مقدار منفی باشد";
}
  
    return newErrors;
  };
  // بقیه توابع بدون تغییر می‌مانند (handleNextTrip, handlePreviousTrip, etc.)
  const updateTripInArray = (index, updatedTrip) => {
    setTrips(prev => {
      const newTrips = [...prev];
      newTrips[index] = updatedTrip;
      return newTrips;
    });
  };

  const handleNextTrip = () => {
    const currentErrors = validateCurrentTrip(currentTrip);
    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return;
    }
  
    setErrors({});
    
    // 🔴 مشکل: اینجا currentTrip آپدیت می‌شود اما در trips ذخیره نمی‌شود
    const updatedCurrentTrip = {
      ...currentTrip,
      purpose: currentTrip.purpose === "سایر" ? currentTrip.customPurpose : currentTrip.purpose,
    };
  
    // ✅ اصلاح: آپدیت آرایه trips با مقدار currentTrip
    const updatedTrips = [...trips];
    updatedTrips[currentTripIndex] = updatedCurrentTrip; // این خط اضافه شد
    
    setTrips(updatedTrips); // ذخیره تغییرات در state اصلی
  
    const nextTripIndex = currentTripIndex + 1;
    if (nextTripIndex < updatedTrips.length) {
      setCurrentTrip(updatedTrips[nextTripIndex]);
      setCurrentTripIndex(nextTripIndex);
    } else {
      const newTrip = {
        tripNumber: trips.length + 1,
        userId: memberId,
        departure: {
          time: { hour: "", minute: "", period: "" },
          location: "",
        },
        destination: { time: { hour: "", minute: "", period: "" }, location: "" },
        purpose: "",
        customPurpose: "",
        transportationMode: "", // این فیلد خالی می‌ماند
        parking: "",
        parkingFee: "",
        tripFee: "",
      };
      updatedTrips.push(newTrip);
      setTrips(updatedTrips);
      setCurrentTripIndex(nextTripIndex);
      setCurrentTrip(newTrip);
    }
  };
  const handlePreviousTrip = () => {
    if (currentTripIndex > 0) {
      const updatedTrips = [...trips];
      updatedTrips[currentTripIndex] = currentTrip;
  
      let lastNonEmptyIndex = currentTripIndex - 1;
      while (lastNonEmptyIndex > 0) {
        const trip = updatedTrips[lastNonEmptyIndex];
        if (
          trip.departure.location?.trim() ||
          trip.destination.location?.trim() ||
          trip.purpose?.trim() ||
          trip.transportationMode?.trim() ||
          trip.tripFee?.trim() ||
          (trip.parking && trip.parkingFee?.trim())
        ) {
          break;
        }
        lastNonEmptyIndex--;
      }
  
      setCurrentTrip(updatedTrips[lastNonEmptyIndex]);
      setCurrentTripIndex(lastNonEmptyIndex);
      setTrips(updatedTrips);
      setErrors({});
    } else {
      navigate(`/trips/${memberId}`, {
        state: { trips, memberId },
      });
    }
  };
  
  const handleOpenMap = (field) => {
    setActiveField(field);
    setShowMap(true);
  };

  const handleMapClick = (event) => {
    const { lat, lng } = event.latlng;
    const location = `Latitude: ${lat}, Longitude: ${lng}`;
  
    setCurrentTrip((prev) => {
      const updated = {
        ...prev,
        [activeField]: {
          ...prev[activeField],
          location,
        },
      };
  
      setErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        if (activeField === "departure") delete updatedErrors["departure.location"];
        if (activeField === "destination") delete updatedErrors["destination.location"];
        return updatedErrors;
      });
  
      return updated;
    });
  
    setShowMap(false);
  };
  
  const MapClickHandler = () => {
    useMapEvents({ click: handleMapClick });
    return null;
  };
  const handleViewTrips = () => {
    // ✅ اول currentTrip را در آرایه ذخیره کنید
    const updatedTrips = [...trips];
    const currentTripWithPurpose = {
      ...currentTrip,
      purpose: currentTrip.purpose === "سایر" ? currentTrip.customPurpose : currentTrip.purpose,
    };
    
    updatedTrips[currentTripIndex] = currentTripWithPurpose; // ذخیره تغییرات
    setTrips(updatedTrips); // آپدیت state اصلی
  
    const firstTrip = updatedTrips[0];
    const firstTripErrors = validateCurrentTrip(firstTrip);
    if (Object.keys(firstTripErrors).length > 0) {
      setErrors(firstTripErrors);
      return;
    }
  
    const nonEmptyTrips = updatedTrips.filter((trip, index) => {
      if (index === 0) return true;
      return (
        trip.departure.location?.trim() ||
        trip.destination.location?.trim() ||
        trip.purpose?.trim() ||
        trip.transportationMode?.trim() || // اینجا transportationMode چک می‌شود
        trip.tripFee?.trim() ||
        (trip.parking && trip.parkingFee?.trim())
      );
    });
  
    const lastTrip = nonEmptyTrips[nonEmptyTrips.length - 1];
  
    if (lastTrip.purpose !== "بازگشت به خانه") {
      setPendingTrips({ trips: nonEmptyTrips, memberId });
      setShowConfirmModal(true);
      return;
    }
  
    navigate("/previewtrips", { state: { trips: nonEmptyTrips, memberId } });
  };
  
  

  return (
    <div className="form-container">
      <h2>{`ثبت سفر شماره ${currentTripIndex + 1}`}</h2>

      <form>
 {/* فیلد مبدا */}
{currentTrip.tripNumber === 1 ? (
  <div className="location-field" onClick={() => handleOpenMap("departure")}>
    <label>مبدا سفر</label>
    <input
      type="text"
      name="departure.location"
      value={currentTrip.departure.location}
      readOnly
      placeholder="انتخاب از روی نقشه"
    />
   <FiMapPin className="location-icon" style={{ 
           pointerEvents: "none", // جلوگیری از تداخل با کلیک
           position: "absolute",
           right: "5px",
           top: "60%",
           transform: "translateY(-50%)"
         }} />
    {errors["departure.location"] && (
      <p className="error">{errors["departure.location"]}</p>
    )}
  </div>
) : (
  <p style={{ fontSize: "14px", color: "red", marginBottom: "10px" }}>
    مبدا این سفر به صورت پیش‌فرض از مقصد سفر قبلی در نظر گرفته شده است.
  </p>
)}

{/* فیلد مقصد */}
<div className="location-field" onClick={() => handleOpenMap("destination")}>
  <label>مقصد سفر</label>
  <input
    type="text"
    name="destination.location"
    value={currentTrip.destination.location}
    readOnly
    placeholder="انتخاب از روی نقشه"
  />
<FiMapPin className="location-icon" style={{ 
        pointerEvents: "none", // جلوگیری از تداخل با کلیک
        position: "absolute",
        right: "5px",
        top: "60%",
        transform: "translateY(-50%)"
      }} />
  {errors["destination.location"] && (
    <p className="error">{errors["destination.location"]}</p>
  )}
</div>

        <div>
          <label>زمان حرکت*</label>
          <div className="time-fields">
            <input
              type="text"
              name="departure.time.hour"
              placeholder="ساعت"
              value={currentTrip.departure.time.hour}
              onChange={handleFieldChange}
            />
            <input
              type="text"
              name="departure.time.minute"
              placeholder="دقیقه"
              value={currentTrip.departure.time.minute}
              onChange={handleFieldChange}
            />
            <select
              name="departure.time.period"
              value={currentTrip.departure.time.period}
              onChange={handleFieldChange}
            >
              <option value="">زمان</option>
              <option value="صبح">صبح</option>
              <option value="عصر">عصر</option>
            </select>
          </div>
          {errors["departure.time"] && <p className="error">{errors["departure.time"]}</p>}
        </div>

        <div>
          <label>زمان رسیدن*</label>
          <div className="time-fields">
            <input
              type="text"
              name="destination.time.hour"
              placeholder="ساعت"
              value={currentTrip.destination.time.hour}
              onChange={handleFieldChange}
            />
            <input
              type="text"
              name="destination.time.minute"
              placeholder="دقیقه"
              value={currentTrip.destination.time.minute}
              onChange={handleFieldChange}
            />
            <select
              name="destination.time.period"
              value={currentTrip.destination.time.period}
              onChange={handleFieldChange}
            >
              <option value="">زمان</option>
              <option value="صبح">صبح</option>
              <option value="عصر">عصر</option>
            </select>
          </div>
          {errors["destination.time"] && <p className="error">{errors["destination.time"]}</p>}
        </div>

        {/* بخش هدف سفر با dropdown */}
        <div>
          <label>هدف سفر*</label>
          <select name="purpose" value={currentTrip.purpose} onChange={handleFieldChange}>
            <option value="">انتخاب کنید</option>
            {purposeOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
          
          {/* نمایش فیلد وارد کردن دستی در صورت انتخاب "سایر" */}
          {currentTrip.purpose === "سایر" && (
            <input
              type="text"
              name="customPurpose"
              placeholder="لطفا هدف سفر را وارد کنید"
              value={currentTrip.customPurpose}
              onChange={handleFieldChange}
              style={{ marginTop: '10px' }}
            />
          )}
          
          {errors["purpose"] && <p className="error">{errors["purpose"]}</p>}
        </div>

        <div>
          <label>نوع حمل و نقل*</label>
          <select name="transportationMode" value={currentTrip.transportationMode} onChange={handleFieldChange}>
            <option value="">انتخاب کنید</option>
            <option value="خودروی شخصی (راننده بودم)">خودروی شخصی (راننده بودم)</option>
            <option value="خودروی شخصی (همراه بودم)">خودروی شخصی (همراه بودم)</option>
            <option value="تاکسی سواری">تاکسی سواری</option>
            <option value="تاکسی ون">تاکسی ون</option>
            <option value="تاکسی اینترنتی">تاکسی اینترنتی</option>
            <option value="تاکسی تلفنی">تاکسی تلفنی</option>
            <option value="مسافرکش">مسافرکش</option>
            <option value="سرویس مدرسه(سواری)">سرویس مدرسه(سواری)</option>
            <option value="سرویس مدرسه(مینی بوس)">سرویس مدرسه(مینی بوس)</option>
            <option value="اتوبوس واحد">اتوبوس واحد</option>
            <option value="اتوبوس غیرواحد">اتوبوس غیرواحد</option>
            <option value="اتوبوس تندرو">اتوبوس تندرو</option>
            <option value="مینی بوس">مینی بوس</option>
            <option value="قطار شهری">قطار شهری</option>
            <option value="دوچرخه">دوچرخه</option>
            <option value="موتورسیکلت">موتورسیکلت</option>
            <option value="وانت">وانت</option>
            <option value="پیاده">پیاده</option>
          </select>
          {errors["transportationMode"] && <p className="error">{errors["transportationMode"]}</p>}
        </div>

        {currentTrip.transportationMode === "خودروی شخصی (راننده بودم)" && (
          <div>
            <label>پارکینگ:</label>
            <select name="parking" value={currentTrip.parking} onChange={handleFieldChange}>
              <option value="">انتخاب کنید</option>
              <option value="پارکینگ شخصی">پارکینگ شخصی</option>
              <option value="پارکینگ عمومی">پارکینگ عمومی</option>
              <option value="پارکینگ محل کار">پارکینگ محل کار</option>
              <option value="در کنار خیابان">در کنار خیابان</option>
            </select>
          </div>
        )}

        {currentTrip.parking && currentTrip.parking !== "پارکینگ شخصی" && (
          <div>
            <label>هزینه پارکینگ (بر حسب هزار تومان)</label>
            <input
              type="text"
              name="parkingFee"
              value={currentTrip.parkingFee}
              onChange={handleFieldChange}
            />
            {errors["parkingFee"] && <p className="error">{errors["parkingFee"]}</p>}
          </div>
        )}

        <div>
          <label>هزینه سفر (بر حسب هزار تومان)</label>
          <input type="text" name="tripFee" value={currentTrip.tripFee} onChange={handleFieldChange} />
          {errors["tripFee"] && currentTrip.tripFee.trim() !== "" && (
  <p className="error">{errors["tripFee"]}</p>
)}        </div>
      </form>

      <div className="button-container">
  <button onClick={handlePreviousTrip} >
    صفحه قبلی
  </button>
  <button onClick={handleNextTrip} >
    سفر بعدی
  </button>
  <button onClick={handleViewTrips} >
    مشاهده و تایید
  </button>
</div>
      {showConfirmModal && (
      <div className="confirm-modal">
        <div className="modal-content">
          <p>معمولا آخرین سفر افراد با هدف بازگشت به خانه است</p>
          <p style={{ fontSize: "14px", color: "#666" }}>
            اگر شما هم در آخرین سفر هدف بازگشت به خانه داشته اید این سفر را هم اضافه کنید
          </p>
          <div className="modal-actions">
            <button onClick={handleCancel} className="modal-button confirm">
              اضافه میکنم
            </button>
            <button onClick={handleConfirm} className="modal-button cancel">
              سفری با این هدف نداشته ام
            </button>
          </div>
        </div>
      </div>
    )}
      <Modal show={showMap} onHide={() => setShowMap(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>انتخاب موقعیت مکانی</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MapContainer
            center={[37.5485, 45.0691]}
            zoom={12}
            style={{ height: "80vh", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={selectedLocation}></Marker>
            <MapClickHandler />
          </MapContainer>
        </Modal.Body>
      </Modal>

      
    </div>
);

};

export default AddTripForm;