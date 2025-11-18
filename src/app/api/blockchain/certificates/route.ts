/**
 * Carbon Certificates API
 * GET /api/blockchain/certificates - Get tenant's certificates
 * POST /api/blockchain/certificates - Mint new certificate
 */

import { NextRequest } from 'next/server'
import { BlockchainService } from '@/modules/blockchain/services/blockchain-service'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, getRequestBody } from '@/lib/api-helpers'
import { z } from 'zod'

const blockchainService = new BlockchainService(prisma)

const mintSchema = z.object({
  type: z.enum(['CARBON_SEQUESTRATION', 'EMISSION_REDUCTION', 'SUSTAINABLE_PRACTICE', 'BIODIVERSITY']),
  carbonAmount: z.number().positive(),
  periodStart: z.string().transform((s) => new Date(s)),
  periodEnd: z.string().transform((s) => new Date(s)),
  methodology: z.string(),
  projectDescription: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string(),
  }),
  evidence: z.object({
    calculationMethod: z.string(),
    dataPoints: z.array(
      z.object({
        type: z.string(),
        value: z.number(),
        unit: z.string(),
        timestamp: z.string().transform((s) => new Date(s)),
      })
    ),
    documents: z.array(z.string()).optional(),
    photos: z.array(z.string()).optional(),
  }),
})

export async function GET(request: NextRequest) {
  try {
    // TODO: Get tenantId from JWT
    const tenantId = request.headers.get('x-tenant-id') || 'default'

    const certificates = await blockchainService.getCertificatesByTenant(tenantId)

    return successResponse({ certificates })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await getRequestBody(request)
    const validated = mintSchema.parse(body)

    // TODO: Get tenantId from JWT
    const tenantId = request.headers.get('x-tenant-id') || 'default'

    const certificate = await blockchainService.mintCertificate(validated, tenantId)

    return successResponse(certificate, 201)
  } catch (error) {
    return errorResponse(error)
  }
}
