// src/auth/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { parseJwt, setAccessToken, getAccessToken, clearAccessToken } from "../utils/token";
import { loginApi, refreshApi, logoutApi } from "../api/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setTokenState] = useState(() => getAccessToken());
  const [user, setUser] = useState(() => {
    const t = getAccessToken();
    return t ? parseJwt(t) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // keep sessionStorage and state in sync
    if (accessToken) setAccessToken(accessToken);
    else clearAccessToken();
  }, [accessToken]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { accessToken: token } = await loginApi({ email, password });
      if (!token) throw new Error("No access token returned");
      setTokenState(token);
      setAccessToken(token);
      setUser(parseJwt(token));
      setLoading(false);
      return { ok: true };
    } catch (err) {
      setLoading(false);
      return { ok: false, error: err?.response?.data || err.message };
    }
  };

  const tryRefresh = async () => {
    setLoading(true);
    try {
      const { accessToken: token } = await refreshApi();
      if (!token) throw new Error("No token");
      setTokenState(token);
      setUser(parseJwt(token));
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      setTokenState(null);
      setUser(null);
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {}
    setTokenState(null);
    setUser(null);
    clearAccessToken();
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ accessToken, user, login, logout, tryRefresh, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
