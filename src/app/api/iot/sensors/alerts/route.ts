/**
 * IoT Sensor Alerts API
 * GET /api/iot/sensors/alerts - Get active alerts
 * PATCH /api/iot/sensors/alerts/:id - Acknowledge alert
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { iotSensorService } from '@/services/iot-sensor.service'

/**
 * Get active alerts
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const alerts = await iotSensorService.getActiveAlerts(session.user.tenantId)

    // Group by severity
    const grouped = {
      CRITICAL: alerts.filter((a) => a.severity === 'CRITICAL'),
      HIGH: alerts.filter((a) => a.severity === 'HIGH'),
      MEDIUM: alerts.filter((a) => a.severity === 'MEDIUM'),
      LOW: alerts.filter((a) => a.severity === 'LOW'),
    }

    return NextResponse.json({
      alerts,
      grouped,
      counts: {
        total: alerts.length,
        critical: grouped.CRITICAL.length,
        high: grouped.HIGH.length,
        medium: grouped.MEDIUM.length,
        low: grouped.LOW.length,
      },
    })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Acknowledge an alert
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { alertId } = body

    if (!alertId) {
      return NextResponse.json({ error: 'Missing alertId' }, { status: 400 })
    }

    await iotSensorService.acknowledgeAlert(alertId, session.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error acknowledging alert:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
