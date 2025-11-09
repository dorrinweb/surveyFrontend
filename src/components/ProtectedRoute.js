import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  const location = useLocation();

  if (!token) {
    // ذخیره مسیر فعلی برای ریدایرکت بعد از لاگین (اختیاری)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
