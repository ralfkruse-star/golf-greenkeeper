/**
 * IoT Sensor Readings API
 * GET /api/iot/sensors/readings
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { iotSensorService } from '@/services/iot-sensor.service'
import { ExtendedSensorType } from '@/modules/iot/types/sensors'

/**
 * Get sensor readings for a location
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const locationId = searchParams.get('locationId')
    const sensorType = searchParams.get('sensorType') as ExtendedSensorType
    const days = parseInt(searchParams.get('days') || '7')

    if (!locationId || !sensorType) {
      return NextResponse.json(
        { error: 'Missing required query parameters: locationId, sensorType' },
        { status: 400 }
      )
    }

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const readings = await iotSensorService.getReadings(
      locationId,
      sensorType,
      startDate,
      endDate,
      session.user.tenantId
    )

    const statistics = await iotSensorService.getSensorStatistics(
      locationId,
      sensorType,
      days,
      session.user.tenantId
    )

    return NextResponse.json({
      readings,
      statistics,
      period: { startDate, endDate, days },
    })
  } catch (error) {
    console.error('Error fetching sensor readings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
