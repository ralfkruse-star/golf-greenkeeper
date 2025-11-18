/**
 * Test Data Factories
 * Create test entities with sensible defaults
 */

import { PrismaClient, UserRole, LocationType, TaskStatus, TaskPriority, EquipmentStatus } from '@prisma/client'
import * as argon2 from 'argon2'

export async function createTestUser(
  prisma: PrismaClient,
  overrides: {
    email?: string
    password?: string
    firstName?: string
    lastName?: string
    role?: UserRole
  } = {}
) {
  return prisma.user.create({
    data: {
      email: overrides.email || `test-${Date.now()}@example.com`,
      password: await argon2.hash(overrides.password || 'Test123!'),
      firstName: overrides.firstName || 'Test',
      lastName: overrides.lastName || 'User',
      role: overrides.role || UserRole.GREENKEEPER,
    },
  })
}

export async function createTestLocation(
  prisma: PrismaClient,
  overrides: {
    name?: string
    code?: string
    type?: LocationType
    parentId?: string
  } = {}
) {
  return prisma.location.create({
    data: {
      name: overrides.name || `Test Location ${Date.now()}`,
      code: overrides.code || `TEST-LOC-${Date.now()}`,
      type: overrides.type || LocationType.GREEN,
      parentId: overrides.parentId,
    },
  })
}

export async function createTestTask(
  prisma: PrismaClient,
  createdById: string,
  overrides: {
    title?: string
    description?: string
    status?: TaskStatus
    priority?: TaskPriority
    assignedToId?: string
    locationId?: string
    equipmentId?: string
  } = {}
) {
  return prisma.task.create({
    data: {
      title: overrides.title || `Test Task ${Date.now()}`,
      description: overrides.description || 'Test task description',
      status: overrides.status || TaskStatus.TODO,
      priority: overrides.priority || TaskPriority.MEDIUM,
      createdById,
      assignedToId: overrides.assignedToId,
      locationId: overrides.locationId,
      equipmentId: overrides.equipmentId,
    },
  })
}

export async function createTestEquipment(
  prisma: PrismaClient,
  overrides: {
    name?: string
    code?: string
    type?: string
    status?: EquipmentStatus
  } = {}
) {
  return prisma.equipment.create({
    data: {
      name: overrides.name || `Test Equipment ${Date.now()}`,
      code: overrides.code || `TEST-EQ-${Date.now()}`,
      type: overrides.type || 'Test Type',
      status: overrides.status || EquipmentStatus.AVAILABLE,
    },
  })
}
