/**
 * Equipment Usage Start API Route
 * POST /api/equipment/[id]/usage/start - Check-out equipment
 */

import { NextRequest } from 'next/server'
import { EquipmentService } from '@/modules/equipment/services/equipment-service'
import { startUsageSchema } from '@/modules/equipment/validators'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getRequestBody } from '@/lib/api-helpers'

const equipmentService = new EquipmentService(prisma)

/**
 * POST /api/equipment/[id]/usage/start
 * Start equipment usage (check-out)
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
    const validatedData = startUsageSchema.parse(body)

    // TODO: Get userId from JWT token
    const userId = request.headers.get('x-user-id') || 'system'

    // Start usage
    const usageLog = await equipmentService.startUsage({
      equipmentId,
      userId,
      locationId: validatedData.locationId,
    })

    return successResponse(usageLog, 201)
  } catch (error) {
    return errorResponse(error)
  }
}
