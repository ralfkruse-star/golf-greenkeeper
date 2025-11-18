/**
 * Analytics Service
 * Advanced Analytics, KPIs, and Business Intelligence
 */

export interface LaborAnalytics {
  period: { from: Date; to: Date }
  totalHours: number
  totalCost: number
  byUser: Array<{
    userId: string
    userName: string
    hours: number
    tasksCompleted: number
    avgTaskDuration: number
    cost: number
  }>
  byLocation: Array<{
    locationId: string
    locationName: string
    hours: number
    cost: number
  }>
  trend: 'increasing' | 'stable' | 'decreasing'
}

export interface EquipmentROI {
  equipmentId: string
  name: string
  purchasePrice: number
  purchaseDate: Date
  ageYears: number
  totalMaintenanceCost: number
  totalOperatingHours: number
  utilizationRate: number
  costPerHour: number
  estimatedValue: number
  roi: number
  replacementRecommendation: boolean
}

export interface MaterialEfficiency {
  materialId: string
  name: string
  type: string
  totalUsed: number
  totalCost: number
  applicationRate: number
  costPerSquareMeter: number
  wasteEstimate: number
  trend: 'increasing' | 'stable' | 'decreasing'
}

export class AnalyticsService {
  constructor(private prisma: any) {}

  /**
   * Calculate labor analytics for period
   */
  async getLaborAnalytics(fromDate: Date, toDate: Date): Promise<LaborAnalytics> {
    const tasks = await this.prisma.task.findMany({
      where: {
        actualStart: {
          gte: fromDate,
          lte: toDate,
        },
        actualEnd: { not: null },
      },
      include: {
        assignedTo: true,
        location: true,
      },
    })

    const hourlyRate = 25 // €/hour (should come from config)

    // Aggregate by user
    const byUser = new Map<string, any>()
    const byLocation = new Map<string, any>()
    let totalHours = 0

    tasks.forEach((task) => {
      if (!task.actualStart || !task.actualEnd) return

      const hours =
        (task.actualEnd.getTime() - task.actualStart.getTime()) / (1000 * 60 * 60)

      totalHours += hours

      // By user
      if (task.assignedTo) {
        const userId = task.assignedTo.id
        if (!byUser.has(userId)) {
          byUser.set(userId, {
            userId,
            userName: `${task.assignedTo.firstName} ${task.assignedTo.lastName}`,
            hours: 0,
            tasksCompleted: 0,
            totalDuration: 0,
          })
        }
        const userData = byUser.get(userId)
        userData.hours += hours
        userData.tasksCompleted++
        userData.totalDuration += hours
      }

      // By location
      if (task.location) {
        const locId = task.location.id
        if (!byLocation.has(locId)) {
          byLocation.set(locId, {
            locationId: locId,
            locationName: task.location.name,
            hours: 0,
          })
        }
        byLocation.get(locId).hours += hours
      }
    })

    return {
      period: { from: fromDate, to: toDate },
      totalHours,
      totalCost: totalHours * hourlyRate,
      byUser: Array.from(byUser.values()).map((u) => ({
        ...u,
        avgTaskDuration: u.totalDuration / u.tasksCompleted,
        cost: u.hours * hourlyRate,
      })),
      byLocation: Array.from(byLocation.values()).map((l) => ({
        ...l,
        cost: l.hours * hourlyRate,
      })),
      trend: 'stable', // Requires historical comparison
    }
  }

  /**
   * Calculate Equipment ROI
   */
  async getEquipmentROI(): Promise<EquipmentROI[]> {
    const equipment = await this.prisma.equipment.findMany({
      where: { active: true },
      include: {
        maintenanceEvents: true,
        usageLogs: true,
      },
    })

    const now = new Date()

    return equipment.map((eq) => {
      const ageYears = eq.purchaseDate
        ? (now.getTime() - eq.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
        : 0

      const totalMaintenanceCost = eq.maintenanceEvents.reduce(
        (sum: number, e: any) => sum + (e.cost || 0),
        0
      )

      const totalHours = eq.currentHours - eq.initialHours
      const utilizationRate = totalHours / (ageYears * 2000) // 2000 hours/year = full utilization

      const totalCost = (eq.purchasePrice || 0) + totalMaintenanceCost
      const costPerHour = totalHours > 0 ? totalCost / totalHours : 0

      // Simple depreciation (20% per year)
      const estimatedValue = (eq.purchasePrice || 0) * Math.pow(0.8, ageYears)

      // ROI = (Gain - Cost) / Cost (simplified)
      const roi = totalCost > 0 ? ((estimatedValue - totalCost) / totalCost) * 100 : 0

      return {
        equipmentId: eq.id,
        name: eq.name,
        purchasePrice: eq.purchasePrice || 0,
        purchaseDate: eq.purchaseDate || now,
        ageYears,
        totalMaintenanceCost,
        totalOperatingHours: totalHours,
        utilizationRate,
        costPerHour,
        estimatedValue,
        roi,
        replacementRecommendation: ageYears > 10 || utilizationRate > 0.9,
      }
    })
  }

  /**
   * Calculate Material Efficiency
   */
  async getMaterialEfficiency(fromDate: Date, toDate: Date): Promise<MaterialEfficiency[]> {
    const materials = await this.prisma.material.findMany({
      where: { active: true },
      include: {
        applications: {
          where: {
            appliedAt: {
              gte: fromDate,
              lte: toDate,
            },
          },
          include: {
            location: true,
          },
        },
      },
    })

    return materials.map((material) => {
      const totalUsed = material.applications.reduce(
        (sum: number, app: any) => sum + app.quantity,
        0
      )

      const totalCost = totalUsed * (material.unitCost || 0)

      // Calculate total area treated
      const totalArea = material.applications.reduce((sum: number, app: any) => {
        return sum + (app.location?.area || 0)
      }, 0)

      const applicationRate = totalArea > 0 ? totalUsed / totalArea : 0
      const costPerSquareMeter = totalArea > 0 ? totalCost / totalArea : 0

      // Estimate waste (simplified: 5% waste assumed)
      const wasteEstimate = totalUsed * 0.05

      return {
        materialId: material.id,
        name: material.name,
        type: material.type,
        totalUsed,
        totalCost,
        applicationRate,
        costPerSquareMeter,
        wasteEstimate,
        trend: 'stable',
      }
    })
  }

  /**
   * Get comprehensive dashboard KPIs
   */
  async getDashboardKPIs(period: 'week' | 'month' | 'year' = 'month') {
    const now = new Date()
    let fromDate = new Date()

    switch (period) {
      case 'week':
        fromDate.setDate(now.getDate() - 7)
        break
      case 'month':
        fromDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        fromDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const [tasks, equipment, labor, materialEff] = await Promise.all([
      this.prisma.task.findMany({
        where: {
          createdAt: { gte: fromDate },
        },
      }),
      this.getEquipmentROI(),
      this.getLaborAnalytics(fromDate, now),
      this.getMaterialEfficiency(fromDate, now),
    ])

    const taskStats = {
      total: tasks.length,
      completed: tasks.filter((t: any) => t.status === 'COMPLETED').length,
      inProgress: tasks.filter((t: any) => t.status === 'IN_PROGRESS').length,
      overdue: tasks.filter(
        (t: any) => t.scheduledEnd && t.scheduledEnd < now && t.status !== 'COMPLETED'
      ).length,
      completionRate:
        tasks.length > 0
          ? (tasks.filter((t: any) => t.status === 'COMPLETED').length / tasks.length) * 100
          : 0,
    }

    return {
      period: { from: fromDate, to: now, type: period },
      tasks: taskStats,
      labor,
      equipment: {
        total: equipment.length,
        avgUtilization:
          equipment.reduce((sum, e) => sum + e.utilizationRate, 0) / equipment.length,
        needsReplacement: equipment.filter((e) => e.replacementRecommendation).length,
        totalMaintenanceCost: equipment.reduce((sum, e) => sum + e.totalMaintenanceCost, 0),
      },
      materials: {
        total: materialEff.length,
        totalCost: materialEff.reduce((sum, m) => sum + m.totalCost, 0),
        avgWaste: materialEff.reduce((sum, m) => sum + m.wasteEstimate, 0),
      },
    }
  }
}
