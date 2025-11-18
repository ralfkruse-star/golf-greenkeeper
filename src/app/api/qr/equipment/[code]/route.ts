/**
 * GET /api/qr/equipment/:code - Get equipment by QR code
 */

import { NextRequest, NextResponse } from 'next/server'
import { EquipmentService } from '@/modules/equipment/application/equipment.service'
import { EquipmentRepository } from '@/modules/equipment/infrastructure/equipment.repository'
import { authenticateRequest } from '@/lib/auth/middleware'

const equipmentService = new EquipmentService(new EquipmentRepository())

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const user = authenticateRequest(req)

    const equipment = await equipmentService.getEquipmentByCode(params.code)

    return NextResponse.json({
      success: true,
      data: {
        equipment: equipment.toJSON,
        actions: {
          canStart: equipment.status === 'AVAILABLE',
          canEnd: equipment.status === 'IN_USE',
          canMaintenance: equipment.status === 'AVAILABLE',
        },
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
