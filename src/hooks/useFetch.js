import { useState } from 'react';

const useFetch = (callback) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const response = await callback(params);
      setData(response);
    } catch (err) {
      setError(err.message || 'خطایی رخ داد.');
    } finally {
      setLoading(false);
    }
  };

  return { data, error, loading, fetchData };
};

export default useFetch;