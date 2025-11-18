/**
 * Equipment Module Types
 */

export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  BROKEN = 'BROKEN',
  RETIRED = 'RETIRED',
}

export interface Equipment {
  id: string
  name: string
  code: string
  type: string
  manufacturer?: string
  model?: string
  serialNumber?: string
  status: EquipmentStatus
  purchaseDate?: Date
  purchasePrice?: number
  currentValue?: number
  initialHours: number
  currentHours: number
  metadata?: Record<string, any>
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface EquipmentUsageLog {
  id: string
  equipmentId: string
  userId: string
  startTime: Date
  endTime?: Date
  hoursStart?: number
  hoursEnd?: number
  locationId?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateEquipmentInput {
  name: string
  code: string
  type: string
  manufacturer?: string
  model?: string
  serialNumber?: string
  purchaseDate?: Date
  purchasePrice?: number
  initialHours?: number
}

export interface StartEquipmentUsageInput {
  equipmentId: string
  userId: string
  locationId?: string
}

export interface StopEquipmentUsageInput {
  usageLogId: string
  userId: string
  hoursEnd?: number
  notes?: string
}
