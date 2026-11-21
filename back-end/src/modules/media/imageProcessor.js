import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

/**
 * Process a user avatar: 1:1 crop, 500×500, WebP, ≤50 KB.
 */
export async function processAvatar(inputPath, outputPath) {
  let quality = 80;
  while (true) {
    await sharp(inputPath)
      .rotate()
      .resize(500, 500, { fit: 'cover' })
      .webp({ quality })
      .toFile(outputPath);
    const { size } = await fs.stat(outputPath);
    if (size <= 50 * 1024 || quality <= 30) break;
    quality -= 10;
  }
  await fs.unlink(inputPath);
}

/**
 * Process a logo (SVG stays SVG, PNG is resized/compressed).
 */
export async function processLogo(inputPath, outputPath, mime) {
  if (mime === 'image/svg+xml') {
    // No processing needed – just move file when target differs
    if (inputPath !== outputPath) {
      await fs.rename(inputPath, outputPath);
    }
    return;
  }
  // Raster logos (png/webp/avif) -> normalize to WebP, max 500x200, target <= 80KB
  let quality = 80;
  while (true) {
    await sharp(inputPath)
      .rotate()
      .resize({ width: 500, height: 200, fit: 'inside' })
      .webp({ quality })
      .toFile(outputPath);

    const { size } = await fs.stat(outputPath);
    if (size <= 80 * 1024 || quality <= 30) break;
    quality -= 10;
  }

  await fs.unlink(inputPath);
}

/**
 * Process a banner: width ≤1920 px, keep aspect, WebP, ≤300 KB.
 */
export async function processBanner(inputPath, outputPath) {
  let quality = 85;
  while (true) {
    await sharp(inputPath)
      .rotate()
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality })
      .toFile(outputPath);
    const { size } = await fs.stat(outputPath);
    if (size <= 300 * 1024 || quality <= 30) break;
    quality -= 10;
  }
  await fs.unlink(inputPath);
}

/**
 * Process screenshot images: resize to max width 1280, convert to WebP and keep size <= 1MB.
 */
export async function processScreenshot(inputPath, outputPath) {
  let quality = 80;
  while (true) {
    await sharp(inputPath)
      .rotate()
      .resize({ width: 1280, withoutEnlargement: true })
      .webp({ quality })
      .toFile(outputPath);
    const { size } = await fs.stat(outputPath);
    if (size <= 1024 * 1024 || quality <= 30) break;
    quality -= 10;
  }
  await fs.unlink(inputPath);
}
