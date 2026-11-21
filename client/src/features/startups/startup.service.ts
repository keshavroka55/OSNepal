import { api } from '../api/api';

const BASE = '/api/startups';

export type StartupStatus = "draft" | "pending" | "published" | "rejected" | "archived";

// Get all startups with optional query params
export const getAllStartupsAPI = async (params: Record<string, string | number | undefined> = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  const res = await api.get(query ? `${BASE}?${query}` : BASE);
  return res.data;
};

// Get startup by slug
export const getStartupBySlugAPI = async (slug: string) => {
  const res = await api.get(`${BASE}/slug/${slug}`);
  return res.data;
};

// Get trending startups
export const getTrendingStartupsAPI = async () => {
  const res = await api.get(`${BASE}/trending`);
  return res.data;
};

// Get single startup by ID
export const getSingleStartupAPI = async (id: string) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

// Create new startup (authenticated)
export const createStartupAPI = async (data: Record<string, unknown>) => {
  const res = await api.post(BASE, data);
  return res.data;
};

// Update startup (authenticated)
export const updateStartupAPI = async (id: string, data: Record<string, unknown>) => {
  const res = await api.put(`${BASE}/${id}`, data);
  return res.data;
};

// Delete startup (authenticated)
export const deleteStartupAPI = async (id: string) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

// Add screenshot to startup (authenticated)
export const addScreenshotAPI = async (startupId: string, data: FormData | Record<string, unknown>) => {
  const isFormData = data instanceof FormData;
  const res = await api.post(`${BASE}/${startupId}/screenshots`, data, {
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
  });
  return res.data;
};

// Delete screenshot from startup (authenticated)
export const deleteScreenshotAPI = async (startupId: string, screenshotId: string) => {
  const res = await api.delete(`${BASE}/${startupId}/screenshots/${screenshotId}`);
  return res.data;
};