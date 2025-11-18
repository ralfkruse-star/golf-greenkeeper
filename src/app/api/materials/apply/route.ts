/**
 * POST /api/materials/apply - Apply material to zone
 */

import { NextRequest, NextResponse } from 'next/server'
import { MaterialService } from '@/modules/materials/application/material.service'
import { MaterialRepository } from '@/modules/materials/infrastructure/material.repository'
import { authenticateRequest } from '@/lib/auth/middleware'
import { z } from 'zod'

const materialService = new MaterialService(new MaterialRepository())

const applyMaterialSchema = z.object({
  materialId: z.string().uuid(),
  zoneId: z.string().uuid(),
  quantity: z.number().positive(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const user = authenticateRequest(req)

    const body = await req.json()

    const result = applyMaterialSchema.safeParse(body)
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

    await materialService.applyMaterial({
      ...result.data,
      userId: user.userId,
    })

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
