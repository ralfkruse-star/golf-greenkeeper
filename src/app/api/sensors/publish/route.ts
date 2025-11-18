import { NextRequest, NextResponse } from 'next/server'
import { getMQTTService } from '@/lib/mqtt/mqtt.service'

// POST /api/sensors/publish - Publish message to sensor via MQTT
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceId, topic, message } = body

    if (!deviceId || !topic || !message) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'deviceId, topic, and message are required',
          },
        },
        { status: 400 }
      )
    }

    const mqttService = getMQTTService()

    if (!mqttService || !mqttService.isConnected()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MQTT_NOT_CONNECTED',
            message: 'MQTT service is not connected',
          },
        },
        { status: 503 }
      )
    }

    // Publish message to MQTT
    const fullTopic = `golf/sensors/${deviceId}/${topic}`
    mqttService.publish(fullTopic, message)

    return NextResponse.json({
      success: true,
      data: {
        deviceId,
        topic: fullTopic,
        message,
        publishedAt: new Date(),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PUBLISH_FAILED',
          message: error.message,
        },
      },
      { status: 500 }
    )
  }
}
