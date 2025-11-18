/**
 * Predictive Maintenance API
 * GET /api/ai/predictive-maintenance
 */

import { NextRequest } from 'next/server'
import { PredictiveMaintenanceService } from '@/modules/ai/services/predictive-maintenance'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-helpers'

const predictiveService = new PredictiveMaintenanceService(prisma)

export async function GET(request: NextRequest) {
  try {
    const predictions = await predictiveService.predictAllEquipment()

    return successResponse({
      predictions,
      criticalCount: predictions.filter((p) => p.riskLevel === 'CRITICAL').length,
      highRiskCount: predictions.filter((p) => p.riskLevel === 'HIGH').length,
      totalEstimatedCost: predictions.reduce((sum, p) => sum + p.estimatedCost, 0),
    })
  } catch (error) {
    return errorResponse(error)
  }
}
