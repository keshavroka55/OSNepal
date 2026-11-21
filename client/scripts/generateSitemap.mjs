#!/usr/bin/env node

/**
 * Sitemap Generator Script
 * Run with: node scripts/generateSitemap.mjs
 * Generates a dynamic sitemap.xml file for SEO
 */

import fs from 'fs';
import path from 'path';

const SITE_URL = process.env.REACT_APP_SITE_URL || 'https://opensourcenepal.org';
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const SITEMAP_PATH = path.join(PUBLIC_DIR, 'sitemap.xml');

// Define static routes
const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/home', priority: '0.9', changefreq: 'daily' },
  { path: '/products', priority: '1.0', changefreq: 'hourly' },
  { path: '/leaderboard', priority: '0.8', changefreq: 'daily' },
  { path: '/submit', priority: '0.9', changefreq: 'weekly' },
  { path: '/pricing', priority: '0.7', changefreq: 'monthly' },
  { path: '/register', priority: '0.6', changefreq: 'yearly' },
  { path: '/privacy-policy', priority: '0.5', changefreq: 'monthly' },
  { path: '/terms-of-service', priority: '0.5', changefreq: 'monthly' },
  { path: '/cookie', priority: '0.5', changefreq: 'monthly' },
];

/**
 * Generate XML sitemap
 */
const generateSitemap = (routes) => {
  const urlset = routes
    .map(
      (route) => `
  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
  xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0">
${urlset}
</urlset>`;
};

/**
 * Generate sitemap index for large sitemaps (optional)
 */
const generateSitemapIndex = (sitemapUrls) => {
  const sitemaps = sitemapUrls
    .map(
      (url) => `
  <sitemap>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps}
</sitemapindex>`;
};

/**
 * Main function
 */
const main = async () => {
  try {
    // Ensure public directory exists
    if (!fs.existsSync(PUBLIC_DIR)) {
      fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    }

    // Generate sitemap
    const sitemap = generateSitemap(staticRoutes);

    // Write sitemap
    fs.writeFileSync(SITEMAP_PATH, sitemap, 'utf-8');
    console.log(`✓ Sitemap generated: ${SITEMAP_PATH}`);
    console.log(`✓ Total routes: ${staticRoutes.length}`);
    console.log(`✓ Sitemap URL: ${SITE_URL}/sitemap.xml`);
  } catch (error) {
    console.error('✗ Error generating sitemap:', error);
    process.exit(1);
  }
};

main();
