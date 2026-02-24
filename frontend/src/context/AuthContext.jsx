import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { authAPI } from "../api/endpoints.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize from localStorage
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!storedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      if (isMounted) {
        setToken(storedToken);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }

      try {
        const response = await authAPI.getMe();
        const freshUser = response.data?.user || null;

        if (isMounted) {
          setUser(freshUser);
          if (freshUser) {
            localStorage.setItem("user", JSON.stringify(freshUser));
          }
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
          setToken(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;

      setToken(token);
      setUser(user);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
