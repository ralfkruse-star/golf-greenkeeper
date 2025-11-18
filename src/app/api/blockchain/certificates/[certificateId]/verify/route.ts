/**
 * Verify Certificate API
 * POST /api/blockchain/certificates/[certificateId]/verify - Verify a certificate
 */

import { NextRequest } from 'next/server'
import { BlockchainService } from '@/modules/blockchain/services/blockchain-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getRequestBody } from '@/lib/api-helpers'
import { z } from 'zod'

const blockchainService = new BlockchainService(prisma)

const verifySchema = z.object({
  verifierAddress: z.string(),
  verificationDocument: z.string(),
  approved: z.boolean(),
  notes: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ certificateId: string }> }
) {
  try {
    const params = await context.params
    const certificateId = params.certificateId

    const body = await getRequestBody(request)
    const validated = verifySchema.parse(body)

    const certificate = await blockchainService.verifyCertificate({
      certificateId,
      ...validated,
    })

    return successResponse(certificate)
  } catch (error) {
    return errorResponse(error)
  }
}
