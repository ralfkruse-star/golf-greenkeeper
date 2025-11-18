/**
 * Test Database Helpers
 * Utilities for managing test database state
 */

import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

export function getTestDb() {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })
  }
  return prisma
}

export async function cleanDatabase() {
  const db = getTestDb()

  // Delete in correct order (respecting foreign keys)
  await db.generatedReport.deleteMany()
  await db.reportDefinition.deleteMany()
  await db.sensorReading.deleteMany()
  await db.sensorDevice.deleteMany()
  await db.weatherSnapshot.deleteMany()
  await db.materialApplication.deleteMany()
  await db.material.deleteMany()
  await db.maintenanceEvent.deleteMany()
  await db.maintenancePlan.deleteMany()
  await db.equipmentUsageLog.deleteMany()
  await db.equipment.deleteMany()
  await db.taskLog.deleteMany()
  await db.task.deleteMany()
  await db.location.deleteMany()
  await db.user.deleteMany()
}

export async function disconnectTestDb() {
  if (prisma) {
    await prisma.$disconnect()
  }
}
