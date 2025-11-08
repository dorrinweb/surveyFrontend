const validatePhone = (phone) => {
  // الگوی جدید ولیدیشن
  const phoneRegex = /^(۰|0)?[0-9۰-۹]{10}$/; // شماره می‌تواند با صفر فارسی یا انگلیسی شروع شود و شامل 10 رقم باشد
  return phoneRegex.test(phone); // بررسی معتبر بودن شماره تلفن
};

export default validatePhone;