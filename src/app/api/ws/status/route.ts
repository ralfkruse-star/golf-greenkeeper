/**
 * GET /api/ws/status - WebSocket server status
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth/middleware'
import { wsManager } from '@/lib/websocket/server'

export async function GET(req: NextRequest) {
  try {
    const user = authenticateRequest(req)

    return NextResponse.json({
      success: true,
      data: {
        connected: wsManager.getConnectedClients(),
        endpoint: '/ws',
        protocol: 'ws',
      },
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
