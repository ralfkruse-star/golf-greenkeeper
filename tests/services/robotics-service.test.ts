/**
 * Robotics Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RoboticsService } from '@/modules/robotics/services/robotics-service'
import { createMockPrismaClient, createMockRobot } from '../utils/test-helpers'

describe('RoboticsService', () => {
  let service: RoboticsService
  let mockPrisma: any

  beforeEach(() => {
    mockPrisma = createMockPrismaClient()
    service = new RoboticsService(mockPrisma)
  })

  describe('getFleetStatus', () => {
    it('should return fleet overview', async () => {
      const status = await service.getFleetStatus('tenant-123')

      expect(status).toBeDefined()
      expect(status.totalRobots).toBeGreaterThanOrEqual(0)
      expect(status.activeRobots).toBeGreaterThanOrEqual(0)
      expect(status.chargingRobots).toBeGreaterThanOrEqual(0)
      expect(status.idleRobots).toBeGreaterThanOrEqual(0)
      expect(Array.isArray(status.robots)).toBe(true)
      expect(Array.isArray(status.missions)).toBe(true)
    })

    it('should calculate area covered today', async () => {
      const status = await service.getFleetStatus('tenant-123')

      expect(status.areaCoveredToday).toBeDefined()
      expect(typeof status.areaCoveredToday).toBe('number')
    })

    it('should track completed missions today', async () => {
      const status = await service.getFleetStatus('tenant-123')

      expect(status.completedToday).toBeDefined()
      expect(typeof status.completedToday).toBe('number')
    })
  })

  describe('createMission', () => {
    it('should create new mission', async () => {
      const plan = {
        locationId: 'location-123',
        type: 'MOWING' as const,
        scheduledStart: new Date(),
        estimatedDuration: 60,
        parameters: {
          cuttingHeight: 3.5,
          speed: 0.4,
          pattern: 'STRIPE' as const,
        },
      }

      const mission = await service.createMission(plan, 'user-123')

      expect(mission).toBeDefined()
      expect(mission.id).toBeDefined()
      expect(mission.robotId).toBeDefined()
      expect(mission.type).toBe('MOWING')
      expect(mission.status).toBe('PENDING')
    })

    it('should throw error if no robot available', async () => {
      // Mock no robots available
      vi.spyOn(service as any, 'findBestRobot').mockResolvedValue(null)

      const plan = {
        locationId: 'location-123',
        type: 'MOWING' as const,
        scheduledStart: new Date(),
        estimatedDuration: 60,
        parameters: {},
      }

      await expect(service.createMission(plan, 'user-123')).rejects.toThrow(
        'No available robot for mission'
      )
    })
  })

  describe('startMission', () => {
    it('should start pending mission', async () => {
      vi.spyOn(service as any, 'getMissionById').mockResolvedValue({
        id: 'mission-123',
        status: 'PENDING',
      })

      const mission = await service.startMission('mission-123')

      expect(mission.status).toBe('IN_PROGRESS')
      expect(mission.actualStart).toBeDefined()
    })

    it('should not start non-pending mission', async () => {
      vi.spyOn(service as any, 'getMissionById').mockResolvedValue({
        id: 'mission-123',
        status: 'COMPLETED',
      })

      await expect(service.startMission('mission-123')).rejects.toThrow(
        'Cannot start mission in status: COMPLETED'
      )
    })
  })

  describe('updateMissionProgress', () => {
    it('should update progress', async () => {
      vi.spyOn(service as any, 'getMissionById').mockResolvedValue({
        id: 'mission-123',
        status: 'IN_PROGRESS',
        area: 1000,
      })

      const mission = await service.updateMissionProgress('mission-123', 50, 500)

      expect(mission.progress).toBe(50)
      expect(mission.distanceCovered).toBe(500)
    })

    it('should auto-complete at 100% progress', async () => {
      vi.spyOn(service as any, 'getMissionById').mockResolvedValue({
        id: 'mission-123',
        status: 'IN_PROGRESS',
        area: 1000,
        actualStart: new Date(Date.now() - 60 * 60 * 1000),
      })

      const mission = await service.updateMissionProgress('mission-123', 100, 1000)

      expect(mission.status).toBe('COMPLETED')
      expect(mission.actualEnd).toBeDefined()
      expect(mission.results).toBeDefined()
    })
  })

  describe('cancelMission', () => {
    it('should cancel mission', async () => {
      vi.spyOn(service as any, 'getMissionById').mockResolvedValue({
        id: 'mission-123',
        status: 'IN_PROGRESS',
      })

      const mission = await service.cancelMission('mission-123', 'Weather')

      expect(mission.status).toBe('CANCELLED')
      expect(mission.actualEnd).toBeDefined()
    })
  })

  describe('processTelemetry', () => {
    it('should process robot telemetry', async () => {
      const telemetry = {
        robotId: 'robot-123',
        timestamp: new Date(),
        position: { latitude: 51.5, longitude: -0.1, heading: 90 },
        batteryLevel: 85,
        speed: 0.4,
        status: 'ACTIVE' as const,
      }

      await expect(service.processTelemetry(telemetry)).resolves.not.toThrow()
    })
  })
})
