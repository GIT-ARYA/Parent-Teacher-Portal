// client/src/context/AuthContext.jsx
import React, { createContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';


export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('token');
    if (!t) return null;
    try { return jwtDecode(t); } catch { return null; }
  });

  useEffect(() => {
    const onStorage = () => {
      const t = localStorage.getItem('token');
      setUser(t ? jwtDecode(t) : null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    try { setUser(jwtDecode(token)); } catch { setUser(null); }
  };
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
