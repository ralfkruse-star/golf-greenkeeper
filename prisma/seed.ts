/**
 * Database Seed Script
 *
 * Creates initial data for development
 */

import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth/password'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
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
  console.log('✅ Admin user created:', admin.email)

  // Create head greenkeeper
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
  console.log('✅ Head Greenkeeper created:', headGreenkeeper.email)

  // Create greenkeeper
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
  console.log('✅ Greenkeeper created:', greenkeeper.email)

  // Create course
  const course = await prisma.course.upsert({
    where: { id: 'course-1' },
    update: {},
    create: {
      id: 'course-1',
      name: 'Golfplatz Siek',
      description: '18-Loch Championship Course',
      totalHoles: 18,
    },
  })
  console.log('✅ Course created:', course.name)

  // Create some holes
  for (let i = 1; i <= 18; i++) {
    await prisma.hole.upsert({
      where: { id: `hole-${i}` },
      update: {},
      create: {
        id: `hole-${i}`,
        courseId: course.id,
        holeNumber: i,
        par: i <= 4 || i >= 15 ? 3 : i <= 10 ? 4 : 5,
        length: 150 + i * 20,
      },
    })
  }
  console.log('✅ 18 holes created')

  // Create zones
  const zones = [
    { code: 'GREEN-001', name: 'Green 1', type: 'GREEN', holeId: 'hole-1' },
    { code: 'GREEN-002', name: 'Green 2', type: 'GREEN', holeId: 'hole-2' },
    { code: 'FAIRWAY-001', name: 'Fairway 1', type: 'FAIRWAY', holeId: 'hole-1' },
    { code: 'TEE-001', name: 'Tee 1', type: 'TEE', holeId: 'hole-1' },
    { code: 'BUNKER-001', name: 'Bunker 1', type: 'BUNKER', holeId: 'hole-1' },
    { code: 'PRACTICE-001', name: 'Practice Green', type: 'PRACTICE_AREA' },
  ]

  for (const zone of zones) {
    await prisma.zone.upsert({
      where: { code: zone.code },
      update: {},
      create: zone as any,
    })
  }
  console.log('✅ Zones created')

  // Create equipment
  const equipment = [
    { code: 'EQ-001', name: 'Fairway Mower 1', type: 'MOWER', manufacturer: 'John Deere' },
    { code: 'EQ-002', name: 'Green Mower 1', type: 'MOWER', manufacturer: 'Toro' },
    { code: 'EQ-003', name: 'Tractor 1', type: 'TRACTOR', manufacturer: 'Kubota' },
    { code: 'EQ-004', name: 'Sprayer 1', type: 'SPRAYER', manufacturer: 'Amazone' },
  ]

  for (const eq of equipment) {
    await prisma.equipment.upsert({
      where: { code: eq.code },
      update: {},
      create: {
        ...eq,
        status: 'AVAILABLE',
        operatingHours: 0,
      } as any,
    })
  }
  console.log('✅ Equipment created')

  // Create sample tasks
  const tasks = [
    {
      code: 'TASK-001',
      title: 'Mow Green 1',
      description: 'Regular morning mow',
      priority: 'HIGH',
      zoneId: (await prisma.zone.findUnique({ where: { code: 'GREEN-001' } }))?.id,
      assignedToId: greenkeeper.id,
      createdById: headGreenkeeper.id,
      status: 'TODO',
    },
    {
      code: 'TASK-002',
      title: 'Fertilize Fairway 1',
      description: 'Spring fertilization',
      priority: 'MEDIUM',
      zoneId: (await prisma.zone.findUnique({ where: { code: 'FAIRWAY-001' } }))?.id,
      assignedToId: greenkeeper.id,
      createdById: headGreenkeeper.id,
      status: 'TODO',
    },
  ]

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { code: task.code },
      update: {},
      create: task as any,
    })
  }
  console.log('✅ Sample tasks created')

  console.log('🎉 Seeding complete!')
  console.log('\nTest credentials:')
  console.log('Admin: admin@golfclub.de / admin123')
  console.log('Head Greenkeeper: head@golfclub.de / head123')
  console.log('Greenkeeper: greenkeeper@golfclub.de / greenkeeper123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
