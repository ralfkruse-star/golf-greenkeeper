/**
 * Dashboard Page
 * Main dashboard with KPIs, quick actions, and recent activity
 */

'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard } from '@/components/dashboard/StatCard'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'

export default function DashboardPage() {
  // Mock data - in production, fetch from API
  const stats = {
    tasksToday: { value: 8, change: { value: 12, trend: 'up' as const } },
    completionRate: { value: '94%', change: { value: 5, trend: 'up' as const } },
    equipmentActive: { value: 12, change: { value: 2, trend: 'down' as const } },
    areasManaged: { value: 42, change: { value: 0, trend: 'up' as const } },
  }

  const recentTasks = [
    {
      id: '1',
      title: 'Mow Green #5',
      location: 'Green 5',
      status: 'IN_PROGRESS' as const,
      assignee: 'Mike Johnson',
      priority: 'HIGH',
      dueTime: '10:30 AM',
    },
    {
      id: '2',
      title: 'Fertilize Fairway #12',
      location: 'Fairway 12',
      status: 'TODO' as const,
      assignee: 'Tom Wilson',
      priority: 'MEDIUM',
      dueTime: '2:00 PM',
    },
    {
      id: '3',
      title: 'Inspect Irrigation System',
      location: 'Course-wide',
      status: 'COMPLETED' as const,
      assignee: 'Sarah Miller',
      priority: 'HIGH',
      dueTime: '8:00 AM',
    },
    {
      id: '4',
      title: 'Trim Bunker Edges #7',
      location: 'Bunker 7',
      status: 'TODO' as const,
      assignee: 'John Doe',
      priority: 'LOW',
      dueTime: '3:30 PM',
    },
  ]

  const weatherAlert = {
    type: 'warning' as const,
    message: 'Heavy rain expected tonight. Consider postponing outdoor maintenance tasks.',
    temp: '72°F',
    conditions: 'Partly Cloudy',
    humidity: '65%',
  }

  const equipmentAlerts = [
    { id: '1', name: 'Mower #2', issue: 'Maintenance due in 2 hours', severity: 'warning' },
    { id: '2', name: 'Sprayer #1', issue: 'Low battery (15%)', severity: 'info' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
            >
              Export
            </Button>
            <Button
              variant="primary"
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              }
            >
              New Task
            </Button>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Tasks Today"
            value={stats.tasksToday.value}
            change={stats.tasksToday.change}
            color="primary"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
            }
          />
          <StatCard
            title="Completion Rate"
            value={stats.completionRate.value}
            change={stats.completionRate.change}
            color="success"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            }
          />
          <StatCard
            title="Equipment Active"
            value={stats.equipmentActive.value}
            change={stats.equipmentActive.change}
            color="info"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
            }
          />
          <StatCard
            title="Areas Managed"
            value={stats.areasManaged.value}
            color="warning"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tasks */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader action={<Button variant="ghost" size="sm">View All</Button>}>
                <CardTitle>Recent Tasks</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {recentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{task.title}</h4>
                          <StatusBadge status={task.status} />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {task.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {task.assignee}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {task.dueTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Weather Widget */}
            <Card>
              <CardHeader>
                <CardTitle>Weather</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-gray-900 mb-1">{weatherAlert.temp}</div>
                  <p className="text-gray-600">{weatherAlert.conditions}</p>
                  <p className="text-sm text-gray-500">Humidity: {weatherAlert.humidity}</p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">{weatherAlert.message}</p>
                </div>
              </CardBody>
            </Card>

            {/* Equipment Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Equipment Alerts</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {equipmentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{alert.name}</p>
                        <p className="text-xs text-gray-600 mt-1">{alert.issue}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
