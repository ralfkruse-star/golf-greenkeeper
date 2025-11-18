/**
 * Equipment Service
 * Business logic for equipment management
 */

import {
  EquipmentStatus,
  type Equipment,
  type EquipmentUsageLog,
  type CreateEquipmentInput,
  type StartEquipmentUsageInput,
  type StopEquipmentUsageInput,
} from '../types'
import { ValidationError, NotFoundError } from '@/types'

export class EquipmentService {
  constructor(private prisma: any) {}

  /**
   * Create new equipment
   */
  async createEquipment(input: CreateEquipmentInput): Promise<Equipment> {
    // Check if code is unique
    const existing = await this.prisma.equipment.findUnique({
      where: { code: input.code },
    })

    if (existing) {
      throw new ValidationError(`Equipment code ${input.code} already exists`)
    }

    const equipment = await this.prisma.equipment.create({
      data: {
        name: input.name,
        code: input.code,
        type: input.type,
        manufacturer: input.manufacturer,
        model: input.model,
        serialNumber: input.serialNumber,
        purchaseDate: input.purchaseDate,
        purchasePrice: input.purchasePrice,
        initialHours: input.initialHours || 0,
        currentHours: input.initialHours || 0,
        status: EquipmentStatus.AVAILABLE,
      },
    })

    return equipment
  }

  /**
   * Get equipment by ID
   */
  async getEquipmentById(equipmentId: string): Promise<Equipment | null> {
    return this.prisma.equipment.findUnique({
      where: { id: equipmentId },
    })
  }

  /**
   * Get equipment by code (for QR scanning)
   */
  async getEquipmentByCode(code: string): Promise<Equipment | null> {
    return this.prisma.equipment.findUnique({
      where: { code },
    })
  }

  /**
   * List equipment with filters
   */
  async listEquipment(filters: {
    status?: EquipmentStatus
    type?: string
    active?: boolean
  }): Promise<Equipment[]> {
    const where: any = {}

    if (filters.status) where.status = filters.status
    if (filters.type) where.type = filters.type
    if (filters.active !== undefined) where.active = filters.active

    return this.prisma.equipment.findMany({
      where,
      orderBy: [{ status: 'asc' }, { name: 'asc' }],
    })
  }

  /**
   * Start equipment usage (check-out)
   */
  async startUsage(input: StartEquipmentUsageInput): Promise<EquipmentUsageLog> {
    return this.prisma.$transaction(async (tx: any) => {
      const equipment = await tx.equipment.findUnique({
        where: { id: input.equipmentId },
      })

      if (!equipment) {
        throw new NotFoundError('Equipment')
      }

      if (equipment.status === EquipmentStatus.IN_USE) {
        throw new ValidationError('Equipment is already in use')
      }

      if (equipment.status === EquipmentStatus.BROKEN) {
        throw new ValidationError('Equipment is broken and cannot be used')
      }

      if (equipment.status === EquipmentStatus.MAINTENANCE) {
        throw new ValidationError('Equipment is under maintenance')
      }

      // Create usage log
      const usageLog = await tx.equipmentUsageLog.create({
        data: {
          equipmentId: input.equipmentId,
          userId: input.userId,
          startTime: new Date(),
          hoursStart: equipment.currentHours,
          locationId: input.locationId,
        },
      })

      // Update equipment status
      await tx.equipment.update({
        where: { id: input.equipmentId },
        data: { status: EquipmentStatus.IN_USE },
      })

      return usageLog
    })
  }

  /**
   * Stop equipment usage (check-in)
   */
  async stopUsage(input: StopEquipmentUsageInput): Promise<EquipmentUsageLog> {
    return this.prisma.$transaction(async (tx: any) => {
      const usageLog = await tx.equipmentUsageLog.findUnique({
        where: { id: input.usageLogId },
        include: { equipment: true },
      })

      if (!usageLog) {
        throw new NotFoundError('Usage log')
      }

      if (usageLog.endTime) {
        throw new ValidationError('Usage already stopped')
      }

      const updateData: any = {
        endTime: new Date(),
        notes: input.notes,
      }

      // If hours provided, update them
      if (input.hoursEnd !== undefined) {
        updateData.hoursEnd = input.hoursEnd

        // Update equipment current hours
        await tx.equipment.update({
          where: { id: usageLog.equipmentId },
          data: {
            currentHours: input.hoursEnd,
            status: EquipmentStatus.AVAILABLE,
          },
        })
      } else {
        // Just set status back to available
        await tx.equipment.update({
          where: { id: usageLog.equipmentId },
          data: { status: EquipmentStatus.AVAILABLE },
        })
      }

      // Update usage log
      const updatedLog = await tx.equipmentUsageLog.update({
        where: { id: input.usageLogId },
        data: updateData,
      })

      return updatedLog
    })
  }

  /**
   * Get active usage for equipment
   */
  async getActiveUsage(equipmentId: string): Promise<EquipmentUsageLog | null> {
    return this.prisma.equipmentUsageLog.findFirst({
      where: {
        equipmentId,
        endTime: null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })
  }

  /**
   * Get usage history for equipment
   */
  async getUsageHistory(
    equipmentId: string,
    limit: number = 50
  ): Promise<EquipmentUsageLog[]> {
    return this.prisma.equipmentUsageLog.findMany({
      where: { equipmentId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
      take: limit,
    })
  }

  /**
   * Update equipment status
   */
  async updateEquipmentStatus(
    equipmentId: string,
    status: EquipmentStatus
  ): Promise<Equipment> {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
    })

    if (!equipment) {
      throw new NotFoundError('Equipment')
    }

    // Don't allow setting to IN_USE manually (use startUsage instead)
    if (status === EquipmentStatus.IN_USE) {
      throw new ValidationError('Use startUsage endpoint to mark equipment as in use')
    }

    return this.prisma.equipment.update({
      where: { id: equipmentId },
      data: { status },
    })
  }
}
