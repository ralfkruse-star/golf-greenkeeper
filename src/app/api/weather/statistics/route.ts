/**
 * Weather Statistics API Route
 * GET /api/weather/statistics
 */

import { NextRequest } from 'next/server'
import { WeatherService } from '@/modules/weather/services/weather-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getQueryParams } from '@/lib/api-helpers'

const weatherService = new WeatherService(prisma)

/**
 * GET /api/weather/statistics
 * Get weather statistics for period
 */
export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request)
    const days = params.days ? parseInt(params.days, 10) : 30

    const [stats, historical] = await Promise.all([
      weatherService.getWeatherStatistics(days),
      weatherService.getHistoricalData(days),
    ])

    return successResponse({
      statistics: stats,
      historical,
    })
  } catch (error) {
    return errorResponse(error)
  }
}
