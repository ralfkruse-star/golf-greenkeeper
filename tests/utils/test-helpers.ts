/**
 * Test Utilities
 * Helper functions for testing
 */

import { vi } from 'vitest'

/**
 * Mock Prisma Client
 */
export const createMockPrismaClient = () => {
  return {
    task: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    location: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    equipment: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    robotDevice: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    robotMission: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    carbonCertificate: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    knowledgePost: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    imageAnalysis: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  }
}

/**
 * Mock user for testing
 */
export const createMockUser = (overrides = {}) => {
  return {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'GREENKEEPER',
    tenantId: 'tenant-123',
    ...overrides,
  }
}

/**
 * Mock task for testing
 */
export const createMockTask = (overrides = {}) => {
  return {
    id: 'task-123',
    title: 'Test Task',
    description: 'Test description',
    status: 'TODO',
    priority: 'MEDIUM',
    locationId: 'location-123',
    assignedToId: 'user-123',
    createdById: 'user-123',
    tenantId: 'tenant-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Mock robot for testing
 */
export const createMockRobot = (overrides = {}) => {
  return {
    id: 'robot-123',
    name: 'Test Mower',
    code: 'MOWER-001',
    type: 'AUTONOMOUS_MOWER',
    status: 'IDLE',
    batteryLevel: 100,
    operatingHours: 50,
    active: true,
    tenantId: 'tenant-123',
    ...overrides,
  }
}

/**
 * Wait for async operations
 */
export const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Mock fetch response
 */
export const createMockFetchResponse = (data: any, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as Response)
}
