/**
 * GET /api/sensors/:id/readings - Get sensor readings
 * POST /api/sensors/:id/readings - Record reading
 */

import { NextRequest, NextResponse } from 'next/server'
import { SensorService } from '@/modules/sensors/application/sensor.service'
import { SensorRepository } from '@/modules/sensors/infrastructure/sensor.repository'
import { authenticateRequest } from '@/lib/auth/middleware'
import { z } from 'zod'

const sensorService = new SensorService(new SensorRepository())

const recordReadingSchema = z.object({
  value: z.number(),
  unit: z.string(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = authenticateRequest(req)

    const { searchParams } = new URL(req.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    if (dateFrom && dateTo) {
      const readings = await sensorService.getReadingHistory(
        params.id,
        new Date(dateFrom),
        new Date(dateTo)
      )
      return NextResponse.json({
        success: true,
        data: readings,
      })
    }

    const latest = await sensorService.getLatestReading(params.id)

    return NextResponse.json({
      success: true,
      data: latest,
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

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = authenticateRequest(req)

    const body = await req.json()

    const result = recordReadingSchema.safeParse(body)
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

    const reading = await sensorService.recordReading({
      deviceId: params.id,
      ...result.data,
    })

    return NextResponse.json(
      {
        success: true,
        data: reading,
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
