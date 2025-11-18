/**
 * Equipment Entity - Domain Model
 */

import { EquipmentStatus, EquipmentType } from '@/types'
import { BusinessRuleViolationError } from '@/lib/errors'

export interface EquipmentProps {
  id: string
  code: string
  name: string
  type: EquipmentType
  manufacturer?: string
  model?: string
  serialNumber?: string
  status: EquipmentStatus
  purchaseDate?: Date
  purchasePrice?: number
  operatingHours: number
  lastServiceHours?: number
  serviceInterval?: number
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export class Equipment {
  private props: EquipmentProps

  constructor(props: EquipmentProps) {
    this.props = props
  }

  get id(): string {
    return this.props.id
  }

  get code(): string {
    return this.props.code
  }

  get status(): EquipmentStatus {
    return this.props.status
  }

  get operatingHours(): number {
    return this.props.operatingHours
  }

  get toJSON(): EquipmentProps {
    return { ...this.props }
  }

  /**
   * Start usage - mark as IN_USE
   */
  startUsage(): number {
    if (this.props.status === EquipmentStatus.MAINTENANCE) {
      throw new BusinessRuleViolationError('Equipment is under maintenance')
    }

    if (this.props.status === EquipmentStatus.OUT_OF_SERVICE) {
      throw new BusinessRuleViolationError('Equipment is out of service')
    }

    if (this.props.status === EquipmentStatus.IN_USE) {
      throw new BusinessRuleViolationError('Equipment is already in use')
    }

    this.props.status = EquipmentStatus.IN_USE
    this.props.updatedAt = new Date()

    return this.props.operatingHours
  }

  /**
   * End usage - mark as AVAILABLE and update hours
   */
  endUsage(hoursAdded: number): void {
    if (this.props.status !== EquipmentStatus.IN_USE) {
      throw new BusinessRuleViolationError('Equipment is not in use')
    }

    this.props.operatingHours += hoursAdded
    this.props.status = EquipmentStatus.AVAILABLE
    this.props.updatedAt = new Date()
  }

  /**
   * Send to maintenance
   */
  sendToMaintenance(): void {
    if (this.props.status === EquipmentStatus.IN_USE) {
      throw new BusinessRuleViolationError('Cannot send equipment to maintenance while in use')
    }

    this.props.status = EquipmentStatus.MAINTENANCE
    this.props.updatedAt = new Date()
  }

  /**
   * Complete maintenance
   */
  completeMaintenance(): void {
    if (this.props.status !== EquipmentStatus.MAINTENANCE) {
      throw new BusinessRuleViolationError('Equipment is not under maintenance')
    }

    this.props.lastServiceHours = this.props.operatingHours
    this.props.status = EquipmentStatus.AVAILABLE
    this.props.updatedAt = new Date()
  }

  /**
   * Mark as out of service
   */
  markOutOfService(): void {
    this.props.status = EquipmentStatus.OUT_OF_SERVICE
    this.props.updatedAt = new Date()
  }

  /**
   * Check if maintenance is due
   */
  isMaintenanceDue(): boolean {
    if (!this.props.serviceInterval || !this.props.lastServiceHours) {
      return false
    }

    const hoursSinceService = this.props.operatingHours - this.props.lastServiceHours
    return hoursSinceService >= this.props.serviceInterval
  }
}
