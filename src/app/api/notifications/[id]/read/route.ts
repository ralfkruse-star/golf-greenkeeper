import { NextRequest, NextResponse } from 'next/server'

// PATCH /api/notifications/[id]/read - Mark notification as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Update in database
    return NextResponse.json({
      success: true,
      data: {
        id: params.id,
        read: true,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOTIFICATION_UPDATE_FAILED',
          message: error.message,
        },
      },
      { status: 500 }
    )
  }
}
