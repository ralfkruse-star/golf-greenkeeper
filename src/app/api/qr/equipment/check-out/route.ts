/**
 * QR Equipment Check-Out API Route
 * POST /api/qr/equipment/check-out
 * Check out equipment by QR code
 */

import { NextRequest } from 'next/server'
import { EquipmentService } from '@/modules/equipment/services/equipment-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getRequestBody } from '@/lib/api-helpers'
import { NotFoundError } from '@/types'
import { z } from 'zod'

const equipmentService = new EquipmentService(prisma)

const checkOutSchema = z.object({
  equipmentCode: z.string().min(1, 'Equipment code is required'),
  locationId: z.string().cuid().optional(),
})

/**
 * POST /api/qr/equipment/check-out
 * Check out equipment using QR code
 */
export async function POST(request: NextRequest) {
  try {
    const body = await getRequestBody(request)

    // Validate input
    const validatedData = checkOutSchema.parse(body)

    // Find equipment by code
    const equipment = await equipmentService.getEquipmentByCode(validatedData.equipmentCode)

    if (!equipment) {
      throw new NotFoundError('Equipment')
    }

    // TODO: Get userId from JWT token
    const userId = request.headers.get('x-user-id') || 'system'

    // Start usage
    const usageLog = await equipmentService.startUsage({
      equipmentId: equipment.id,
      userId,
      locationId: validatedData.locationId,
    })

    return successResponse({
      message: 'Equipment checked out successfully',
      equipment: {
        id: equipment.id,
        name: equipment.name,
        code: equipment.code,
        type: equipment.type,
      },
      usageLog,
    })
  } catch (error) {
    return errorResponse(error)
  }
}
