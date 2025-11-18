/**
 * Weather Repository
 */

import prisma from '@/lib/db'

export class WeatherRepository {
  async save(snapshot: any): Promise<void> {
    await prisma.weatherSnapshot.create({
      data: {
        id: snapshot.id,
        timestamp: snapshot.timestamp,
        temperature: snapshot.temperature,
        humidity: snapshot.humidity,
        precipitation: snapshot.precipitation,
        windSpeed: snapshot.windSpeed,
        windDirection: snapshot.windDirection,
        evapotranspiration: snapshot.evapotranspiration,
        source: snapshot.source,
        metadata: {},
      },
    })
  }

  async findLatest(): Promise<any> {
    return prisma.weatherSnapshot.findFirst({
      orderBy: { timestamp: 'desc' },
    })
  }

  async findByDateRange(dateFrom: Date, dateTo: Date): Promise<any[]> {
    return prisma.weatherSnapshot.findMany({
      where: {
        timestamp: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      orderBy: { timestamp: 'desc' },
    })
  }
}
