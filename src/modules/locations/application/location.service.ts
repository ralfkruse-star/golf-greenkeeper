/**
 * Location Service
 */

import { Zone, ZoneProps } from '../domain/zone.entity'
import { LocationRepository } from '../infrastructure/location.repository'
import { ZoneType } from '@/types'
import { NotFoundError } from '@/lib/errors'

export interface CreateZoneDTO {
  name: string
  type: ZoneType
  holeId?: string
  area?: number
  coordinates?: any
  description?: string
}

export class LocationService {
  constructor(private repository: LocationRepository) {}

  async createZone(dto: CreateZoneDTO): Promise<Zone> {
    const code = await this.repository.generateNextCode(dto.type)

    const now = new Date()
    const zoneProps: ZoneProps = {
      id: crypto.randomUUID(),
      code,
      name: dto.name,
      type: dto.type,
      holeId: dto.holeId,
      area: dto.area,
      coordinates: dto.coordinates,
      description: dto.description,
      createdAt: now,
      updatedAt: now,
    }

    const zone = new Zone(zoneProps)
    await this.repository.save(zone)

    return zone
  }

  async getZoneById(id: string): Promise<Zone> {
    const zone = await this.repository.findById(id)
    if (!zone) {
      throw new NotFoundError('Zone', id)
    }
    return zone
  }

  async getZoneByCode(code: string): Promise<Zone> {
    const zone = await this.repository.findByCode(code)
    if (!zone) {
      throw new NotFoundError('Zone', code)
    }
    return zone
  }

  async listZones(type?: ZoneType): Promise<Zone[]> {
    return this.repository.findMany(type)
  }

  async updateZone(
    id: string,
    updates: {
      name?: string
      area?: number
      coordinates?: any
      description?: string
    }
  ): Promise<Zone> {
    const zone = await this.getZoneById(id)
    zone.updateDetails(updates)
    await this.repository.save(zone)
    return zone
  }
}
