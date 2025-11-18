/**
 * IoT Sensor Service
 * Handles extended sensor data ingestion, processing, and alerts
 */

import { PrismaClient } from '@prisma/client'
import {
  ExtendedSensorType,
  SoilPHReading,
  NPKReading,
  TurfFirmnessReading,
  LightIntensityReading,
  CO2Reading,
  RootDepthReading,
  WaterFlowReading,
  WeatherStationReading,
  SoilSalinityReading,
  LeafWetnessReading,
  SensorAlert,
} from '@/modules/iot/types/sensors'

const prisma = new PrismaClient()

export class IoTSensorService {
  /**
   * Ingest sensor reading and check for alerts
   */
  async ingestReading(
    deviceId: string,
    sensorType: ExtendedSensorType,
    data: any,
    tenantId: string
  ): Promise<{ success: boolean; alerts?: SensorAlert[] }> {
    // Store reading in database
    const reading = await prisma.sensorReading.create({
      data: {
        deviceId,
        type: sensorType,
        value: JSON.stringify(data),
        timestamp: new Date(),
        tenantId,
      },
    })

    // Check for alerts based on sensor type
    const alerts = await this.checkAlerts(deviceId, sensorType, data, tenantId)

    return { success: true, alerts }
  }

  /**
   * Check sensor values against thresholds and generate alerts
   */
  private async checkAlerts(
    deviceId: string,
    sensorType: ExtendedSensorType,
    data: any,
    tenantId: string
  ): Promise<SensorAlert[]> {
    const alerts: SensorAlert[] = []

    switch (sensorType) {
      case ExtendedSensorType.SOIL_PH:
        const phData = data as SoilPHReading
        if (phData.pH < 5.5 || phData.pH > 7.0) {
          alerts.push({
            id: this.generateAlertId(),
            deviceId,
            type: sensorType,
            severity: phData.pH < 5.0 || phData.pH > 7.5 ? 'HIGH' : 'MEDIUM',
            message: `Soil pH out of optimal range: ${phData.pH}`,
            value: phData.pH,
            threshold: phData.pH < 5.5 ? 5.5 : 7.0,
            timestamp: new Date(),
            acknowledged: false,
          })
        }
        break

      case ExtendedSensorType.SOIL_NPK:
        const npkData = data as NPKReading
        if (npkData.nitrogen < 20 || npkData.phosphorus < 10 || npkData.potassium < 20) {
          alerts.push({
            id: this.generateAlertId(),
            deviceId,
            type: sensorType,
            severity: 'MEDIUM',
            message: `Nutrient deficiency detected: N=${npkData.nitrogen}, P=${npkData.phosphorus}, K=${npkData.potassium}`,
            value: Math.min(npkData.nitrogen, npkData.phosphorus, npkData.potassium),
            threshold: 20,
            timestamp: new Date(),
            acknowledged: false,
          })
        }
        break

      case ExtendedSensorType.TURF_FIRMNESS:
        const firmnessData = data as TurfFirmnessReading
        if (firmnessData.firmness < 40 || firmnessData.firmness > 70) {
          alerts.push({
            id: this.generateAlertId(),
            deviceId,
            type: sensorType,
            severity: 'MEDIUM',
            message: `Turf firmness out of range: ${firmnessData.firmness}`,
            value: firmnessData.firmness,
            threshold: firmnessData.firmness < 40 ? 40 : 70,
            timestamp: new Date(),
            acknowledged: false,
          })
        }
        break

      case ExtendedSensorType.WATER_FLOW:
        const flowData = data as WaterFlowReading
        if (flowData.pressure < 30 || flowData.pressure > 80) {
          alerts.push({
            id: this.generateAlertId(),
            deviceId,
            type: sensorType,
            severity: flowData.pressure < 20 || flowData.pressure > 90 ? 'HIGH' : 'MEDIUM',
            message: `Water pressure out of range: ${flowData.pressure} PSI`,
            value: flowData.pressure,
            threshold: flowData.pressure < 30 ? 30 : 80,
            timestamp: new Date(),
            acknowledged: false,
          })
        }
        break

      case ExtendedSensorType.SOIL_SALINITY:
        const salinityData = data as SoilSalinityReading
        if (salinityData.ec > 2.0) {
          alerts.push({
            id: this.generateAlertId(),
            deviceId,
            type: sensorType,
            severity: salinityData.ec > 4.0 ? 'CRITICAL' : 'HIGH',
            message: `High soil salinity detected: ${salinityData.ec} dS/m`,
            value: salinityData.ec,
            threshold: 2.0,
            timestamp: new Date(),
            acknowledged: false,
          })
        }
        break

      case ExtendedSensorType.LEAF_WETNESS:
        const wetnessData = data as LeafWetnessReading
        if (wetnessData.duration > 10 * 60) {
          // More than 10 hours wet
          alerts.push({
            id: this.generateAlertId(),
            deviceId,
            type: sensorType,
            severity: 'MEDIUM',
            message: `Extended leaf wetness detected: ${Math.round(wetnessData.duration / 60)} hours`,
            value: wetnessData.duration,
            threshold: 600,
            timestamp: new Date(),
            acknowledged: false,
          })
        }
        break
    }

    // Store alerts in database
    for (const alert of alerts) {
      await prisma.sensorAlert.create({
        data: {
          deviceId: alert.deviceId,
          type: alert.type,
          severity: alert.severity,
          message: alert.message,
          value: alert.value,
          threshold: alert.threshold,
          timestamp: alert.timestamp,
          acknowledged: false,
          tenantId,
        },
      })
    }

    return alerts
  }

  /**
   * Get sensor readings by location and type
   */
  async getReadings(
    locationId: string,
    sensorType: ExtendedSensorType,
    startDate: Date,
    endDate: Date,
    tenantId: string
  ): Promise<any[]> {
    const readings = await prisma.sensorReading.findMany({
      where: {
        locationId,
        type: sensorType,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
        tenantId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    })

    return readings.map((r) => ({
      ...JSON.parse(r.value as string),
      id: r.id,
      timestamp: r.timestamp,
    }))
  }

  /**
   * Get active alerts for a tenant
   */
  async getActiveAlerts(tenantId: string): Promise<SensorAlert[]> {
    const alerts = await prisma.sensorAlert.findMany({
      where: {
        tenantId,
        acknowledged: false,
      },
      orderBy: {
        timestamp: 'desc',
      },
    })

    return alerts.map((a) => ({
      id: a.id,
      deviceId: a.deviceId,
      type: a.type as ExtendedSensorType,
      severity: a.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
      message: a.message,
      value: a.value,
      threshold: a.threshold,
      timestamp: a.timestamp,
      acknowledged: a.acknowledged,
    }))
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    await prisma.sensorAlert.update({
      where: { id: alertId },
      data: {
        acknowledged: true,
        acknowledgedBy: userId,
        acknowledgedAt: new Date(),
      },
    })
  }

  /**
   * Get sensor statistics for a location
   */
  async getSensorStatistics(
    locationId: string,
    sensorType: ExtendedSensorType,
    days: number,
    tenantId: string
  ): Promise<{
    average: number
    min: number
    max: number
    trend: 'UP' | 'DOWN' | 'STABLE'
  }> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const readings = await this.getReadings(
      locationId,
      sensorType,
      startDate,
      new Date(),
      tenantId
    )

    if (readings.length === 0) {
      return { average: 0, min: 0, max: 0, trend: 'STABLE' }
    }

    // Extract primary value based on sensor type
    const values = readings.map((r) => this.extractPrimaryValue(r, sensorType))

    const average = values.reduce((sum, v) => sum + v, 0) / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)

    // Calculate trend (compare first half vs second half)
    const midpoint = Math.floor(values.length / 2)
    const firstHalf = values.slice(0, midpoint)
    const secondHalf = values.slice(midpoint)

    const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length

    let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE'
    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100

    if (Math.abs(changePercent) > 5) {
      trend = changePercent > 0 ? 'UP' : 'DOWN'
    }

    return { average, min, max, trend }
  }

  /**
   * Extract primary value from sensor reading
   */
  private extractPrimaryValue(reading: any, sensorType: ExtendedSensorType): number {
    switch (sensorType) {
      case ExtendedSensorType.SOIL_PH:
        return reading.pH
      case ExtendedSensorType.SOIL_NPK:
        return reading.nitrogen
      case ExtendedSensorType.TURF_FIRMNESS:
        return reading.firmness
      case ExtendedSensorType.LIGHT_INTENSITY:
        return reading.lux
      case ExtendedSensorType.CO2_LEVEL:
        return reading.ppm
      case ExtendedSensorType.ROOT_DEPTH:
        return reading.depth
      case ExtendedSensorType.WATER_FLOW:
        return reading.flowRate
      case ExtendedSensorType.SOIL_SALINITY:
        return reading.ec
      case ExtendedSensorType.LEAF_WETNESS:
        return reading.wetness
      default:
        return 0
    }
  }

  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

export const iotSensorService = new IoTSensorService()
