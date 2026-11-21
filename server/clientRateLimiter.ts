import crypto from 'crypto';
import type { IncomingMessage } from 'http';
import Redis from 'ioredis';
import { serverConfig } from './config.ts';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSec: number;
}

interface InMemoryRecord {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, InMemoryRecord>();

let redisClient: Redis | null = null;
let isRedisAvailable = false;

if (serverConfig.REDIS_URL) {
  try {
    redisClient = new Redis(serverConfig.REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableOfflineQueue: false,
    });
    redisClient.on('connect', () => { isRedisAvailable = true; });
    redisClient.on('error', () => { isRedisAvailable = false; });
    redisClient.connect().catch(() => { isRedisAvailable = false; });
  } catch {
    isRedisAvailable = false;
  }
}

export function hashClientIdentifier(ip: string): string {
  return crypto
    .createHmac('sha256', serverConfig.RATE_LIMIT_SALT)
    .update(ip || '127.0.0.1')
    .digest('hex');
}

export function extractClientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && typeof forwarded[0] === 'string') {
    return forwarded[0].split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

export async function checkRateLimit(
  clientId: string,
  keyPrefix: string,
  limit: number,
  windowSec: number = 60
): Promise<RateLimitResult> {
  const hashedId = hashClientIdentifier(clientId);
  const cacheKey = `ratelimit:${keyPrefix}:${hashedId}`;

  if (redisClient && isRedisAvailable) {
    try {
      const current = await redisClient.incr(cacheKey);
      if (current === 1) {
        await redisClient.expire(cacheKey, windowSec);
      }
      const ttl = await redisClient.ttl(cacheKey);
      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
        resetSec: Math.max(1, ttl),
      };
    } catch {
      // Fallback to in-memory on Redis error
    }
  }

  const now = Date.now();
  const entry = memoryStore.get(cacheKey);

  if (!entry || now > entry.resetTime) {
    memoryStore.set(cacheKey, { count: 1, resetTime: now + windowSec * 1000 });
    return { allowed: true, remaining: limit - 1, resetSec: windowSec };
  }

  entry.count += 1;
  const resetSec = Math.ceil((entry.resetTime - now) / 1000);
  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    resetSec: Math.max(1, resetSec),
  };
}
