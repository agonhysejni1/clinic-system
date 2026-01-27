// src/api/appointment.api.js
import api from "./axios.js";

export const getAppointments = async () => {
  const res = await api.get("/appointments");
  return res.data;
};

export const createAppointment = async (payload) => {
  const res = await api.post("/appointments", payload);
  return res.data;
};

export const updateAppointmentStatus = async (id, status) => {
  const res = await api.patch(`/appointments/${id}/status`, { status });
  return res.data;
};

export const deleteAppointment = async (id) => {
  const res = await api.delete(`/appointments/${id}`);
  return res.data;
};

export const getDoctors = async () => {
  const res = await api.get("/doctors");
  return res.data;
};
