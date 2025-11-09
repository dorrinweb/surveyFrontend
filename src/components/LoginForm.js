import React, { useState } from 'react';
import userService from '../services/userService';
import validatePhone from '../utils/validatePhone';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';
import '../styles/LoginForm.css';

const LoginForm = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // هندلر جداگانه برای تغییر شماره تلفن
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    
    // پاک کردن پیام خطا وقتی کاربر شروع به تایپ مجدد می‌کند
    if (error) {
      setError('');
    }
    
    // همچنین پیام موفقیت را هم پاک کنید اگر وجود دارد
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleGetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const isValidPhone = validatePhone(phone);
    if (!isValidPhone) {
      setError('شماره تلفن معتبر نیست.');
      setSuccessMessage('');
      setIsLoading(false);
      return;
    }

    try {
      const response = await userService.getPassword({ phone });

      console.log('API Response:', response);

      if (response.code === 0) {
        setSuccessMessage(response.msg);
        setError('');
        setShowLoginForm(true);
      } else {
        setError(response.msg);
        setSuccessMessage('');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'خطایی در ارتباط با سرور رخ داد.');
      setSuccessMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await userService.login({ phone, password });

      console.log('Login API Response:', response);

      if (response.code === 0) {
        setSuccessMessage('ورود موفقیت‌آمیز بود.');
        setError('');

        const { accessToken, userInfo } = response.data;
        localStorage.setItem('accessToken', accessToken);

        const householdId = userInfo.householdId;

        if (householdId && householdId !== '') {
          navigate('/household/details');
        } else {
          navigate('/household/register');
        }
      } else {
        setError(response.msg);
        setSuccessMessage('');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'خطایی در ارتباط با سرور رخ داد.');
      setSuccessMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    setShowLoginForm(false);
    setPassword('');
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="login-container">
      <div className="login-content-box">
        {/* پیام خوشامدگویی */}
        <div className="welcome-message">
          <h3>🌟 به سامانه ثبت سفرهای شهری خوش آمدید</h3>
          <p>
            از اینکه در طرح بزرگ ساماندهی حمل و نقل و ترافیک شهرتان مشارکت می‌کنید، 
          </p>
          <p className='green'>صمیمانه سپاسگزاریم. شماره تلفن افرادی که تمامی سفر های یکایک اعضای خانوار خود را ثبت کنند در قرعه کشی بزرگ طرح جامع ساماندهی حمل و نقل شهر ارومیه ثبت خواهد شد..
          </p>
        </div>

        {!showLoginForm ? (
          <>
            <h2>📱 دریافت کد ورود</h2>
            <form onSubmit={handleGetPassword}>
              <div>
                <label htmlFor="phone">شماره تلفن همراه:</label>
                <input
                  id="phone"
                  type="text"
                  placeholder="09xxxxxxxxx"
                  value={phone}
                  onChange={handlePhoneChange} // استفاده از هندلر جدید
                  disabled={isLoading}
                />
              </div>
              {error && <p className="error">{error}</p>}
              {successMessage && <p className="success">{successMessage}</p>}
              <button type="submit" disabled={isLoading}>
                {isLoading ? '⏳ در حال ارسال...' : '📨 دریافت کد ورود'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2>🔐 ورود به حساب کاربری</h2>
            <form onSubmit={handleLogin}>
              <div>
                <label htmlFor="password">کد تأیید:</label>
                <input
                  id="password"
                  type="text"
                  placeholder="کد ارسال شده را وارد کنید"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {error && <p className="error">{error}</p>}
              {successMessage && <p className="success">{successMessage}</p>}
              <button type="submit" disabled={isLoading}>
                {isLoading ? '⏳ در حال ورود...' : '🚀 ورود به سامانه'}
              </button>
            </form>
            <button
              type="button"
              className="resend-code-button"
              onClick={handleResendCode}
              disabled={isLoading}
            >
              {isLoading ? '⏳ در حال ارسال...' : '🔄 ارسال مجدد کد'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginForm;