/**
 * Equipment Usage Stop API Route
 * POST /api/equipment/[id]/usage/stop - Check-in equipment
 */

import { NextRequest } from 'next/server'
import { EquipmentService } from '@/modules/equipment/services/equipment-service'
import { stopUsageSchema } from '@/modules/equipment/validators'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getRequestBody } from '@/lib/api-helpers'

const equipmentService = new EquipmentService(prisma)

/**
 * POST /api/equipment/[id]/usage/stop
 * Stop equipment usage (check-in)
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const equipmentId = params.id

    const body = await getRequestBody(request)

    // Validate input
    const validatedData = stopUsageSchema.parse(body)

    // TODO: Get userId from JWT token
    const userId = request.headers.get('x-user-id') || 'system'

    // Get active usage
    const activeUsage = await equipmentService.getActiveUsage(equipmentId)

    if (!activeUsage) {
      return errorResponse(new Error('No active usage found for this equipment'), 400)
    }

    // Stop usage
    const usageLog = await equipmentService.stopUsage({
      usageLogId: activeUsage.id,
      userId,
      hoursEnd: validatedData.hoursEnd,
      notes: validatedData.notes,
    })

    return successResponse(usageLog)
  } catch (error) {
    return errorResponse(error)
  }
}
