// back-end/src/routes/conversation.routes.js
import { Router } from 'express';
import { verifyToken } from '../../middleware/authMiddleware.js';
import {
  getOrCreateConversationWithUser,
  getMessages,
  listConversations,
} from './conversation.controller.js';

const router = Router();

router.get('/', verifyToken, listConversations);
router.get('/with/:userId', verifyToken, getOrCreateConversationWithUser);
router.get('/:conversationId/messages', verifyToken, getMessages);

export default router;