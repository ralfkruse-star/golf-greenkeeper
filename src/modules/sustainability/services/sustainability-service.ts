/**
 * Sustainability Service
 * Track environmental impact, carbon credits, certifications
 */

export interface SustainabilityMetrics {
  period: { from: Date; to: Date }
  waterUsage: {
    total: number // Liter
    perSquareMeter: number
    savingsVsLastYear: number
    rainwaterHarvested: number
  }
  chemicalUsage: {
    totalKg: number
    reductionVsLastYear: number
    organicPercentage: number
  }
  carbonFootprint: {
    sequestration: {
      grass: number // kg CO2
      trees: number
      soil: number
      total: number
    }
    emissions: {
      equipment: number
      fertilizer: number
      transport: number
      total: number
    }
    netImpact: number // Negative = Carbon Positive!
  }
  certificationProgress: {
    target: 'Audubon' | 'GEO' | 'DGV_Golf&Natur'
    completionPercentage: number
    nextSteps: string[]
  }
}

export interface CarbonCredit {
  year: number
  totalSequestration: number // kg CO2
  totalEmissions: number
  netCapture: number
  eligibleForCredits: boolean
  estimatedValue: number // EUR
  marketplace: 'EU_ETS' | 'Voluntary'
  verificationStatus: 'PENDING' | 'VERIFIED' | 'ISSUED'
}

export class SustainabilityService {
  constructor(private prisma: any) {}

  /**
   * Calculate comprehensive sustainability metrics
   */
  async calculateMetrics(fromDate: Date, toDate: Date): Promise<SustainabilityMetrics> {
    // Get material applications
    const applications = await this.prisma.materialApplication.findMany({
      where: {
        appliedAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        material: true,
        location: true,
      },
    })

    // Get equipment usage
    const equipmentLogs = await this.prisma.equipmentUsageLog.findMany({
      where: {
        startTime: {
          gte: fromDate,
          lte: toDate,
        },
        endTime: { not: null },
      },
      include: {
        equipment: true,
      },
    })

    // Calculate total course area
    const locations = await this.prisma.location.findMany({
      where: {
        type: {
          in: ['GREEN', 'FAIRWAY', 'TEE'],
        },
      },
    })
    const totalArea = locations.reduce((sum: number, loc: any) => sum + (loc.area || 0), 0)

    // Water usage estimation (from irrigation recommendations + precipitation data)
    const weatherStats = await this.getWeatherStatistics(fromDate, toDate)
    const estimatedIrrigation = Math.max(
      0,
      (weatherStats?.evapotranspiration?.total || 0) - (weatherStats?.precipitation?.total || 0)
    )
    const waterUsage = {
      total: estimatedIrrigation * totalArea, // mm * m² = liters
      perSquareMeter: estimatedIrrigation,
      savingsVsLastYear: 0, // Would need historical comparison
      rainwaterHarvested: 0, // Would need sensor data
    }

    // Chemical usage
    const chemicalApps = applications.filter((app: any) =>
      ['FUNGICIDE', 'HERBICIDE', 'INSECTICIDE', 'FERTILIZER'].includes(app.material.type)
    )

    const totalChemicals = chemicalApps.reduce(
      (sum: number, app: any) => sum + app.quantity,
      0
    )

    const organicApps = chemicalApps.filter((app: any) =>
      app.material.name.toLowerCase().includes('organic')
    )
    const organicPercentage = chemicalApps.length > 0
      ? (organicApps.length / chemicalApps.length) * 100
      : 0

    // Carbon footprint calculation
    const carbonFootprint = await this.calculateCarbonFootprint(
      totalArea,
      equipmentLogs,
      applications
    )

    // Certification progress (simplified)
    const certificationProgress = {
      target: 'GEO' as const,
      completionPercentage: 45, // Would calculate based on actual criteria
      nextSteps: [
        'Install additional water meters',
        'Document pesticide reduction plan',
        'Create biodiversity survey',
      ],
    }

    return {
      period: { from: fromDate, to: toDate },
      waterUsage,
      chemicalUsage: {
        totalKg: totalChemicals,
        reductionVsLastYear: 0,
        organicPercentage,
      },
      carbonFootprint,
      certificationProgress,
    }
  }

  /**
   * Calculate carbon footprint
   */
  private async calculateCarbonFootprint(
    totalArea: number,
    equipmentLogs: any[],
    applications: any[]
  ) {
    // Sequestration rates (kg CO2 per m² per year)
    const grassSequestrationRate = 0.8 // Turf grass sequesters ~0.8 kg/m²/year
    const soilSequestrationRate = 0.3

    // Estimate for year (adjust if period is shorter)
    const daysInPeriod = 365 // Simplified
    const sequestration = {
      grass: totalArea * grassSequestrationRate,
      trees: 500, // Would calculate from tree inventory
      soil: totalArea * soilSequestrationRate,
      total: 0,
    }
    sequestration.total = sequestration.grass + sequestration.trees + sequestration.soil

    // Emissions
    // Equipment: assume 2.3 kg CO2 per liter fuel, ~0.3 L/hour
    const equipmentHours = equipmentLogs.reduce((sum: number, log: any) => {
      if (log.hoursEnd && log.hoursStart) {
        return sum + (log.hoursEnd - log.hoursStart)
      }
      return sum
    }, 0)
    const equipmentEmissions = equipmentHours * 0.3 * 2.3 // kg CO2

    // Fertilizer: ~3.5 kg CO2 per kg fertilizer produced
    const fertilizerUsed = applications
      .filter((app: any) => app.material.type === 'FERTILIZER')
      .reduce((sum: number, app: any) => sum + app.quantity, 0)
    const fertilizerEmissions = fertilizerUsed * 3.5

    const emissions = {
      equipment: equipmentEmissions,
      fertilizer: fertilizerEmissions,
      transport: 1000, // Simplified estimate
      total: 0,
    }
    emissions.total = emissions.equipment + emissions.fertilizer + emissions.transport

    const netImpact = sequestration.total - emissions.total

    return {
      sequestration,
      emissions,
      netImpact,
    }
  }

  /**
   * Calculate carbon credits eligibility
   */
  async calculateCarbonCredits(year: number): Promise<CarbonCredit> {
    const fromDate = new Date(year, 0, 1)
    const toDate = new Date(year, 11, 31)

    const metrics = await this.calculateMetrics(fromDate, toDate)
    const cf = metrics.carbonFootprint

    const eligibleForCredits = cf.netImpact < 0 // Carbon positive (more sequestration than emissions)

    // EU ETS price ~80 EUR/ton CO2 (simplified)
    const pricePerTon = 80
    const estimatedValue = eligibleForCredits
      ? (Math.abs(cf.netImpact) / 1000) * pricePerTon
      : 0

    return {
      year,
      totalSequestration: cf.sequestration.total,
      totalEmissions: cf.emissions.total,
      netCapture: Math.abs(cf.netImpact),
      eligibleForCredits,
      estimatedValue,
      marketplace: eligibleForCredits ? 'Voluntary' : 'EU_ETS',
      verificationStatus: 'PENDING',
    }
  }

  /**
   * Get weather statistics helper
   */
  private async getWeatherStatistics(fromDate: Date, toDate: Date) {
    const snapshots = await this.prisma.weatherSnapshot.findMany({
      where: {
        recordedAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
    })

    if (snapshots.length === 0) return null

    const totalPrecip = snapshots.reduce((sum: number, s: any) => sum + (s.precipitation || 0), 0)
    const totalET = snapshots.reduce((sum: number, s: any) => sum + (s.et || 0), 0)

    return {
      precipitation: {
        total: totalPrecip,
      },
      evapotranspiration: {
        total: totalET,
      },
    }
  }
}
