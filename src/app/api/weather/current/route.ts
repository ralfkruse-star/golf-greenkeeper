/**
 * Weather Station API - Current Weather
 * GET /api/weather/current
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { weatherStationService } from '@/services/weather-station.service'

/**
 * Get current weather conditions
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const latitude = parseFloat(searchParams.get('latitude') || '0')
    const longitude = parseFloat(searchParams.get('longitude') || '0')
    const provider = (searchParams.get('provider') || 'OPENWEATHER') as
      | 'OPENWEATHER'
      | 'WEATHERSTACK'
      | 'ONSITE'
    const apiKey = searchParams.get('apiKey') || process.env.OPENWEATHER_API_KEY || ''

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required query parameters: latitude, longitude' },
        { status: 400 }
      )
    }

    const weather = await weatherStationService.getCurrentWeather(latitude, longitude, {
      provider,
      apiKey,
    })

    // Get forecast for irrigation adjustment
    const forecast = await weatherStationService.getForecast(latitude, longitude, 3, apiKey)

    // Calculate irrigation adjustment
    const irrigationAdjustment = weatherStationService.calculateIrrigationAdjustment(
      weather,
      forecast
    )

    // Check for weather alerts
    const alerts = await weatherStationService.checkWeatherAlerts(weather, forecast)

    // Store reading
    await weatherStationService.storeReading(weather, session.user.tenantId)

    return NextResponse.json({
      weather,
      forecast,
      irrigationAdjustment,
      alerts,
    })
  } catch (error) {
    console.error('Error fetching weather:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
