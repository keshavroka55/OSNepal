import { api } from '../api/api';

const BASE = "/api/auth";

// Register
export const registerAPI = async (name: string, email: string, password: string, role: string) => {
  const res = await api.post(`${BASE}/register`, { name, email, password, role });
  return res.data;
};

// Login
export const loginAPI = async (email: string, password: string) => {
  const res = await api.post(`${BASE}/login`, { email, password });
  return res.data;
};


// Logout
export const logoutAPI = async () => {
  const res = await api.post(`${BASE}/logout`);
  return res.data;
};