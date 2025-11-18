/**
 * Equipment Management Page
 * Track and manage all maintenance equipment
 */

'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { StatCard } from '@/components/dashboard/StatCard'

export default function EquipmentPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')

  // Mock equipment data
  const equipment = [
    {
      id: 'eq-001',
      name: 'Triplex Mower #1',
      type: 'MOWER',
      code: 'MOWER-001',
      status: 'AVAILABLE',
      condition: 'GOOD',
      location: 'Equipment Shed A',
      lastMaintenance: '2025-11-10',
      nextMaintenance: '2025-11-25',
      operatingHours: 245.5,
      fuelLevel: 85,
    },
    {
      id: 'eq-002',
      name: 'Fairway Mower #2',
      type: 'MOWER',
      code: 'MOWER-002',
      status: 'IN_USE',
      condition: 'GOOD',
      location: 'Fairway 12',
      assignedTo: 'Mike Johnson',
      lastMaintenance: '2025-11-08',
      nextMaintenance: '2025-11-22',
      operatingHours: 312.8,
      fuelLevel: 45,
    },
    {
      id: 'eq-003',
      name: 'Aerator',
      type: 'AERATOR',
      code: 'AERO-001',
      status: 'MAINTENANCE',
      condition: 'FAIR',
      location: 'Workshop',
      lastMaintenance: '2025-11-15',
      nextMaintenance: '2025-11-18',
      operatingHours: 156.2,
      issue: 'Oil change required',
    },
    {
      id: 'eq-004',
      name: 'Fertilizer Spreader',
      type: 'SPREADER',
      code: 'SPREAD-001',
      status: 'AVAILABLE',
      condition: 'EXCELLENT',
      location: 'Equipment Shed B',
      lastMaintenance: '2025-11-12',
      nextMaintenance: '2025-12-12',
      operatingHours: 89.3,
    },
    {
      id: 'eq-005',
      name: 'Sprayer Unit',
      type: 'SPRAYER',
      code: 'SPRAY-001',
      status: 'OUT_OF_SERVICE',
      condition: 'POOR',
      location: 'Workshop',
      lastMaintenance: '2025-10-20',
      nextMaintenance: 'TBD',
      operatingHours: 445.7,
      issue: 'Pump failure - replacement needed',
    },
  ]

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'default'> = {
      AVAILABLE: 'success',
      IN_USE: 'info',
      MAINTENANCE: 'warning',
      OUT_OF_SERVICE: 'danger',
    }
    return colors[status] || 'default'
  }

  const getConditionColor = (condition: string) => {
    const colors: Record<string, string> = {
      EXCELLENT: 'text-green-600 bg-green-50',
      GOOD: 'text-blue-600 bg-blue-50',
      FAIR: 'text-yellow-600 bg-yellow-50',
      POOR: 'text-red-600 bg-red-50',
    }
    return colors[condition] || 'text-gray-600 bg-gray-50'
  }

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterStatus === 'ALL' || item.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const stats = {
    total: equipment.length,
    available: equipment.filter((e) => e.status === 'AVAILABLE').length,
    inUse: equipment.filter((e) => e.status === 'IN_USE').length,
    maintenance: equipment.filter((e) => e.status === 'MAINTENANCE' || e.status === 'OUT_OF_SERVICE').length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Equipment Management</h1>
            <p className="text-gray-600 mt-1">Track and maintain all course equipment</p>
          </div>
          <Button variant="primary">Add Equipment</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Equipment"
            value={stats.total}
            color="primary"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
              </svg>
            }
          />
          <StatCard
            title="Available"
            value={stats.available}
            color="success"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            }
          />
          <StatCard
            title="In Use"
            value={stats.inUse}
            color="info"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            }
          />
          <StatCard
            title="Maintenance"
            value={stats.maintenance}
            color="warning"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            }
          />
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
            <div className="flex gap-2">
              {['ALL', 'AVAILABLE', 'IN_USE', 'MAINTENANCE'].map((status) => (
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

        {/* Equipment List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredEquipment.map((item) => (
            <Card key={item.id} hoverable padding="none">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <Badge variant={getStatusColor(item.status)}>{item.status.replace('_', ' ')}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{item.code}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getConditionColor(item.condition)}`}>
                    {item.condition}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>{item.operatingHours}h</span>
                  </div>
                  {item.assignedTo && (
                    <div className="flex items-center gap-2 text-gray-600 col-span-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span>Assigned to: {item.assignedTo}</span>
                    </div>
                  )}
                  {item.fuelLevel !== undefined && (
                    <div className="col-span-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Fuel Level</span>
                        <span>{item.fuelLevel}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.fuelLevel > 50 ? 'bg-green-500' : item.fuelLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${item.fuelLevel}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {item.issue && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800 mb-3">
                    <strong>Issue:</strong> {item.issue}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>Last service: {item.lastMaintenance}</span>
                  <span>Next service: {item.nextMaintenance}</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" fullWidth>
                    View Details
                  </Button>
                  {item.status === 'AVAILABLE' && (
                    <Button variant="primary" size="sm" fullWidth>
                      Check Out
                    </Button>
                  )}
                  {item.status === 'IN_USE' && (
                    <Button variant="success" size="sm" fullWidth>
                      Check In
                    </Button>
                  )}
                  {item.status === 'MAINTENANCE' && (
                    <Button variant="warning" size="sm" fullWidth>
                      Update Status
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
