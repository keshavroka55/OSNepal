import express from 'express';
import * as StartupController from './startup.controller.js';
import { verifyToken, optionalAuth } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Public endpoints
// Declared before '/:id' so 'mine' is not read as an id.
router.get('/mine', verifyToken, StartupController.GetMyStartups);
router.get('/', optionalAuth, StartupController.GetAllStartups);
router.get('/slug/:slug', StartupController.GetStartupBySlug);
router.get('/trending', StartupController.GetTrendingStartups);
router.get('/:id', StartupController.GetSingleStartup);

// Authenticated endpoints
router.post('/', verifyToken, StartupController.CreateStartup);
router.put('/:id', verifyToken, StartupController.UpdateStartup);
router.delete('/:id', verifyToken, StartupController.DeleteStartup);

// Screenshot management
router.post('/:id/screenshots', verifyToken, StartupController.AddScreenshot);
router.delete('/:startupId/screenshots/:screenshotId', verifyToken, StartupController.DeleteScreenshot);

export default router;
