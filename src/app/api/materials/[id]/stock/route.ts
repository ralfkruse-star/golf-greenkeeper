/**
 * POST /api/materials/:id/stock - Add stock
 */

import { NextRequest, NextResponse } from 'next/server'
import { MaterialService } from '@/modules/materials/application/material.service'
import { MaterialRepository } from '@/modules/materials/infrastructure/material.repository'
import { authenticateRequest, requireManagement } from '@/lib/auth/middleware'
import { z } from 'zod'

const materialService = new MaterialService(new MaterialRepository())

const addStockSchema = z.object({
  quantity: z.number().positive(),
  reason: z.string().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = authenticateRequest(req)
    requireManagement(user)

    const body = await req.json()

    const result = addStockSchema.safeParse(body)
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

    const material = await materialService.addStock(
      params.id,
      result.data.quantity,
      result.data.reason
    )

    return NextResponse.json({
      success: true,
      data: material.toJSON,
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
