/**
 * Sensor Alerts API
 * GET /api/sensors/alerts - Get all sensor alerts
 */

import { NextRequest } from 'next/server'
import { SensorService } from '@/modules/sensors/services/sensor-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-helpers'

const sensorService = new SensorService(prisma)

export async function GET(request: NextRequest) {
  try {
    const alerts = await sensorService.checkAlerts()

    return successResponse({
      alerts,
      count: alerts.length,
      timestamp: new Date(),
    })
  } catch (error) {
    return errorResponse(error)
  }
}
