/**
 * Task Validators
 * Zod schemas for input validation
 */

import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  scheduledStart: z.coerce.date().optional(),
  scheduledEnd: z.coerce.date().optional(),
  locationId: z.string().cuid().optional(),
  equipmentId: z.string().cuid().optional(),
  assignedToId: z.string().cuid().optional(),
  checklist: z
    .array(
      z.object({
        label: z.string(),
        checked: z.boolean(),
      })
    )
    .optional(),
})

export const updateTaskStatusSchema = z.object({
  newStatus: z.enum(['TODO', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  notes: z.string().max(1000).optional(),
})

export const assignTaskSchema = z.object({
  assignedToId: z.string().cuid(),
})
