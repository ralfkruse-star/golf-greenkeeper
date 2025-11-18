/**
 * Material Service
 */

import { Material, MaterialProps } from '../domain/material.entity'
import { MaterialRepository } from '../infrastructure/material.repository'
import { MaterialType } from '@/types'
import { NotFoundError } from '@/lib/errors'

export interface CreateMaterialDTO {
  name: string
  type: MaterialType
  manufacturer?: string
  unit: string
  initialStock?: number
  minStock?: number
  unitCost?: number
  safetyInfo?: string
}

export interface UpdateMaterialDTO {
  name?: string
  manufacturer?: string
  unitCost?: number
  minStock?: number
  safetyInfo?: string
}

export interface MaterialApplicationDTO {
  materialId: string
  zoneId: string
  userId: string
  quantity: number
  notes?: string
}

export class MaterialService {
  constructor(private repository: MaterialRepository) {}

  async createMaterial(dto: CreateMaterialDTO): Promise<Material> {
    const code = await this.repository.generateNextCode()

    const now = new Date()
    const materialProps: MaterialProps = {
      id: crypto.randomUUID(),
      code,
      name: dto.name,
      type: dto.type,
      manufacturer: dto.manufacturer,
      unit: dto.unit,
      currentStock: dto.initialStock || 0,
      minStock: dto.minStock,
      unitCost: dto.unitCost,
      safetyInfo: dto.safetyInfo,
      createdAt: now,
      updatedAt: now,
    }

    const material = new Material(materialProps)
    await this.repository.save(material)

    return material
  }

  async getMaterialById(id: string): Promise<Material> {
    const material = await this.repository.findById(id)
    if (!material) {
      throw new NotFoundError('Material', id)
    }
    return material
  }

  async getMaterialByCode(code: string): Promise<Material> {
    const material = await this.repository.findByCode(code)
    if (!material) {
      throw new NotFoundError('Material', code)
    }
    return material
  }

  async listMaterials(type?: MaterialType): Promise<Material[]> {
    return this.repository.findMany(type)
  }

  async updateMaterial(id: string, dto: UpdateMaterialDTO): Promise<Material> {
    const material = await this.getMaterialById(id)
    material.updateDetails(dto)
    await this.repository.save(material)
    return material
  }

  async addStock(materialId: string, quantity: number, reason?: string): Promise<Material> {
    const material = await this.getMaterialById(materialId)
    material.addStock(quantity, reason)
    await this.repository.save(material)

    // Log stock change
    await this.repository.logStockChange({
      materialId,
      type: 'ADD',
      quantity,
      reason,
      newStock: material.currentStock,
    })

    return material
  }

  async applyMaterial(dto: MaterialApplicationDTO): Promise<void> {
    const material = await this.getMaterialById(dto.materialId)

    // Remove from stock
    material.removeStock(dto.quantity, `Applied to zone ${dto.zoneId}`)
    await this.repository.save(material)

    // Log stock change
    await this.repository.logStockChange({
      materialId: dto.materialId,
      type: 'REMOVE',
      quantity: dto.quantity,
      reason: `Applied to zone ${dto.zoneId}`,
      newStock: material.currentStock,
    })

    // Create application record
    await this.repository.createApplication({
      materialId: dto.materialId,
      zoneId: dto.zoneId,
      userId: dto.userId,
      quantity: dto.quantity,
      unit: material.toJSON.unit,
      notes: dto.notes,
    })
  }

  async getLowStockMaterials(): Promise<Material[]> {
    const allMaterials = await this.repository.findMany()
    return allMaterials.filter(m => m.isStockLow())
  }

  async getMaterialApplications(
    materialId?: string,
    zoneId?: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<any[]> {
    return this.repository.findApplications({ materialId, zoneId, dateFrom, dateTo })
  }
}
