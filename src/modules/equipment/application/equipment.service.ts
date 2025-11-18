/**
 * Equipment Service
 */

import { Equipment, EquipmentProps } from '../domain/equipment.entity'
import { EquipmentRepository } from '../infrastructure/equipment.repository'
import { EquipmentStatus, EquipmentType } from '@/types'
import { NotFoundError } from '@/lib/errors'

export interface CreateEquipmentDTO {
  name: string
  type: EquipmentType
  manufacturer?: string
  model?: string
  serialNumber?: string
  purchaseDate?: Date
  purchasePrice?: number
  serviceInterval?: number
}

export interface StartUsageDTO {
  equipmentId: string
  userId: string
  zoneId?: string
  notes?: string
}

export interface EndUsageDTO {
  usageLogId: string
  notes?: string
}

export class EquipmentService {
  constructor(private repository: EquipmentRepository) {}

  async createEquipment(dto: CreateEquipmentDTO): Promise<Equipment> {
    const code = await this.repository.generateNextCode()

    const now = new Date()
    const equipmentProps: EquipmentProps = {
      id: crypto.randomUUID(),
      code,
      name: dto.name,
      type: dto.type,
      manufacturer: dto.manufacturer,
      model: dto.model,
      serialNumber: dto.serialNumber,
      status: EquipmentStatus.AVAILABLE,
      purchaseDate: dto.purchaseDate,
      purchasePrice: dto.purchasePrice,
      operatingHours: 0,
      serviceInterval: dto.serviceInterval,
      createdAt: now,
      updatedAt: now,
    }

    const equipment = new Equipment(equipmentProps)
    await this.repository.save(equipment)

    return equipment
  }

  async getEquipmentById(id: string): Promise<Equipment> {
    const equipment = await this.repository.findById(id)
    if (!equipment) {
      throw new NotFoundError('Equipment', id)
    }
    return equipment
  }

  async getEquipmentByCode(code: string): Promise<Equipment> {
    const equipment = await this.repository.findByCode(code)
    if (!equipment) {
      throw new NotFoundError('Equipment', code)
    }
    return equipment
  }

  async listEquipment(status?: EquipmentStatus): Promise<Equipment[]> {
    return this.repository.findMany(status)
  }

  async startUsage(dto: StartUsageDTO): Promise<string> {
    const equipment = await this.getEquipmentById(dto.equipmentId)

    const startHours = equipment.startUsage()
    await this.repository.save(equipment)

    // Create usage log
    const logId = await this.repository.createUsageLog({
      equipmentId: dto.equipmentId,
      userId: dto.userId,
      zoneId: dto.zoneId,
      startTime: new Date(),
      startHours,
      notes: dto.notes,
    })

    return logId
  }

  async endUsage(dto: EndUsageDTO, endHours: number): Promise<void> {
    const usageLog = await this.repository.getUsageLog(dto.usageLogId)
    if (!usageLog) {
      throw new NotFoundError('Usage Log', dto.usageLogId)
    }

    const equipment = await this.getEquipmentById(usageLog.equipmentId)

    const hoursAdded = endHours - usageLog.startHours
    equipment.endUsage(hoursAdded)

    await this.repository.save(equipment)
    await this.repository.completeUsageLog(dto.usageLogId, endHours, dto.notes)
  }

  async sendToMaintenance(equipmentId: string): Promise<Equipment> {
    const equipment = await this.getEquipmentById(equipmentId)
    equipment.sendToMaintenance()
    await this.repository.save(equipment)
    return equipment
  }

  async completeMaintenance(
    equipmentId: string,
    description: string,
    cost?: number
  ): Promise<Equipment> {
    const equipment = await this.getEquipmentById(equipmentId)
    equipment.completeMaintenance()

    await this.repository.save(equipment)
    await this.repository.createMaintenanceEvent({
      equipmentId,
      type: 'ROUTINE',
      description,
      performedAt: new Date(),
      hoursAtMaintenance: equipment.operatingHours,
      cost,
    })

    return equipment
  }
}
