/**
 * GET /api/materials/low-stock - Get materials with low stock
 */

import { NextRequest, NextResponse } from 'next/server'
import { MaterialService } from '@/modules/materials/application/material.service'
import { MaterialRepository } from '@/modules/materials/infrastructure/material.repository'
import { authenticateRequest } from '@/lib/auth/middleware'

const materialService = new MaterialService(new MaterialRepository())

export async function GET(req: NextRequest) {
  try {
    const user = authenticateRequest(req)

    const materials = await materialService.getLowStockMaterials()

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
