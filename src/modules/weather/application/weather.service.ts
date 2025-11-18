/**
 * Weather Service
 */

import { WeatherRepository } from '../infrastructure/weather.repository'

export interface RecordWeatherDTO {
  temperature?: number
  humidity?: number
  precipitation?: number
  windSpeed?: number
  windDirection?: string
  source: 'API' | 'MANUAL' | 'STATION'
}

export interface IrrigationRecommendation {
  shouldIrrigate: boolean
  reason: string
  estimatedAmount?: number // mm
}

export class WeatherService {
  constructor(private repository: WeatherRepository) {}

  async recordWeather(dto: RecordWeatherDTO): Promise<any> {
    // Calculate ET (simple Penman-Monteith approximation)
    let et: number | undefined
    if (dto.temperature !== undefined && dto.humidity !== undefined) {
      et = this.calculateET(dto.temperature, dto.humidity, dto.windSpeed)
    }

    const snapshot = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      temperature: dto.temperature,
      humidity: dto.humidity,
      precipitation: dto.precipitation,
      windSpeed: dto.windSpeed,
      windDirection: dto.windDirection,
      evapotranspiration: et,
      source: dto.source,
    }

    await this.repository.save(snapshot)
    return snapshot
  }

  async getLatestWeather(): Promise<any> {
    return this.repository.findLatest()
  }

  async getWeatherHistory(dateFrom: Date, dateTo: Date): Promise<any[]> {
    return this.repository.findByDateRange(dateFrom, dateTo)
  }

  /**
   * Calculate reference evapotranspiration (simplified)
   */
  private calculateET(temp: number, humidity: number, windSpeed: number = 2): number {
    // Simplified Penman-Monteith for daily ET (mm/day)
    // In production, use proper meteorological formulas
    const vpd = this.calculateVPD(temp, humidity) // Vapor Pressure Deficit
    const et = (0.408 * vpd * (temp + 15) / 100) + (windSpeed * 0.05)
    return Math.round(et * 10) / 10
  }

  private calculateVPD(temp: number, humidity: number): number {
    const es = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3))
    const ea = (humidity / 100) * es
    return es - ea
  }

  /**
   * Get irrigation recommendation based on weather
   */
  getIrrigationRecommendation(conditions: {
    temperature?: number
    humidity?: number
    precipitation?: number
    evapotranspiration?: number
  }): IrrigationRecommendation {
    const { temperature, humidity, precipitation, evapotranspiration } = conditions

    // Rule 1: Recent precipitation
    if (precipitation !== undefined && precipitation > 5) {
      return {
        shouldIrrigate: false,
        reason: 'Recent precipitation sufficient',
      }
    }

    // Rule 2: High temperature and low humidity
    if (temperature !== undefined && temperature > 30 && humidity !== undefined && humidity < 40) {
      return {
        shouldIrrigate: true,
        reason: 'High temperature and low humidity detected',
        estimatedAmount: 8,
      }
    }

    // Rule 3: High evapotranspiration
    if (evapotranspiration !== undefined && evapotranspiration > 6) {
      return {
        shouldIrrigate: true,
        reason: 'High evapotranspiration rate',
        estimatedAmount: Math.ceil(evapotranspiration),
      }
    }

    // Rule 4: Moderate conditions
    if (temperature !== undefined && temperature > 25 && (precipitation === undefined || precipitation === 0)) {
      return {
        shouldIrrigate: true,
        reason: 'Warm weather with no recent rain',
        estimatedAmount: 5,
      }
    }

    return {
      shouldIrrigate: false,
      reason: 'Current conditions adequate',
    }
  }
}
