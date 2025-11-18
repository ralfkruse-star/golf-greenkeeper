/**
 * GET /api/materials - List materials
 * POST /api/materials - Create material
 */

import { NextRequest, NextResponse } from 'next/server'
import { MaterialService } from '@/modules/materials/application/material.service'
import { MaterialRepository } from '@/modules/materials/infrastructure/material.repository'
import { authenticateRequest, requireManagement } from '@/lib/auth/middleware'
import { z } from 'zod'
import { MaterialType } from '@/types'

const materialService = new MaterialService(new MaterialRepository())

const createMaterialSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.nativeEnum(MaterialType),
  manufacturer: z.string().optional(),
  unit: z.string().min(1).max(50),
  initialStock: z.number().min(0).optional(),
  minStock: z.number().min(0).optional(),
  unitCost: z.number().positive().optional(),
  safetyInfo: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const user = authenticateRequest(req)

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || undefined

    const materials = await materialService.listMaterials(type as any)

    return NextResponse.json({
      success: true,
      data: materials.map(m => m.toJSON),
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

    const result = createMaterialSchema.safeParse(body)
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

    const material = await materialService.createMaterial(result.data)

    return NextResponse.json(
      {
        success: true,
        data: material.toJSON,
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
