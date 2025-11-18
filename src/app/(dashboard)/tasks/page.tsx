/**
 * Tasks Page
 * Task management with filtering, sorting, and quick actions
 */

'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')

  // Mock tasks data
  const tasks = [
    {
      id: '1',
      title: 'Mow Green #5',
      description: 'Regular mowing at 3.5mm height',
      location: 'Green 5',
      status: 'IN_PROGRESS' as const,
      priority: 'HIGH',
      assignee: 'Mike Johnson',
      dueDate: '2025-11-18',
      dueTime: '10:30',
      equipment: 'Mower #1',
    },
    {
      id: '2',
      title: 'Fertilize Fairway #12',
      description: 'Apply nitrogen-rich fertilizer',
      location: 'Fairway 12',
      status: 'TODO' as const,
      priority: 'MEDIUM',
      assignee: 'Tom Wilson',
      dueDate: '2025-11-18',
      dueTime: '14:00',
      equipment: 'Spreader #2',
    },
    {
      id: '3',
      title: 'Inspect Irrigation System',
      description: 'Check all sprinkler heads and valves',
      location: 'Course-wide',
      status: 'COMPLETED' as const,
      priority: 'HIGH',
      assignee: 'Sarah Miller',
      dueDate: '2025-11-18',
      dueTime: '08:00',
      equipment: null,
    },
    {
      id: '4',
      title: 'Trim Bunker Edges #7',
      description: 'Clean edges around bunker',
      location: 'Bunker 7',
      status: 'TODO' as const,
      priority: 'LOW',
      assignee: 'John Doe',
      dueDate: '2025-11-18',
      dueTime: '15:30',
      equipment: 'Trimmer #1',
    },
    {
      id: '5',
      title: 'Disease Inspection - Greens',
      description: 'Check for dollar spot and other diseases',
      location: 'All Greens',
      status: 'TODO' as const,
      priority: 'HIGH',
      assignee: 'Head Greenkeeper',
      dueDate: '2025-11-18',
      dueTime: '09:00',
      equipment: 'Camera',
    },
  ]

  const priorityColors: Record<string, string> = {
    HIGH: 'text-red-600 bg-red-50',
    MEDIUM: 'text-yellow-600 bg-yellow-50',
    LOW: 'text-gray-600 bg-gray-50',
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterStatus === 'ALL' || task.status === filterStatus

    return matchesSearch && matchesFilter
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-1">Manage and track all maintenance tasks</p>
          </div>
          <Button
            variant="primary"
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Create Task
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search tasks by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                }
              />
            </div>
            <div className="flex gap-2">
              {['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card key={task.id} hoverable padding="none">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                        <StatusBadge status={task.status} />
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[task.priority]}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{task.description}</p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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
                        {task.equipment && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                            {task.equipment}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      {task.status === 'TODO' && (
                        <Button variant="primary" size="sm">
                          Start
                        </Button>
                      )}
                      {task.status === 'IN_PROGRESS' && (
                        <Button variant="success" size="sm">
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
