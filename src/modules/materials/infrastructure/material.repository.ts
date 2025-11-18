/**
 * Material Repository
 */

import { Material, MaterialProps } from '../domain/material.entity'
import { MaterialType } from '@/types'
import prisma from '@/lib/db'
import { generateCode } from '@/lib/utils'

export interface CreateApplicationDTO {
  materialId: string
  zoneId: string
  userId: string
  quantity: number
  unit: string
  notes?: string
}

export interface StockChangeLogDTO {
  materialId: string
  type: 'ADD' | 'REMOVE'
  quantity: number
  reason?: string
  newStock: number
}

export interface ApplicationFilters {
  materialId?: string
  zoneId?: string
  dateFrom?: Date
  dateTo?: Date
}

export class MaterialRepository {
  async save(material: Material): Promise<void> {
    const props = material.toJSON

    await prisma.material.upsert({
      where: { id: props.id },
      create: {
        id: props.id,
        code: props.code,
        name: props.name,
        type: props.type,
        manufacturer: props.manufacturer,
        unit: props.unit,
        currentStock: props.currentStock,
        minStock: props.minStock,
        unitCost: props.unitCost,
        safetyInfo: props.safetyInfo,
        metadata: props.metadata || {},
      },
      update: {
        name: props.name,
        manufacturer: props.manufacturer,
        currentStock: props.currentStock,
        minStock: props.minStock,
        unitCost: props.unitCost,
        safetyInfo: props.safetyInfo,
        metadata: props.metadata || {},
        updatedAt: new Date(),
      },
    })
  }

  async findById(id: string): Promise<Material | null> {
    const record = await prisma.material.findUnique({ where: { id } })
    return record ? this.toDomain(record) : null
  }

  async findByCode(code: string): Promise<Material | null> {
    const record = await prisma.material.findUnique({ where: { code } })
    return record ? this.toDomain(record) : null
  }

  async findMany(type?: MaterialType): Promise<Material[]> {
    const records = await prisma.material.findMany({
      where: type ? { type } : {},
      orderBy: { name: 'asc' },
    })
    return records.map((r: any) => this.toDomain(r))
  }

  async generateNextCode(): Promise<string> {
    const lastMaterial = await prisma.material.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { code: true },
    })

    if (!lastMaterial) {
      return 'MAT-001'
    }

    const match = lastMaterial.code.match(/MAT-(\d+)/)
    if (match) {
      const num = parseInt(match[1], 10) + 1
      return generateCode('MAT', num, 3)
    }

    return 'MAT-001'
  }

  async createApplication(dto: CreateApplicationDTO): Promise<void> {
    await prisma.materialApplication.create({
      data: {
        materialId: dto.materialId,
        zoneId: dto.zoneId,
        userId: dto.userId,
        quantity: dto.quantity,
        unit: dto.unit,
        notes: dto.notes,
      },
    })
  }

  async findApplications(filters: ApplicationFilters): Promise<any[]> {
    const where: any = {}

    if (filters.materialId) {
      where.materialId = filters.materialId
    }

    if (filters.zoneId) {
      where.zoneId = filters.zoneId
    }

    if (filters.dateFrom || filters.dateTo) {
      where.appliedAt = {}
      if (filters.dateFrom) {
        where.appliedAt.gte = filters.dateFrom
      }
      if (filters.dateTo) {
        where.appliedAt.lte = filters.dateTo
      }
    }

    return prisma.materialApplication.findMany({
      where,
      include: {
        material: true,
        zone: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    })
  }

  async logStockChange(dto: StockChangeLogDTO): Promise<void> {
    // Could be stored in a separate table for audit trail
    // For now, we're just using the MaterialApplication table
    // In production, you might want a dedicated StockChangeLog table
  }

  private toDomain(record: any): Material {
    const props: MaterialProps = {
      id: record.id,
      code: record.code,
      name: record.name,
      type: record.type as MaterialType,
      manufacturer: record.manufacturer,
      unit: record.unit,
      currentStock: record.currentStock,
      minStock: record.minStock,
      unitCost: record.unitCost,
      safetyInfo: record.safetyInfo,
      metadata: typeof record.metadata === 'object' ? record.metadata : undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }
    return new Material(props)
  }
}
