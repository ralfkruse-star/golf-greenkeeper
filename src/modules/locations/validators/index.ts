/**
 * Location Validators
 */

import { z } from 'zod'

export const createLocationSchema = z.object({
  name: z.string().min(2).max(200),
  code: z.string().min(2).max(50),
  type: z.enum([
    'COURSE',
    'HOLE',
    'GREEN',
    'FAIRWAY',
    'TEE',
    'BUNKER',
    'ROUGH',
    'PRACTICE_AREA',
    'OTHER',
  ]),
  description: z.string().max(1000).optional(),
  parentId: z.string().cuid().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  area: z.number().positive().optional(),
  metadata: z.record(z.any()).optional(),
})
