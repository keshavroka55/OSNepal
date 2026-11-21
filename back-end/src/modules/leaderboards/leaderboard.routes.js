import express from 'express';
import * as LeaderboardController from './leaderboard.controller.js';
import { verifyToken } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Public endpoints
router.get('/daily', LeaderboardController.GetDaily);
router.get('/weekly', LeaderboardController.GetWeekly);
router.get('/monthly', LeaderboardController.GetMonthly);
router.get('/all-time', LeaderboardController.GetAllTimeLeaderboard);
router.get('/founders', LeaderboardController.GetFounderLeaderboard);
router.get('/rankings', LeaderboardController.GetRankings);

// Admin endpoints
router.post('/calculate', verifyToken, LeaderboardController.CalculateLeaderboard);

export default router;
