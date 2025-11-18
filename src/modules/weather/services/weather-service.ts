/**
 * Weather Service
 * Integration mit OpenWeatherMap und Weather-basierte Empfehlungen
 */

import type {
  WeatherSnapshot,
  WeatherForecast,
  WeatherAlert,
  WeatherBasedRecommendation,
  IrrigationRecommendation,
  OpenWeatherCurrentResponse,
  OpenWeatherForecastResponse,
} from '../types'
import { config } from '@/lib/config'

export class WeatherService {
  private apiKey: string
  private baseUrl = 'https://api.openweathermap.org/data/2.5'

  constructor(
    private prisma: any,
    apiKey?: string
  ) {
    this.apiKey = apiKey || config.externalApis.openWeather.apiKey || ''
  }

  /**
   * Fetch current weather from OpenWeatherMap
   */
  async fetchCurrentWeather(lat: number, lon: number): Promise<OpenWeatherCurrentResponse> {
    if (!this.apiKey) {
      throw new Error('OpenWeatherMap API key not configured')
    }

    const url = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Fetch 5-day forecast from OpenWeatherMap
   */
  async fetchForecast(lat: number, lon: number): Promise<OpenWeatherForecastResponse> {
    if (!this.apiKey) {
      throw new Error('OpenWeatherMap API key not configured')
    }

    const url = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Create weather snapshot from current data
   */
  async createSnapshot(lat: number, lon: number): Promise<WeatherSnapshot> {
    const current = await this.fetchCurrentWeather(lat, lon)

    const snapshot = await this.prisma.weatherSnapshot.create({
      data: {
        recordedAt: new Date(current.dt * 1000),
        tempMin: current.main.temp_min,
        tempMax: current.main.temp_max,
        tempAvg: current.main.temp,
        precipitation: current.rain?.['1h'] || 0,
        humidity: current.main.humidity,
        windSpeed: current.wind.speed * 3.6, // m/s to km/h
        et: this.calculateET(current), // Simple Penman estimation
        source: 'OpenWeatherMap',
      },
    })

    return snapshot
  }

  /**
   * Get 7-day forecast as structured data
   */
  async getSevenDayForecast(lat: number, lon: number): Promise<WeatherForecast[]> {
    const forecastData = await this.fetchForecast(lat, lon)

    // Group by day and aggregate
    const dailyForecasts = new Map<string, any[]>()

    forecastData.list.forEach((item) => {
      const date = new Date(item.dt * 1000)
      const dateKey = date.toISOString().split('T')[0]

      if (!dailyForecasts.has(dateKey)) {
        dailyForecasts.set(dateKey, [])
      }
      dailyForecasts.get(dateKey)!.push(item)
    })

    const forecasts: WeatherForecast[] = []

    dailyForecasts.forEach((items, dateKey) => {
      const temps = items.map((i) => i.main.temp)
      const precipProbs = items.map((i) => i.pop)
      const precip = items.reduce((sum, i) => sum + (i.rain?.['3h'] || 0), 0)

      forecasts.push({
        date: new Date(dateKey),
        tempMin: Math.min(...temps),
        tempMax: Math.max(...temps),
        tempAvg: temps.reduce((a, b) => a + b, 0) / temps.length,
        precipitation: precip,
        precipitationProbability: Math.max(...precipProbs),
        humidity: items[0].main.humidity,
        windSpeed: items[0].wind.speed * 3.6,
        windDirection: items[0].wind.deg,
        uvIndex: 0, // Needs premium API
        conditions: items[0].weather[0].main,
        icon: items[0].weather[0].icon,
      })
    })

    return forecasts.slice(0, 7)
  }

  /**
   * Analyze weather and generate alerts
   */
  async generateAlerts(lat: number, lon: number): Promise<WeatherAlert[]> {
    const forecasts = await this.getSevenDayForecast(lat, lon)
    const alerts: WeatherAlert[] = []

    forecasts.forEach((forecast, index) => {
      // Frost warning
      if (forecast.tempMin < 2) {
        alerts.push({
          id: `frost-${index}`,
          type: 'FROST',
          severity: forecast.tempMin < 0 ? 'HIGH' : 'MEDIUM',
          message: `Frostgefahr: Tiefsttemperatur ${forecast.tempMin.toFixed(1)}°C`,
          startsAt: forecast.date,
          endsAt: new Date(forecast.date.getTime() + 24 * 60 * 60 * 1000),
          recommendations: [
            'Bewässerung am Vorabend vermeiden',
            'Greens ggf. abdecken',
            'Morgens nicht betreten bis aufgetaut',
          ],
        })
      }

      // Heat warning
      if (forecast.tempMax > 32) {
        alerts.push({
          id: `heat-${index}`,
          type: 'HEAT',
          severity: forecast.tempMax > 35 ? 'HIGH' : 'MEDIUM',
          message: `Hitzewelle: Höchsttemperatur ${forecast.tempMax.toFixed(1)}°C`,
          startsAt: forecast.date,
          endsAt: new Date(forecast.date.getTime() + 24 * 60 * 60 * 1000),
          recommendations: [
            'Bewässerung erhöhen',
            'Mähen in frühen Morgenstunden',
            'Stress-Indikatoren überwachen',
          ],
        })
      }

      // Heavy rain warning
      if (forecast.precipitation > 20) {
        alerts.push({
          id: `rain-${index}`,
          type: 'HEAVY_RAIN',
          severity: forecast.precipitation > 40 ? 'HIGH' : 'MEDIUM',
          message: `Starkregen: ${forecast.precipitation.toFixed(1)}mm erwartet`,
          startsAt: forecast.date,
          endsAt: new Date(forecast.date.getTime() + 24 * 60 * 60 * 1000),
          recommendations: [
            'Bewässerung aussetzen',
            'Drainage überprüfen',
            'Keine Bodenarbeiten',
            'Erosionsgefährdete Bereiche sichern',
          ],
        })
      }
    })

    return alerts
  }

  /**
   * Generate task recommendations based on weather
   */
  async generateTaskRecommendations(
    lat: number,
    lon: number
  ): Promise<WeatherBasedRecommendation[]> {
    const forecasts = await this.getSevenDayForecast(lat, lon)
    const recommendations: WeatherBasedRecommendation[] = []

    // Check next 3 days
    const next3Days = forecasts.slice(0, 3)

    next3Days.forEach((forecast, index) => {
      // Heavy rain → cancel/reschedule outdoor tasks
      if (forecast.precipitation > 10 || forecast.precipitationProbability > 0.7) {
        recommendations.push({
          recommendationType: 'CANCEL_TASK',
          reason: `Regen erwartet: ${forecast.precipitation.toFixed(1)}mm (${(forecast.precipitationProbability * 100).toFixed(0)}% Wahrscheinlichkeit)`,
          priority: 'HIGH',
          suggestedAction: 'Verschiebe Außen-Arbeiten auf trockenen Tag',
          weatherCondition: forecast.conditions,
        })
      }

      // Optimal conditions for fertilization
      if (
        forecast.precipitation > 2 &&
        forecast.precipitation < 8 &&
        forecast.tempAvg > 10 &&
        forecast.tempAvg < 25
      ) {
        recommendations.push({
          recommendationType: 'CREATE_TASK',
          reason: 'Ideale Bedingungen für Düngung (leichter Regen erwartet)',
          priority: 'MEDIUM',
          suggestedAction: 'Düngen heute/morgen - Regen wäscht Dünger ein',
          weatherCondition: forecast.conditions,
        })
      }

      // Drought conditions
      if (index >= 5 && forecasts.slice(0, index).every((f) => f.precipitation < 2)) {
        recommendations.push({
          recommendationType: 'ADJUST_IRRIGATION',
          reason: `Keine Niederschläge in den letzten ${index} Tagen`,
          priority: 'HIGH',
          suggestedAction: 'Bewässerung erhöhen',
          weatherCondition: 'Trockenheit',
        })
      }

      // Frost → protect greens
      if (forecast.tempMin < 0) {
        recommendations.push({
          recommendationType: 'CREATE_TASK',
          reason: `Frost erwartet: ${forecast.tempMin.toFixed(1)}°C`,
          priority: 'HIGH',
          suggestedAction: 'Greens-Schutzmaßnahmen vorbereiten',
          weatherCondition: 'Frost',
        })
      }
    })

    return recommendations
  }

  /**
   * Calculate irrigation needs based on weather
   */
  async calculateIrrigationNeeds(
    lat: number,
    lon: number
  ): Promise<IrrigationRecommendation[]> {
    const current = await this.fetchCurrentWeather(lat, lon)
    const forecasts = await this.getSevenDayForecast(lat, lon)

    // Get all greens and high-priority areas
    const locations = await this.prisma.location.findMany({
      where: {
        type: {
          in: ['GREEN', 'TEE', 'FAIRWAY'],
        },
        active: true,
      },
    })

    const recommendations: IrrigationRecommendation[] = []

    // Simple ET-based calculation
    const dailyET = this.calculateET(current)
    const next3DaysPrecip = forecasts
      .slice(0, 3)
      .reduce((sum, f) => sum + f.precipitation, 0)

    locations.forEach((location) => {
      // Assume target moisture varies by type
      const targetMoisture = location.type === 'GREEN' ? 70 : 60 // %

      // Estimate water deficit
      const waterDeficit = dailyET * 3 - next3DaysPrecip // Next 3 days

      if (waterDeficit > 5) {
        recommendations.push({
          locationId: location.id,
          locationName: location.name,
          targetMoisture,
          recommendedAmount: waterDeficit,
          reason: `ET ${dailyET.toFixed(1)}mm/Tag, Niederschlag ${next3DaysPrecip.toFixed(1)}mm erwartet`,
          urgency: waterDeficit > 15 ? 'HIGH' : 'MEDIUM',
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        })
      }
    })

    return recommendations
  }

  /**
   * Simple Penman ET estimation
   * (In production, use more sophisticated models)
   */
  private calculateET(weather: OpenWeatherCurrentResponse): number {
    const temp = weather.main.temp
    const humidity = weather.main.humidity
    const windSpeed = weather.wind.speed

    // Simplified Penman formula (very rough approximation)
    // Real implementation should use solar radiation, day length, etc.
    const vaporPressureDeficit = (100 - humidity) / 100
    const windFactor = 1 + 0.1 * windSpeed

    const et = 0.5 * (temp / 20) * vaporPressureDeficit * windFactor

    return Math.max(0, et) // mm/day
  }

  /**
   * Get historical weather data
   */
  async getHistoricalData(days: number = 30): Promise<WeatherSnapshot[]> {
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)

    return this.prisma.weatherSnapshot.findMany({
      where: {
        recordedAt: {
          gte: fromDate,
        },
      },
      orderBy: {
        recordedAt: 'desc',
      },
    })
  }

  /**
   * Get weather statistics for period
   */
  async getWeatherStatistics(days: number = 30) {
    const snapshots = await this.getHistoricalData(days)

    if (snapshots.length === 0) {
      return null
    }

    const totalPrecip = snapshots.reduce((sum, s) => sum + (s.precipitation || 0), 0)
    const avgTemp =
      snapshots.reduce((sum, s) => sum + (s.tempAvg || 0), 0) / snapshots.length
    const totalET = snapshots.reduce((sum, s) => sum + (s.et || 0), 0)

    return {
      period: {
        from: snapshots[snapshots.length - 1].recordedAt,
        to: snapshots[0].recordedAt,
        days: snapshots.length,
      },
      precipitation: {
        total: totalPrecip,
        average: totalPrecip / snapshots.length,
      },
      temperature: {
        average: avgTemp,
        min: Math.min(...snapshots.map((s) => s.tempMin || 999)),
        max: Math.max(...snapshots.map((s) => s.tempMax || -999)),
      },
      evapotranspiration: {
        total: totalET,
        average: totalET / snapshots.length,
      },
      waterBalance: totalPrecip - totalET,
    }
  }
}
