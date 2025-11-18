/**
 * Material Entity - Domain Model
 */

import { MaterialType } from '@/types'
import { BusinessRuleViolationError } from '@/lib/errors'

export interface MaterialProps {
  id: string
  code: string
  name: string
  type: MaterialType
  manufacturer?: string
  unit: string
  currentStock: number
  minStock?: number
  unitCost?: number
  safetyInfo?: string
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export class Material {
  private props: MaterialProps

  constructor(props: MaterialProps) {
    this.props = props
  }

  get id(): string {
    return this.props.id
  }

  get code(): string {
    return this.props.code
  }

  get name(): string {
    return this.props.name
  }

  get currentStock(): number {
    return this.props.currentStock
  }

  get toJSON(): MaterialProps {
    return { ...this.props }
  }

  /**
   * Add stock (e.g., after purchase)
   */
  addStock(quantity: number, reason?: string): void {
    if (quantity <= 0) {
      throw new BusinessRuleViolationError('Quantity must be positive')
    }

    this.props.currentStock += quantity
    this.props.updatedAt = new Date()
  }

  /**
   * Remove stock (e.g., after application)
   */
  removeStock(quantity: number, reason?: string): void {
    if (quantity <= 0) {
      throw new BusinessRuleViolationError('Quantity must be positive')
    }

    if (quantity > this.props.currentStock) {
      throw new BusinessRuleViolationError(
        `Insufficient stock. Available: ${this.props.currentStock} ${this.props.unit}`
      )
    }

    this.props.currentStock -= quantity
    this.props.updatedAt = new Date()
  }

  /**
   * Check if stock is below minimum threshold
   */
  isStockLow(): boolean {
    if (!this.props.minStock) {
      return false
    }

    return this.props.currentStock <= this.props.minStock
  }

  /**
   * Update material details
   */
  updateDetails(updates: {
    name?: string
    manufacturer?: string
    unitCost?: number
    minStock?: number
    safetyInfo?: string
  }): void {
    if (updates.name) this.props.name = updates.name
    if (updates.manufacturer !== undefined) this.props.manufacturer = updates.manufacturer
    if (updates.unitCost !== undefined) this.props.unitCost = updates.unitCost
    if (updates.minStock !== undefined) this.props.minStock = updates.minStock
    if (updates.safetyInfo !== undefined) this.props.safetyInfo = updates.safetyInfo
    this.props.updatedAt = new Date()
  }

  /**
   * Check if material requires safety information
   */
  requiresSafetyInfo(): boolean {
    return !!this.props.safetyInfo
  }

  /**
   * Check if material is hazardous
   */
  isHazardous(): boolean {
    const hazardousTypes = [
      MaterialType.PESTICIDE,
      MaterialType.HERBICIDE,
      MaterialType.FUNGICIDE,
    ]
    return hazardousTypes.includes(this.props.type)
  }
}
