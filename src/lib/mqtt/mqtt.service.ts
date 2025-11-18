import mqtt, { MqttClient } from 'mqtt'
import { WebSocketServer } from '../websocket/server'

export interface SensorData {
  deviceId: string
  zoneId: string
  type: 'SOIL_MOISTURE' | 'TEMPERATURE' | 'HUMIDITY' | 'PH_LEVEL' | 'LIGHT_LEVEL'
  value: number
  unit: string
  timestamp: Date
  battery?: number
  signal?: number
}

export class MQTTService {
  private client: MqttClient | null = null
  private wsServer: WebSocketServer
  private brokerUrl: string
  private options: mqtt.IClientOptions

  constructor(wsServer: WebSocketServer) {
    this.wsServer = wsServer
    this.brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883'
    this.options = {
      clientId: `golf-greenkeeper-${Math.random().toString(16).substr(2, 8)}`,
      clean: true,
      connectTimeout: 4000,
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      reconnectPeriod: 1000,
    }
  }

  /**
   * Connect to MQTT broker and subscribe to topics
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.client = mqtt.connect(this.brokerUrl, this.options)

        this.client.on('connect', () => {
          console.log('✓ Connected to MQTT broker:', this.brokerUrl)

          // Subscribe to sensor topics
          this.subscribeTo Topics([
            'golf/sensors/+/data', // golf/sensors/{deviceId}/data
            'golf/sensors/+/status', // golf/sensors/{deviceId}/status
            'golf/sensors/+/alert', // golf/sensors/{deviceId}/alert
          ])

          resolve()
        })

        this.client.on('error', (error) => {
          console.error('✗ MQTT connection error:', error)
          reject(error)
        })

        this.client.on('message', (topic, message) => {
          this.handleMessage(topic, message)
        })

        this.client.on('reconnect', () => {
          console.log('↻ Reconnecting to MQTT broker...')
        })

        this.client.on('close', () => {
          console.log('✗ MQTT connection closed')
        })
      } catch (error) {
        console.error('✗ Failed to connect to MQTT broker:', error)
        reject(error)
      }
    })
  }

  /**
   * Subscribe to MQTT topics
   */
  private subscribeToTopics(topics: string[]): void {
    if (!this.client) return

    topics.forEach((topic) => {
      this.client!.subscribe(topic, (err) => {
        if (err) {
          console.error(`✗ Failed to subscribe to topic ${topic}:`, err)
        } else {
          console.log(`✓ Subscribed to topic: ${topic}`)
        }
      })
    })
  }

  /**
   * Handle incoming MQTT messages
   */
  private handleMessage(topic: string, message: Buffer): void {
    try {
      const payload = message.toString()
      const data = JSON.parse(payload)

      console.log(`📨 MQTT message received on ${topic}:`, data)

      // Determine message type based on topic
      if (topic.includes('/data')) {
        this.handleSensorData(data)
      } else if (topic.includes('/status')) {
        this.handleSensorStatus(data)
      } else if (topic.includes('/alert')) {
        this.handleSensorAlert(data)
      }
    } catch (error) {
      console.error('✗ Failed to handle MQTT message:', error)
    }
  }

  /**
   * Handle sensor data readings
   */
  private handleSensorData(data: SensorData): void {
    // Broadcast to all connected WebSocket clients
    this.wsServer.broadcast('SENSOR_DATA', data)

    // TODO: Store in database
    // await this.sensorRepository.createReading(data)

    // Check for alerts
    this.checkForAlerts(data)
  }

  /**
   * Handle sensor status updates
   */
  private handleSensorStatus(data: any): void {
    this.wsServer.broadcast('SENSOR_STATUS', data)

    // Log status change
    console.log(`📊 Sensor ${data.deviceId} status: ${data.status}`)
  }

  /**
   * Handle sensor alerts
   */
  private handleSensorAlert(data: any): void {
    this.wsServer.broadcast('SENSOR_ALERT', data)

    // Log alert
    console.warn(`⚠️ Sensor alert from ${data.deviceId}: ${data.message}`)

    // TODO: Send push notifications
    // TODO: Create notification in database
  }

  /**
   * Check sensor readings for alert conditions
   */
  private checkForAlerts(data: SensorData): void {
    const alerts: string[] = []

    // Soil moisture alerts
    if (data.type === 'SOIL_MOISTURE') {
      if (data.value < 20) {
        alerts.push(`Kritisch niedrige Bodenfeuchtigkeit: ${data.value}%`)
      } else if (data.value < 30) {
        alerts.push(`Niedrige Bodenfeuchtigkeit: ${data.value}%`)
      } else if (data.value > 70) {
        alerts.push(`Hohe Bodenfeuchtigkeit: ${data.value}%`)
      }
    }

    // Temperature alerts
    if (data.type === 'TEMPERATURE') {
      if (data.value < 5) {
        alerts.push(`Frost-Warnung: ${data.value}°C`)
      } else if (data.value > 35) {
        alerts.push(`Hitze-Warnung: ${data.value}°C`)
      }
    }

    // PH Level alerts
    if (data.type === 'PH_LEVEL') {
      if (data.value < 6.0 || data.value > 7.5) {
        alerts.push(`pH-Wert außerhalb Idealbereich: ${data.value}`)
      }
    }

    // Battery alerts
    if (data.battery !== undefined && data.battery < 20) {
      alerts.push(`Niedriger Batteriestand: ${data.battery}%`)
    }

    // Broadcast alerts
    if (alerts.length > 0) {
      this.wsServer.broadcast('SENSOR_ALERT', {
        deviceId: data.deviceId,
        zoneId: data.zoneId,
        alerts,
        timestamp: new Date(),
      })
    }
  }

  /**
   * Publish message to MQTT topic
   */
  publish(topic: string, message: any): void {
    if (!this.client) {
      console.error('✗ MQTT client not connected')
      return
    }

    const payload = JSON.stringify(message)
    this.client.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        console.error(`✗ Failed to publish to ${topic}:`, err)
      } else {
        console.log(`✓ Published to ${topic}:`, message)
      }
    })
  }

  /**
   * Disconnect from MQTT broker
   */
  disconnect(): void {
    if (this.client) {
      this.client.end()
      this.client = null
      console.log('✓ Disconnected from MQTT broker')
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.client?.connected || false
  }
}

// Singleton instance
let mqttService: MQTTService | null = null

export function initializeMQTT(wsServer: WebSocketServer): MQTTService {
  if (!mqttService) {
    mqttService = new MQTTService(wsServer)
  }
  return mqttService
}

export function getMQTTService(): MQTTService | null {
  return mqttService
}
