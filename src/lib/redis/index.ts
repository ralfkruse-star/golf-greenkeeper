/**
 * Redis Client
 * Used for caching, sessions, and real-time data
 */

import { createClient } from 'redis'

const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof createClient> | undefined
}

export const redis =
  globalForRedis.redis ??
  createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  })

if (!redis.isOpen) {
  redis.connect().catch(console.error)
}

redis.on('error', (err) => console.error('Redis Client Error', err))

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

export default redis

/**
 * Cache utilities
 */
export const cache = {
  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key)
    return value ? JSON.parse(value) : null
  },

  /**
   * Set cached value with optional TTL (seconds)
   */
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value)
    if (ttl) {
      await redis.setEx(key, ttl, serialized)
    } else {
      await redis.set(key, serialized)
    }
  },

  /**
   * Delete cached value
   */
  async del(key: string): Promise<void> {
    await redis.del(key)
  },

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    return (await redis.exists(key)) === 1
  },

  /**
   * Clear all cache (use with caution)
   */
  async clear(): Promise<void> {
    await redis.flushAll()
  },
}
