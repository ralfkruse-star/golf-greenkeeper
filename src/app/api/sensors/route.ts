/**
 * GET /api/sensors - List sensor devices
 * POST /api/sensors - Register sensor
 */

import { NextRequest, NextResponse } from 'next/server'
import { SensorService } from '@/modules/sensors/application/sensor.service'
import { SensorRepository } from '@/modules/sensors/infrastructure/sensor.repository'
import { authenticateRequest, requireManagement } from '@/lib/auth/middleware'
import { z } from 'zod'

const sensorService = new SensorService(new SensorRepository())

const registerSensorSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  zoneId: z.string().uuid().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const user = authenticateRequest(req)

    const devices = await new SensorRepository().findAllDevices()

    return NextResponse.json({
      success: true,
      data: devices,
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

export async function POST(req: NextRequest) {
  try {
    const user = authenticateRequest(req)
    requireManagement(user)

    const body = await req.json()

    const result = registerSensorSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: result.error.errors,
          },
        },
        { status: 400 }
      )
    }

    const device = await sensorService.registerSensor(result.data)

    return NextResponse.json(
      {
        success: true,
        data: device,
      },
      { status: 201 }
    )
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
