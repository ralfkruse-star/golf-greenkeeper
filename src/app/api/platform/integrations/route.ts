/**
 * Platform Integrations API
 * GET /api/platform/integrations - List available integrations
 * POST /api/platform/integrations/:id/install - Install integration
 */

import { NextRequest } from 'next/server'
import { MarketplaceService } from '@/modules/platform/services/marketplace-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getQueryParams } from '@/lib/api-helpers'

const marketplaceService = new MarketplaceService(prisma)

export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request)

    const integrations = await marketplaceService.listIntegrations(
      params.category,
      params.tier
    )

    return successResponse(integrations)
  } catch (error) {
    return errorResponse(error)
  }
}
