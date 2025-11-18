/**
 * GET /api/equipment - List equipment
 * POST /api/equipment - Create equipment
 */

import { NextRequest, NextResponse } from 'next/server'
import { EquipmentService } from '@/modules/equipment/application/equipment.service'
import { EquipmentRepository } from '@/modules/equipment/infrastructure/equipment.repository'
import { authenticateRequest, requireManagement } from '@/lib/auth/middleware'
import { createEquipmentSchema } from '@/lib/validation'

const equipmentService = new EquipmentService(new EquipmentRepository())

export async function GET(req: NextRequest) {
  try {
    const user = authenticateRequest(req)

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined

    const equipment = await equipmentService.listEquipment(status as any)

    return NextResponse.json({
      success: true,
      data: equipment.map(e => e.toJSON),
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

export async function POST(req: NextRequest) {
  try {
    const user = authenticateRequest(req)
    requireManagement(user)

    const body = await req.json()

    // Validate
    const result = createEquipmentSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: result.error.errors,
          },
        },
        { status: 400 }
      )
    }

    const equipment = await equipmentService.createEquipment({
      ...result.data,
      purchaseDate: result.data.purchaseDate ? new Date(result.data.purchaseDate) : undefined,
    })

    return NextResponse.json(
      {
        success: true,
        data: equipment.toJSON,
      },
      { status: 201 }
    )
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
