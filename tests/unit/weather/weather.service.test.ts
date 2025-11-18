/**
 * Weather Service - Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WeatherService } from '@/modules/weather/application/weather.service'
import { WeatherRepository } from '@/modules/weather/infrastructure/weather.repository'

describe('Weather Service', () => {
  let weatherService: WeatherService
  let mockRepository: any

  beforeEach(() => {
    mockRepository = {
      save: vi.fn(),
      findLatest: vi.fn(),
      findByDateRange: vi.fn(),
    }
    weatherService = new WeatherService(mockRepository)
  })

  describe('Record Weather', () => {
    it('should record manual weather snapshot', async () => {
      const data = {
        temperature: 22.5,
        humidity: 65,
        precipitation: 0,
        windSpeed: 12,
        windDirection: 'NW',
        source: 'MANUAL' as const,
      }

      mockRepository.save.mockResolvedValue(undefined)

      await weatherService.recordWeather(data)

      expect(mockRepository.save).toHaveBeenCalled()
      const savedSnapshot = mockRepository.save.mock.calls[0][0]
      expect(savedSnapshot.temperature).toBe(22.5)
      expect(savedSnapshot.source).toBe('MANUAL')
    })

    it('should calculate evapotranspiration', async () => {
      const data = {
        temperature: 28,
        humidity: 50,
        windSpeed: 15,
        source: 'MANUAL' as const,
      }

      mockRepository.save.mockResolvedValue(undefined)

      await weatherService.recordWeather(data)

      const savedSnapshot = mockRepository.save.mock.calls[0][0]
      expect(savedSnapshot.evapotranspiration).toBeDefined()
      expect(savedSnapshot.evapotranspiration).toBeGreaterThan(0)
    })
  })

  describe('Irrigation Recommendation', () => {
    it('should recommend irrigation on hot dry day', () => {
      const recommendation = weatherService.getIrrigationRecommendation({
        temperature: 32,
        humidity: 30,
        precipitation: 0,
        evapotranspiration: 8,
      })

      expect(recommendation.shouldIrrigate).toBe(true)
      expect(recommendation.reason).toContain('High temperature')
    })

    it('should not recommend irrigation after recent rain', () => {
      const recommendation = weatherService.getIrrigationRecommendation({
        temperature: 22,
        humidity: 80,
        precipitation: 15,
        evapotranspiration: 3,
      })

      expect(recommendation.shouldIrrigate).toBe(false)
      expect(recommendation.reason).toContain('precipitation')
    })
  })
})
