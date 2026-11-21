import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Enable TLS only for Redis Cloud (rediss://) — not for local dev (redis://)
const isTLS = redisUrl.startsWith('rediss://');

const redisOptions = {
  retryStrategy(times) {
    const delay = Math.min(times * 200, 10000);
    return delay;
  },
  enableOfflineQueue: false,
  connectTimeout: 2000,
  // TLS required for Redis Cloud (rediss://), skipped for local redis://
  ...(isTLS && {
    tls: {
      rejectUnauthorized: false, // Redis Cloud uses self-signed-style certs
    },
  }),
};

const redis = new Redis(redisUrl, redisOptions);

redis.on('error', (err) => {
  console.error('🔴 Redis error:', err);
});

redis.on('connect', () => {
  console.info('🟢 Connected to Redis');
});

redis.on('ready', () => {
  console.info('✅ Redis ready');
});

export default redis;