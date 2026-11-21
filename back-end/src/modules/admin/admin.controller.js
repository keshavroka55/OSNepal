import * as AdminService from './admin.service.js';

export const GetDashboardStats = async (req, res) => {
  try {
    const data = await AdminService.getDashboardStats();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

