/**
 * Computer Vision Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ComputerVisionService } from '@/modules/vision/services/computer-vision-service'
import { createMockPrismaClient } from '../utils/test-helpers'

describe('ComputerVisionService', () => {
  let service: ComputerVisionService
  let mockPrisma: any

  beforeEach(() => {
    mockPrisma = createMockPrismaClient()
    service = new ComputerVisionService(mockPrisma)
  })

  describe('analyzeImage', () => {
    it('should analyze image and return quality scores', async () => {
      const result = await service.analyzeImage(
        'https://example.com/image.jpg',
        'location-123',
        'TURF_QUALITY',
        'user-123'
      )

      expect(result).toBeDefined()
      expect(result.overallQuality).toBeGreaterThanOrEqual(0)
      expect(result.overallQuality).toBeLessThanOrEqual(100)
      expect(result.color).toBeDefined()
      expect(result.density).toBeDefined()
      expect(result.uniformity).toBeDefined()
    })

    it('should detect diseases when present', async () => {
      const result = await service.analyzeImage(
        'https://example.com/diseased.jpg',
        'location-123',
        'DISEASE_DETECTION',
        'user-123'
      )

      expect(result.diseases).toBeDefined()
      expect(Array.isArray(result.diseases)).toBe(true)
    })

    it('should provide stress indicators', async () => {
      const result = await service.analyzeImage(
        'https://example.com/stress.jpg',
        'location-123',
        'STRESS_ANALYSIS',
        'user-123'
      )

      expect(result.stressIndicators).toBeDefined()
      expect(result.stressIndicators.drought).toBeDefined()
      expect(result.stressIndicators.heat).toBeDefined()
      expect(result.stressIndicators.compaction).toBeDefined()
      expect(result.stressIndicators.nutrientDeficiency).toBeDefined()
    })

    it('should generate AI recommendations', async () => {
      const result = await service.analyzeImage(
        'https://example.com/image.jpg',
        'location-123',
        'OVERALL_CONDITION',
        'user-123'
      )

      expect(result.recommendations).toBeDefined()
      expect(Array.isArray(result.recommendations)).toBe(true)
      expect(result.recommendations.length).toBeGreaterThan(0)
    })

    it('should include AI summary', async () => {
      const result = await service.analyzeImage(
        'https://example.com/image.jpg',
        'location-123',
        'OVERALL_CONDITION',
        'user-123'
      )

      expect(result.aiSummary).toBeDefined()
      expect(typeof result.aiSummary).toBe('string')
      expect(result.aiSummary.length).toBeGreaterThan(0)
    })
  })

  describe('getGreenHealthAnalysis', () => {
    it('should return 30-day health trend', async () => {
      mockPrisma.imageAnalysis.findMany.mockResolvedValue([
        {
          id: '1',
          locationId: 'location-123',
          overallQuality: 85,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          id: '2',
          locationId: 'location-123',
          overallQuality: 88,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
      ])

      const result = await service.getGreenHealthAnalysis('location-123')

      expect(result).toBeDefined()
      expect(result.locationId).toBe('location-123')
      expect(result.averageQuality).toBeDefined()
      expect(result.trend).toBeDefined()
      expect(Array.isArray(result.recentAnalyses)).toBe(true)
    })

    it('should identify issues from analyses', async () => {
      mockPrisma.imageAnalysis.findMany.mockResolvedValue([
        {
          id: '1',
          locationId: 'location-123',
          overallQuality: 85,
          diseases: [{ type: 'DOLLAR_SPOT', confidence: 75 }],
          createdAt: new Date(),
        },
      ])

      const result = await service.getGreenHealthAnalysis('location-123')

      expect(result.issues).toBeDefined()
      expect(Array.isArray(result.issues)).toBe(true)
    })
  })

  describe('batchAnalyze', () => {
    it('should analyze multiple images', async () => {
      const images = [
        { imageUrl: 'https://example.com/1.jpg', locationId: 'loc-1' },
        { imageUrl: 'https://example.com/2.jpg', locationId: 'loc-2' },
        { imageUrl: 'https://example.com/3.jpg', locationId: 'loc-3' },
      ]

      const results = await service.batchAnalyze(images, 'user-123')

      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBe(3)
      results.forEach((result) => {
        expect(result.overallQuality).toBeDefined()
      })
    })
  })
})
