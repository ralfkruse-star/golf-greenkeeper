/**
 * Certificate Marketplace API
 * GET /api/blockchain/marketplace - Get carbon credit marketplace data
 */

import { NextRequest } from 'next/server'
import { BlockchainService } from '@/modules/blockchain/services/blockchain-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-helpers'

const blockchainService = new BlockchainService(prisma)

export async function GET(request: NextRequest) {
  try {
    const marketplace = await blockchainService.getMarketplace()

    return successResponse(marketplace)
  } catch (error) {
    return errorResponse(error)
  }
}
