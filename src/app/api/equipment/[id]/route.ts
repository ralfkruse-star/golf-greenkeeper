/**
 * Single Equipment API Route
 * GET /api/equipment/[id] - Get equipment by ID
 */

import { NextRequest } from 'next/server'
import { EquipmentService } from '@/modules/equipment/services/equipment-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-helpers'
import { NotFoundError } from '@/types'

const equipmentService = new EquipmentService(prisma)

/**
 * GET /api/equipment/[id]
 * Get a single equipment by ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const equipmentId = params.id

    const equipment = await equipmentService.getEquipmentById(equipmentId)

    if (!equipment) {
      throw new NotFoundError('Equipment')
    }

    return successResponse(equipment)
  } catch (error) {
    return errorResponse(error)
  }
}
