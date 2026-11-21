import path from 'path';
import { AppError } from '../../utils/AppError.js';
import fs from 'fs/promises';
import prisma from '../../prisma.js';
import { processAvatar, processLogo, processBanner, processScreenshot } from './imageProcessor.js';
import { invalidateStartupCaches } from '../../middleware/cacheAside.js';

/** Helper to build absolute file path from stored URL */
function urlToPath(url) {
  // Expected format: http(s)://host/uploads/<folder>/<filename>
  try {
    const pathname = new URL(url).pathname; // e.g., /uploads/avatars/abc.webp
    return path.join(import.meta.dirname, '..', '..', '..', 'public', pathname);
  } catch {
    return null;
  }
}

/** Delete previous file if it exists */
async function deleteOldFile(oldUrl) {
  if (!oldUrl) return;
  const filePath = urlToPath(oldUrl);
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (e) {
    // ignore if file already missing
  }
}

/** Build public URL for a stored file */
function buildUrl(req, folder, filename) {
  return `${req.protocol}://${req.get('host')}/uploads/${folder}/${filename}`;
}


/** Reject requests that arrive without a file (multer leaves req.file undefined). */
function requireFile(req) {
  if (!req.file) throw new AppError('No file uploaded', 400);
  return req.file;
}

/** Only the founder (or an admin) may change a startup's media. */
async function requireStartupOwner(req) {
  const startupId = String(req.body.startupId || '');
  if (!startupId) throw new AppError('Startup ID missing', 400);
  const startup = await prisma.startup.findUnique({ where: { id: startupId } });
  if (!startup) throw new AppError('Startup not found', 404);
  if (startup.founderId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Not allowed to edit this startup', 403);
  }
  return startup;
}

/** USER AVATAR ---------------------------------------------------------- */
export async function uploadAvatar(req, res, next) {
  try {
    const userId = req.user.id;
    const file = requireFile(req);
    const processedName = `${path.parse(file.filename).name}.webp`;
    const processedPath = path.join(file.destination, processedName);
    await processAvatar(file.path, processedPath);
    const avatarUrl = buildUrl(req, 'avatars', processedName);
    // Delete previous avatar if any
    const user = await prisma.user.findUnique({ where: { id: String(userId) } });
    if (user?.avatar) await deleteOldFile(user.avatar);
    await prisma.user.update({ where: { id: String(userId) }, data: { avatar: avatarUrl } });
    res.json({ avatarUrl });
  } catch (err) {
    next(err);
  }
}

/** STARTUP LOGO -------------------------------------------------------- */
export async function uploadLogo(req, res, next) {
  try {
    const owned = await requireStartupOwner(req);
    const startupId = owned.id;
    const file = requireFile(req);
    const processedName = file.mimetype === 'image/svg+xml'
      ? file.filename
      : `${path.parse(file.filename).name}.webp`;
    const processedPath = path.join(file.destination, processedName);
    await processLogo(file.path, processedPath, file.mimetype);
    const logoUrl = buildUrl(req, 'logos', processedName);
    const startup = await prisma.startup.findUnique({ where: { id: String(startupId) } });
    if (startup?.logo) await deleteOldFile(startup.logo);
    await prisma.startup.update({ where: { id: String(startupId) }, data: { logo: logoUrl } });
    await invalidateStartupCaches({ id: String(startupId), slug: startup?.slug });
    res.json({ logoUrl });
  } catch (err) {
    next(err);
  }
}

/** STARTUP BANNER ------------------------------------------------------ */
export async function uploadBanner(req, res, next) {
  try {
    const owned = await requireStartupOwner(req);
    const startupId = owned.id;
    const file = requireFile(req);
    const processedName = `${path.parse(file.filename).name}.webp`;
    const processedPath = path.join(file.destination, processedName);
    await processBanner(file.path, processedPath);
    const bannerUrl = buildUrl(req, 'banners', processedName);
    const startup = await prisma.startup.findUnique({ where: { id: String(startupId) } });
    if (startup?.banner) await deleteOldFile(startup.banner);
    await prisma.startup.update({ where: { id: String(startupId) }, data: { banner: bannerUrl } });
    await invalidateStartupCaches({ id: String(startupId), slug: startup?.slug });
    res.json({ bannerUrl });
  } catch (err) {
    next(err);
  }
}

/** STARTUP SCREENSHOT -------------------------------------------------- */
export async function uploadScreenshot(req, res, next) {
  try {
    const owned = await requireStartupOwner(req);
    const startupId = owned.id;
    const file = requireFile(req);
    const processedName = `${path.parse(file.filename).name}.webp`;
    const processedPath = path.join(file.destination, processedName);
    await processScreenshot(file.path, processedPath);
    const imageUrl = buildUrl(req, 'screenshots', processedName);

    // Create screenshot record in DB with next position
    const maxPosition = await prisma.screenshot.findFirst({
      where: { startupId: String(startupId) },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const screenshot = await prisma.screenshot.create({
      data: {
        imageUrl,
        position: (maxPosition?.position || 0) + 1,
        startupId: String(startupId),
      },
    });

    await invalidateStartupCaches({ id: String(startupId) });
    res.status(201).json(screenshot);
  } catch (err) {
    next(err);
  }
}


/** POST IMAGE ------------------------------------------------------------ */
// Images embedded in ecosystem posts. Re-encoded by Sharp like every other upload.
export async function uploadPostImage(req, res, next) {
  try {
    const file = requireFile(req);
    const processedName = `${path.parse(file.filename).name}.webp`;
    const processedPath = path.join(file.destination, processedName);
    await processScreenshot(file.path, processedPath);
    res.status(201).json({ url: buildUrl(req, 'posts', processedName) });
  } catch (err) {
    next(err);
  }
}
