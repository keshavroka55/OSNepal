import { api } from '../api/api';

const BASE = "/api/categories";

// Get all categories
export const getAllCategoriesAPI = async () => {
  const res = await api.get(BASE);
  return res.data;
};

// Get single category
export const getSingleCategoryAPI = async (id: string) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

// Create category
export const createCategoryAPI = async (data: {
  name: string;
  description?: string;
}) => {
  const res = await api.post(BASE, data);
  return res.data;
};

// Update category
export const updateCategoryAPI = async (id: string, data: {
  name?: string;
  description?: string;
}) => {
  const res = await api.put(`${BASE}/${id}`, data);
  return res.data;
};

// Delete category
export const deleteCategoryAPI = async (id: string) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};