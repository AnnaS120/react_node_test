/**
 * Authentication Context
 * Uses backend-issued JWT. Persists token/email/role in localStorage.
 * @version 1.1.0
 */

import React, { createContext, useState, useContext, useEffect } from "react";

// Create the authentication context
const AuthContext = createContext();

/**
 * Custom hook to use the authentication context
 * @returns {Object} Authentication context values and methods
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

/**
 * Authentication Provider Component
 * Manages authentication state and provides methods to login, logout, etc.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
const AuthProvider = ({ children }) => {
  // Restore session on refresh
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    
    return token && email ? { email } : null;
  });
  
  const [loading, setLoading] = useState(true);

  /**
   * Effect to check token validity on mount
   * In a production app, this would verify the token with the backend
   */
  useEffect(() => {
    // Optional: validate token with backend here
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    if (token && email) setUser({ email });
    else handleLogout();
    setLoading(false);
  }, []);

  // ---- Auth API calls ----
  const login = async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Login failed");
    }

    const data = await res.json(); // { token, userId, role }
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("userRole", data.role);
    localStorage.setItem("email", email);

    setUser({ email });
    return { email, role: data.role, userId: data.userId };
  };

  const signup = async (email, password, FullName, role = "user") => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ FullName, email, password, role }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Signup failed");
    }

    const data = await res.json(); // { token, userId, role }
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("userRole", data.role);
    localStorage.setItem("email", email);

    setUser({ email });
    return { email, role: data.role, userId: data.userId };
  };

  /**
   * Handles user logout
   * Clears authentication data and resets state
   */
  const handleLogout = () => {
    // Clear all auth-related data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    setUser(null);
  };

  /**
   * Handles password reset request
   * @param {string} email - User's email
   * @returns {Promise<void>}
   */
  const resetPassword = async (email) => {
    // Hook up to your backend when ready
    console.log("Password reset requested for:", email);
    return Promise.resolve();
  };

  /**
   * Checks if the current user has a specific role
   * @param {string} requiredRole - Role to check for
   * @returns {boolean} Whether user has the required role
   */
  const hasRole = (requiredRole) => {
    const userRole = localStorage.getItem("userRole");
    return userRole === requiredRole;
  };

  /**
   * Context value with authentication state and methods
   */
  const value = {
    user,
    loading,
    login,
    signup,
    logout: handleLogout,
    resetPassword,
    hasRole,
    isAdmin: () => hasRole("admin"),
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
