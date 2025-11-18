import { NextRequest, NextResponse } from 'next/server'

// GET /api/zones - Get all zones
export async function GET(request: NextRequest) {
  try {
    // Mock data for 18-hole course
    const zones = []

    // Generate zones for 18 holes
    for (let i = 1; i <= 18; i++) {
      // Green
      zones.push({
        id: `green-${i}`,
        name: `Green ${i}`,
        type: 'GREEN',
        holeNumber: i,
        area: 400 + Math.random() * 200,
        latitude: 53.6394 + (Math.random() - 0.5) * 0.01,
        longitude: 10.2931 + (Math.random() - 0.5) * 0.01,
        radius: 30,
      })

      // Tee
      zones.push({
        id: `tee-${i}`,
        name: `Tee ${i}`,
        type: 'TEE',
        holeNumber: i,
        area: 100 + Math.random() * 50,
        latitude: 53.6394 + (Math.random() - 0.5) * 0.01,
        longitude: 10.2931 + (Math.random() - 0.5) * 0.01,
        radius: 15,
      })

      // Fairway
      zones.push({
        id: `fairway-${i}`,
        name: `Fairway ${i}`,
        type: 'FAIRWAY',
        holeNumber: i,
        area: 3000 + Math.random() * 2000,
        latitude: 53.6394 + (Math.random() - 0.5) * 0.01,
        longitude: 10.2931 + (Math.random() - 0.5) * 0.01,
        radius: 100,
      })
    }

    return NextResponse.json({
      success: true,
      data: zones,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ZONES_FETCH_FAILED',
          message: error.message,
        },
      },
      { status: 500 }
    )
  }
}

// POST /api/zones - Create new zone
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // TODO: Validate and store in database
    const newZone = {
      id: `zone-${Date.now()}`,
      ...body,
      createdAt: new Date(),
    }

    return NextResponse.json({
      success: true,
      data: newZone,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ZONE_CREATION_FAILED',
          message: error.message,
        },
      },
      { status: 500 }
    )
  }
}
