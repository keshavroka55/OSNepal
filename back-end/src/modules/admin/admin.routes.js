import express from 'express';
import * as AdminController from './admin.controller.js';
import { verifyToken } from '../../middleware/authMiddleware.js';
import { allowRoles } from '../../middleware/role.middleware.js';
import * as AdminService from './admin.service.js';


const router = express.Router();

router.get('/dashboard', verifyToken, allowRoles('admin'), AdminController.GetDashboardStats);

router.patch('/users/:id/verify', verifyToken, allowRoles('admin'), async (req, res, next) => {
  try {
    const user = await AdminService.setUserVerified(req.params.id, req.body?.verified !== false);
    const { evaluateBadges } = await import('../badges/badge.service.js');
    await evaluateBadges(user.id);
    res.json(user);
  } catch (e) { next(e); }
});

export default router;