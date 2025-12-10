// client/src/context/AuthContext.jsx
import React, { createContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const decoded = jwtDecode(token);

      setUser({
        id: decoded.id,
        role: decoded.role,
        name: decoded.name,
        email: decoded.email || '',   // ✅ include email
      });
    } catch (err) {
      console.error('Invalid token, clearing', err);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
