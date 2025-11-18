/**
 * Weather-Based Recommendations API Route
 * GET /api/weather/recommendations
 */

import { NextRequest } from 'next/server'
import { WeatherService } from '@/modules/weather/services/weather-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getQueryParams } from '@/lib/api-helpers'

const weatherService = new WeatherService(prisma)

/**
 * GET /api/weather/recommendations
 * Get task recommendations based on weather
 */
export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request)

    const lat = params.lat ? parseFloat(params.lat) : 53.6355
    const lon = params.lon ? parseFloat(params.lon) : 10.2877

    const [taskRecommendations, irrigationNeeds] = await Promise.all([
      weatherService.generateTaskRecommendations(lat, lon),
      weatherService.calculateIrrigationNeeds(lat, lon),
    ])

    return successResponse({
      taskRecommendations,
      irrigationNeeds,
    })
  } catch (error) {
    return errorResponse(error)
  }
}
