/**
 * Sensor Data Ingest API
 * POST /api/sensors/ingest - Batch ingest sensor readings
 */

import { NextRequest } from 'next/server'
import { SensorService } from '@/modules/sensors/services/sensor-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getRequestBody } from '@/lib/api-helpers'
import { z } from 'zod'

const sensorService = new SensorService(prisma)

const ingestSchema = z.object({
  readings: z.array(
    z.object({
      deviceId: z.string(),
      timestamp: z.coerce.date(),
      value: z.number(),
      unit: z.string(),
      metadata: z.record(z.any()).optional(),
    })
  ),
})

export async function POST(request: NextRequest) {
  try {
    const body = await getRequestBody(request)
    const validated = ingestSchema.parse(body)

    const result = await sensorService.ingestReadings(validated.readings)

    return successResponse({
      ingested: result.count,
      timestamp: new Date(),
    }, 201)
  } catch (error) {
    return errorResponse(error)
  }
}
