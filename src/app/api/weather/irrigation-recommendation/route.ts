/**
 * GET /api/weather/irrigation-recommendation
 */

import { NextRequest, NextResponse } from 'next/server'
import { WeatherService } from '@/modules/weather/application/weather.service'
import { WeatherRepository } from '@/modules/weather/infrastructure/weather.repository'
import { authenticateRequest } from '@/lib/auth/middleware'

const weatherService = new WeatherService(new WeatherRepository())

export async function GET(req: NextRequest) {
  try {
    const user = authenticateRequest(req)

    const latest = await weatherService.getLatestWeather()

    if (!latest) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_DATA',
            message: 'No weather data available',
          },
        },
        { status: 404 }
      )
    }

    const recommendation = weatherService.getIrrigationRecommendation({
      temperature: latest.temperature,
      humidity: latest.humidity,
      precipitation: latest.precipitation,
      evapotranspiration: latest.evapotranspiration,
    })

    return NextResponse.json({
      success: true,
      data: {
        weather: latest,
        recommendation,
      },
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
