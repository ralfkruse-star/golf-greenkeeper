/**
 * QR Equipment Check-In API Route
 * POST /api/qr/equipment/check-in
 * Check in equipment by QR code
 */

import { NextRequest } from 'next/server'
import { EquipmentService } from '@/modules/equipment/services/equipment-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getRequestBody } from '@/lib/api-helpers'
import { NotFoundError, ValidationError } from '@/types'
import { z } from 'zod'

const equipmentService = new EquipmentService(prisma)

const checkInSchema = z.object({
  equipmentCode: z.string().min(1, 'Equipment code is required'),
  hoursEnd: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
})

/**
 * POST /api/qr/equipment/check-in
 * Check in equipment using QR code
 */
export async function POST(request: NextRequest) {
  try {
    const body = await getRequestBody(request)

    // Validate input
    const validatedData = checkInSchema.parse(body)

    // Find equipment by code
    const equipment = await equipmentService.getEquipmentByCode(validatedData.equipmentCode)

    if (!equipment) {
      throw new NotFoundError('Equipment')
    }

    // Get active usage
    const activeUsage = await equipmentService.getActiveUsage(equipment.id)

    if (!activeUsage) {
      throw new ValidationError('No active usage found for this equipment')
    }

    // TODO: Get userId from JWT token
    const userId = request.headers.get('x-user-id') || 'system'

    // Stop usage
    const usageLog = await equipmentService.stopUsage({
      usageLogId: activeUsage.id,
      userId,
      hoursEnd: validatedData.hoursEnd,
      notes: validatedData.notes,
    })

    return successResponse({
      message: 'Equipment checked in successfully',
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
