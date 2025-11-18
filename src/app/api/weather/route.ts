/**
 * GET /api/weather - Get latest weather or history
 * POST /api/weather - Record weather data
 */

import { NextRequest, NextResponse } from 'next/server'
import { WeatherService } from '@/modules/weather/application/weather.service'
import { WeatherRepository } from '@/modules/weather/infrastructure/weather.repository'
import { authenticateRequest, requireManagement } from '@/lib/auth/middleware'
import { z } from 'zod'

const weatherService = new WeatherService(new WeatherRepository())

const recordWeatherSchema = z.object({
  temperature: z.number().optional(),
  humidity: z.number().min(0).max(100).optional(),
  precipitation: z.number().min(0).optional(),
  windSpeed: z.number().min(0).optional(),
  windDirection: z.string().optional(),
  source: z.enum(['API', 'MANUAL', 'STATION']),
})

export async function GET(req: NextRequest) {
  try {
    const user = authenticateRequest(req)

    const { searchParams } = new URL(req.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    if (dateFrom && dateTo) {
      const history = await weatherService.getWeatherHistory(
        new Date(dateFrom),
        new Date(dateTo)
      )
      return NextResponse.json({
        success: true,
        data: history,
      })
    }

    const latest = await weatherService.getLatestWeather()

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

export async function POST(req: NextRequest) {
  try {
    const user = authenticateRequest(req)
    requireManagement(user)

    const body = await req.json()

    const result = recordWeatherSchema.safeParse(body)
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

    const snapshot = await weatherService.recordWeather(result.data)

    return NextResponse.json(
      {
        success: true,
        data: snapshot,
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
