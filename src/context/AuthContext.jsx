import { useState, useEffect } from "react";
import { AuthContext } from "./auth-context";
import { authService } from "../services/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Verify token with backend
          const response = await authService.getCurrentUser();
          if (response.success) {
            setUser(response.data);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        } catch (error) {
          console.error("Error verifying auth token:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      console.log("🌐 Making API login request to backend...");
      const response = await authService.login(email, password);
      console.log("📡 Backend response:", response);

      if (response.success && response.token && response.data) {
        console.log("✅ Login successful, setting user data");
        console.log("👤 User data:", response.data);
        setUser(response.data);
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.data));
        console.log("🔒 Token saved:", response.token.substring(0, 20) + "...");
        return true;
      }
      console.log("❌ Login failed - backend returned unsuccessful response");
      return false;
    } catch (error) {
      console.error("🚨 Login API error:", error);
      return false;
    }
  };

  const register = async (name, email, password, phone = "") => {
    try {
      const response = await authService.register(name, email, password, phone);
      if (response.success) {
        setUser(response.data.user);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
