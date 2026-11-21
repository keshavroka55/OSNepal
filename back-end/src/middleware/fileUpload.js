import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Factory that creates a Multer instance with strict validation.
 * All uploaded files are stored under /public/uploads/<destFolder>.
 * Filenames are random hex strings to avoid collisions and path‑traversal.
 */
function createUploader({ destFolder, maxSize, allowedMimes }) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '..', '..', 'public', 'uploads', destFolder);
      // Ensure directory exists
      try {
        fs.mkdirSync(uploadPath, { recursive: true });
      } catch (e) {
        // ignore
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const random = crypto.randomBytes(16).toString('hex');
      cb(null, `${random}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type ${file.mimetype}`), false);
    }
  };

  return multer({
    storage,
    limits: { fileSize: maxSize },
    fileFilter,
  });
}

export const avatarUpload = createUploader({
  destFolder: 'avatars',
  maxSize: 5 * 1024 * 1024, // 5 MB
  allowedMimes: [
    'image/jpeg',
    'image/jpg',
    'image/png',

  ],
});

export const logoUpload = createUploader({
  destFolder: 'logos',
  maxSize: 5 * 1024 * 1024,
  allowedMimes: [
    'image/png',
    'image/jpeg',
    'image/jpg',
  ],
});

export const bannerUpload = createUploader({
  destFolder: 'banners',
  maxSize: 10 * 1024 * 1024,
  allowedMimes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
  ],
});

export const screenshotUpload = createUploader({
  destFolder: 'screenshots',
  maxSize: 10 * 1024 * 1024,
  allowedMimes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
  ],
});

export const postImageUpload = createUploader({
  destFolder: 'posts',
  maxSize: 5 * 1024 * 1024,
  allowedMimes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
});
