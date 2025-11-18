/**
 * Analytics Dashboard Page
 * Comprehensive analytics with charts and insights
 */

'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Chart } from '@/components/analytics/Chart'
import { StatCard } from '@/components/dashboard/StatCard'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function AnalyticsPage() {
  // Mock data
  const taskCompletionData = [
    { label: 'Mon', value: 8 },
    { label: 'Tue', value: 12 },
    { label: 'Wed', value: 10 },
    { label: 'Thu', value: 15 },
    { label: 'Fri', value: 14 },
    { label: 'Sat', value: 9 },
    { label: 'Sun', value: 7 },
  ]

  const waterUsageData = [
    { label: 'Week 1', value: 4500 },
    { label: 'Week 2', value: 4200 },
    { label: 'Week 3', value: 3800 },
    { label: 'Week 4', value: 3500 },
  ]

  const greenQualityData = [
    { label: 'Green 1', value: 92 },
    { label: 'Green 2', value: 88 },
    { label: 'Green 3', value: 95 },
    { label: 'Green 4', value: 90 },
    { label: 'Green 5', value: 87 },
    { label: 'Green 6', value: 93 },
  ]

  const equipmentUsageData = [
    { label: 'Mower', value: 85 },
    { label: 'Trimmer', value: 65 },
    { label: 'Sprayer', value: 45 },
    { label: 'Aerator', value: 30 },
    { label: 'Spreader', value: 55 },
  ]

  const topPerformers = [
    { name: 'Mike Johnson', tasksCompleted: 45, rating: 4.8 },
    { name: 'Sarah Miller', tasksCompleted: 42, rating: 4.9 },
    { name: 'Tom Wilson', tasksCompleted: 38, rating: 4.7 },
    { name: 'John Doe', tasksCompleted: 35, rating: 4.6 },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">Insights and performance metrics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Last 7 Days</Button>
            <Button variant="outline">Last 30 Days</Button>
            <Button variant="primary">Custom Range</Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Tasks Completed"
            value="275"
            change={{ value: 12, trend: 'up' }}
            color="success"
          />
          <StatCard
            title="Average Quality Score"
            value="91%"
            change={{ value: 3, trend: 'up' }}
            color="primary"
          />
          <StatCard
            title="Water Saved"
            value="28%"
            change={{ value: 5, trend: 'up' }}
            color="info"
          />
          <StatCard
            title="Equipment Efficiency"
            value="87%"
            change={{ value: 2, trend: 'down' }}
            color="warning"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Chart
            title="Task Completion Trend"
            data={taskCompletionData}
            type="area"
            color="#00a35c"
          />
          <Chart
            title="Water Usage (Gallons)"
            data={waterUsageData}
            type="line"
            color="#3b82f6"
          />
          <Chart
            title="Green Quality Scores"
            data={greenQualityData}
            type="bar"
            color="#10b981"
          />
          <Chart
            title="Equipment Usage (%)"
            data={equipmentUsageData}
            type="bar"
            color="#f59e0b"
          />
        </div>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers This Month</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{performer.name}</h4>
                      <p className="text-sm text-gray-600">
                        {performer.tasksCompleted} tasks completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold">{performer.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  )
}
