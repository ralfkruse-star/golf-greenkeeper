/**
 * GET /api/reports/tasks - Get task summary report
 */

import { NextRequest, NextResponse } from 'next/server'
import { ReportService } from '@/modules/reports/application/report.service'
import { authenticateRequest } from '@/lib/auth/middleware'

const reportService = new ReportService()

export async function GET(req: NextRequest) {
  try {
    const user = authenticateRequest(req)

    const { searchParams } = new URL(req.url)
    const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined
    const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined

    const report = await reportService.getTaskSummary(dateFrom, dateTo)

    return NextResponse.json({
      success: true,
      data: report,
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
