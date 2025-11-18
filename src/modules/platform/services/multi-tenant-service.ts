/**
 * Multi-Tenant Service
 * Manage tenants, subscriptions, and tenant-scoped data
 */

export interface TenantConfig {
  clubId: string
  name: string
  subdomain: string
  tier: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE'
  customBranding?: {
    logoUrl?: string
    primaryColor?: string
    secondaryColor?: string
  }
  settings?: Record<string, any>
}

export interface TenantFeatures {
  maxUsers: number
  maxLocations: number
  maxEquipment: number
  features: {
    aiScheduling: boolean
    predictiveMaintenance: boolean
    computerVision: boolean
    advancedAnalytics: boolean
    iotIntegration: boolean
    carbonTracking: boolean
    customBranding: boolean
    apiAccess: boolean
  }
}

export class MultiTenantService {
  constructor(private prisma: any) {}

  /**
   * Create a new tenant
   */
  async createTenant(config: TenantConfig) {
    // Validate subdomain is unique
    const existing = await this.prisma.tenant.findUnique({
      where: { subdomain: config.subdomain },
    })

    if (existing) {
      throw new Error('Subdomain already exists')
    }

    return this.prisma.tenant.create({
      data: {
        name: config.name,
        subdomain: config.subdomain,
        tier: config.tier,
        logoUrl: config.customBranding?.logoUrl,
        primaryColor: config.customBranding?.primaryColor,
        secondaryColor: config.customBranding?.secondaryColor,
        settings: config.settings ? JSON.parse(JSON.stringify(config.settings)) : undefined,
      },
    })
  }

  /**
   * Get tenant features based on subscription tier
   */
  getTenantFeatures(tier: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE'): TenantFeatures {
    const features: Record<string, TenantFeatures> = {
      BASIC: {
        maxUsers: 5,
        maxLocations: 50,
        maxEquipment: 10,
        features: {
          aiScheduling: false,
          predictiveMaintenance: false,
          computerVision: false,
          advancedAnalytics: false,
          iotIntegration: false,
          carbonTracking: false,
          customBranding: false,
          apiAccess: false,
        },
      },
      PROFESSIONAL: {
        maxUsers: 20,
        maxLocations: 200,
        maxEquipment: 50,
        features: {
          aiScheduling: true,
          predictiveMaintenance: true,
          computerVision: false,
          advancedAnalytics: true,
          iotIntegration: true,
          carbonTracking: true,
          customBranding: true,
          apiAccess: true,
        },
      },
      ENTERPRISE: {
        maxUsers: -1, // Unlimited
        maxLocations: -1,
        maxEquipment: -1,
        features: {
          aiScheduling: true,
          predictiveMaintenance: true,
          computerVision: true,
          advancedAnalytics: true,
          iotIntegration: true,
          carbonTracking: true,
          customBranding: true,
          apiAccess: true,
        },
      },
    }

    return features[tier]
  }

  /**
   * Get tenant usage statistics
   */
  async getTenantUsage(tenantId: string) {
    const [users, locations, equipment, tasks] = await Promise.all([
      this.prisma.user.count({ where: { tenantId } }),
      this.prisma.location.count({ where: { tenantId } }),
      this.prisma.equipment.count({ where: { active: true } }),
      this.prisma.task.count({ where: { createdBy: { tenantId } } }),
    ])

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    })

    const features = this.getTenantFeatures(tenant.tier)

    return {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        tier: tenant.tier,
      },
      usage: {
        users,
        locations,
        equipment,
        tasks,
      },
      limits: {
        maxUsers: features.maxUsers,
        maxLocations: features.maxLocations,
        maxEquipment: features.maxEquipment,
      },
      utilizationPercentage: {
        users: features.maxUsers > 0 ? (users / features.maxUsers) * 100 : 0,
        locations: features.maxLocations > 0 ? (locations / features.maxLocations) * 100 : 0,
        equipment: features.maxEquipment > 0 ? (equipment / features.maxEquipment) * 100 : 0,
      },
    }
  }

  /**
   * Check if tenant can use a feature
   */
  async canUseFeature(tenantId: string, feature: string): Promise<boolean> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    })

    if (!tenant || !tenant.active) return false

    const features = this.getTenantFeatures(tenant.tier)
    return features.features[feature as keyof typeof features.features] || false
  }

  /**
   * Get tenant by subdomain
   */
  async getTenantBySubdomain(subdomain: string) {
    return this.prisma.tenant.findUnique({
      where: { subdomain },
    })
  }
}
