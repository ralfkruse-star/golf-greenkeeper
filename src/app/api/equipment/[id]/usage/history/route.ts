/**
 * Equipment Usage History API Route
 * GET /api/equipment/[id]/usage/history - Get usage history
 */

import { NextRequest } from 'next/server'
import { EquipmentService } from '@/modules/equipment/services/equipment-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getQueryParams } from '@/lib/api-helpers'

const equipmentService = new EquipmentService(prisma)

/**
 * GET /api/equipment/[id]/usage/history
 * Get usage history for equipment
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const equipmentId = params.id

    const queryParams = getQueryParams(request)
    const limit = queryParams.limit ? parseInt(queryParams.limit, 10) : 50

    const history = await equipmentService.getUsageHistory(equipmentId, limit)

    return successResponse(history)
  } catch (error) {
    return errorResponse(error)
  }
}
