import React, { createContext, useContext, useState, useEffect } from "react";
import { setAccessToken, getAccessToken, clearAccessToken } from "../utils/token";
import { loginApi, refreshApi, logoutApi } from "../api/auth.api";
import { getMe } from "../api/user.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setTokenState] = useState(() => getAccessToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      if (!getAccessToken()) return;
      setLoading(true);
      try {
        const profile = await getMe();
        if (!mounted) return;
        setUser(profile);
      } catch (err) {

        try {
          const refreshed = await refreshApi();
          const token = refreshed?.accessToken;
          if (token) {
            setTokenState(token);
            setAccessToken(token);
            const profile2 = await getMe();
            if (!mounted) return;
            setUser(profile2);
          } else {
            setUser(null);
            clearAccessToken();
          }
        } catch (refreshErr) {
          setUser(null);
          clearAccessToken();
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { accessToken: token } = await loginApi({ email, password });
      if (!token) throw new Error("No access token returned");
      setTokenState(token);
      setAccessToken(token);

      const profile = await getMe();
      setUser(profile);
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
      setAccessToken(token);
      const profile = await getMe();
      setUser(profile);
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      setTokenState(null);
      setUser(null);
      clearAccessToken();
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
