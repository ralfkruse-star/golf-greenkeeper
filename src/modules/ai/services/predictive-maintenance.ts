/**
 * Predictive Maintenance Service
 * ML-based equipment failure prediction
 */

export interface MaintenancePrediction {
  equipmentId: string
  equipmentName: string
  currentHours: number
  predictedFailureHours: number
  hoursUntilFailure: number
  daysUntilFailure: number
  confidence: number // 0-1
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  recommendedAction: string
  estimatedCost: number
  factors: string[]
}

export class PredictiveMaintenanceService {
  constructor(private prisma: any) {}

  /**
   * Predict maintenance needs for equipment
   * Uses simple heuristics + historical data (real ML would use TensorFlow/PyTorch)
   */
  async predictMaintenance(equipmentId: string): Promise<MaintenancePrediction> {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        maintenanceEvents: {
          orderBy: { performedAt: 'desc' },
        },
        maintenancePlans: {
          where: { active: true },
        },
        usageLogs: {
          orderBy: { startTime: 'desc' },
          take: 100,
        },
      },
    })

    if (!equipment) {
      throw new Error('Equipment not found')
    }

    const factors: string[] = []
    let riskScore = 0

    // Factor 1: Hours since last maintenance
    const lastMaintenance = equipment.maintenanceEvents[0]
    const hoursSinceLastMaintenance = lastMaintenance
      ? equipment.currentHours - (lastMaintenance.performedHours || 0)
      : equipment.currentHours

    if (hoursSinceLastMaintenance > 500) {
      riskScore += 30
      factors.push(`${hoursSinceLastMaintenance} Stunden seit letzter Wartung`)
    }

    // Factor 2: Check if approaching planned maintenance interval
    const upcomingMaintenance = equipment.maintenancePlans.find(
      (plan: any) => plan.nextDueHours && plan.nextDueHours - equipment.currentHours < 100
    )

    if (upcomingMaintenance) {
      riskScore += 20
      factors.push('Geplante Wartung steht bevor')
    }

    // Factor 3: Age of equipment
    const ageYears = equipment.purchaseDate
      ? (Date.now() - equipment.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
      : 0

    if (ageYears > 10) {
      riskScore += 40
      factors.push(`Equipment ist ${ageYears.toFixed(1)} Jahre alt`)
    } else if (ageYears > 7) {
      riskScore += 25
      factors.push(`Equipment ist ${ageYears.toFixed(1)} Jahre alt`)
    }

    // Factor 4: Total operating hours
    const totalHours = equipment.currentHours - equipment.initialHours
    if (totalHours > 5000) {
      riskScore += 30
      factors.push(`Hohe Betriebsstunden: ${totalHours}h`)
    }

    // Factor 5: Usage intensity (recent vs. historical)
    const recentUsageDays = 30
    const recentUsage = equipment.usageLogs
      .filter(
        (log: any) =>
          new Date(log.startTime).getTime() > Date.now() - recentUsageDays * 24 * 60 * 60 * 1000
      )
      .reduce((sum: number, log: any) => {
        if (log.hoursEnd && log.hoursStart) {
          return sum + (log.hoursEnd - log.hoursStart)
        }
        return sum
      }, 0)

    const avgDailyUsage = recentUsage / recentUsageDays
    if (avgDailyUsage > 8) {
      riskScore += 15
      factors.push(`Intensive Nutzung: ${avgDailyUsage.toFixed(1)}h/Tag`)
    }

    // Calculate prediction
    const confidence = Math.min(0.95, 0.6 + factors.length * 0.1)

    // Predict failure hours (simplified model)
    const baseLifeExpectancy = 8000 // hours
    const degradationFactor = riskScore / 100
    const remainingLife = baseLifeExpectancy - totalHours
    const adjustedRemainingLife = remainingLife * (1 - degradationFactor)

    const predictedFailureHours = equipment.currentHours + Math.max(0, adjustedRemainingLife)
    const hoursUntilFailure = Math.max(0, predictedFailureHours - equipment.currentHours)

    // Assume 8 hours/day usage
    const daysUntilFailure = hoursUntilFailure / 8

    // Risk level
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    if (daysUntilFailure < 7) riskLevel = 'CRITICAL'
    else if (daysUntilFailure < 30) riskLevel = 'HIGH'
    else if (daysUntilFailure < 90) riskLevel = 'MEDIUM'
    else riskLevel = 'LOW'

    // Recommended action
    let recommendedAction: string
    if (riskLevel === 'CRITICAL') {
      recommendedAction = 'Sofortige Wartung erforderlich - Equipment außer Betrieb nehmen'
    } else if (riskLevel === 'HIGH') {
      recommendedAction = 'Wartung innerhalb der nächsten 7 Tage planen'
    } else if (riskLevel === 'MEDIUM') {
      recommendedAction = 'Wartung für nächsten Monat einplanen'
    } else {
      recommendedAction = 'Regelmäßige Überwachung fortsetzen'
    }

    // Estimated cost (based on historical maintenance)
    const avgMaintenanceCost =
      equipment.maintenanceEvents.length > 0
        ? equipment.maintenanceEvents.reduce((sum: number, e: any) => sum + (e.cost || 0), 0) /
          equipment.maintenanceEvents.length
        : 500 // Default estimate

    return {
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      currentHours: equipment.currentHours,
      predictedFailureHours,
      hoursUntilFailure,
      daysUntilFailure,
      confidence,
      riskLevel,
      recommendedAction,
      estimatedCost: avgMaintenanceCost,
      factors,
    }
  }

  /**
   * Get predictions for all equipment
   */
  async predictAllEquipment(): Promise<MaintenancePrediction[]> {
    const equipment = await this.prisma.equipment.findMany({
      where: { active: true },
    })

    const predictions = await Promise.all(
      equipment.map((eq: any) => this.predictMaintenance(eq.id))
    )

    // Sort by risk
    return predictions.sort((a, b) => {
      const riskOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
    })
  }
}
