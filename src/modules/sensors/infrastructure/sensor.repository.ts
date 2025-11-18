/**
 * Sensor Repository
 */

import prisma from '@/lib/db'

export class SensorRepository {
  async saveDevice(device: any): Promise<void> {
    await prisma.sensorDevice.create({
      data: {
        id: device.id,
        code: device.code,
        name: device.name,
        type: device.type,
        zoneId: device.zoneId,
        active: device.active,
        installDate: device.installDate,
        metadata: {},
      },
    })
  }

  async saveReading(reading: any): Promise<void> {
    await prisma.sensorReading.create({
      data: {
        id: reading.id,
        deviceId: reading.deviceId,
        timestamp: reading.timestamp,
        value: reading.value,
        unit: reading.unit,
        metadata: {},
      },
    })
  }

  async findDeviceById(id: string): Promise<any> {
    return prisma.sensorDevice.findUnique({ where: { id } })
  }

  async findDeviceByCode(code: string): Promise<any> {
    return prisma.sensorDevice.findUnique({ where: { code } })
  }

  async findAllDevices(): Promise<any[]> {
    return prisma.sensorDevice.findMany({ where: { active: true } })
  }

  async findLatestReading(deviceId: string): Promise<any> {
    return prisma.sensorReading.findFirst({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
    })
  }

  async findReadings(deviceId: string, dateFrom: Date, dateTo: Date): Promise<any[]> {
    return prisma.sensorReading.findMany({
      where: {
        deviceId,
        timestamp: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      orderBy: { timestamp: 'desc' },
    })
  }
}
