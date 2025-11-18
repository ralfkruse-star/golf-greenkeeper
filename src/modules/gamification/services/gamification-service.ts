/**
 * Gamification Service
 * Manage achievements, leaderboards, and challenges
 */

import {
  Achievement,
  AchievementCategory,
  AchievementTier,
  UserAchievement,
  Leaderboard,
  LeaderboardEntry,
  Challenge,
  GamificationStats,
} from '../types'

export class GamificationService {
  constructor(private prisma: any) {}

  /**
   * Initialize default achievements
   */
  private getDefaultAchievements(): Achievement[] {
    return [
      // Task-based achievements
      {
        id: 'ach_first_task',
        code: 'FIRST_TASK',
        name: 'Getting Started',
        description: 'Complete your first task',
        category: AchievementCategory.TASKS,
        tier: AchievementTier.BRONZE,
        icon: '🌱',
        points: 10,
        criteria: { type: 'TASK_COUNT', threshold: 1 },
        secret: false,
        createdAt: new Date(),
      },
      {
        id: 'ach_task_master',
        code: 'TASK_MASTER',
        name: 'Task Master',
        description: 'Complete 100 tasks',
        category: AchievementCategory.TASKS,
        tier: AchievementTier.GOLD,
        icon: '⭐',
        points: 100,
        criteria: { type: 'TASK_COUNT', threshold: 100 },
        secret: false,
        createdAt: new Date(),
      },
      {
        id: 'ach_perfect_week',
        code: 'PERFECT_WEEK',
        name: 'Perfect Week',
        description: 'Complete all assigned tasks for 7 consecutive days',
        category: AchievementCategory.EFFICIENCY,
        tier: AchievementTier.SILVER,
        icon: '🔥',
        points: 50,
        criteria: { type: 'STREAK_DAYS', threshold: 7 },
        secret: false,
        createdAt: new Date(),
      },
      // Quality-based achievements
      {
        id: 'ach_quality_inspector',
        code: 'QUALITY_INSPECTOR',
        name: 'Quality Inspector',
        description: 'Achieve 95%+ quality score on 10 inspections',
        category: AchievementCategory.QUALITY,
        tier: AchievementTier.SILVER,
        icon: '🔍',
        points: 75,
        criteria: { type: 'QUALITY_SCORE', threshold: 95 },
        secret: false,
        createdAt: new Date(),
      },
      {
        id: 'ach_green_perfection',
        code: 'GREEN_PERFECTION',
        name: 'Green Perfection',
        description: 'Maintain all greens at 90%+ health for a month',
        category: AchievementCategory.QUALITY,
        tier: AchievementTier.PLATINUM,
        icon: '💎',
        points: 200,
        criteria: { type: 'QUALITY_SCORE', threshold: 90, timeframe: 'MONTH' },
        secret: false,
        createdAt: new Date(),
      },
      // Sustainability achievements
      {
        id: 'ach_water_saver',
        code: 'WATER_SAVER',
        name: 'Water Saver',
        description: 'Reduce water usage by 20% compared to previous month',
        category: AchievementCategory.SUSTAINABILITY,
        tier: AchievementTier.GOLD,
        icon: '💧',
        points: 150,
        criteria: { type: 'SPECIAL', threshold: 20 },
        secret: false,
        createdAt: new Date(),
      },
      {
        id: 'ach_carbon_neutral',
        code: 'CARBON_NEUTRAL',
        name: 'Carbon Neutral',
        description: 'Achieve carbon-neutral operations for a quarter',
        category: AchievementCategory.SUSTAINABILITY,
        tier: AchievementTier.PLATINUM,
        icon: '🌍',
        points: 250,
        criteria: { type: 'SPECIAL', threshold: 1 },
        secret: true,
        createdAt: new Date(),
      },
      // Teamwork achievements
      {
        id: 'ach_team_player',
        code: 'TEAM_PLAYER',
        name: 'Team Player',
        description: 'Help colleagues complete 20 tasks',
        category: AchievementCategory.TEAMWORK,
        tier: AchievementTier.SILVER,
        icon: '🤝',
        points: 60,
        criteria: { type: 'TASK_COUNT', threshold: 20 },
        secret: false,
        createdAt: new Date(),
      },
    ]
  }

  /**
   * Get all achievements
   */
  async getAllAchievements(): Promise<Achievement[]> {
    // In production: fetch from database
    return this.getDefaultAchievements()
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    // In production: fetch from database
    // Simulated data
    const achievements = this.getDefaultAchievements()
    return [
      {
        id: '1',
        userId,
        achievementId: achievements[0].id,
        achievement: achievements[0],
        unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        progress: 100,
      },
      {
        id: '2',
        userId,
        achievementId: achievements[1].id,
        achievement: achievements[1],
        unlockedAt: new Date(),
        progress: 45,
      },
    ]
  }

  /**
   * Check and unlock achievements for user
   */
  async checkAchievements(userId: string): Promise<UserAchievement[]> {
    // Get user stats
    const stats = await this.getUserStats(userId)
    const achievements = this.getDefaultAchievements()
    const newlyUnlocked: UserAchievement[] = []

    for (const achievement of achievements) {
      const hasAchievement = await this.hasAchievement(userId, achievement.id)
      if (hasAchievement) continue

      let shouldUnlock = false

      switch (achievement.criteria.type) {
        case 'TASK_COUNT':
          shouldUnlock = stats.tasksCompleted >= achievement.criteria.threshold
          break
        case 'QUALITY_SCORE':
          shouldUnlock = stats.averageQuality >= achievement.criteria.threshold
          break
        case 'STREAK_DAYS':
          shouldUnlock = stats.currentStreak >= achievement.criteria.threshold
          break
      }

      if (shouldUnlock) {
        const userAchievement = await this.unlockAchievement(userId, achievement.id)
        newlyUnlocked.push(userAchievement)
      }
    }

    return newlyUnlocked
  }

  /**
   * Unlock achievement for user
   */
  private async unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    // In production: create in database
    const achievement = this.getDefaultAchievements().find((a) => a.id === achievementId)
    return {
      id: this.generateId(),
      userId,
      achievementId,
      achievement,
      unlockedAt: new Date(),
      progress: 100,
    }
  }

  /**
   * Check if user has achievement
   */
  private async hasAchievement(userId: string, achievementId: string): Promise<boolean> {
    // In production: query database
    return false
  }

  /**
   * Get user statistics
   */
  private async getUserStats(
    userId: string
  ): Promise<{ tasksCompleted: number; averageQuality: number; currentStreak: number }> {
    // In production: calculate from database
    return {
      tasksCompleted: 45,
      averageQuality: 92,
      currentStreak: 5,
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL_TIME',
    category?: AchievementCategory,
    tenantId?: string
  ): Promise<Leaderboard> {
    // In production: query database with proper filtering and ranking

    // Simulated leaderboard data
    const entries: LeaderboardEntry[] = [
      {
        rank: 1,
        userId: 'user1',
        userName: 'Max Mustermann',
        avatar: undefined,
        score: 1250,
        achievementCount: 12,
        badges: [AchievementTier.PLATINUM, AchievementTier.GOLD],
        trend: 'UP',
      },
      {
        rank: 2,
        userId: 'user2',
        userName: 'Anna Schmidt',
        score: 1180,
        achievementCount: 10,
        badges: [AchievementTier.GOLD],
        trend: 'STABLE',
      },
      {
        rank: 3,
        userId: 'user3',
        userName: 'Tom Weber',
        score: 950,
        achievementCount: 8,
        badges: [AchievementTier.SILVER, AchievementTier.BRONZE],
        trend: 'DOWN',
      },
      {
        rank: 4,
        userId: 'user4',
        userName: 'Lisa Müller',
        score: 890,
        achievementCount: 7,
        badges: [AchievementTier.SILVER],
        trend: 'UP',
      },
      {
        rank: 5,
        userId: 'user5',
        userName: 'Jan Schneider',
        score: 780,
        achievementCount: 6,
        badges: [AchievementTier.BRONZE],
        trend: 'UP',
      },
    ]

    return {
      period,
      category,
      entries,
      currentUser: entries[2], // Simulated current user
      generatedAt: new Date(),
    }
  }

  /**
   * Get active challenges
   */
  async getActiveChallenges(tenantId: string): Promise<Challenge[]> {
    // Simulated challenges
    const now = new Date()
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    return [
      {
        id: 'chal_weekly_tasks',
        title: 'Weekly Task Sprint',
        description: 'Complete 50 tasks as a team this week',
        category: AchievementCategory.TASKS,
        startDate: now,
        endDate: weekEnd,
        active: true,
        rewards: {
          points: 100,
        },
        criteria: {
          type: 'TEAM_GOAL',
          target: 50,
          metric: 'tasks_completed',
        },
        participants: 8,
        progress: 32,
      },
      {
        id: 'chal_green_quality',
        title: 'Green Quality Challenge',
        description: 'Maintain all greens above 85% health score',
        category: AchievementCategory.QUALITY,
        startDate: now,
        endDate: monthEnd,
        active: true,
        rewards: {
          points: 200,
          achievementId: 'ach_green_perfection',
        },
        criteria: {
          type: 'QUALITY_TARGET',
          target: 85,
          metric: 'green_health_score',
        },
        participants: 12,
        progress: 78,
      },
      {
        id: 'chal_water_reduction',
        title: 'Water Conservation Month',
        description: 'Reduce water usage by 15% compared to last month',
        category: AchievementCategory.SUSTAINABILITY,
        startDate: now,
        endDate: monthEnd,
        active: true,
        rewards: {
          points: 250,
          achievementId: 'ach_water_saver',
        },
        criteria: {
          type: 'SUSTAINABILITY_GOAL',
          target: 15,
          metric: 'water_reduction_percent',
        },
        participants: 15,
        progress: 9,
      },
    ]
  }

  /**
   * Get user gamification stats
   */
  async getUserGamificationStats(userId: string): Promise<GamificationStats> {
    const achievements = await this.getUserAchievements(userId)
    const totalPoints = achievements
      .filter((a) => a.progress === 100)
      .reduce((sum, a) => sum + (a.achievement?.points || 0), 0)

    const level = Math.floor(totalPoints / 100) + 1
    const nextLevelPoints = level * 100

    return {
      totalPoints,
      level,
      nextLevelPoints,
      achievementCount: achievements.filter((a) => a.progress === 100).length,
      completedChallenges: 3,
      currentStreak: 5,
      longestStreak: 14,
      rank: {
        daily: 3,
        weekly: 2,
        monthly: 4,
        allTime: 8,
      },
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
