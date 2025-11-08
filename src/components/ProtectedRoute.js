import { Navigate } from 'react-router-dom';

// این کامپوننت بررسی می‌کنه که کاربر لاگین کرده یا نه
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    // اگر توکن موجود نبود، ریدایرکت به صفحه لاگین
    return <Navigate to="/" replace />;
  }

  // اگر توکن موجود بود، اجازه دسترسی به صفحه داده می‌شود
  return children;
};

export default ProtectedRoute;
