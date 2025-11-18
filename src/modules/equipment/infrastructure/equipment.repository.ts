/**
 * Equipment Repository
 */

import { Equipment, EquipmentProps } from '../domain/equipment.entity'
import { EquipmentStatus } from '@/types'
import prisma from '@/lib/db'
import { generateCode } from '@/lib/utils'

export interface CreateUsageLogDTO {
  equipmentId: string
  userId: string
  zoneId?: string
  startTime: Date
  startHours: number
  notes?: string
}

export interface CreateMaintenanceEventDTO {
  equipmentId: string
  type: string
  description: string
  performedAt: Date
  hoursAtMaintenance?: number
  cost?: number
}

export class EquipmentRepository {
  async save(equipment: Equipment): Promise<void> {
    const props = equipment.toJSON

    await prisma.equipment.upsert({
      where: { id: props.id },
      create: {
        id: props.id,
        code: props.code,
        name: props.name,
        type: props.type,
        manufacturer: props.manufacturer,
        model: props.model,
        serialNumber: props.serialNumber,
        status: props.status,
        purchaseDate: props.purchaseDate,
        purchasePrice: props.purchasePrice,
        operatingHours: props.operatingHours,
        lastServiceHours: props.lastServiceHours,
        serviceInterval: props.serviceInterval,
        metadata: props.metadata || {},
      },
      update: {
        name: props.name,
        status: props.status,
        operatingHours: props.operatingHours,
        lastServiceHours: props.lastServiceHours,
        metadata: props.metadata || {},
        updatedAt: new Date(),
      },
    })
  }

  async findById(id: string): Promise<Equipment | null> {
    const record = await prisma.equipment.findUnique({ where: { id } })
    return record ? this.toDomain(record) : null
  }

  async findByCode(code: string): Promise<Equipment | null> {
    const record = await prisma.equipment.findUnique({ where: { code } })
    return record ? this.toDomain(record) : null
  }

  async findMany(status?: EquipmentStatus): Promise<Equipment[]> {
    const records = await prisma.equipment.findMany({
      where: status ? { status } : {},
      orderBy: { code: 'asc' },
    })
    return records.map((r: any) => this.toDomain(r))
  }

  async generateNextCode(): Promise<string> {
    const lastEquipment = await prisma.equipment.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { code: true },
    })

    if (!lastEquipment) {
      return 'EQ-001'
    }

    const match = lastEquipment.code.match(/EQ-(\d+)/)
    if (match) {
      const num = parseInt(match[1], 10) + 1
      return generateCode('EQ', num, 3)
    }

    return 'EQ-001'
  }

  async createUsageLog(dto: CreateUsageLogDTO): Promise<string> {
    const log = await prisma.equipmentUsageLog.create({
      data: {
        equipmentId: dto.equipmentId,
        userId: dto.userId,
        zoneId: dto.zoneId,
        startTime: dto.startTime,
        startHours: dto.startHours,
        notes: dto.notes,
      },
    })
    return log.id
  }

  async getUsageLog(id: string): Promise<any> {
    return prisma.equipmentUsageLog.findUnique({ where: { id } })
  }

  async completeUsageLog(id: string, endHours: number, notes?: string): Promise<void> {
    await prisma.equipmentUsageLog.update({
      where: { id },
      data: {
        endTime: new Date(),
        endHours,
        notes,
      },
    })
  }

  async createMaintenanceEvent(dto: CreateMaintenanceEventDTO): Promise<void> {
    await prisma.maintenanceEvent.create({
      data: {
        equipmentId: dto.equipmentId,
        type: dto.type,
        description: dto.description,
        performedAt: dto.performedAt,
        hoursAtMaintenance: dto.hoursAtMaintenance,
        cost: dto.cost,
      },
    })
  }

  private toDomain(record: any): Equipment {
    const props: EquipmentProps = {
      id: record.id,
      code: record.code,
      name: record.name,
      type: record.type,
      manufacturer: record.manufacturer,
      model: record.model,
      serialNumber: record.serialNumber,
      status: record.status as EquipmentStatus,
      purchaseDate: record.purchaseDate,
      purchasePrice: record.purchasePrice,
      operatingHours: record.operatingHours,
      lastServiceHours: record.lastServiceHours,
      serviceInterval: record.serviceInterval,
      metadata: typeof record.metadata === 'object' ? record.metadata : undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }
    return new Equipment(props)
  }
}
