import { useState, useCallback } from "react";

export const useData = (apiCall) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiCall(...args);
        setData(response.data);
        return response.data;
      } catch (err) {
        const message = err.response?.data?.message || "Error fetching data";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiCall],
  );

  return { data, loading, error, fetch };
};
