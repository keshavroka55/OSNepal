import { api } from '../api/api';

const BASE = "/api/users";

// Get my profile
export const getMyProfileAPI = async () => {
  const res = await api.get(`${BASE}/me`);
  return res.data;
};

// Update my profile
export const updateMyProfileAPI = async (data: {
  name?: string;
  bio?: string;
  avatar?: string;
  location?: string;
  website?: string;
  headline?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}) => {
  const res = await api.put(`${BASE}/me`, data);
  return res.data;
};

// Upload Avatar
export const uploadAvatarAPI = async (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const res = await api.post('/api/media/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};


// View any user profile by id
export const getUserByIdAPI = async (id: string) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

// Admin — get all users
export const getAllUsersAPI = async () => {
  const res = await api.get(BASE);
  const data = res.data;
  return data?.data ?? data;
};

// Admin — delete user
export const deleteUserAPI = async (id: string) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

// Admin — update user role
export const updateUserRoleAPI = async (id: string, role: "user" | "admin") => {
  const res = await api.put(`${BASE}/${id}/role`, { role });
  return res.data;
};