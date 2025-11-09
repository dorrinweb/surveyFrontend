import React from 'react';
import '../styles/UsersTable.css';

const UsersTable = ({ users, loading, currentPage = 1, itemsPerPage = 10 }) => {
    
  // تابع برای فرمت تاریخ
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('fa-IR');
    } catch (error) {
      return dateString;
    }
  };

  // تابع برای نمایش وضعیت کاربر
  const getStatusBadge = (user) => {
    if (user.deleted) {
      return <span className="badge badge-danger">حذف شده</span>;
    }
    if (!user.active) {
      return <span className="badge badge-warning">غیرفعال</span>;
    }
    if (user.hasTrip && !user.tripReviewed) {
      return <span className="badge badge-info">در انتظار بررسی سفر</span>;
    }
    if (user.hasTrip) {
      return <span className="badge badge-success">دارای سفر</span>;
    }
    return <span className="badge badge-secondary">بدون سفر</span>;
  };

  // تابع برای نمایش نقش کاربر
  const getRoleText = (role) => {
    const roles = {
      '690fa9029d9eee27ec97f36e': 'کاربر عادی',
      'admin': 'مدیر',
      'superadmin': 'سوپرادمین'
    };
    return roles[role] || role;
  };

  // تابع برای نمایش اطلاعات خودروها
  const renderCarDetails = (carDetails) => {
    if (!carDetails || carDetails.length === 0) {
      return '-';
    }
    
    return (
      <div className="cars-info">
        {carDetails.map((car, index) => (
          <div key={car._id || index} className="car-item">
            <strong>{car.carType}</strong> - {car.carName} ({car.carYear})
          </div>
        ))}
      </div>
    );
  };

  // تابع برای نمایش اطلاعات شخصی
  const renderPersonalInfo = (user) => {
    const info = [];
    
    if (user.gender) info.push(`جنسیت: ${user.gender}`);
    if (user.job) info.push(`شغل: ${user.job}`);
    if (user.education) info.push(`تحصیلات: ${user.education}`);
    if (user.relationWithHouseHold) info.push(`نسبت: ${user.relationWithHouseHold}`);
    if (user.income) info.push(`درآمد: ${user.income}`);
    if (user.expenses) info.push(`هزینه: ${user.expenses}`);
    
    if (info.length === 0) return '-';
    
    return (
      <div className="user-info">
        {info.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </div>
    );
  };

  // نمایش لودینگ
  if (loading) {
    return (
      <div className="table-container">
        <div className="loading">📊 در حال بارگذاری لیست کاربران...</div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th className="text-center">ردیف</th>
              <th className="text-center">کد کاربر</th>
              <th className="text-center">شماره تلفن</th>
              <th className="text-center">نقش</th>
              <th className="text-center">کد خانوار</th>
              <th className="text-center">سرپرست</th>
              <th className="text-center">وضعیت سفر</th>
              <th className="text-center">اطلاعات شخصی</th>
              <th className="text-center">خودروها</th>
              <th className="text-center">تاریخ ثبت</th>
              <th className="text-center">وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="11" className="empty-state">
                  👥 هیچ کاربری یافت نشد
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user.id || user._id}>
                  <td className="text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="text-center">{user.userCode || '-'}</td>
                  <td className="text-center">{user.phone || '-'}</td>
                  <td className="text-center">{getRoleText(user.role)}</td>
                  <td className="text-center">{user.householdCode || '-'}</td>
                  <td className="text-center">
                    {user.isHeadOfHousehold ? (
                      <span className="badge badge-primary">✅ بله</span>
                    ) : (
                      <span className="badge badge-secondary">❌ خیر</span>
                    )}
                  </td>
                  <td className="text-center">
                    <div className="status-container">
                      {user.noTrip && <span className="badge badge-warning">🚫 بدون سفر</span>}
                      {user.noInCity && <span className="badge badge-info">🏙️ غیرشهری</span>}
                      {user.hasTrip && <span className="badge badge-success">✈️ دارای سفر</span>}
                      {user.tripReviewed && <span className="badge badge-primary">🔍 بررسی شده</span>}
                    </div>
                  </td>
                  <td className="text-center">
                    {renderPersonalInfo(user)}
                  </td>
                  <td className="text-center">
                    {renderCarDetails(user.carDetails)}
                  </td>
                  <td className="text-center">{formatDate(user.createdAt)}</td>
                  <td className="text-center">
                    {getStatusBadge(user)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;