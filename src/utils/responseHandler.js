const handleSuccessResponse = (data) => {
    return {
      status: 'success',
      message: data.message || 'عملیات با موفقیت انجام شد',
      data: data.data || null,
    };
  };
  
  const handleErrorResponse = (err) => {
    return {
      status: 'error',
      message: err.message || 'مشکلی رخ داده است.',
    };
  };
  
  export default {
    handleSuccessResponse,
    handleErrorResponse,
  };