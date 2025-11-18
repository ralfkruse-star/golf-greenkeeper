/**
 * Report & Analytics Service
 */

import prisma from '@/lib/db'
import { TaskStatus } from '@/types'

export interface TaskSummaryReport {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTask: number
  completionRate: number
  averageCompletionTime: number // hours
  tasksByPriority: Record<string, number>
  tasksByZone: Array<{ zoneName: string; count: number }>
}

export interface EquipmentUsageReport {
  totalEquipment: number
  activeEquipment: number
  totalOperatingHours: number
  averageHoursPerEquipment: number
  maintenanceDue: number
  usageByType: Record<string, { count: number; totalHours: number }>
}

export interface MaterialConsumptionReport {
  totalMaterials: number
  lowStockItems: number
  totalApplications: number
  consumptionByType: Record<string, { quantity: number; cost: number }>
  topConsumers: Array<{ materialName: string; quantity: number; unit: string }>
}

export interface WorkforceReport {
  totalUsers: number
  activeUsers: number
  tasksByUser: Array<{ userName: string; completed: number; inProgress: number; hoursWorked: number }>
  averageTasksPerUser: number
}

export class ReportService {
  /**
   * Generate task summary report
   */
  async getTaskSummary(dateFrom?: Date, dateTo?: Date): Promise<TaskSummaryReport> {
    const where: any = {}
    if (dateFrom && dateTo) {
      where.createdAt = { gte: dateFrom, lte: dateTo }
    }

    const tasks = await prisma.task.findMany({ where, include: { zone: true } })

    const now = new Date()
    const overdueTasks = tasks.filter((t: any) =>
      t.status !== TaskStatus.COMPLETED &&
      t.scheduledEnd &&
      new Date(t.scheduledEnd) < now
    )

    const completedTasks = tasks.filter((t: any) => t.status === TaskStatus.COMPLETED)
    const avgCompletionTime = completedTasks.length > 0
      ? completedTasks.reduce((sum: number, t: any) => sum + (t.actualHours || 0), 0) / completedTasks.length
      : 0

    const tasksByPriority: Record<string, number> = {}
    tasks.forEach((t: any) => {
      tasksByPriority[t.priority] = (tasksByPriority[t.priority] || 0) + 1
    })

    const zoneMap = new Map<string, number>()
    tasks.forEach((t: any) => {
      if (t.zone) {
        const name = t.zone.name
        zoneMap.set(name, (zoneMap.get(name) || 0) + 1)
      }
    })
    const tasksByZone = Array.from(zoneMap.entries()).map(([zoneName, count]) => ({ zoneName, count }))

    return {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      inProgressTasks: tasks.filter((t: any) => t.status === TaskStatus.IN_PROGRESS).length,
      overdueTask: overdueTasks.length,
      completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
      averageCompletionTime: Math.round(avgCompletionTime * 10) / 10,
      tasksByPriority,
      tasksByZone,
    }
  }

  /**
   * Generate equipment usage report
   */
  async getEquipmentUsage(dateFrom?: Date, dateTo?: Date): Promise<EquipmentUsageReport> {
    const equipment = await prisma.equipment.findMany()

    const totalHours = equipment.reduce((sum: number, eq: any) => sum + eq.operatingHours, 0)
    const maintenanceDue = equipment.filter((eq: any) =>
      eq.serviceInterval &&
      eq.lastServiceHours !== null &&
      (eq.operatingHours - eq.lastServiceHours!) >= eq.serviceInterval
    ).length

    const usageByType: Record<string, { count: number; totalHours: number }> = {}
    equipment.forEach((eq: any) => {
      if (!usageByType[eq.type]) {
        usageByType[eq.type] = { count: 0, totalHours: 0 }
      }
      usageByType[eq.type].count++
      usageByType[eq.type].totalHours += eq.operatingHours
    })

    return {
      totalEquipment: equipment.length,
      activeEquipment: equipment.filter((eq: any) => eq.status === 'AVAILABLE' || eq.status === 'IN_USE').length,
      totalOperatingHours: totalHours,
      averageHoursPerEquipment: equipment.length > 0 ? totalHours / equipment.length : 0,
      maintenanceDue,
      usageByType,
    }
  }

  /**
   * Generate material consumption report
   */
  async getMaterialConsumption(dateFrom?: Date, dateTo?: Date): Promise<MaterialConsumptionReport> {
    const materials = await prisma.material.findMany()
    const lowStock = materials.filter((m: any) => m.minStock && m.currentStock <= m.minStock).length

    const where: any = {}
    if (dateFrom && dateTo) {
      where.appliedAt = { gte: dateFrom, lte: dateTo }
    }

    const applications = await prisma.materialApplication.findMany({
      where,
      include: { material: true },
    })

    const consumptionByType: Record<string, { quantity: number; cost: number }> = {}
    const materialMap = new Map<string, { quantity: number; unit: string }>()

    applications.forEach((app: any) => {
      const type = app.material.type
      const cost = (app.material.unitCost || 0) * app.quantity

      if (!consumptionByType[type]) {
        consumptionByType[type] = { quantity: 0, cost: 0 }
      }
      consumptionByType[type].quantity += app.quantity
      consumptionByType[type].cost += cost

      const key = app.material.name
      if (!materialMap.has(key)) {
        materialMap.set(key, { quantity: 0, unit: app.unit })
      }
      const existing = materialMap.get(key)!
      materialMap.set(key, { ...existing, quantity: existing.quantity + app.quantity })
    })

    const topConsumers = Array.from(materialMap.entries())
      .map(([materialName, data]) => ({ materialName, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)

    return {
      totalMaterials: materials.length,
      lowStockItems: lowStock,
      totalApplications: applications.length,
      consumptionByType,
      topConsumers,
    }
  }

  /**
   * Generate workforce report
   */
  async getWorkforceReport(dateFrom?: Date, dateTo?: Date): Promise<WorkforceReport> {
    const users = await prisma.user.findMany({
      where: { active: true },
      include: {
        assignedTasks: {
          where: dateFrom && dateTo ? {
            createdAt: { gte: dateFrom, lte: dateTo }
          } : undefined,
        },
      },
    })

    const tasksByUser = users.map((user: any) => {
      const completed = user.assignedTasks.filter((t: any) => t.status === TaskStatus.COMPLETED).length
      const inProgress = user.assignedTasks.filter((t: any) => t.status === TaskStatus.IN_PROGRESS).length
      const hoursWorked = user.assignedTasks
        .filter((t: any) => t.actualHours)
        .reduce((sum: number, t: any) => sum + t.actualHours!, 0)

      return {
        userName: `${user.firstName} ${user.lastName}`,
        completed,
        inProgress,
        hoursWorked: Math.round(hoursWorked * 10) / 10,
      }
    })

    const totalTasks = tasksByUser.reduce((sum: number, u: any) => sum + u.completed + u.inProgress, 0)

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u: any) => u.active).length,
      tasksByUser,
      averageTasksPerUser: users.length > 0 ? totalTasks / users.length : 0,
    }
  }

  /**
   * Get dashboard summary (all KPIs)
   */
  async getDashboardSummary() {
    const [tasks, equipment, materials, workforce] = await Promise.all([
      this.getTaskSummary(),
      this.getEquipmentUsage(),
      this.getMaterialConsumption(),
      this.getWorkforceReport(),
    ])

    return {
      tasks,
      equipment,
      materials,
      workforce,
      generatedAt: new Date(),
    }
  }
}
