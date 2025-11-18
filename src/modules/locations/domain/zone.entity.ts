/**
 * Zone Entity - Domain Model
 */

import { ZoneType } from '@/types'

export interface ZoneProps {
  id: string
  holeId?: string
  name: string
  type: ZoneType
  code: string
  area?: number
  coordinates?: any
  description?: string
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export class Zone {
  private props: ZoneProps

  constructor(props: ZoneProps) {
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

  get type(): ZoneType {
    return this.props.type
  }

  get toJSON(): ZoneProps {
    return { ...this.props }
  }

  updateDetails(updates: {
    name?: string
    area?: number
    coordinates?: any
    description?: string
  }): void {
    if (updates.name) this.props.name = updates.name
    if (updates.area) this.props.area = updates.area
    if (updates.coordinates) this.props.coordinates = updates.coordinates
    if (updates.description !== undefined) this.props.description = updates.description
    this.props.updatedAt = new Date()
  }
}
