/**
 * Integration Marketplace Service
 * Manage third-party integrations and plugins
 */

export interface Integration {
  id: string
  name: string
  category: 'weather' | 'iot' | 'payment' | 'supplier' | 'teesheet' | 'analytics' | 'other'
  provider: string
  description: string
  logoUrl: string
  pricingModel: 'free' | 'subscription' | 'usage' | 'one_time'
  monthlyPrice?: number
  active: boolean
  requiredTier: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE'
  config: Record<string, any>
}

export class MarketplaceService {
  private availableIntegrations: Integration[] = [
    {
      id: 'openweather',
      name: 'OpenWeatherMap',
      category: 'weather',
      provider: 'OpenWeather',
      description: 'Professional weather data and forecasting',
      logoUrl: '/integrations/openweather.png',
      pricingModel: 'subscription',
      monthlyPrice: 0, // Free tier available
      active: true,
      requiredTier: 'BASIC',
      config: {
        apiKey: '',
      },
    },
    {
      id: 'mqtt-iot',
      name: 'MQTT IoT Platform',
      category: 'iot',
      provider: 'HiveMQ',
      description: 'Connect IoT sensors via MQTT protocol',
      logoUrl: '/integrations/mqtt.png',
      pricingModel: 'subscription',
      monthlyPrice: 49,
      active: true,
      requiredTier: 'PROFESSIONAL',
      config: {
        brokerUrl: '',
        username: '',
        password: '',
      },
    },
    {
      id: 'stripe-payments',
      name: 'Stripe Payments',
      category: 'payment',
      provider: 'Stripe',
      description: 'Accept payments for equipment rentals and services',
      logoUrl: '/integrations/stripe.png',
      pricingModel: 'usage',
      active: true,
      requiredTier: 'PROFESSIONAL',
      config: {
        publicKey: '',
        secretKey: '',
      },
    },
    {
      id: 'golfmanager',
      name: 'GolfManager Integration',
      category: 'teesheet',
      provider: 'GolfManager',
      description: 'Sync with tee sheet system for player traffic data',
      logoUrl: '/integrations/golfmanager.png',
      pricingModel: 'subscription',
      monthlyPrice: 99,
      active: true,
      requiredTier: 'ENTERPRISE',
      config: {
        apiUrl: '',
        apiKey: '',
      },
    },
  ]

  constructor(private prisma: any) {}

  /**
   * List all available integrations
   */
  async listIntegrations(category?: string, tenantTier?: string): Promise<Integration[]> {
    let integrations = this.availableIntegrations

    if (category) {
      integrations = integrations.filter((i) => i.category === category)
    }

    if (tenantTier) {
      const tierOrder = ['BASIC', 'PROFESSIONAL', 'ENTERPRISE']
      const tenantTierIndex = tierOrder.indexOf(tenantTier)

      integrations = integrations.filter(
        (i) => tierOrder.indexOf(i.requiredTier) <= tenantTierIndex
      )
    }

    return integrations
  }

  /**
   * Install integration for tenant
   */
  async installIntegration(
    tenantId: string,
    integrationId: string,
    config: Record<string, any>
  ) {
    const integration = this.availableIntegrations.find((i) => i.id === integrationId)

    if (!integration) {
      throw new Error('Integration not found')
    }

    // Check tenant tier
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    })

    const tierOrder = ['BASIC', 'PROFESSIONAL', 'ENTERPRISE']
    if (tierOrder.indexOf(tenant.tier) < tierOrder.indexOf(integration.requiredTier)) {
      throw new Error(
        `Integration requires ${integration.requiredTier} tier or higher`
      )
    }

    // Store integration config in tenant settings
    const currentSettings = tenant.settings || {}
    const updatedSettings = {
      ...currentSettings,
      integrations: {
        ...currentSettings.integrations,
        [integrationId]: {
          installed: true,
          installedAt: new Date(),
          config,
        },
      },
    }

    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: JSON.parse(JSON.stringify(updatedSettings)),
      },
    })
  }

  /**
   * Get installed integrations for tenant
   */
  async getInstalledIntegrations(tenantId: string): Promise<Integration[]> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    })

    const installedIds = Object.keys(tenant.settings?.integrations || {})

    return this.availableIntegrations.filter((i) => installedIds.includes(i.id))
  }
}
