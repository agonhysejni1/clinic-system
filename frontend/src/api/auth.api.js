// src/api/auth.api.js
import api from "./axios.js";

export const loginApi = async ({ email, password }) => {
  // backend sets refresh token cookie, and returns { accessToken }
  console.log("sup")
  const res = await api.post("/auth/login", { email, password });
  console.log(res)
  return res.data; // { accessToken }
};

export const refreshApi = async () => {
  const res = await api.post("/auth/refresh");
  return res.data; // { accessToken }
};

export const logoutApi = async () => {
  return api.post("/auth/logout");
};
