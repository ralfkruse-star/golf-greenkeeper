/**
 * Vitest Setup File
 * Runs before all tests
 */

import { beforeAll, afterAll, afterEach } from 'vitest'

// Mock environment variables for tests
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/golf_greenkeeper_test'
process.env.REDIS_URL = 'redis://localhost:6379/1'
process.env.JWT_ACCESS_SECRET = 'test-access-secret-min-32-chars-long-enough-now'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-32-chars-long-enough-now'

beforeAll(async () => {
  // Setup logic before all tests
})

afterEach(async () => {
  // Cleanup after each test
})

afterAll(async () => {
  // Cleanup logic after all tests
})
