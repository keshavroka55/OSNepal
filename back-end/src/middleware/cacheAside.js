import redis from '../lib/redis.js';
// import { config, FEED_TTL, PROJECT_TTL, COMMENT_TTL } from '../config/config.js';

/**
 * Helper to get a cached value or compute & store it.
 * @param {string} key Redis key
 * @param {Function} fetcher async function that returns the data
 * @param {number} ttl seconds
 */
// Timeout wrapper to avoid Redis calls hanging the request if Redis is unreachable
const redisGetWithTimeout = async (key, ms = 1500) => {
  try {
    const result = await Promise.race([
      redis.get(key),
      new Promise((resolve) => setTimeout(() => resolve(null), ms)),
    ]);
    return result;
  } catch (err) {
    console.warn('Redis GET failed:', err && err.message ? err.message : err);
    return null;
  }
};

const redisSetWithTimeout = async (key, value, ttl, ms = 1500) => {
  try {
    // ioredis set returns a promise; race with timeout and ignore any failure
    await Promise.race([
      redis.set(key, value, 'EX', ttl),
      new Promise((resolve) => setTimeout(() => resolve(null), ms)),
    ]);
  } catch (err) {
    console.warn('Redis SET failed:', err && err.message ? err.message : err);
  }
};

const redisScanWithTimeout = async (cursor, pattern, count = 100, ms = 1500) => {
  try {
    const result = await Promise.race([
      redis.scan(cursor, 'MATCH', pattern, 'COUNT', count),
      new Promise((resolve) => setTimeout(() => resolve(null), ms)),
    ]);
    return result;
  } catch (err) {
    console.warn('Redis SCAN failed:', err && err.message ? err.message : err);
    return null;
  }
};

const redisDelWithTimeout = async (keys, ms = 1500) => {
  if (!Array.isArray(keys) || keys.length === 0) return;
  try {
    await Promise.race([
      redis.del(...keys),
      new Promise((resolve) => setTimeout(() => resolve(null), ms)),
    ]);
  } catch (err) {
    console.warn('Redis DEL failed:', err && err.message ? err.message : err);
  }
};

export const getOrSetCache = async (key, fetcher, ttl) => {
  const cached = await redisGetWithTimeout(key);
  if (cached) {
    console.info(`cache HIT: ${key}`);
    return JSON.parse(cached);
  }
  console.info(`cache MISS: ${key}`);
  const data = await fetcher();
  // Store only if data is not null/undefined
  if (data !== undefined && data !== null) {
    // Fire-and-forget the redis set (we await with timeout inside helper)
    await redisSetWithTimeout(key, JSON.stringify(data), ttl);
  }
  return data;
};

const deleteKeysWithPattern = async (pattern) => {
  try {
    let cursor = '0';
    let loops = 0;

    do {
      const scanned = await redisScanWithTimeout(cursor, pattern, 100);
      if (!scanned || !Array.isArray(scanned)) {
        // Redis unavailable/timeout: fail-safe without throwing
        return;
      }

      const [nextCursor, keys] = scanned;
      cursor = nextCursor;

      if (Array.isArray(keys) && keys.length > 0) {
        await redisDelWithTimeout(keys);
      }

      loops += 1;
      if (loops > 10000) {
        console.warn(`Redis SCAN loop limit reached for pattern: ${pattern}`);
        break;
      }
    } while (cursor !== '0');
  } catch (err) {
    console.warn('Cache pattern invalidation failed:', err && err.message ? err.message : err);
  }
};

export const invalidateStartupCaches = async ({ id, slug } = {}) => {
  try {
    const keys = [
      id ? `project:${id}` : null,
      slug ? `project:slug:${slug}` : null,
      id ? `project:${id}:comments` : null,
    ].filter(Boolean);

    if (keys.length > 0) {
      await redisDelWithTimeout(keys);
    }

    await Promise.allSettled([
      deleteKeysWithPattern('feed:*'),
      deleteKeysWithPattern('project:*'),
    ]);
  } catch (err) {
    console.warn('Startup cache invalidation failed:', err && err.message ? err.message : err);
  }
};

export const invalidateCommentCache = async (startupId) => {
  if (!startupId) return;
  await redisDelWithTimeout([`project:${startupId}:comments`]);
};

// Public ecosystem feeds are cached for anonymous readers; clear them
// whenever a post is created, removed or moderated.
export const invalidateEcosystemFeeds = () => deleteKeysWithPattern('ecosystem:feed:*');
