import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('lms_token');
      const savedUser = localStorage.getItem('lms_user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Verify with backend
          const res = await authApi.getMe();
          setUser(res.data);
          localStorage.setItem('lms_user', JSON.stringify(res.data));
        } catch (err) {
          console.error('Session expired or invalid token', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token, ...userData } = res.data;
    localStorage.setItem('lms_token', token);
    localStorage.setItem('lms_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, role = 'Student', bio = '') => {
    const res = await authApi.register({ name, email, password, role, bio });
    // Note: User registration requires Admin approval.
    // If no token returned, do not log in automatically.
    if (res.data.token) {
      const { token, ...userData } = res.data;
      localStorage.setItem('lms_token', token);
      localStorage.setItem('lms_user', JSON.stringify(userData));
      setUser(userData);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
    setUser(null);
  };

  const quickDemoLogin = async (role) => {
    const emailMap = {
      Admin: 'admin@eduberg.in',
      Instructor: 'instructor@eduberg.in',
      Student: 'student@eduberg.in'
    };
    const email = emailMap[role] || 'student@eduberg.in';
    return await login(email, 'Password123!');
  };

  const updateUserProfile = (newProfile) => {
    setUser((prev) => {
      const updated = { ...prev, ...newProfile };
      localStorage.setItem('lms_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        quickDemoLogin,
        updateUserProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'Admin',
        isInstructor: user?.role === 'Instructor' || user?.role === 'Admin',
        isStudent: user?.role === 'Student',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
