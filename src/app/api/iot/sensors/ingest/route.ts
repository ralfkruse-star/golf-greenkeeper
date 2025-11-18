/**
 * IoT Sensor Data Ingestion API
 * POST /api/iot/sensors/ingest
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { iotSensorService } from '@/services/iot-sensor.service'
import { ExtendedSensorType } from '@/modules/iot/types/sensors'

/**
 * Ingest sensor readings from IoT devices
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { deviceId, sensorType, data } = body

    // Validate required fields
    if (!deviceId || !sensorType || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: deviceId, sensorType, data' },
        { status: 400 }
      )
    }

    // Validate sensor type
    if (!Object.values(ExtendedSensorType).includes(sensorType)) {
      return NextResponse.json({ error: 'Invalid sensor type' }, { status: 400 })
    }

    // Ingest the reading
    const result = await iotSensorService.ingestReading(
      deviceId,
      sensorType,
      data,
      session.user.tenantId
    )

    return NextResponse.json({
      success: true,
      alerts: result.alerts || [],
      alertCount: result.alerts?.length || 0,
    })
  } catch (error) {
    console.error('Error ingesting sensor data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
