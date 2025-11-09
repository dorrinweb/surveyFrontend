import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';
import adminService from '../services/adminService';
import UsersTable from '../components/UsersTable';
import Pagination from '../components/Pagination';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHouseholds: 0,
    totalTrips: 0
  });
  
  // حالت‌های صفحه‌بندی برای هر تب
  const [usersState, setUsersState] = useState({
    data: [],
    currentPage: 1,
    itemsPerPage: 10,
    total: 0,
    totalPages: 0
  });
  
  const [householdsState, setHouseholdsState] = useState({
    data: [],
    currentPage: 1,
    itemsPerPage: 10,
    total: 0,
    totalPages: 0
  });
  
  const [tripsState, setTripsState] = useState({
    data: [],
    currentPage: 1,
    itemsPerPage: 10,
    total: 0,
    totalPages: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const navigate = useNavigate();

  // فراخوانی API برای آمار کلی
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      setDebugInfo('در حال دریافت آمار...');
      
      console.log('Starting fetchStats...');
      const response = await adminService.getStats();
      console.log('Stats response received:', response);
      
      if (response && response.code === 0 && response.data) {
        setStats({
          totalUsers: response.data.usersCount || 0,
          totalHouseholds: response.data.householdsCount || 0,
          totalTrips: response.data.tripsCount || 0
        });
        setDebugInfo('آمار با موفقیت دریافت شد');
      } else {
        setStats({ totalUsers: 0, totalHouseholds: 0, totalTrips: 0 });
        setDebugInfo('داده‌ای در پاسخ دریافت نشد');
      }
    } catch (error) {
      console.error('Error in fetchStats:', error);
      const errorMsg = `خطا در دریافت آمار کلی: ${error.message}`;
      setError(errorMsg);
      setDebugInfo(`خطا: ${error.message}`);
      setStats({ totalUsers: 1250, totalHouseholds: 450, totalTrips: 3200 });
    } finally {
      setLoading(false);
    }
  };

  // فراخوانی API برای لیست کاربران با صفحه‌بندی - شرط ساده‌تر
  const fetchUsers = async (page = usersState.currentPage, limit = usersState.itemsPerPage) => {
    try {
      setLoading(true);
      setError('');
      console.log('در حال دریافت لیست کاربران...');
      
      const response = await adminService.getUsers(page, limit);
      console.log('Users API Response:', response);
      
      // شرط ساده‌تر برای بررسی پاسخ
      if (response && response.data) {
        setUsersState(prev => ({
          ...prev,
          data: response.data,
          total: response.total || response.data.length,
          currentPage: response.page || page,
          totalPages: Math.ceil((response.total || response.data.length) / limit)
        }));
        setDebugInfo(`تعداد کاربران: ${response.total || response.data.length}`);
      } else {
        setUsersState(prev => ({ ...prev, data: [], total: 0, totalPages: 0 }));
        setDebugInfo('هیچ کاربری یافت نشد - پاسخ خالی');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(`خطا در دریافت لیست کاربران: ${error.message}`);
      setUsersState(prev => ({ ...prev, data: [], total: 0, totalPages: 0 }));
    } finally {
      setLoading(false);
    }
  };

  // فراخوانی API برای لیست خانوارها با صفحه‌بندی - شرط ساده‌تر
  const fetchHouseholds = async (page = householdsState.currentPage, limit = householdsState.itemsPerPage) => {
    try {
      setLoading(true);
      setError('');
      console.log('در حال دریافت لیست خانوارها...');
      
      const response = await adminService.getHouseholds(page, limit);
      console.log('Households API Response:', response);
      
      // شرط ساده‌تر برای بررسی پاسخ
      if (response && response.data) {
        setHouseholdsState(prev => ({
          ...prev,
          data: response.data,
          total: response.total || 0,
          currentPage: response.page || page,
          totalPages: Math.ceil((response.total || response.data.length) / limit)
        }));
        setDebugInfo(`تعداد خانوارها: ${response.total || 0}`);
      } else {
        setHouseholdsState(prev => ({ ...prev, data: [], total: 0, totalPages: 0 }));
        setDebugInfo('هیچ خانواری یافت نشد - پاسخ خالی');
      }
    } catch (error) {
      console.error('Error fetching households:', error);
      setError(`خطا در دریافت لیست خانوارها: ${error.message}`);
      setHouseholdsState(prev => ({ ...prev, data: [], total: 0, totalPages: 0 }));
    } finally {
      setLoading(false);
    }
  };

  // فراخوانی API برای لیست سفرها با صفحه‌بندی - شرط ساده‌تر
  const fetchTrips = async (page = tripsState.currentPage, limit = tripsState.itemsPerPage) => {
    try {
      setLoading(true);
      setError('');
      console.log('در حال دریافت لیست سفرها...');
      
      const response = await adminService.getTrips(page, limit);
      console.log('Trips API Response:', response);
      
      // شرط ساده‌تر برای بررسی پاسخ
      if (response && response.data) {
        setTripsState(prev => ({
          ...prev,
          data: response.data,
          total: response.total || 0,
          currentPage: response.page || page,
          totalPages: Math.ceil((response.total || response.data.length) / limit)
        }));
        setDebugInfo(`تعداد سفرها: ${response.total || 0}`);
      } else {
        setTripsState(prev => ({ ...prev, data: [], total: 0, totalPages: 0 }));
        setDebugInfo('هیچ سفری یافت نشد - پاسخ خالی');
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      setError(`خطا در دریافت لیست سفرها: ${error.message}`);
      setTripsState(prev => ({ ...prev, data: [], total: 0, totalPages: 0 }));
    } finally {
      setLoading(false);
    }
  };

  // هندلرهای تغییر صفحه
  const handleUsersPageChange = (page) => {
    setUsersState(prev => ({ ...prev, currentPage: page }));
    fetchUsers(page, usersState.itemsPerPage);
  };

  const handleHouseholdsPageChange = (page) => {
    setHouseholdsState(prev => ({ ...prev, currentPage: page }));
    fetchHouseholds(page, householdsState.itemsPerPage);
  };

  const handleTripsPageChange = (page) => {
    setTripsState(prev => ({ ...prev, currentPage: page }));
    fetchTrips(page, tripsState.itemsPerPage);
  };

  // هندلرهای تغییر تعداد آیتم در صفحه
  const handleUsersItemsPerPageChange = (itemsPerPage) => {
    setUsersState(prev => ({ ...prev, itemsPerPage, currentPage: 1 }));
    fetchUsers(1, itemsPerPage);
  };

  const handleHouseholdsItemsPerPageChange = (itemsPerPage) => {
    setHouseholdsState(prev => ({ ...prev, itemsPerPage, currentPage: 1 }));
    fetchHouseholds(1, itemsPerPage);
  };

  const handleTripsItemsPerPageChange = (itemsPerPage) => {
    setTripsState(prev => ({ ...prev, itemsPerPage, currentPage: 1 }));
    fetchTrips(1, itemsPerPage);
  };

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('accessToken');
  
    if (!token && isMounted) {
      setError('لطفاً ابتدا وارد شوید');
      navigate('/admin/login');
      return;
    }
  
    if (isMounted) fetchStats();
  
    return () => { isMounted = false; };
  }, [navigate]);

  useEffect(() => {
    if (activeTab !== 'overview') {
      switch (activeTab) {
        case 'users':
          fetchUsers();
          break;
        case 'households':
          fetchHouseholds();
          break;
        case 'trips':
          fetchTrips();
          break;
        default:
          break;
      }
    }
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/');
  };

  const handleRetry = () => {
    setError('');
    setDebugInfo('در حال تلاش مجدد...');
    if (activeTab === 'overview') {
      fetchStats();
    } else {
      handleTabChange(activeTab);
    }
  };

  // تابع برای فرمت‌دهی زمان
  const formatTime = (timeObj) => {
    if (!timeObj || !timeObj.hour || !timeObj.minute) return '-';
    return `${timeObj.hour}:${timeObj.minute} ${timeObj.period || ''}`;
  };
  
  // تابع برای کوتاه کردن موقعیت مکانی
  const shortenLocation = (location) => {
    if (!location) return '-';
    if (location.includes('Latitude:')) {
      const latMatch = location.match(/Latitude:\s*([\d.]+)/);
      const lngMatch = location.match(/Longitude:\s*([\d.]+)/);
      if (latMatch && lngMatch) {
        return `موقعیت: ${latMatch[1]}, ${lngMatch[1]}`;
      }
    }
    return location.length > 25 ? `${location.substring(0, 25)}...` : location;
  };
  
  // تابع برای نمایش هدف سفر
  const getPurposeText = (purpose) => {
    const purposes = {
      "تحصیلی": "تحصیلی",
      "کاری": "کاری",
      "خرید": "خرید",
      "تفریحی": "تفریحی",
      "درمانی": "درمانی",
      "سایر": "سایر"
    };
    return purposes[purpose] || purpose || '-';
  };

  // تابع برای فرمت‌دهی تاریخ
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return dateString;
  };

  // تابع برای کوتاه کردن آدرس طولانی
  const shortenAddress = (address) => {
    if (!address) return '-';
    if (address.includes('Latitude:')) {
      const latMatch = address.match(/Latitude:\s*([\d.]+)/);
      const lngMatch = address.match(/Longitude:\s*([\d.]+)/);
      if (latMatch && lngMatch) {
        return `موقعیت: ${latMatch[1]}, ${lngMatch[1]}`;
      }
    }
    return address.length > 30 ? `${address.substring(0, 30)}...` : address;
  };

  // تابع برای فرمت کد پستی
  const formatPostCode = (postCode) => {
    if (!postCode) return '-';
    const postCodeStr = String(postCode);
    return postCodeStr.length === 10 ? postCodeStr : postCodeStr;
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="header-content">
          <h1>پنل مدیریت سامانه حمل و نقل</h1>
          <button onClick={handleLogout} className="logout-btn">
            خروج
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => handleTabChange('overview')}
            >
              📊 آمار کلی
            </button>
            <button 
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => handleTabChange('users')}
            >
              👥 مشاهده افراد
            </button>
            <button 
              className={`nav-item ${activeTab === 'households' ? 'active' : ''}`}
              onClick={() => handleTabChange('households')}
            >
              🏠 مشاهده خانوارها
            </button>
            <button 
              className={`nav-item ${activeTab === 'trips' ? 'active' : ''}`}
              onClick={() => handleTabChange('trips')}
            >
              🚗 مشاهده سفرها
            </button>
          </nav>
        </aside>

        <main className="main-content">
          {debugInfo && (
            <div className="debug-info">
              وضعیت: {debugInfo}
            </div>
          )}
          
          {error && (
            <div className="error-message">
              {error}
              <button onClick={handleRetry} className="retry-btn">
                تلاش مجدد
              </button>
            </div>
          )}
          
          {loading ? (
            <div className="loading">در حال بارگذاری...</div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="overview">
                  <h2>آمار کلی سیستم</h2>
                  <div className="stats-cards">
                    <div className="stat-card">
                      <div className="stat-icon">👥</div>
                      <div className="stat-info">
                        <h3>تعداد نفرات</h3>
                        <span className="stat-number">{stats.totalUsers}</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">🏠</div>
                      <div className="stat-info">
                        <h3>تعداد خانوارها</h3>
                        <span className="stat-number">{stats.totalHouseholds}</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">🚗</div>
                      <div className="stat-info">
                        <h3>تعداد سفرها</h3>
                        <span className="stat-number">{stats.totalTrips}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="users-section">
                  <h2>لیست کاربران ثبت‌شده ({usersState.total})</h2>
                  <UsersTable 
                    users={usersState.data}
                    loading={loading}
                    currentPage={usersState.currentPage}
                    itemsPerPage={usersState.itemsPerPage}
                  />
                  {usersState.total > 0 && (
                    <Pagination
                      currentPage={usersState.currentPage}
                      totalPages={usersState.totalPages}
                      totalItems={usersState.total}
                      itemsPerPage={usersState.itemsPerPage}
                      onPageChange={handleUsersPageChange}
                      onItemsPerPageChange={handleUsersItemsPerPageChange}
                    />
                  )}
                </div>
              )}

              {activeTab === 'households' && (
                <div className="households-section">
                  <h2>لیست خانوارهای ثبت‌شده ({householdsState.total})</h2>
                  <div className="table-container">
                    <table className="data-table compact-table">
                      <thead>
                        <tr>
                          <th>ردیف</th>
                          <th>کد خانوار</th>
                          <th>کد پستی</th>
                          <th>آدرس</th>
                          <th>اعضا</th>
                          <th>خودرو</th>
                          <th>پارکینگ</th>
                          <th>تاریخ ثبت</th>
                        </tr>
                      </thead>
                      <tbody>
                        {householdsState.data.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="empty-state">
                              🏠 هیچ خانواری یافت نشد
                            </td>
                          </tr>
                        ) : (
                          householdsState.data.map((household, index) => (
                            <tr key={household.id || household._id || index}>
                              <td>{(householdsState.currentPage - 1) * householdsState.itemsPerPage + index + 1}</td>
                              <td>{household.householdCode || '-'}</td>
                              <td className="ltr-text">{formatPostCode(household.postCode)}</td>
                              <td title={household.address}>{shortenAddress(household.address)}</td>
                              <td>{household.householdCount || 0}</td>
                              <td>{household.carCount || 0}</td>
                              <td>{household.parkingSpacesCount || 0}</td>
                              <td>{formatDate(household.createdAt)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {householdsState.total > 0 && (
                    <Pagination
                      currentPage={householdsState.currentPage}
                      totalPages={householdsState.totalPages}
                      totalItems={householdsState.total}
                      itemsPerPage={householdsState.itemsPerPage}
                      onPageChange={handleHouseholdsPageChange}
                      onItemsPerPageChange={handleHouseholdsItemsPerPageChange}
                    />
                  )}
                </div>
              )}

              {activeTab === 'trips' && (
                <div className="trips-section">
                  <h2>لیست سفرهای ثبت‌شده ({tripsState.total})</h2>
                  <div className="table-container">
                    <table className="data-table compact-table">
                      <thead>
                        <tr>
                          <th>ردیف</th>
                          <th>کد سفر</th>
                          <th>کد کاربر</th>
                          <th>کد خانوار</th>
                          <th>هدف سفر</th>
                          <th>مبدا</th>
                          <th>زمان خروج</th>
                          <th>مقصد</th>
                          <th>زمان رسیدن</th>
                          <th>هزینه پارکینگ</th>
                          <th>هزینه سفر</th>
                          <th>تاریخ ثبت</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tripsState.data.length === 0 ? (
                          <tr>
                            <td colSpan="12" className="empty-state">
                              🚗 هیچ سفری یافت نشد
                            </td>
                          </tr>
                        ) : (
                          tripsState.data.map((trip, index) => (
                            <tr key={trip.id || trip._id || index}>
                              <td>{(tripsState.currentPage - 1) * tripsState.itemsPerPage + index + 1}</td>
                              <td>{trip.tripNumber || '-'}</td>
                              <td>{trip.userCode || '-'}</td>
                              <td>{trip.householdCode || '-'}</td>
                              <td>{getPurposeText(trip.purpose)}</td>
                              <td title={trip.departure?.location}>{shortenLocation(trip.departure?.location)}</td>
                              <td>{formatTime(trip.departure?.time)}</td>
                              <td title={trip.destination?.location}>{shortenLocation(trip.destination?.location)}</td>
                              <td>{formatTime(trip.destination?.time)}</td>
                              <td>{trip.parkingFee ? `${trip.parkingFee} تومان` : 'رایگان'}</td>
                              <td>{trip.tripFee ? `${trip.tripFee} تومان` : 'رایگان'}</td>
                              <td>{formatDate(trip.createdAt)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {tripsState.total > 0 && (
                    <Pagination
                      currentPage={tripsState.currentPage}
                      totalPages={tripsState.totalPages}
                      totalItems={tripsState.total}
                      itemsPerPage={tripsState.itemsPerPage}
                      onPageChange={handleTripsPageChange}
                      onItemsPerPageChange={handleTripsItemsPerPageChange}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;