import { createContext, useContext, useMemo, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('access'));

  const persist = (nextUser, access, refresh) => {
    localStorage.setItem('user', JSON.stringify(nextUser));
    localStorage.setItem('access', access);
    if (refresh) localStorage.setItem('refresh', refresh);
    setUser(nextUser);
    setToken(access);
  };

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    persist(data.user, data.access, data.refresh);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await api.register({ name, email, password });
    persist(data.user, data.access, data.refresh);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
