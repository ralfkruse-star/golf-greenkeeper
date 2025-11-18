/**
 * Profile Page
 * User profile management and personal statistics
 */

'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { StatCard } from '@/components/dashboard/StatCard'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@golfclub.com',
    phone: '+1 234 567 8900',
    role: 'GREENKEEPER',
    department: 'Turf Management',
    location: 'Greenfield Golf Club',
    joinedDate: '2023-01-15',
    bio: 'Experienced greenkeeper with 10+ years in golf course maintenance. Specialized in bentgrass greens and integrated pest management.',
    certifications: ['GCSAA Certified Golf Course Superintendent', 'Pesticide Applicator License'],
    skills: ['Turf Management', 'Irrigation Systems', 'Equipment Maintenance', 'IPM'],
  })

  const stats = {
    tasksCompleted: 487,
    totalPoints: 1150,
    level: 12,
    currentStreak: 5,
    achievements: 8,
    hoursLogged: 1240,
    averageQuality: 94,
    rank: 3,
  }

  const recentActivity = [
    {
      type: 'TASK_COMPLETED',
      title: 'Mowed Green #5',
      timestamp: '2 hours ago',
      points: 10,
      icon: '✅',
    },
    {
      type: 'ACHIEVEMENT_UNLOCKED',
      title: 'Quality Inspector Achievement',
      timestamp: '1 day ago',
      points: 75,
      icon: '🏆',
    },
    {
      type: 'TASK_COMPLETED',
      title: 'Applied fungicide to Fairway #12',
      timestamp: '1 day ago',
      points: 15,
      icon: '✅',
    },
    {
      type: 'LEVEL_UP',
      title: 'Reached Level 12',
      timestamp: '3 days ago',
      points: 100,
      icon: '⬆️',
    },
  ]

  const achievements = [
    {
      name: 'Getting Started',
      tier: 'BRONZE',
      icon: '🌱',
      unlocked: true,
    },
    {
      name: 'Quality Inspector',
      tier: 'SILVER',
      icon: '🔍',
      unlocked: true,
    },
    {
      name: 'Task Master',
      tier: 'GOLD',
      icon: '⭐',
      unlocked: false,
    },
    {
      name: 'Green Perfection',
      tier: 'PLATINUM',
      icon: '💎',
      unlocked: false,
    },
  ]

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setIsEditing(false)
  }

  const getTierColor = (tier: string) => {
    const colors = {
      BRONZE: 'bg-orange-100 text-orange-800',
      SILVER: 'bg-gray-100 text-gray-800',
      GOLD: 'bg-yellow-100 text-yellow-800',
      PLATINUM: 'bg-purple-100 text-purple-800',
    }
    return colors[tier as keyof typeof colors] || colors.BRONZE
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Profile Card */}
        <Card>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white">
                <span className="text-5xl font-bold">
                  {profile.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </span>
              </div>
              <Button variant="outline" size="sm">
                Change Photo
              </Button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <Input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        fullWidth
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        fullWidth
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <Input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        fullWidth
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <Input
                        type="text"
                        value={profile.department}
                        onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                        fullWidth
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                      <p className="text-gray-600 mt-1">
                        {profile.role} • {profile.department}
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span>{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <span>{profile.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Joined {new Date(profile.joinedDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 mt-4">{profile.bio}</p>

                  {/* Certifications */}
                  {profile.certifications.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        Certifications
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.certifications.map((cert, i) => (
                          <Badge key={i} variant="success">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {profile.skills.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, i) => (
                          <Badge key={i} variant="info">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Tasks Completed"
            value={stats.tasksCompleted.toString()}
            icon="✅"
            trend="up"
            trendValue="12%"
          />
          <StatCard
            title="Total Points"
            value={stats.totalPoints.toString()}
            icon="⭐"
            trend="up"
            trendValue="8%"
          />
          <StatCard
            title="Current Level"
            value={stats.level.toString()}
            icon="🎯"
            trend="stable"
          />
          <StatCard
            title="Day Streak"
            value={`${stats.currentStreak} days`}
            icon="🔥"
            trend="up"
            trendValue="2 days"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="text-2xl">{activity.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.timestamp}</p>
                    </div>
                    <div className="flex items-center gap-1 text-primary-600 font-semibold">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      +{activity.points}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Achievements Showcase */}
          <Card>
            <CardHeader>
              <CardTitle>Achievement Showcase</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg text-center border-2 transition-all ${
                      achievement.unlocked
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-gray-200 bg-gray-50 opacity-50'
                    }`}
                  >
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <p className="font-semibold text-gray-900 text-sm mb-1">
                      {achievement.name}
                    </p>
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getTierColor(
                        achievement.tier
                      )}`}
                    >
                      {achievement.tier}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" fullWidth>
                  View All Achievements
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Task Quality</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {stats.averageQuality}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${stats.averageQuality}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Above team average</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Hours Logged</span>
                  <span className="text-2xl font-bold text-primary-600">{stats.hoursLogged}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all"
                    style={{ width: '85%' }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">This year</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Team Rank</span>
                  <span className="text-2xl font-bold text-primary-600">#{stats.rank}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all"
                    style={{ width: '75%' }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Top 10% this month</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  )
}
