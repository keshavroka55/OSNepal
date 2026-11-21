import express from 'express';
import * as VoteController from './vote.controller.js';
import { verifyToken } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my', verifyToken, VoteController.GetMyVotedStartups);
router.post('/:startupId', verifyToken, VoteController.ToggleVote);
router.get('/:startupId', verifyToken, VoteController.GetVoteCount);

export default router;
