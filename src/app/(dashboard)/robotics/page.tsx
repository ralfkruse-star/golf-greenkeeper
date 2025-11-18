/**
 * Robotics Fleet Management Page
 * Monitor and control autonomous robots
 */

'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StatCard } from '@/components/dashboard/StatCard'

export default function RoboticsPage() {
  const robots = [
    {
      id: 'robot_001',
      name: 'Mower Alpha',
      type: 'AUTONOMOUS_MOWER',
      status: 'ACTIVE',
      battery: 87,
      location: 'Green 5',
      mission: 'Mowing Green #5',
      progress: 68,
      speed: '0.4 m/s',
    },
    {
      id: 'robot_002',
      name: 'Mower Beta',
      type: 'AUTONOMOUS_MOWER',
      status: 'CHARGING',
      battery: 45,
      location: 'Charging Station',
      mission: null,
      progress: 0,
      speed: '0 m/s',
    },
    {
      id: 'robot_003',
      name: 'Line Marker One',
      type: 'LINE_MARKER',
      status: 'IDLE',
      battery: 100,
      location: 'Storage',
      mission: null,
      progress: 0,
      speed: '0 m/s',
    },
  ]

  const missions = [
    {
      id: 'mission_001',
      robot: 'Mower Alpha',
      type: 'MOWING',
      location: 'Green 5',
      status: 'IN_PROGRESS',
      progress: 68,
      startTime: '09:30',
      estimatedEnd: '10:45',
    },
    {
      id: 'mission_002',
      robot: 'Mower Beta',
      type: 'MOWING',
      location: 'Fairway 12',
      status: 'PENDING',
      progress: 0,
      startTime: '11:00',
      estimatedEnd: '13:30',
    },
  ]

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      CHARGING: 'bg-yellow-100 text-yellow-800',
      IDLE: 'bg-gray-100 text-gray-800',
      ERROR: 'bg-red-100 text-red-800',
      OFFLINE: 'bg-gray-100 text-gray-500',
    }
    return colors[status] || colors.IDLE
  }

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-600'
    if (level > 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Robotics Fleet</h1>
            <p className="text-gray-600 mt-1">Monitor and control autonomous equipment</p>
          </div>
          <Button variant="primary">Create Mission</Button>
        </div>

        {/* Fleet Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Robots" value="3" color="primary" />
          <StatCard title="Active Missions" value="1" color="success" />
          <StatCard title="Area Covered Today" value="2.4ha" color="info" />
          <StatCard title="Avg Battery" value="77%" color="warning" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Robot Fleet */}
          <Card>
            <CardHeader>
              <CardTitle>Fleet Status</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {robots.map((robot) => (
                  <div key={robot.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{robot.name}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(robot.status)}`}>
                            {robot.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{robot.type.replace('_', ' ')}</p>
                      </div>
                      <div className={`flex items-center gap-1 ${getBatteryColor(robot.battery)}`}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2H4zm6 12H4V5h6v10zm3-11v10h1a1 1 0 001-1V5a1 1 0 00-1-1h-1z" />
                        </svg>
                        <span className="font-semibold">{robot.battery}%</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span>{robot.location}</span>
                      </div>
                      {robot.mission && (
                        <>
                          <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <span>{robot.mission}</span>
                          </div>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Progress</span>
                              <span>{robot.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${robot.progress}%` }} />
                            </div>
                          </div>
                        </>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>Speed: {robot.speed}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      {robot.status === 'IDLE' && (
                        <Button variant="primary" size="sm" fullWidth>
                          Start Mission
                        </Button>
                      )}
                      {robot.status === 'ACTIVE' && (
                        <Button variant="warning" size="sm" fullWidth>
                          Pause
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Track
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Active Missions */}
          <Card>
            <CardHeader>
              <CardTitle>Active Missions</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {missions.map((mission) => (
                  <div key={mission.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{mission.type}</h3>
                        <p className="text-sm text-gray-600">{mission.location}</p>
                      </div>
                      <Badge variant={mission.status === 'IN_PROGRESS' ? 'primary' : 'default'}>
                        {mission.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-3">
                      <div className="flex justify-between">
                        <span>Robot:</span>
                        <span className="font-medium">{mission.robot}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Start:</span>
                        <span>{mission.startTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Est. End:</span>
                        <span>{mission.estimatedEnd}</span>
                      </div>
                    </div>

                    {mission.progress > 0 && (
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{mission.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${mission.progress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
