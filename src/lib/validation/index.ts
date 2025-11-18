/**
 * Zod validation schemas
 */

import { z } from 'zod'
import { UserRole, TaskPriority, TaskStatus, ZoneType, EquipmentType } from '@/types'

// Common schemas
export const idSchema = z.string().uuid()
export const emailSchema = z.string().email()
export const passwordSchema = z.string().min(8).max(100)
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

// User schemas
export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: z.nativeEnum(UserRole).default(UserRole.GREENKEEPER),
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
})

// Task schemas
export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  zoneId: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
  equipmentId: z.string().uuid().optional(),
  scheduledStart: z.string().datetime().optional(),
  scheduledEnd: z.string().datetime().optional(),
  estimatedHours: z.number().positive().optional(),
  checklistItems: z.array(z.object({
    id: z.string(),
    text: z.string(),
    completed: z.boolean(),
  })).optional(),
})

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
  notes: z.string().optional(),
})

// Location schemas
export const createZoneSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.nativeEnum(ZoneType),
  holeId: z.string().uuid().optional(),
  area: z.number().positive().optional(),
  coordinates: z.any().optional(), // GeoJSON or lat/lng
  description: z.string().optional(),
})

// Equipment schemas
export const createEquipmentSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.nativeEnum(EquipmentType),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().datetime().optional(),
  purchasePrice: z.number().positive().optional(),
  serviceInterval: z.number().positive().optional(),
})

export const startEquipmentUsageSchema = z.object({
  userId: z.string().uuid(),
  zoneId: z.string().uuid().optional(),
  notes: z.string().optional(),
})

export const endEquipmentUsageSchema = z.object({
  usageLogId: z.string().uuid(),
  notes: z.string().optional(),
})
