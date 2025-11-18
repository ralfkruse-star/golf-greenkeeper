/**
 * Sensor Service
 */

import { SensorRepository } from '../infrastructure/sensor.repository'

export interface RegisterSensorDTO {
  code: string
  name: string
  type: string
  zoneId?: string
}

export interface RecordReadingDTO {
  deviceId: string
  value: number
  unit: string
}

export class SensorService {
  constructor(private repository: SensorRepository) {}

  async registerSensor(dto: RegisterSensorDTO): Promise<any> {
    const device = {
      id: crypto.randomUUID(),
      code: dto.code,
      name: dto.name,
      type: dto.type,
      zoneId: dto.zoneId,
      active: true,
      installDate: new Date(),
    }

    await this.repository.saveDevice(device)
    return device
  }

  async recordReading(dto: RecordReadingDTO): Promise<any> {
    const reading = {
      id: crypto.randomUUID(),
      deviceId: dto.deviceId,
      timestamp: new Date(),
      value: dto.value,
      unit: dto.unit,
    }

    await this.repository.saveReading(reading)
    return reading
  }

  async getDeviceById(id: string): Promise<any> {
    return this.repository.findDeviceById(id)
  }

  async getDeviceByCode(code: string): Promise<any> {
    return this.repository.findDeviceByCode(code)
  }

  async getLatestReading(deviceId: string): Promise<any> {
    return this.repository.findLatestReading(deviceId)
  }

  async getReadingHistory(deviceId: string, dateFrom: Date, dateTo: Date): Promise<any[]> {
    return this.repository.findReadings(deviceId, dateFrom, dateTo)
  }

  async getAlerts(deviceId?: string): Promise<any[]> {
    // Simple threshold-based alerts
    const devices = deviceId
      ? [await this.repository.findDeviceById(deviceId)]
      : await this.repository.findAllDevices()

    const alerts = []

    for (const device of devices) {
      if (!device) continue

      const latest = await this.repository.findLatestReading(device.id)
      if (!latest) continue

      // Soil moisture alerts
      if (device.type === 'SOIL_MOISTURE') {
        if (latest.value < 20) {
          alerts.push({
            deviceId: device.id,
            deviceName: device.name,
            type: 'LOW_MOISTURE',
            severity: 'HIGH',
            message: `Low soil moisture: ${latest.value}%`,
            timestamp: latest.timestamp,
          })
        } else if (latest.value > 80) {
          alerts.push({
            deviceId: device.id,
            deviceName: device.name,
            type: 'HIGH_MOISTURE',
            severity: 'MEDIUM',
            message: `High soil moisture: ${latest.value}%`,
            timestamp: latest.timestamp,
          })
        }
      }

      // Temperature alerts
      if (device.type === 'TEMPERATURE') {
        if (latest.value > 35) {
          alerts.push({
            deviceId: device.id,
            deviceName: device.name,
            type: 'HIGH_TEMPERATURE',
            severity: 'HIGH',
            message: `High temperature: ${latest.value}°C`,
            timestamp: latest.timestamp,
          })
        } else if (latest.value < 0) {
          alerts.push({
            deviceId: device.id,
            deviceName: device.name,
            type: 'FROST_WARNING',
            severity: 'CRITICAL',
            message: `Frost warning: ${latest.value}°C`,
            timestamp: latest.timestamp,
          })
        }
      }
    }

    return alerts
  }
}
