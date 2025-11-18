/**
 * Network Statistics API
 * GET /api/network/stats - Get network statistics
 */

import { NextRequest } from 'next/server'
import { NetworkService } from '@/modules/network/services/network-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-helpers'

const networkService = new NetworkService(prisma)

export async function GET(request: NextRequest) {
  try {
    const stats = await networkService.getNetworkStats()
    return successResponse(stats)
  } catch (error) {
    return errorResponse(error)
  }
}
