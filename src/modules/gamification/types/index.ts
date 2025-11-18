/**
 * Gamification Types
 * Achievements, Leaderboards, and Challenges
 */

export enum AchievementCategory {
  TASKS = 'TASKS',
  QUALITY = 'QUALITY',
  EFFICIENCY = 'EFFICIENCY',
  SUSTAINABILITY = 'SUSTAINABILITY',
  LEARNING = 'LEARNING',
  TEAMWORK = 'TEAMWORK',
}

export enum AchievementTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

export interface Achievement {
  id: string
  code: string
  name: string
  description: string
  category: AchievementCategory
  tier: AchievementTier
  icon: string
  points: number
  criteria: {
    type: 'TASK_COUNT' | 'QUALITY_SCORE' | 'STREAK_DAYS' | 'SPECIAL'
    threshold: number
    timeframe?: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'ALL_TIME'
  }
  secret: boolean // Hidden until unlocked
  createdAt: Date
}

export interface UserAchievement {
  id: string
  userId: string
  achievementId: string
  achievement?: Achievement
  unlockedAt: Date
  progress: number // 0-100
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  avatar?: string
  score: number
  achievementCount: number
  badges: AchievementTier[]
  trend: 'UP' | 'DOWN' | 'STABLE'
}

export interface Leaderboard {
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL_TIME'
  category?: AchievementCategory
  entries: LeaderboardEntry[]
  currentUser?: LeaderboardEntry
  generatedAt: Date
}

export interface Challenge {
  id: string
  title: string
  description: string
  category: AchievementCategory
  startDate: Date
  endDate: Date
  active: boolean
  rewards: {
    points: number
    achievementId?: string
  }
  criteria: {
    type: 'COMPLETE_TASKS' | 'TEAM_GOAL' | 'QUALITY_TARGET' | 'SUSTAINABILITY_GOAL'
    target: number
    metric: string
  }
  participants: number
  progress?: number // For current user
}

export interface GamificationStats {
  totalPoints: number
  level: number
  nextLevelPoints: number
  achievementCount: number
  completedChallenges: number
  currentStreak: number
  longestStreak: number
  rank: {
    daily: number
    weekly: number
    monthly: number
    allTime: number
  }
}
