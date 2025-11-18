/**
 * Gamification Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GamificationService } from '@/modules/gamification/services/gamification-service'
import { createMockPrismaClient } from '../utils/test-helpers'

describe('GamificationService', () => {
  let service: GamificationService
  let mockPrisma: any

  beforeEach(() => {
    mockPrisma = createMockPrismaClient()
    service = new GamificationService(mockPrisma)
  })

  describe('getAllAchievements', () => {
    it('should return all available achievements', async () => {
      const achievements = await service.getAllAchievements()

      expect(Array.isArray(achievements)).toBe(true)
      expect(achievements.length).toBeGreaterThan(0)

      achievements.forEach((achievement) => {
        expect(achievement.id).toBeDefined()
        expect(achievement.name).toBeDefined()
        expect(achievement.points).toBeGreaterThan(0)
        expect(achievement.criteria).toBeDefined()
      })
    })

    it('should include different tiers', async () => {
      const achievements = await service.getAllAchievements()
      const tiers = [...new Set(achievements.map((a) => a.tier))]

      expect(tiers.length).toBeGreaterThan(1)
      expect(tiers).toContain('BRONZE')
    })
  })

  describe('getUserAchievements', () => {
    it('should return user achievements', async () => {
      const achievements = await service.getUserAchievements('user-123')

      expect(Array.isArray(achievements)).toBe(true)
      achievements.forEach((achievement) => {
        expect(achievement.userId).toBe('user-123')
        expect(achievement.achievementId).toBeDefined()
        expect(achievement.progress).toBeGreaterThanOrEqual(0)
        expect(achievement.progress).toBeLessThanOrEqual(100)
      })
    })
  })

  describe('checkAchievements', () => {
    it('should unlock achievements when criteria met', async () => {
      vi.spyOn(service as any, 'getUserStats').mockResolvedValue({
        tasksCompleted: 1,
        averageQuality: 95,
        currentStreak: 1,
      })

      vi.spyOn(service as any, 'hasAchievement').mockResolvedValue(false)

      const unlocked = await service.checkAchievements('user-123')

      expect(Array.isArray(unlocked)).toBe(true)
      expect(unlocked.length).toBeGreaterThan(0)
    })

    it('should not unlock already earned achievements', async () => {
      vi.spyOn(service as any, 'getUserStats').mockResolvedValue({
        tasksCompleted: 100,
        averageQuality: 95,
        currentStreak: 7,
      })

      vi.spyOn(service as any, 'hasAchievement').mockResolvedValue(true)

      const unlocked = await service.checkAchievements('user-123')

      expect(unlocked.length).toBe(0)
    })
  })

  describe('getLeaderboard', () => {
    it('should return leaderboard for period', async () => {
      const leaderboard = await service.getLeaderboard('WEEKLY')

      expect(leaderboard).toBeDefined()
      expect(leaderboard.period).toBe('WEEKLY')
      expect(Array.isArray(leaderboard.entries)).toBe(true)
      expect(leaderboard.generatedAt).toBeDefined()
    })

    it('should rank users by score', async () => {
      const leaderboard = await service.getLeaderboard('ALL_TIME')

      expect(leaderboard.entries.length).toBeGreaterThan(0)

      for (let i = 0; i < leaderboard.entries.length - 1; i++) {
        expect(leaderboard.entries[i].score).toBeGreaterThanOrEqual(
          leaderboard.entries[i + 1].score
        )
      }
    })

    it('should include current user position', async () => {
      const leaderboard = await service.getLeaderboard('MONTHLY')

      expect(leaderboard.currentUser).toBeDefined()
      expect(leaderboard.currentUser?.rank).toBeGreaterThan(0)
    })
  })

  describe('getActiveChallenges', () => {
    it('should return active challenges', async () => {
      const challenges = await service.getActiveChallenges('tenant-123')

      expect(Array.isArray(challenges)).toBe(true)
      challenges.forEach((challenge) => {
        expect(challenge.active).toBe(true)
        expect(challenge.endDate).toBeInstanceOf(Date)
        expect(challenge.endDate.getTime()).toBeGreaterThan(Date.now())
      })
    })

    it('should include progress for user challenges', async () => {
      const challenges = await service.getActiveChallenges('tenant-123')

      challenges.forEach((challenge) => {
        if (challenge.progress !== undefined) {
          expect(challenge.progress).toBeGreaterThanOrEqual(0)
          expect(challenge.progress).toBeLessThanOrEqual(100)
        }
      })
    })
  })

  describe('getUserGamificationStats', () => {
    it('should calculate user stats', async () => {
      const stats = await service.getUserGamificationStats('user-123')

      expect(stats).toBeDefined()
      expect(stats.totalPoints).toBeGreaterThanOrEqual(0)
      expect(stats.level).toBeGreaterThan(0)
      expect(stats.achievementCount).toBeGreaterThanOrEqual(0)
      expect(stats.currentStreak).toBeGreaterThanOrEqual(0)
    })

    it('should calculate correct level from points', async () => {
      const stats = await service.getUserGamificationStats('user-123')

      const expectedLevel = Math.floor(stats.totalPoints / 100) + 1
      expect(stats.level).toBe(expectedLevel)
    })

    it('should include rank across all periods', async () => {
      const stats = await service.getUserGamificationStats('user-123')

      expect(stats.rank).toBeDefined()
      expect(stats.rank.daily).toBeGreaterThan(0)
      expect(stats.rank.weekly).toBeGreaterThan(0)
      expect(stats.rank.monthly).toBeGreaterThan(0)
      expect(stats.rank.allTime).toBeGreaterThan(0)
    })
  })
})
