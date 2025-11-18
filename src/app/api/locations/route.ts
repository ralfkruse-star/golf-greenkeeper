/**
 * GET /api/locations - List zones
 * POST /api/locations - Create zone
 */

import { NextRequest, NextResponse } from 'next/server'
import { LocationService } from '@/modules/locations/application/location.service'
import { LocationRepository } from '@/modules/locations/infrastructure/location.repository'
import { authenticateRequest, requireManagement } from '@/lib/auth/middleware'
import { createZoneSchema } from '@/lib/validation'

const locationService = new LocationService(new LocationRepository())

export async function GET(req: NextRequest) {
  try {
    const user = authenticateRequest(req)

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || undefined

    const zones = await locationService.listZones(type as any)

    return NextResponse.json({
      success: true,
      data: zones.map(z => z.toJSON),
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
    const result = createZoneSchema.safeParse(body)
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

    const zone = await locationService.createZone(result.data)

    return NextResponse.json(
      {
        success: true,
        data: zone.toJSON,
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
