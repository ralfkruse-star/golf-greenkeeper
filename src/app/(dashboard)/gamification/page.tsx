/**
 * Gamification Page
 * Achievements, leaderboards, and challenges
 */

'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function GamificationPage() {
  const [selectedTab, setSelectedTab] = useState<'achievements' | 'leaderboard' | 'challenges'>('achievements')

  const userStats = {
    level: 12,
    totalPoints: 1150,
    nextLevelPoints: 1200,
    achievementCount: 8,
    rank: { weekly: 3, monthly: 5, allTime: 12 },
    currentStreak: 5,
  }

  const achievements = [
    {
      id: '1',
      name: 'Getting Started',
      description: 'Complete your first task',
      tier: 'BRONZE',
      icon: '🌱',
      points: 10,
      unlocked: true,
      unlockedAt: '2 weeks ago',
      progress: 100,
    },
    {
      id: '2',
      name: 'Task Master',
      description: 'Complete 100 tasks',
      tier: 'GOLD',
      icon: '⭐',
      points: 100,
      unlocked: false,
      progress: 45,
    },
    {
      id: '3',
      name: 'Perfect Week',
      description: 'Complete all assigned tasks for 7 consecutive days',
      tier: 'SILVER',
      icon: '🔥',
      points: 50,
      unlocked: false,
      progress: 71,
    },
    {
      id: '4',
      name: 'Quality Inspector',
      description: 'Achieve 95%+ quality score on 10 inspections',
      tier: 'SILVER',
      icon: '🔍',
      points: 75,
      unlocked: true,
      unlockedAt: '1 week ago',
      progress: 100,
    },
    {
      id: '5',
      name: 'Water Saver',
      description: 'Reduce water usage by 20%',
      tier: 'GOLD',
      icon: '💧',
      points: 150,
      unlocked: false,
      progress: 15,
    },
    {
      id: '6',
      name: 'Green Perfection',
      description: 'Maintain all greens at 90%+ health for a month',
      tier: 'PLATINUM',
      icon: '💎',
      points: 200,
      unlocked: false,
      progress: 0,
      secret: true,
    },
  ]

  const leaderboard = [
    { rank: 1, name: 'Max Mustermann', score: 1250, badges: ['PLATINUM', 'GOLD'], trend: 'UP' },
    { rank: 2, name: 'Anna Schmidt', score: 1180, badges: ['GOLD'], trend: 'STABLE' },
    { rank: 3, name: 'Tom Weber', score: 950, badges: ['SILVER'], trend: 'DOWN', isCurrentUser: true },
    { rank: 4, name: 'Lisa Müller', score: 890, badges: ['SILVER'], trend: 'UP' },
    { rank: 5, name: 'Jan Schneider', score: 780, badges: ['BRONZE'], trend: 'UP' },
  ]

  const challenges = [
    {
      id: '1',
      title: 'Weekly Task Sprint',
      description: 'Complete 50 tasks as a team this week',
      type: 'TEAM_GOAL',
      progress: 64,
      target: 50,
      reward: 100,
      endDate: '2 days',
      participants: 8,
    },
    {
      id: '2',
      title: 'Green Quality Challenge',
      description: 'Maintain all greens above 85% health',
      type: 'QUALITY_TARGET',
      progress: 78,
      target: 85,
      reward: 200,
      endDate: '15 days',
      participants: 12,
    },
  ]

  const getTierColor = (tier: string) => {
    const colors = {
      BRONZE: 'bg-orange-100 text-orange-800',
      SILVER: 'bg-gray-100 text-gray-800',
      GOLD: 'bg-yellow-100 text-yellow-800',
      PLATINUM: 'bg-purple-100 text-purple-800',
    }
    return colors[tier as keyof typeof colors] || colors.BRONZE
  }

  const progressPercent = (userStats.totalPoints % 100)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gamification</h1>
          <p className="text-gray-600 mt-1">Achievements, leaderboards, and challenges</p>
        </div>

        {/* User Stats Card */}
        <Card>
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="text-2xl font-bold">{userStats.level}</div>
                  <div className="text-xs">Level</div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">John Doe</h3>
                <p className="text-gray-600">{userStats.totalPoints} points</p>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Level {userStats.level}</span>
                <span>Level {userStats.level + 1}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {userStats.nextLevelPoints - userStats.totalPoints} points to next level
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-600">{userStats.achievementCount}</div>
                <p className="text-sm text-gray-600">Achievements</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">#{userStats.rank.weekly}</div>
                <p className="text-sm text-gray-600">Weekly Rank</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{userStats.currentStreak} 🔥</div>
                <p className="text-sm text-gray-600">Day Streak</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {(['achievements', 'leaderboard', 'challenges'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${
                selectedTab === tab
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Achievements Tab */}
        {selectedTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.filter(a => !a.secret || a.unlocked).map((achievement) => (
              <Card key={achievement.id} className={achievement.unlocked ? 'border-primary-300' : 'opacity-60'}>
                <div className="text-center">
                  <div className="text-5xl mb-3">{achievement.icon}</div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getTierColor(achievement.tier)}`}>
                      {achievement.tier}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold text-gray-900">{achievement.points} points</span>
                  </div>

                  {!achievement.unlocked && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full transition-all"
                          style={{ width: `${achievement.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {achievement.unlocked && (
                    <div className="flex items-center justify-center gap-1 text-green-600 text-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Unlocked {achievement.unlockedAt}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Leaderboard Tab */}
        {selectedTab === 'leaderboard' && (
          <Card>
            <CardHeader>
              <CardTitle>Weekly Leaderboard</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      entry.isCurrentUser ? 'bg-primary-50 border-2 border-primary-300' : 'bg-gray-50'
                    }`}
                  >
                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-lg">
                      {entry.rank}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{entry.name}</h4>
                        {entry.badges.map((badge) => (
                          <span key={badge} className={`px-2 py-0.5 text-xs font-semibold rounded ${getTierColor(badge)}`}>
                            {badge}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{entry.score} points</p>
                    </div>
                    <div className="text-right">
                      {entry.trend === 'UP' && <span className="text-green-600">↑</span>}
                      {entry.trend === 'DOWN' && <span className="text-red-600">↓</span>}
                      {entry.trend === 'STABLE' && <span className="text-gray-400">→</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Challenges Tab */}
        {selectedTab === 'challenges' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id}>
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{challenge.title}</h3>
                      <p className="text-sm text-gray-600">{challenge.description}</p>
                    </div>
                    <Badge variant="info">{challenge.endDate}</Badge>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{challenge.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all"
                        style={{ width: `${challenge.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{challenge.participants} participants</span>
                    <div className="flex items-center gap-1 text-primary-600 font-semibold">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {challenge.reward} points
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
