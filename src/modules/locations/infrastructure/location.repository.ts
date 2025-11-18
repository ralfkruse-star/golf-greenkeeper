/**
 * Location Repository
 */

import { Zone, ZoneProps } from '../domain/zone.entity'
import { ZoneType } from '@/types'
import prisma from '@/lib/db'
import { generateCode } from '@/lib/utils'

export class LocationRepository {
  async save(zone: Zone): Promise<void> {
    const props = zone.toJSON

    await prisma.zone.upsert({
      where: { id: props.id },
      create: {
        id: props.id,
        code: props.code,
        name: props.name,
        type: props.type,
        holeId: props.holeId,
        area: props.area,
        coordinates: props.coordinates,
        description: props.description,
        metadata: props.metadata || {},
      },
      update: {
        name: props.name,
        area: props.area,
        coordinates: props.coordinates,
        description: props.description,
        metadata: props.metadata || {},
        updatedAt: new Date(),
      },
    })
  }

  async findById(id: string): Promise<Zone | null> {
    const record = await prisma.zone.findUnique({ where: { id } })
    return record ? this.toDomain(record) : null
  }

  async findByCode(code: string): Promise<Zone | null> {
    const record = await prisma.zone.findUnique({ where: { code } })
    return record ? this.toDomain(record) : null
  }

  async findMany(type?: ZoneType): Promise<Zone[]> {
    const records = await prisma.zone.findMany({
      where: type ? { type } : {},
      orderBy: { code: 'asc' },
    })
    return records.map((r: any) => this.toDomain(r))
  }

  async generateNextCode(type: ZoneType): Promise<string> {
    const prefix = this.getPrefix(type)
    const lastZone = await prisma.zone.findFirst({
      where: { type },
      orderBy: { createdAt: 'desc' },
      select: { code: true },
    })

    if (!lastZone) {
      return `${prefix}-001`
    }

    const match = lastZone.code.match(new RegExp(`${prefix}-(\\d+)`))
    if (match) {
      const num = parseInt(match[1], 10) + 1
      return generateCode(prefix, num, 3)
    }

    return `${prefix}-001`
  }

  private getPrefix(type: ZoneType): string {
    const prefixes: Record<ZoneType, string> = {
      [ZoneType.GREEN]: 'GREEN',
      [ZoneType.FAIRWAY]: 'FAIRWAY',
      [ZoneType.TEE]: 'TEE',
      [ZoneType.BUNKER]: 'BUNKER',
      [ZoneType.ROUGH]: 'ROUGH',
      [ZoneType.SEMI_ROUGH]: 'SEMI',
      [ZoneType.WATER_HAZARD]: 'WATER',
      [ZoneType.OUT_OF_BOUNDS]: 'OOB',
      [ZoneType.PRACTICE_AREA]: 'PRACTICE',
      [ZoneType.OTHER]: 'ZONE',
    }
    return prefixes[type]
  }

  private toDomain(record: any): Zone {
    const props: ZoneProps = {
      id: record.id,
      holeId: record.holeId,
      name: record.name,
      type: record.type as ZoneType,
      code: record.code,
      area: record.area,
      coordinates: record.coordinates,
      description: record.description,
      metadata: typeof record.metadata === 'object' ? record.metadata : undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }
    return new Zone(props)
  }
}
