/**
 * Current Weather API Route
 * GET /api/weather/current
 */

import { NextRequest } from 'next/server'
import { WeatherService } from '@/modules/weather/services/weather-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getQueryParams } from '@/lib/api-helpers'

const weatherService = new WeatherService(prisma)

/**
 * GET /api/weather/current
 * Get current weather and create snapshot
 */
export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request)

    // Default coordinates (can be from club settings)
    const lat = params.lat ? parseFloat(params.lat) : 53.6355 // Golfclub Siek
    const lon = params.lon ? parseFloat(params.lon) : 10.2877

    const snapshot = await weatherService.createSnapshot(lat, lon)

    return successResponse(snapshot)
  } catch (error) {
    return errorResponse(error)
  }
}
