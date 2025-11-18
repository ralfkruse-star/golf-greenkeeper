/**
 * GET /api/sensors/alerts - Get sensor alerts
 */

import { NextRequest, NextResponse } from 'next/server'
import { SensorService } from '@/modules/sensors/application/sensor.service'
import { SensorRepository } from '@/modules/sensors/infrastructure/sensor.repository'
import { authenticateRequest } from '@/lib/auth/middleware'

const sensorService = new SensorService(new SensorRepository())

export async function GET(req: NextRequest) {
  try {
    const user = authenticateRequest(req)

    const { searchParams } = new URL(req.url)
    const deviceId = searchParams.get('deviceId') || undefined

    const alerts = await sensorService.getAlerts(deviceId)

    return NextResponse.json({
      success: true,
      data: alerts,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'An error occurred',
        },
      },
      { status: error.statusCode || 500 }
    )
  }
}
