'use client'

import { useEffect, useState } from 'react'

interface Notification {
  id: string
  type: 'TASK' | 'EQUIPMENT' | 'MATERIAL' | 'SENSOR' | 'WEATHER'
  title: string
  message: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  read: boolean
  createdAt: string
  actionUrl?: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL')

  useEffect(() => {
    fetchNotifications()
    // Simulate real-time notifications
    const interval = setInterval(checkForNewNotifications, 30000) // Check every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setNotifications(data.data)
      }
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      // Load mock notifications for demo
      loadMockNotifications()
      setLoading(false)
    }
  }

  const loadMockNotifications = () => {
    const mock: Notification[] = [
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
      {
        id: '4',
        type: 'SENSOR',
        title: 'Bodenfeuchtigkeit kritisch',
        message: 'Sensor Zone Fairway 5: Feuchtigkeit unter Schwellenwert (12%)',
        priority: 'HIGH',
        read: false,
        createdAt: new Date(Date.now() - 10800000).toISOString(),
      },
      {
        id: '5',
        type: 'WEATHER',
        title: 'Wetterwarnung',
        message: 'Starkregen erwartet für morgen (18mm)',
        priority: 'MEDIUM',
        read: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ]
    setNotifications(mock)
  }

  const checkForNewNotifications = async () => {
    // In production, this would check for new notifications via API or WebSocket
    console.log('Checking for new notifications...')
  }

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('access_token')
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })

      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('access_token')
      await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })

      setNotifications(notifications.map((n) => ({ ...n, read: true })))
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      TASK: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      EQUIPMENT: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
      MATERIAL: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      SENSOR: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
      WEATHER: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
          />
        </svg>
      ),
    }
    return icons[type] || icons.TASK
  }

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      URGENT: { bg: 'bg-red-100', text: 'text-red-800' },
      HIGH: { bg: 'bg-orange-100', text: 'text-orange-800' },
      MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      LOW: { bg: 'bg-blue-100', text: 'text-blue-800' },
    }
    return badges[priority] || badges.MEDIUM
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      TASK: 'bg-blue-100 text-blue-600',
      EQUIPMENT: 'bg-green-100 text-green-600',
      MATERIAL: 'bg-purple-100 text-purple-600',
      SENSOR: 'bg-orange-100 text-orange-600',
      WEATHER: 'bg-cyan-100 text-cyan-600',
    }
    return colors[type] || colors.TASK
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'Gerade eben'
    if (seconds < 3600) return `vor ${Math.floor(seconds / 60)} Min`
    if (seconds < 86400) return `vor ${Math.floor(seconds / 3600)} Std`
    return `vor ${Math.floor(seconds / 86400)} Tag(en)`
  }

  const filteredNotifications =
    filter === 'UNREAD'
      ? notifications.filter((n) => !n.read)
      : notifications

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Benachrichtigungen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Benachrichtigungen
          </h1>
          <p className="text-gray-600 mt-1">
            {unreadCount} ungelesene Benachrichtigung(en)
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="mt-4 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Alle als gelesen markieren
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'ALL'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Alle ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'UNREAD'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Ungelesen ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => {
          const badge = getPriorityBadge(notification.priority)

          return (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow p-4 hover:shadow-md transition ${
                !notification.read ? 'border-l-4 border-blue-600' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`rounded-lg p-3 ${getTypeColor(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-3 mt-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
                        >
                          {notification.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    {!notification.read && (
                      <span className="inline-block w-3 h-3 bg-blue-600 rounded-full ml-4"></span>
                    )}
                  </div>

                  <div className="flex space-x-2 mt-3">
                    {notification.actionUrl && (
                      <button
                        onClick={() =>
                          (window.location.href = notification.actionUrl!)
                        }
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition"
                      >
                        Anzeigen
                      </button>
                    )}
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition"
                      >
                        Als gelesen markieren
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <p className="text-gray-600">
            {filter === 'UNREAD'
              ? 'Keine ungelesenen Benachrichtigungen'
              : 'Keine Benachrichtigungen vorhanden'}
          </p>
        </div>
      )}
    </div>
  )
}
