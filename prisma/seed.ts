/**
 * Database Seed Script
 * Creates initial development data
 */

import { PrismaClient, UserRole, LocationType, EquipmentStatus, MaterialType } from '@prisma/client'
import * as argon2 from 'argon2'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data (be careful in production!)
  if (process.env.NODE_ENV === 'development') {
    console.log('🗑️  Cleaning existing data...')
    await prisma.generatedReport.deleteMany()
    await prisma.reportDefinition.deleteMany()
    await prisma.sensorReading.deleteMany()
    await prisma.sensorDevice.deleteMany()
    await prisma.weatherSnapshot.deleteMany()
    await prisma.materialApplication.deleteMany()
    await prisma.material.deleteMany()
    await prisma.maintenanceEvent.deleteMany()
    await prisma.maintenancePlan.deleteMany()
    await prisma.equipmentUsageLog.deleteMany()
    await prisma.equipment.deleteMany()
    await prisma.taskLog.deleteMany()
    await prisma.task.deleteMany()
    await prisma.location.deleteMany()
    await prisma.user.deleteMany()
  }

  // Create Users
  console.log('👤 Creating users...')
  const admin = await prisma.user.create({
    data: {
      email: 'admin@golfclub-siek.de',
      password: await argon2.hash('Admin123!'),
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    },
  })

  const manager = await prisma.user.create({
    data: {
      email: 'manager@golfclub-siek.de',
      password: await argon2.hash('Manager123!'),
      firstName: 'Max',
      lastName: 'Mustermann',
      role: UserRole.MANAGER,
    },
  })

  const headGreenkeeper = await prisma.user.create({
    data: {
      email: 'head@golfclub-siek.de',
      password: await argon2.hash('Head123!'),
      firstName: 'Hans',
      lastName: 'Schmidt',
      role: UserRole.HEAD_GREENKEEPER,
    },
  })

  const greenkeeper1 = await prisma.user.create({
    data: {
      email: 'greenkeeper1@golfclub-siek.de',
      password: await argon2.hash('Green123!'),
      firstName: 'Peter',
      lastName: 'Müller',
      role: UserRole.GREENKEEPER,
    },
  })

  const greenkeeper2 = await prisma.user.create({
    data: {
      email: 'greenkeeper2@golfclub-siek.de',
      password: await argon2.hash('Green123!'),
      firstName: 'Thomas',
      lastName: 'Weber',
      role: UserRole.GREENKEEPER,
    },
  })

  // Create Course Structure
  console.log('🏌️ Creating course locations...')
  const course = await prisma.location.create({
    data: {
      name: 'Golfclub Siek',
      code: 'GCS-MAIN',
      type: LocationType.COURSE,
      description: '18-Loch Championship Course',
      area: 650000, // 65 hectares
    },
  })

  // Create Holes 1-18 with zones
  const holes = []
  for (let i = 1; i <= 18; i++) {
    const hole = await prisma.location.create({
      data: {
        name: `Loch ${i}`,
        code: `GCS-H${String(i).padStart(2, '0')}`,
        type: LocationType.HOLE,
        parentId: course.id,
      },
    })
    holes.push(hole)

    // Create zones for each hole
    await prisma.location.createMany({
      data: [
        {
          name: `Loch ${i} - Abschlag`,
          code: `GCS-H${String(i).padStart(2, '0')}-TEE`,
          type: LocationType.TEE,
          parentId: hole.id,
        },
        {
          name: `Loch ${i} - Fairway`,
          code: `GCS-H${String(i).padStart(2, '0')}-FAIR`,
          type: LocationType.FAIRWAY,
          parentId: hole.id,
        },
        {
          name: `Loch ${i} - Grün`,
          code: `GCS-H${String(i).padStart(2, '0')}-GREEN`,
          type: LocationType.GREEN,
          parentId: hole.id,
        },
      ],
    })
  }

  // Practice Areas
  await prisma.location.createMany({
    data: [
      {
        name: 'Driving Range',
        code: 'GCS-RANGE',
        type: LocationType.PRACTICE_AREA,
        parentId: course.id,
      },
      {
        name: 'Putting Green',
        code: 'GCS-PUTTING',
        type: LocationType.PRACTICE_AREA,
        parentId: course.id,
      },
    ],
  })

  // Create Equipment
  console.log('🚜 Creating equipment...')
  const mower1 = await prisma.equipment.create({
    data: {
      name: 'John Deere 7500 Fairway Mower',
      code: 'EQ-MOWER-001',
      type: 'Fairway Mower',
      manufacturer: 'John Deere',
      model: '7500',
      serialNumber: 'JD7500-2020-001',
      status: EquipmentStatus.AVAILABLE,
      purchaseDate: new Date('2020-03-15'),
      purchasePrice: 85000,
      currentValue: 65000,
      currentHours: 1247.5,
    },
  })

  const mower2 = await prisma.equipment.create({
    data: {
      name: 'Toro Greensmaster 3250-D',
      code: 'EQ-MOWER-002',
      type: 'Greens Mower',
      manufacturer: 'Toro',
      model: 'Greensmaster 3250-D',
      status: EquipmentStatus.AVAILABLE,
      purchaseDate: new Date('2021-05-20'),
      purchasePrice: 42000,
      currentHours: 856.3,
    },
  })

  const tractor = await prisma.equipment.create({
    data: {
      name: 'Kubota M5-111',
      code: 'EQ-TRACTOR-001',
      type: 'Tractor',
      manufacturer: 'Kubota',
      model: 'M5-111',
      status: EquipmentStatus.AVAILABLE,
      purchaseDate: new Date('2019-08-10'),
      purchasePrice: 55000,
      currentHours: 2134.8,
    },
  })

  // Create Materials
  console.log('🧪 Creating materials...')
  await prisma.material.createMany({
    data: [
      {
        name: 'NPK 15-5-20 Rasendünger',
        type: MaterialType.FERTILIZER,
        unit: 'kg',
        currentStock: 500,
        minStock: 100,
        unitCost: 2.5,
      },
      {
        name: 'Heritage Maxx Fungizid',
        type: MaterialType.FUNGICIDE,
        unit: 'l',
        currentStock: 20,
        minStock: 5,
        unitCost: 125.0,
      },
      {
        name: 'Rasensand 0-2mm',
        type: MaterialType.SAND,
        unit: 't',
        currentStock: 15,
        minStock: 5,
        unitCost: 35.0,
      },
      {
        name: 'Agrostis stolonifera (Saatgut)',
        type: MaterialType.SEED,
        unit: 'kg',
        currentStock: 25,
        minStock: 10,
        unitCost: 18.5,
      },
    ],
  })

  // Create some Tasks
  console.log('📋 Creating tasks...')
  const hole1Green = await prisma.location.findFirst({
    where: { code: 'GCS-H01-GREEN' },
  })

  await prisma.task.create({
    data: {
      title: 'Grün 1 mähen',
      description: 'Schnitthöhe 3.5mm, Kreuzschnitt',
      priority: 'HIGH',
      status: 'ASSIGNED',
      scheduledStart: new Date(Date.now() + 3600000), // +1 hour
      locationId: hole1Green?.id,
      assignedToId: greenkeeper1.id,
      createdById: headGreenkeeper.id,
      equipmentId: mower2.id,
    },
  })

  await prisma.task.create({
    data: {
      title: 'Fairways 1-9 mähen',
      description: 'Schnitthöhe 12mm',
      priority: 'MEDIUM',
      status: 'TODO',
      scheduledStart: new Date(Date.now() + 86400000), // +1 day
      createdById: headGreenkeeper.id,
      equipmentId: mower1.id,
    },
  })

  // Create Weather Snapshot
  console.log('🌤️ Creating weather data...')
  await prisma.weatherSnapshot.create({
    data: {
      recordedAt: new Date(),
      tempMin: 12.5,
      tempMax: 18.3,
      tempAvg: 15.2,
      precipitation: 2.3,
      humidity: 72,
      windSpeed: 12.5,
      et: 3.2,
      source: 'Manual',
    },
  })

  console.log('✅ Seed completed!')
  console.log('\n📊 Created:')
  console.log(`  - ${await prisma.user.count()} users`)
  console.log(`  - ${await prisma.location.count()} locations`)
  console.log(`  - ${await prisma.equipment.count()} equipment items`)
  console.log(`  - ${await prisma.material.count()} materials`)
  console.log(`  - ${await prisma.task.count()} tasks`)
  console.log('\n🔐 Login credentials:')
  console.log('  Admin: admin@golfclub-siek.de / Admin123!')
  console.log('  Manager: manager@golfclub-siek.de / Manager123!')
  console.log('  Head Greenkeeper: head@golfclub-siek.de / Head123!')
  console.log('  Greenkeeper: greenkeeper1@golfclub-siek.de / Green123!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
