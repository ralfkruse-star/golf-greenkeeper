/**
 * Sensor Service
 * IoT Sensor Integration und Real-Time Data Processing
 */

import type { SensorType } from '@prisma/client'

export interface SensorReading {
  deviceId: string
  timestamp: Date
  value: number
  unit: string
  metadata?: Record<string, any>
}

export interface SensorAlert {
  id: string
  deviceId: string
  type: 'THRESHOLD_EXCEEDED' | 'DEVICE_OFFLINE' | 'ANOMALY'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  value?: number
  threshold?: number
  timestamp: Date
}

export class SensorService {
  constructor(private prisma: any) {}

  /**
   * Register a new sensor device
   */
  async registerDevice(data: {
    name: string
    code: string
    type: SensorType
    locationId?: string
    latitude?: number
    longitude?: number
    depth?: number
    metadata?: Record<string, any>
  }) {
    return this.prisma.sensorDevice.create({
      data: {
        ...data,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
        lastSeenAt: new Date(),
      },
    })
  }

  /**
   * Ingest sensor readings (batch or single)
   */
  async ingestReadings(readings: SensorReading[]) {
    const created = await this.prisma.sensorReading.createMany({
      data: readings.map((r) => ({
        deviceId: r.deviceId,
        timestamp: r.timestamp,
        value: r.value,
        unit: r.unit,
        metadata: r.metadata ? JSON.parse(JSON.stringify(r.metadata)) : undefined,
      })),
    })

    // Update last seen for all devices
    const deviceIds = [...new Set(readings.map((r) => r.deviceId))]
    await Promise.all(
      deviceIds.map((id) =>
        this.prisma.sensorDevice.update({
          where: { id },
          data: { lastSeenAt: new Date() },
        })
      )
    )

    return created
  }

  /**
   * Get latest reading for a device
   */
  async getLatestReading(deviceId: string) {
    return this.prisma.sensorReading.findFirst({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
      include: {
        device: true,
      },
    })
  }

  /**
   * Get readings for time range
   */
  async getReadings(
    deviceId: string,
    from: Date,
    to: Date,
    aggregation?: 'none' | 'hourly' | 'daily'
  ) {
    const readings = await this.prisma.sensorReading.findMany({
      where: {
        deviceId,
        timestamp: {
          gte: from,
          lte: to,
        },
      },
      orderBy: { timestamp: 'asc' },
    })

    if (aggregation === 'none' || !aggregation) {
      return readings
    }

    // Aggregate by hour or day
    const aggregated = new Map<string, any[]>()

    readings.forEach((reading) => {
      let key: string
      if (aggregation === 'hourly') {
        key = new Date(reading.timestamp).toISOString().slice(0, 13) // YYYY-MM-DDTHH
      } else {
        key = new Date(reading.timestamp).toISOString().slice(0, 10) // YYYY-MM-DD
      }

      if (!aggregated.has(key)) {
        aggregated.set(key, [])
      }
      aggregated.get(key)!.push(reading)
    })

    return Array.from(aggregated.entries()).map(([timestamp, values]) => ({
      timestamp: new Date(timestamp),
      avg: values.reduce((sum, v) => sum + v.value, 0) / values.length,
      min: Math.min(...values.map((v) => v.value)),
      max: Math.max(...values.map((v) => v.value)),
      count: values.length,
      unit: values[0].unit,
    }))
  }

  /**
   * Get all sensors for a location
   */
  async getSensorsForLocation(locationId: string) {
    const sensors = await this.prisma.sensorDevice.findMany({
      where: { locationId },
      include: {
        readings: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    })

    return sensors.map((sensor) => ({
      ...sensor,
      latestReading: sensor.readings[0] || null,
    }))
  }

  /**
   * Check for alerts based on thresholds
   */
  async checkAlerts(): Promise<SensorAlert[]> {
    const alerts: SensorAlert[] = []

    // Get all active devices
    const devices = await this.prisma.sensorDevice.findMany({
      where: { active: true },
      include: {
        readings: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    })

    const now = new Date()
    const offlineThreshold = 2 * 60 * 60 * 1000 // 2 hours

    devices.forEach((device) => {
      // Check if device is offline
      if (device.lastSeenAt && now.getTime() - device.lastSeenAt.getTime() > offlineThreshold) {
        alerts.push({
          id: `offline-${device.id}`,
          deviceId: device.id,
          type: 'DEVICE_OFFLINE',
          severity: 'HIGH',
          message: `Sensor ${device.name} ist seit ${Math.round((now.getTime() - device.lastSeenAt.getTime()) / 60000)} Minuten offline`,
          timestamp: now,
        })
      }

      // Check thresholds based on sensor type
      const latestReading = device.readings[0]
      if (!latestReading) return

      if (device.type === 'SOIL_MOISTURE') {
        // Low moisture alert
        if (latestReading.value < 30) {
          alerts.push({
            id: `moisture-low-${device.id}`,
            deviceId: device.id,
            type: 'THRESHOLD_EXCEEDED',
            severity: latestReading.value < 20 ? 'CRITICAL' : 'HIGH',
            message: `Niedrige Bodenfeuchtigkeit: ${latestReading.value}%`,
            value: latestReading.value,
            threshold: 30,
            timestamp: latestReading.timestamp,
          })
        }

        // High moisture alert (drainage issue?)
        if (latestReading.value > 85) {
          alerts.push({
            id: `moisture-high-${device.id}`,
            deviceId: device.id,
            type: 'THRESHOLD_EXCEEDED',
            severity: 'MEDIUM',
            message: `Sehr hohe Bodenfeuchtigkeit: ${latestReading.value}% - mögliches Drainage-Problem`,
            value: latestReading.value,
            threshold: 85,
            timestamp: latestReading.timestamp,
          })
        }
      }

      if (device.type === 'SOIL_TEMPERATURE') {
        // Frost alert
        if (latestReading.value < 2) {
          alerts.push({
            id: `temp-frost-${device.id}`,
            deviceId: device.id,
            type: 'THRESHOLD_EXCEEDED',
            severity: latestReading.value < 0 ? 'CRITICAL' : 'HIGH',
            message: `Bodentemperatur niedrig: ${latestReading.value}°C - Frostgefahr`,
            value: latestReading.value,
            threshold: 2,
            timestamp: latestReading.timestamp,
          })
        }

        // Heat stress alert
        if (latestReading.value > 28) {
          alerts.push({
            id: `temp-heat-${device.id}`,
            deviceId: device.id,
            type: 'THRESHOLD_EXCEEDED',
            severity: 'MEDIUM',
            message: `Hohe Bodentemperatur: ${latestReading.value}°C - Hitzestress möglich`,
            value: latestReading.value,
            threshold: 28,
            timestamp: latestReading.timestamp,
          })
        }
      }
    })

    return alerts
  }

  /**
   * Detect anomalies using simple statistical methods
   */
  async detectAnomalies(deviceId: string, lookbackHours: number = 24): Promise<SensorAlert[]> {
    const from = new Date(Date.now() - lookbackHours * 60 * 60 * 1000)
    const readings = await this.prisma.sensorReading.findMany({
      where: {
        deviceId,
        timestamp: { gte: from },
      },
      orderBy: { timestamp: 'desc' },
    })

    if (readings.length < 10) return [] // Not enough data

    // Calculate mean and std deviation
    const values = readings.map((r) => r.value)
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)

    const alerts: SensorAlert[] = []
    const latest = readings[0]

    // Alert if latest value is more than 3 std devs from mean
    if (Math.abs(latest.value - mean) > 3 * stdDev) {
      alerts.push({
        id: `anomaly-${deviceId}`,
        deviceId,
        type: 'ANOMALY',
        severity: 'MEDIUM',
        message: `Anomaler Wert erkannt: ${latest.value} ${latest.unit} (erwartet: ${mean.toFixed(1)} ± ${(3 * stdDev).toFixed(1)})`,
        value: latest.value,
        threshold: mean + 3 * stdDev,
        timestamp: latest.timestamp,
      })
    }

    return alerts
  }

  /**
   * Get sensor health dashboard data
   */
  async getDashboardData() {
    const devices = await this.prisma.sensorDevice.findMany({
      where: { active: true },
      include: {
        readings: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    })

    const now = new Date()
    const offlineThreshold = 2 * 60 * 60 * 1000

    const summary = {
      total: devices.length,
      online: 0,
      offline: 0,
      alerts: 0,
      byType: {} as Record<string, number>,
    }

    devices.forEach((device) => {
      // Count by type
      summary.byType[device.type] = (summary.byType[device.type] || 0) + 1

      // Check online status
      if (device.lastSeenAt && now.getTime() - device.lastSeenAt.getTime() < offlineThreshold) {
        summary.online++
      } else {
        summary.offline++
      }
    })

    const alerts = await this.checkAlerts()
    summary.alerts = alerts.length

    return {
      summary,
      devices: devices.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        online: d.lastSeenAt ? now.getTime() - d.lastSeenAt.getTime() < offlineThreshold : false,
        lastSeen: d.lastSeenAt,
        latestValue: d.readings[0]?.value,
        latestUnit: d.readings[0]?.unit,
      })),
      alerts,
    }
  }
}
