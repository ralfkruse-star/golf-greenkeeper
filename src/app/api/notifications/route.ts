import { NextRequest, NextResponse } from 'next/server'

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    // TODO: Get from authenticated user
    // For now, return mock data
    const notifications = [
      {
        id: '1',
        type: 'TASK',
        title: 'Neue Task zugewiesen',
        message: 'Grünpflege Loch 3 wurde Ihnen zugewiesen',
        priority: 'HIGH',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        actionUrl: '/dashboard/tasks',
      },
      {
        id: '2',
        type: 'EQUIPMENT',
        title: 'Wartung fällig',
        message: 'Rasenmäher Toro 2000 benötigt Wartung in 10 Betriebsstunden',
        priority: 'MEDIUM',
        read: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        actionUrl: '/dashboard/equipment',
      },
      {
        id: '3',
        type: 'MATERIAL',
        title: 'Niedriger Bestand',
        message: 'Premium Dünger NPK 15-15-15 hat niedrigen Bestand (8 kg)',
        priority: 'URGENT',
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        actionUrl: '/dashboard/materials',
      },
    ]

    return NextResponse.json({
      success: true,
      data: notifications,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOTIFICATIONS_FETCH_FAILED',
          message: error.message,
        },
      },
      { status: 500 }
    )
  }
}
