// src/utils/token.js
// For demo: access token is stored in sessionStorage to survive page reload.
// In production prefer in-memory storage to reduce XSS risk.

const KEY = "clinic_access_token";

export const setAccessToken = (token) => {
  try {
    sessionStorage.setItem(KEY, token);
  } catch (e) {
    console.warn("Could not save token", e);
  }
};

export const getAccessToken = () => {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
};

export const clearAccessToken = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
};

export const clearAuth = () => {
  clearAccessToken();
  // you might want to also reload/redirect
  window.location.href = "/login";
};

// decode JWT payload (no validation) - simple base64 decode
export const parseJwt = (token) => {
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded;
  } catch {
    return null;
  }
};

export default {
  setAccessToken,
  getAccessToken,
  clearAccessToken,
  parseJwt,
};
