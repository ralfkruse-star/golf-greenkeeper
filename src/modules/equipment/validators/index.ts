/**
 * Equipment Validators
 */

import { z } from 'zod'

export const createEquipmentSchema = z.object({
  name: z.string().min(2).max(200),
  code: z.string().min(2).max(50),
  type: z.string().min(2).max(100),
  manufacturer: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  serialNumber: z.string().max(100).optional(),
  purchaseDate: z.coerce.date().optional(),
  purchasePrice: z.number().positive().optional(),
  initialHours: z.number().min(0).optional(),
})

export const startUsageSchema = z.object({
  locationId: z.string().cuid().optional(),
})

export const stopUsageSchema = z.object({
  hoursEnd: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
})
