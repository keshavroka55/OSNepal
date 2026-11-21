// back-end/src/routes/connection.routes.js
import { Router } from 'express';
import { verifyToken } from '../../middleware/authMiddleware.js';
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  listConnections,
  listPendingRequests
} from './connection.controller.js';


const router = Router();
router.get('/pending', verifyToken, listPendingRequests);
router.post('/request', verifyToken, sendConnectionRequest);
router.patch('/:id/accept', verifyToken, acceptConnectionRequest);
router.get('/', verifyToken, listConnections);

export default router;