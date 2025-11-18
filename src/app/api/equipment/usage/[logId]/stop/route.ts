/**
 * POST /api/equipment/usage/:logId/stop - End equipment usage
 */

import { NextRequest, NextResponse } from 'next/server'
import { EquipmentService } from '@/modules/equipment/application/equipment.service'
import { EquipmentRepository } from '@/modules/equipment/infrastructure/equipment.repository'
import { authenticateRequest } from '@/lib/auth/middleware'

const equipmentService = new EquipmentService(new EquipmentRepository())

export async function POST(
  req: NextRequest,
  { params }: { params: { logId: string } }
) {
  try {
    const user = authenticateRequest(req)

    const body = await req.json()

    await equipmentService.endUsage(
      {
        usageLogId: params.logId,
        notes: body.notes,
      },
      body.endHours
    )

    return NextResponse.json({
      success: true,
      data: null,
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
