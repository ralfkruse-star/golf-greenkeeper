/**
 * Database Seed Script
 *
 * Creates comprehensive initial data for development and testing
 *
 * Usage:
 *   npm run seed
 *   npx prisma db seed
 */

import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth/password'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...\n')

  // ===================
  // USERS
  // ===================
  console.log('👥 Creating users...')

  const adminPassword = await hashPassword('admin123')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@golfclub.de' },
    update: {},
    create: {
      email: 'admin@golfclub.de',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  })
  console.log('  ✅ Admin created:', admin.email)

  const headPassword = await hashPassword('head123')
  const headGreenkeeper = await prisma.user.upsert({
    where: { email: 'head@golfclub.de' },
    update: {},
    create: {
      email: 'head@golfclub.de',
      password: headPassword,
      firstName: 'Max',
      lastName: 'Mustermann',
      role: 'HEAD_GREENKEEPER',
    },
  })
  console.log('  ✅ Head Greenkeeper created:', headGreenkeeper.email)

  const greenkeeperPassword = await hashPassword('greenkeeper123')
  const greenkeeper = await prisma.user.upsert({
    where: { email: 'greenkeeper@golfclub.de' },
    update: {},
    create: {
      email: 'greenkeeper@golfclub.de',
      password: greenkeeperPassword,
      firstName: 'Hans',
      lastName: 'Schmidt',
      role: 'GREENKEEPER',
    },
  })
  console.log('  ✅ Greenkeeper created:', greenkeeper.email)

  const greenkeeper2Password = await hashPassword('greenkeeper123')
  const greenkeeper2 = await prisma.user.upsert({
    where: { email: 'anna@golfclub.de' },
    update: {},
    create: {
      email: 'anna@golfclub.de',
      password: greenkeeper2Password,
      firstName: 'Anna',
      lastName: 'Weber',
      role: 'GREENKEEPER',
    },
  })
  console.log('  ✅ Greenkeeper 2 created:', greenkeeper2.email)

  // ===================
  // COURSE & HOLES
  // ===================
  console.log('\n⛳ Creating course and holes...')

  const course = await prisma.course.upsert({
    where: { id: 'course-1' },
    update: {},
    create: {
      id: 'course-1',
      name: 'Golfplatz Siek',
      description: '18-Loch Championship Course in Holstein',
      totalHoles: 18,
      latitude: 53.6394,
      longitude: 10.2931,
    },
  })
  console.log('  ✅ Course created:', course.name)

  // Par values for authentic golf course
  const parValues = [4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4, 3, 4, 5, 4, 3]
  const lengthValues = [380, 520, 165, 410, 395, 180, 540, 420, 370, 400, 155, 510, 385, 170, 430, 525, 405, 190]

  for (let i = 1; i <= 18; i++) {
    await prisma.hole.upsert({
      where: { id: `hole-${i}` },
      update: {},
      create: {
        id: `hole-${i}`,
        courseId: course.id,
        holeNumber: i,
        par: parValues[i - 1],
        length: lengthValues[i - 1],
      },
    })
  }
  console.log('  ✅ 18 holes created')

  // ===================
  // ZONES
  // ===================
  console.log('\n📍 Creating zones...')

  const zoneTypes = ['GREEN', 'TEE', 'FAIRWAY', 'BUNKER']
  let zoneCount = 0

  for (let i = 1; i <= 18; i++) {
    // Green for each hole
    await prisma.zone.upsert({
      where: { code: `GREEN-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        code: `GREEN-${String(i).padStart(3, '0')}`,
        name: `Green ${i}`,
        type: 'GREEN',
        area: 400 + Math.random() * 200,
        holeId: `hole-${i}`,
        latitude: 53.6394 + (Math.random() - 0.5) * 0.01,
        longitude: 10.2931 + (Math.random() - 0.5) * 0.01,
      },
    })
    zoneCount++

    // Tee for each hole
    await prisma.zone.upsert({
      where: { code: `TEE-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        code: `TEE-${String(i).padStart(3, '0')}`,
        name: `Tee ${i}`,
        type: 'TEE',
        area: 150 + Math.random() * 100,
        holeId: `hole-${i}`,
        latitude: 53.6394 + (Math.random() - 0.5) * 0.01,
        longitude: 10.2931 + (Math.random() - 0.5) * 0.01,
      },
    })
    zoneCount++

    // Fairway for each hole
    await prisma.zone.upsert({
      where: { code: `FAIRWAY-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        code: `FAIRWAY-${String(i).padStart(3, '0')}`,
        name: `Fairway ${i}`,
        type: 'FAIRWAY',
        area: 3000 + Math.random() * 2000,
        holeId: `hole-${i}`,
        latitude: 53.6394 + (Math.random() - 0.5) * 0.01,
        longitude: 10.2931 + (Math.random() - 0.5) * 0.01,
      },
    })
    zoneCount++
  }

  // Practice areas
  await prisma.zone.upsert({
    where: { code: 'PRACTICE-001' },
    update: {},
    create: {
      code: 'PRACTICE-001',
      name: 'Practice Green',
      type: 'PRACTICE_AREA',
      area: 600,
      latitude: 53.6400,
      longitude: 10.2940,
    },
  })
  zoneCount++

  await prisma.zone.upsert({
    where: { code: 'RANGE-001' },
    update: {},
    create: {
      code: 'RANGE-001',
      name: 'Driving Range',
      type: 'PRACTICE_AREA',
      area: 8000,
      latitude: 53.6380,
      longitude: 10.2920,
    },
  })
  zoneCount++

  console.log(`  ✅ ${zoneCount} zones created`)

  // ===================
  // EQUIPMENT
  // ===================
  console.log('\n🚜 Creating equipment...')

  const equipmentData = [
    { code: 'MOWER-001', name: 'Toro Greensmaster 3250-D', type: 'MOWER', manufacturer: 'Toro', model: 'Greensmaster 3250-D', year: 2022, operatingHours: 450, status: 'AVAILABLE' },
    { code: 'MOWER-002', name: 'John Deere 2653B', type: 'MOWER', manufacturer: 'John Deere', model: '2653B', year: 2021, operatingHours: 720, status: 'AVAILABLE' },
    { code: 'MOWER-003', name: 'Toro Reelmaster 5010-H', type: 'MOWER', manufacturer: 'Toro', model: 'Reelmaster 5010-H', year: 2023, operatingHours: 180, status: 'AVAILABLE' },
    { code: 'TRACTOR-001', name: 'Kubota M5-091', type: 'TRACTOR', manufacturer: 'Kubota', model: 'M5-091', year: 2020, operatingHours: 1250, status: 'AVAILABLE' },
    { code: 'TRACTOR-002', name: 'John Deere 3720', type: 'TRACTOR', manufacturer: 'John Deere', model: '3720', year: 2019, operatingHours: 1580, status: 'IN_USE' },
    { code: 'SPRAYER-001', name: 'Amazone UG 3000', type: 'SPRAYER', manufacturer: 'Amazone', model: 'UG 3000', year: 2021, operatingHours: 340, status: 'AVAILABLE' },
    { code: 'SPRAYER-002', name: 'STIHL SR 450', type: 'SPRAYER', manufacturer: 'STIHL', model: 'SR 450', year: 2022, operatingHours: 120, status: 'AVAILABLE' },
    { code: 'AERATOR-001', name: 'Toro ProCore 648', type: 'AERATOR', manufacturer: 'Toro', model: 'ProCore 648', year: 2021, operatingHours: 280, status: 'MAINTENANCE' },
    { code: 'SPREADER-001', name: 'TURFCO T3000', type: 'SPREADER', manufacturer: 'TURFCO', model: 'T3000', year: 2020, operatingHours: 450, status: 'AVAILABLE' },
    { code: 'UTILITY-001', name: 'John Deere Gator XUV865M', type: 'UTILITY_VEHICLE', manufacturer: 'John Deere', model: 'Gator XUV865M', year: 2023, operatingHours: 95, status: 'AVAILABLE' },
  ]

  for (const eq of equipmentData) {
    await prisma.equipment.upsert({
      where: { code: eq.code },
      update: {},
      create: eq as any,
    })
  }
  console.log(`  ✅ ${equipmentData.length} equipment items created`)

  // ===================
  // MATERIALS
  // ===================
  console.log('\n📦 Creating materials...')

  const materialsData = [
    { code: 'FERT-001', name: 'NPK 15-15-15 Premium Dünger', category: 'FERTILIZER', unit: 'kg', currentStock: 450, minStock: 200, maxStock: 1000, unitCost: 2.50, hazardous: false },
    { code: 'FERT-002', name: 'Langzeitdünger 20-5-8', category: 'FERTILIZER', unit: 'kg', currentStock: 320, minStock: 150, maxStock: 800, unitCost: 3.20, hazardous: false },
    { code: 'SEED-001', name: 'Premium Rasensamen Bentgrass', category: 'SEED', unit: 'kg', currentStock: 85, minStock: 50, maxStock: 200, unitCost: 12.50, hazardous: false },
    { code: 'SEED-002', name: 'Fairway Mix Grassamen', category: 'SEED', unit: 'kg', currentStock: 180, minStock: 100, maxStock: 400, unitCost: 8.00, hazardous: false },
    { code: 'PEST-001', name: 'Fungizid ProTurf', category: 'PESTICIDE', unit: 'liter', currentStock: 25, minStock: 10, maxStock: 50, unitCost: 45.00, hazardous: true },
    { code: 'PEST-002', name: 'Herbizid Selective', category: 'PESTICIDE', unit: 'liter', currentStock: 18, minStock: 10, maxStock: 40, unitCost: 38.50, hazardous: true },
    { code: 'SOIL-001', name: 'Premium Topdressing Sand', category: 'SOIL', unit: 'm³', currentStock: 45, minStock: 20, maxStock: 100, unitCost: 35.00, hazardous: false },
    { code: 'SOIL-002', name: 'Organischer Kompost', category: 'SOIL', unit: 'm³', currentStock: 30, minStock: 15, maxStock: 80, unitCost: 28.00, hazardous: false },
    { code: 'TOOL-001', name: 'Ersatzklingen Mäher (10er Set)', category: 'TOOLS', unit: 'piece', currentStock: 12, minStock: 5, maxStock: 30, unitCost: 125.00, hazardous: false },
    { code: 'TOOL-002', name: 'Bewässerungsdüsen (50er Pack)', category: 'TOOLS', unit: 'piece', currentStock: 8, minStock: 3, maxStock: 20, unitCost: 85.00, hazardous: false },
  ]

  for (const material of materialsData) {
    await prisma.material.upsert({
      where: { code: material.code },
      update: {},
      create: material as any,
    })
  }
  console.log(`  ✅ ${materialsData.length} materials created`)

  // ===================
  // SENSORS
  // ===================
  console.log('\n📡 Creating sensors...')

  const sensorsData = [
    { deviceId: 'SM-GRN-001', name: 'Green 1 Soil Moisture', type: 'SOIL_MOISTURE', zoneId: (await prisma.zone.findUnique({ where: { code: 'GREEN-001' } }))?.id, status: 'ACTIVE', batteryLevel: 95 },
    { deviceId: 'SM-GRN-009', name: 'Green 9 Soil Moisture', type: 'SOIL_MOISTURE', zoneId: (await prisma.zone.findUnique({ where: { code: 'GREEN-009' } }))?.id, status: 'ACTIVE', batteryLevel: 88 },
    { deviceId: 'TMP-FAI-005', name: 'Fairway 5 Temperature', type: 'TEMPERATURE', zoneId: (await prisma.zone.findUnique({ where: { code: 'FAIRWAY-005' } }))?.id, status: 'ACTIVE', batteryLevel: 92 },
    { deviceId: 'PH-GRN-003', name: 'Green 3 pH Sensor', type: 'PH_LEVEL', zoneId: (await prisma.zone.findUnique({ where: { code: 'GREEN-003' } }))?.id, status: 'ACTIVE', batteryLevel: 78 },
    { deviceId: 'HUM-TEE-001', name: 'Tee 1 Humidity', type: 'HUMIDITY', zoneId: (await prisma.zone.findUnique({ where: { code: 'TEE-001' } }))?.id, status: 'ACTIVE', batteryLevel: 85 },
    { deviceId: 'SM-PRAC-001', name: 'Practice Green Moisture', type: 'SOIL_MOISTURE', zoneId: (await prisma.zone.findUnique({ where: { code: 'PRACTICE-001' } }))?.id, status: 'ACTIVE', batteryLevel: 91 },
  ]

  for (const sensor of sensorsData) {
    await prisma.sensor.upsert({
      where: { deviceId: sensor.deviceId },
      update: {},
      create: sensor as any,
    })
  }
  console.log(`  ✅ ${sensorsData.length} sensors created`)

  // ===================
  // TASKS
  // ===================
  console.log('\n✅ Creating tasks...')

  const green1Zone = (await prisma.zone.findUnique({ where: { code: 'GREEN-001' } }))?.id
  const green2Zone = (await prisma.zone.findUnique({ where: { code: 'GREEN-002' } }))?.id
  const fairway1Zone = (await prisma.zone.findUnique({ where: { code: 'FAIRWAY-001' } }))?.id
  const fairway5Zone = (await prisma.zone.findUnique({ where: { code: 'FAIRWAY-005' } }))?.id
  const tee3Zone = (await prisma.zone.findUnique({ where: { code: 'TEE-003' } }))?.id

  const tasksData = [
    {
      code: 'TASK-001',
      title: 'Morgendliches Mähen Green 1',
      description: 'Reguläres morgendliches Mähen auf 3.5mm Schnitthöhe',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      zoneId: green1Zone,
      assignedToId: greenkeeper.id,
      createdById: headGreenkeeper.id,
      estimatedDuration: 45,
      scheduledDate: new Date(),
    },
    {
      code: 'TASK-002',
      title: 'Frühjahrsdüngung Fairway 1',
      description: 'Ausbringung NPK 15-15-15, 25g/m²',
      priority: 'MEDIUM',
      status: 'TODO',
      zoneId: fairway1Zone,
      assignedToId: greenkeeper2.id,
      createdById: headGreenkeeper.id,
      estimatedDuration: 120,
      scheduledDate: new Date(Date.now() + 86400000), // tomorrow
    },
    {
      code: 'TASK-003',
      title: 'Aerifizierung Green 2',
      description: 'Hohlspoon-Aerifizierung, 10cm Tiefe',
      priority: 'HIGH',
      status: 'TODO',
      zoneId: green2Zone,
      assignedToId: greenkeeper.id,
      createdById: headGreenkeeper.id,
      estimatedDuration: 90,
      scheduledDate: new Date(Date.now() + 172800000), // in 2 days
    },
    {
      code: 'TASK-004',
      title: 'Bunker-Pflege Loch 5',
      description: 'Sandauffüllung und Kantenpflege',
      priority: 'MEDIUM',
      status: 'COMPLETED',
      zoneId: fairway5Zone,
      assignedToId: greenkeeper2.id,
      createdById: headGreenkeeper.id,
      estimatedDuration: 60,
      completedAt: new Date(Date.now() - 86400000), // yesterday
    },
    {
      code: 'TASK-005',
      title: 'Bewässerungssystem-Check Tee 3',
      description: 'Überprüfung aller Sprinkler auf Funktion',
      priority: 'LOW',
      status: 'TODO',
      zoneId: tee3Zone,
      assignedToId: greenkeeper.id,
      createdById: headGreenkeeper.id,
      estimatedDuration: 30,
      scheduledDate: new Date(Date.now() + 259200000), // in 3 days
    },
    {
      code: 'TASK-006',
      title: 'Nachsaat Practice Green',
      description: 'Bentgrass Nachsaat in beschädigten Bereichen',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      zoneId: (await prisma.zone.findUnique({ where: { code: 'PRACTICE-001' } }))?.id,
      assignedToId: greenkeeper2.id,
      createdById: headGreenkeeper.id,
      estimatedDuration: 45,
    },
  ]

  for (const task of tasksData) {
    await prisma.task.upsert({
      where: { code: task.code },
      update: {},
      create: task as any,
    })
  }
  console.log(`  ✅ ${tasksData.length} tasks created`)

  // ===================
  // WEATHER DATA
  // ===================
  console.log('\n🌤️  Creating weather data...')

  const weatherData = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(Date.now() - i * 86400000) // last 7 days
    weatherData.push({
      date,
      temperature: 15 + Math.random() * 10,
      humidity: 60 + Math.random() * 20,
      precipitation: Math.random() * 5,
      windSpeed: 5 + Math.random() * 15,
      condition: ['sunny', 'partly_cloudy', 'cloudy', 'rainy'][Math.floor(Math.random() * 4)],
    })
  }

  for (const weather of weatherData) {
    await prisma.weather.create({
      data: weather as any,
    })
  }
  console.log(`  ✅ ${weatherData.length} weather records created`)

  // ===================
  // SUMMARY
  // ===================
  console.log('\n' + '='.repeat(60))
  console.log('🎉 Database seeding complete!')
  console.log('='.repeat(60))
  console.log('\n📊 Summary:')
  console.log(`  • Users: ${await prisma.user.count()}`)
  console.log(`  • Courses: ${await prisma.course.count()}`)
  console.log(`  • Holes: ${await prisma.hole.count()}`)
  console.log(`  • Zones: ${await prisma.zone.count()}`)
  console.log(`  • Equipment: ${await prisma.equipment.count()}`)
  console.log(`  • Materials: ${await prisma.material.count()}`)
  console.log(`  • Sensors: ${await prisma.sensor.count()}`)
  console.log(`  • Tasks: ${await prisma.task.count()}`)
  console.log(`  • Weather Records: ${await prisma.weather.count()}`)

  console.log('\n🔐 Test Credentials:')
  console.log('┌─────────────────────┬────────────────────────┬──────────────┐')
  console.log('│ Role                │ Email                  │ Password     │')
  console.log('├─────────────────────┼────────────────────────┼──────────────┤')
  console.log('│ Admin               │ admin@golfclub.de      │ admin123     │')
  console.log('│ Head Greenkeeper    │ head@golfclub.de       │ head123      │')
  console.log('│ Greenkeeper         │ greenkeeper@golfclub.de│ greenkeeper123│')
  console.log('│ Greenkeeper 2       │ anna@golfclub.de       │ greenkeeper123│')
  console.log('└─────────────────────┴────────────────────────┴──────────────┘')
  console.log('')
}

main()
  .catch((e) => {
    console.error('\n❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
