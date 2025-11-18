/**
 * POST /api/equipment/:id/usage/start - Start equipment usage
 */

import { NextRequest, NextResponse } from 'next/server'
import { EquipmentService } from '@/modules/equipment/application/equipment.service'
import { EquipmentRepository } from '@/modules/equipment/infrastructure/equipment.repository'
import { authenticateRequest } from '@/lib/auth/middleware'

const equipmentService = new EquipmentService(new EquipmentRepository())

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = authenticateRequest(req)

    const body = await req.json()

    const usageLogId = await equipmentService.startUsage({
      equipmentId: params.id,
      userId: user.userId,
      zoneId: body.zoneId,
      notes: body.notes,
    })

    return NextResponse.json({
      success: true,
      data: {
        usageLogId,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'An error occurred',
        },
      },
      { status: error.statusCode || 500 }
    )
  }
}
