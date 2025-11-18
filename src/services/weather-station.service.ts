/**
 * Weather Station Service
 * Integration with external weather APIs and on-site weather stations
 */

import { PrismaClient } from '@prisma/client'
import { WeatherStationReading } from '@/modules/iot/types/sensors'

const prisma = new PrismaClient()

interface WeatherAPIConfig {
  provider: 'OPENWEATHER' | 'WEATHERSTACK' | 'ONSITE'
  apiKey?: string
  stationId?: string
}

interface ForecastData {
  date: Date
  temperature: { min: number; max: number; avg: number }
  humidity: number
  windSpeed: number
  precipitation: number
  conditions: string
}

export class WeatherStationService {
  /**
   * Fetch current weather from API or on-site station
   */
  async getCurrentWeather(
    latitude: number,
    longitude: number,
    config: WeatherAPIConfig
  ): Promise<WeatherStationReading> {
    switch (config.provider) {
      case 'OPENWEATHER':
        return this.fetchOpenWeather(latitude, longitude, config.apiKey!)
      case 'WEATHERSTACK':
        return this.fetchWeatherStack(latitude, longitude, config.apiKey!)
      case 'ONSITE':
        return this.fetchOnSiteStation(config.stationId!)
      default:
        throw new Error('Unsupported weather provider')
    }
  }

  /**
   * Fetch weather data from OpenWeatherMap
   */
  private async fetchOpenWeather(
    latitude: number,
    longitude: number,
    apiKey: string
  ): Promise<WeatherStationReading> {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`OpenWeather API error: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        rainfall: data.rain?.['1h'] || 0,
        solarRadiation: 0, // Not provided by free tier
        barometricPressure: data.main.pressure,
        timestamp: new Date(),
        stationId: 'openweather',
      }
    } catch (error) {
      console.error('Error fetching OpenWeather data:', error)
      throw error
    }
  }

  /**
   * Fetch weather data from WeatherStack
   */
  private async fetchWeatherStack(
    latitude: number,
    longitude: number,
    apiKey: string
  ): Promise<WeatherStationReading> {
    try {
      const url = `http://api.weatherstack.com/current?access_key=${apiKey}&query=${latitude},${longitude}&units=m`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`WeatherStack API error: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(`WeatherStack error: ${data.error.info}`)
      }

      return {
        temperature: data.current.temperature,
        humidity: data.current.humidity,
        windSpeed: data.current.wind_speed / 3.6, // Convert km/h to m/s
        windDirection: data.current.wind_degree,
        rainfall: data.current.precip || 0,
        solarRadiation: 0,
        barometricPressure: data.current.pressure,
        timestamp: new Date(),
        stationId: 'weatherstack',
      }
    } catch (error) {
      console.error('Error fetching WeatherStack data:', error)
      throw error
    }
  }

  /**
   * Fetch data from on-site weather station
   */
  private async fetchOnSiteStation(stationId: string): Promise<WeatherStationReading> {
    // In production, this would query the actual weather station API
    // For now, return simulated data
    const latestReading = await prisma.weatherReading.findFirst({
      where: { stationId },
      orderBy: { timestamp: 'desc' },
    })

    if (!latestReading) {
      throw new Error(`No data available for station ${stationId}`)
    }

    return {
      temperature: latestReading.temperature,
      humidity: latestReading.humidity,
      windSpeed: latestReading.windSpeed,
      windDirection: latestReading.windDirection,
      rainfall: latestReading.rainfall,
      solarRadiation: latestReading.solarRadiation,
      barometricPressure: latestReading.barometricPressure,
      timestamp: latestReading.timestamp,
      stationId: latestReading.stationId,
    }
  }

  /**
   * Get weather forecast for next N days
   */
  async getForecast(
    latitude: number,
    longitude: number,
    days: number,
    apiKey: string
  ): Promise<ForecastData[]> {
    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${latitude}&lon=${longitude}&cnt=${days}&appid=${apiKey}&units=metric`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`OpenWeather API error: ${response.statusText}`)
      }

      const data = await response.json()

      return data.list.map((day: any) => ({
        date: new Date(day.dt * 1000),
        temperature: {
          min: day.temp.min,
          max: day.temp.max,
          avg: (day.temp.min + day.temp.max) / 2,
        },
        humidity: day.humidity,
        windSpeed: day.speed,
        precipitation: day.rain || 0,
        conditions: day.weather[0].main,
      }))
    } catch (error) {
      console.error('Error fetching forecast:', error)
      throw error
    }
  }

  /**
   * Store weather reading in database
   */
  async storeReading(reading: WeatherStationReading, tenantId: string): Promise<void> {
    await prisma.weatherReading.create({
      data: {
        stationId: reading.stationId,
        temperature: reading.temperature,
        humidity: reading.humidity,
        windSpeed: reading.windSpeed,
        windDirection: reading.windDirection,
        rainfall: reading.rainfall,
        solarRadiation: reading.solarRadiation,
        barometricPressure: reading.barometricPressure,
        timestamp: reading.timestamp,
        tenantId,
      },
    })
  }

  /**
   * Get historical weather data
   */
  async getHistoricalData(
    stationId: string,
    startDate: Date,
    endDate: Date,
    tenantId: string
  ): Promise<WeatherStationReading[]> {
    const readings = await prisma.weatherReading.findMany({
      where: {
        stationId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
        tenantId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    })

    return readings.map((r) => ({
      temperature: r.temperature,
      humidity: r.humidity,
      windSpeed: r.windSpeed,
      windDirection: r.windDirection,
      rainfall: r.rainfall,
      solarRadiation: r.solarRadiation,
      barometricPressure: r.barometricPressure,
      timestamp: r.timestamp,
      stationId: r.stationId,
    }))
  }

  /**
   * Calculate weather-based irrigation adjustment
   */
  calculateIrrigationAdjustment(
    reading: WeatherStationReading,
    forecast: ForecastData[]
  ): {
    adjustment: number // -100 to +100 (percentage adjustment)
    reason: string
  } {
    let adjustment = 0
    const reasons: string[] = []

    // Recent rainfall
    if (reading.rainfall > 5) {
      adjustment -= 50
      reasons.push('Recent heavy rainfall')
    } else if (reading.rainfall > 2) {
      adjustment -= 25
      reasons.push('Recent moderate rainfall')
    }

    // Upcoming rainfall
    const upcomingRain = forecast
      .slice(0, 2)
      .reduce((sum, day) => sum + day.precipitation, 0)
    if (upcomingRain > 5) {
      adjustment -= 30
      reasons.push('Heavy rain forecasted')
    }

    // Temperature
    if (reading.temperature > 30) {
      adjustment += 30
      reasons.push('High temperature')
    } else if (reading.temperature > 25) {
      adjustment += 15
      reasons.push('Warm temperature')
    }

    // Humidity
    if (reading.humidity < 40) {
      adjustment += 20
      reasons.push('Low humidity')
    } else if (reading.humidity > 70) {
      adjustment -= 10
      reasons.push('High humidity')
    }

    // Wind speed
    if (reading.windSpeed > 5) {
      adjustment += 15
      reasons.push('High wind speed (increased evaporation)')
    }

    // Cap adjustment at -100 to +100
    adjustment = Math.max(-100, Math.min(100, adjustment))

    return {
      adjustment,
      reason: reasons.join(', ') || 'Normal conditions',
    }
  }

  /**
   * Check for weather alerts
   */
  async checkWeatherAlerts(
    reading: WeatherStationReading,
    forecast: ForecastData[]
  ): Promise<
    Array<{
      type: string
      severity: 'LOW' | 'MEDIUM' | 'HIGH'
      message: string
    }>
  > {
    const alerts: Array<{ type: string; severity: 'LOW' | 'MEDIUM' | 'HIGH'; message: string }> =
      []

    // Frost warning
    if (reading.temperature < 2) {
      alerts.push({
        type: 'FROST',
        severity: 'HIGH',
        message: `Frost risk: Temperature at ${reading.temperature}°C`,
      })
    }

    // Heat stress
    if (reading.temperature > 35) {
      alerts.push({
        type: 'HEAT',
        severity: 'HIGH',
        message: `Heat stress: Temperature at ${reading.temperature}°C`,
      })
    }

    // Heavy rain
    if (reading.rainfall > 10) {
      alerts.push({
        type: 'HEAVY_RAIN',
        severity: 'MEDIUM',
        message: `Heavy rainfall: ${reading.rainfall}mm in last hour`,
      })
    }

    // Strong winds
    if (reading.windSpeed > 10) {
      alerts.push({
        type: 'WIND',
        severity: 'MEDIUM',
        message: `Strong winds: ${reading.windSpeed} m/s`,
      })
    }

    // Disease risk (wet + warm)
    if (reading.humidity > 85 && reading.temperature > 20 && reading.temperature < 30) {
      alerts.push({
        type: 'DISEASE_RISK',
        severity: 'MEDIUM',
        message: 'High disease risk: Warm and humid conditions',
      })
    }

    return alerts
  }
}

export const weatherStationService = new WeatherStationService()
