/**
 * GET /api/reports/dashboard - Get dashboard summary
 */

import { NextRequest, NextResponse } from 'next/server'
import { ReportService } from '@/modules/reports/application/report.service'
import { authenticateRequest } from '@/lib/auth/middleware'

const reportService = new ReportService()

export async function GET(req: NextRequest) {
  try {
    const user = authenticateRequest(req)

    const summary = await reportService.getDashboardSummary()

    return NextResponse.json({
      success: true,
      data: summary,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'An error occurred',
        },
      },
      { status: error.statusCode || 500 }
    )
  }
}
