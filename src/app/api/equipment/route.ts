/**
 * Equipment API Routes
 * POST /api/equipment - Create equipment
 * GET /api/equipment - List equipment
 */

import { NextRequest } from 'next/server'
import { EquipmentService } from '@/modules/equipment/services/equipment-service'
import { createEquipmentSchema } from '@/modules/equipment/validators'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getRequestBody, getQueryParams } from '@/lib/api-helpers'
import { EquipmentStatus } from '@/modules/equipment/types'

const equipmentService = new EquipmentService(prisma)

/**
 * POST /api/equipment
 * Create new equipment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await getRequestBody(request)

    // Validate input
    const validatedData = createEquipmentSchema.parse(body)

    // Create equipment
    const equipment = await equipmentService.createEquipment(validatedData)

    return successResponse(equipment, 201)
  } catch (error) {
    return errorResponse(error)
  }
}

/**
 * GET /api/equipment
 * List equipment with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request)

    // Parse filters
    const filters: any = {}

    if (params.status) {
      filters.status = params.status as EquipmentStatus
    }

    if (params.type) {
      filters.type = params.type
    }

    if (params.active) {
      filters.active = params.active === 'true'
    }

    const equipment = await equipmentService.listEquipment(filters)

    return successResponse(equipment)
  } catch (error) {
    return errorResponse(error)
  }
}
