import React, { useEffect } from "react";
import bgImage from '../assets/images/bg2.jpg';
import overlayImage from '../assets/images/overlay.png';
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // بارگذاری استایل اختصاصی Landing فقط در این صفحه
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/styles/landing.css";
    document.head.appendChild(link);

    // جلوگیری از اسکرول در این صفحه
    document.body.style.overflow = "hidden";

    return () => {
      document.head.removeChild(link);
      document.body.style.overflow = "auto"; // بازگردانی
    };
  }, []);

  const handleJoinClick = () => {
    navigate("/login");
  };

  return (
    <div
      className="landing-page relative w-full h-[100dvh] flex flex-col justify-center items-center text-center text-white overflow-hidden px-4"
      dir="rtl"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* لایه‌ی تاریک و افکت */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/60 to-gray-800/80"></div>
      <div
        className="absolute inset-0 opacity-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${overlayImage})` }}
      ></div>

      {/* محتوای اصلی */}
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <span className="text-white/70 font-bold text-lg sm:text-xl mb-4 block leading-7 sm:leading-9">
          آیا میدانید مشارکت شما شهروندان عزیز در
        </span>
        <h1 className="font-bold text-2xl sm:text-3xl lg:text-4xl xl:text-5xl leading-snug sm:leading-tight mb-6 sm:mb-8 whitespace-normal sm:whitespace-nowrap">
           طرح جامع مدیریت و ساماندهی حمل و نقل و ترافیک
        </h1>
        <h2 className="font-bold text-xl sm:text-2xl lg:text-3xl xl:text-4xl leading-snug sm:leading-tight mb-6 sm:mb-8">
          شهر ارومیه
        </h2>
        <p className="text-white/90 text-lg sm:text-xl leading-relaxed sm:leading-loose mb-8 sm:mb-10 break-words">
          آینده ترافیکی شهر را رقم خواهد زد <br className="hidden sm:block" />
          <br className="hidden sm:block" />
          #برای_ارومیه
        </p>
        <button
          onClick={handleJoinClick}
          className="py-3 sm:py-4 px-8 sm:px-10 font-semibold tracking-wide text-base sm:text-lg rounded-lg text-gray-800 hover:bg-blue-600 hover:text-white transition-all duration-300 w-full sm:w-auto"
        >
          شرکت در آمارگیری
        </button>
      </div>
    </div>
  );
};

export default LandingPage;