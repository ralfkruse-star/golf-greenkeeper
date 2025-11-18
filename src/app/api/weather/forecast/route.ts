/**
 * Weather Forecast API Route
 * GET /api/weather/forecast
 */

import { NextRequest } from 'next/server'
import { WeatherService } from '@/modules/weather/services/weather-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getQueryParams } from '@/lib/api-helpers'

const weatherService = new WeatherService(prisma)

/**
 * GET /api/weather/forecast
 * Get 7-day forecast
 */
export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request)

    const lat = params.lat ? parseFloat(params.lat) : 53.6355
    const lon = params.lon ? parseFloat(params.lon) : 10.2877

    const forecast = await weatherService.getSevenDayForecast(lat, lon)

    return successResponse(forecast)
  } catch (error) {
    return errorResponse(error)
  }
}
