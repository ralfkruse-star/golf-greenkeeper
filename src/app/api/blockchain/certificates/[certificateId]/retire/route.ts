/**
 * Retire Certificate API
 * POST /api/blockchain/certificates/[certificateId]/retire - Retire a certificate
 */

import { NextRequest } from 'next/server'
import { BlockchainService } from '@/modules/blockchain/services/blockchain-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getRequestBody } from '@/lib/api-helpers'
import { z } from 'zod'

const blockchainService = new BlockchainService(prisma)

const retireSchema = z.object({
  retiredBy: z.string(),
  reason: z.string(),
})

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ certificateId: string }> }
) {
  try {
    const params = await context.params
    const certificateId = params.certificateId

    const body = await getRequestBody(request)
    const validated = retireSchema.parse(body)

    const certificate = await blockchainService.retireCertificate({
      certificateId,
      ...validated,
    })

    return successResponse(certificate)
  } catch (error) {
    return errorResponse(error)
  }
}
