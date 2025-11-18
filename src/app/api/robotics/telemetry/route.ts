/**
 * Robot Telemetry API
 * POST /api/robotics/telemetry - Ingest robot telemetry data
 */

import { NextRequest } from 'next/server'
import { RoboticsService } from '@/modules/robotics/services/robotics-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getRequestBody } from '@/lib/api-helpers'
import { z } from 'zod'

const roboticsService = new RoboticsService(prisma)

const telemetrySchema = z.object({
  robotId: z.string(),
  timestamp: z.string().transform((s) => new Date(s)),
  position: z.object({
    latitude: z.number(),
    longitude: z.number(),
    heading: z.number(),
  }),
  batteryLevel: z.number().min(0).max(100),
  speed: z.number(),
  status: z.enum(['IDLE', 'ACTIVE', 'CHARGING', 'MAINTENANCE', 'ERROR', 'OFFLINE']),
  sensors: z
    .object({
      temperature: z.number().optional(),
      vibration: z.number().optional(),
      bladeRPM: z.number().optional(),
    })
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await getRequestBody(request)
    const validated = telemetrySchema.parse(body)

    await roboticsService.processTelemetry(validated)

    return successResponse({ message: 'Telemetry processed successfully' }, 201)
  } catch (error) {
    return errorResponse(error)
  }
}
