/**
 * GET /api/weather/sync - Sync weather from OpenWeather API
 */

import { NextRequest, NextResponse } from 'next/server'
import { WeatherService } from '@/modules/weather/application/weather.service'
import { WeatherRepository } from '@/modules/weather/infrastructure/weather.repository'
import { OpenWeatherService } from '@/lib/weather/openweather.service'
import { authenticateRequest, requireManagement } from '@/lib/auth/middleware'

const weatherService = new WeatherService(new WeatherRepository())
const openWeatherService = new OpenWeatherService()

export async function POST(req: NextRequest) {
  try {
    const user = authenticateRequest(req)
    requireManagement(user)

    // Default location (Golfplatz Siek approximate coordinates)
    const lat = 53.6394
    const lon = 10.2931

    const weatherData = await openWeatherService.getCurrentWeather(lat, lon)
    const converted = openWeatherService.convertToWeatherSnapshot(weatherData)

    const snapshot = await weatherService.recordWeather(converted)

    return NextResponse.json({
      success: true,
      data: {
        snapshot,
        raw: weatherData,
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
