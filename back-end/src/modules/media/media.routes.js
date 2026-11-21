import express from 'express';
import * as MediaCtrl from './media.controller.js';
import { verifyToken } from '../../middleware/authMiddleware.js';
import { postLimiter } from '../../middleware/rateLimit.js';
import { avatarUpload, logoUpload, bannerUpload, screenshotUpload, postImageUpload } from '../../middleware/fileUpload.js';

const router = express.Router();

// Avatar – authenticated user
router.post('/avatar', verifyToken, avatarUpload.single('avatar'), MediaCtrl.uploadAvatar);

// Logo – startup (owner must be authenticated)
router.post('/logo', verifyToken, logoUpload.single('logo'), MediaCtrl.uploadLogo);

// Banner – startup (owner must be authenticated)
router.post('/banner', verifyToken, bannerUpload.single('banner'), MediaCtrl.uploadBanner);

// Screenshot upload: stores processed screenshot and registers it on the startup
router.post('/screenshot', verifyToken, screenshotUpload.single('screenshot'), MediaCtrl.uploadScreenshot);

// Ecosystem post image: any signed-in user, throttled like other writes
router.post('/post-image', verifyToken, postLimiter, postImageUpload.single('image'), MediaCtrl.uploadPostImage);

export default router;
