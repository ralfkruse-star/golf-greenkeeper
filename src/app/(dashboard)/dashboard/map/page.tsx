'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
)

interface Zone {
  id: string
  name: string
  type: string
  latitude: number
  longitude: number
  radius?: number
  activeTasks?: number
  sensors?: number
}

export default function MapPage() {
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [mapReady, setMapReady] = useState(false)

  // Default center: Golfplatz Siek
  const center: [number, number] = [53.6394, 10.2931]

  useEffect(() => {
    // Import leaflet CSS
    import('leaflet/dist/leaflet.css')
    setMapReady(true)
    fetchZones()
  }, [])

  const fetchZones = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('/api/zones', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setZones(data.data)
      }
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch zones:', error)
      setLoading(false)
    }
  }

  const getZoneColor = (type: string) => {
    const colors: Record<string, string> = {
      GREEN: '#10B981',
      TEE: '#3B82F6',
      FAIRWAY: '#34D399',
      ROUGH: '#F59E0B',
      BUNKER: '#F59E0B',
      WATER: '#06B6D4',
      PRACTICE: '#8B5CF6',
    }
    return colors[type] || '#6B7280'
  }

  if (!mapReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Karte...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Platz-Karte
        </h1>
        <p className="text-gray-600 mt-1">
          Übersicht über Zonen, Sensoren und aktive Tasks
        </p>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Legende</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { type: 'GREEN', label: 'Grün' },
            { type: 'TEE', label: 'Abschlag' },
            { type: 'FAIRWAY', label: 'Fairway' },
            { type: 'ROUGH', label: 'Rough' },
            { type: 'BUNKER', label: 'Bunker' },
            { type: 'WATER', label: 'Wasser' },
            { type: 'PRACTICE', label: 'Übung' },
          ].map((item) => (
            <div key={item.type} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: getZoneColor(item.type) }}
              ></div>
              <span className="text-sm text-gray-700">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Lade Zonen...</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {zones.map((zone) => (
              <Circle
                key={zone.id}
                center={[zone.latitude, zone.longitude]}
                radius={zone.radius || 50}
                pathOptions={{
                  color: getZoneColor(zone.type),
                  fillColor: getZoneColor(zone.type),
                  fillOpacity: 0.3,
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">Typ: {zone.type}</p>
                    {zone.activeTasks !== undefined && (
                      <p className="text-sm text-gray-600">
                        Aktive Tasks: {zone.activeTasks}
                      </p>
                    )}
                    {zone.sensors !== undefined && (
                      <p className="text-sm text-gray-600">
                        Sensoren: {zone.sensors}
                      </p>
                    )}
                    <button className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition">
                      Details anzeigen
                    </button>
                  </div>
                </Popup>
              </Circle>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Zones List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Zonen-Übersicht
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getZoneColor(zone.type) }}
                ></div>
                <div>
                  <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                  <p className="text-sm text-gray-600">{zone.type}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <p>Koordinaten: {zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)}</p>
                {zone.activeTasks !== undefined && (
                  <p>Aktive Tasks: {zone.activeTasks}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {zones.length === 0 && (
          <div className="text-center py-8">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <p className="text-gray-600">
              Keine Zonen gefunden. Erstellen Sie Zonen über die API.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
