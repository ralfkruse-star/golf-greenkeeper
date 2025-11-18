import { NextRequest, NextResponse } from 'next/server'

// PATCH /api/notifications/read-all - Mark all notifications as read
export async function PATCH(request: NextRequest) {
  try {
    // TODO: Update all in database for authenticated user
    return NextResponse.json({
      success: true,
      data: {
        updated: true,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOTIFICATIONS_UPDATE_FAILED',
          message: error.message,
        },
      },
      { status: 500 }
    )
  }
}
