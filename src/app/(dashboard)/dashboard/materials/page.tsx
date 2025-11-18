'use client'

import { useEffect, useState } from 'react'

interface Material {
  id: string
  name: string
  type: string
  unit: string
  currentStock: number
  minStock?: number
  maxStock?: number
  costPerUnit: number
  isHazardous: boolean
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'FERTILIZER',
    unit: 'kg',
    currentStock: '0',
    minStock: '10',
    maxStock: '100',
    costPerUnit: '0',
    isHazardous: false,
  })

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('/api/materials', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setMaterials(data.data)
      }
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch materials:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          currentStock: parseFloat(formData.currentStock),
          minStock: parseFloat(formData.minStock),
          maxStock: parseFloat(formData.maxStock),
          costPerUnit: parseFloat(formData.costPerUnit),
        }),
      })
      const data = await response.json()
      if (data.success) {
        setMaterials([...materials, data.data])
        setShowForm(false)
        setFormData({
          name: '',
          type: 'FERTILIZER',
          unit: 'kg',
          currentStock: '0',
          minStock: '10',
          maxStock: '100',
          costPerUnit: '0',
          isHazardous: false,
        })
      }
    } catch (error) {
      console.error('Failed to create material:', error)
    }
  }

  const handleAddStock = async (id: string, quantity: number) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`/api/materials/${id}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      })
      const data = await response.json()
      if (data.success) {
        fetchMaterials()
      }
    } catch (error) {
      console.error('Failed to add stock:', error)
    }
  }

  const getStockStatus = (material: Material) => {
    if (!material.minStock) return 'OK'
    if (material.currentStock === 0) return 'OUT_OF_STOCK'
    if (material.currentStock <= material.minStock) return 'LOW'
    if (material.maxStock && material.currentStock >= material.maxStock)
      return 'FULL'
    return 'OK'
  }

  const getStockBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> =
      {
        OUT_OF_STOCK: {
          bg: 'bg-red-100',
          text: 'text-red-800',
          label: 'Ausverkauft',
        },
        LOW: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Niedrig' },
        OK: { bg: 'bg-green-100', text: 'text-green-800', label: 'OK' },
        FULL: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Voll' },
      }
    return badges[status] || badges.OK
  }

  const getTypeIcon = (type: string) => {
    const colors: Record<string, string> = {
      FERTILIZER: 'text-green-600 bg-green-100',
      PESTICIDE: 'text-red-600 bg-red-100',
      SEED: 'text-yellow-600 bg-yellow-100',
      SAND: 'text-orange-600 bg-orange-100',
      SOIL: 'text-brown-600 bg-amber-100',
      OTHER: 'text-gray-600 bg-gray-100',
    }
    return colors[type] || colors.OTHER
  }

  const filteredMaterials =
    filter === 'ALL'
      ? materials
      : filter === 'LOW'
      ? materials.filter((m) => getStockStatus(m) === 'LOW' || getStockStatus(m) === 'OUT_OF_STOCK')
      : filter === 'HAZARDOUS'
      ? materials.filter((m) => m.isHazardous)
      : materials.filter((m) => m.type === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Materialien...</p>
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
            Materialien
          </h1>
          <p className="text-gray-600 mt-1">
            Verwalten Sie Ihren Materialbestand
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="mt-4 md:mt-0 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Neues Material
        </button>
      </div>

      {/* New Material Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Neues Material erstellen
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="z.B. Premium Dünger NPK 15-15-15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Typ
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="FERTILIZER">Düngemittel</option>
                  <option value="PESTICIDE">Pflanzenschutzmittel</option>
                  <option value="SEED">Saatgut</option>
                  <option value="SAND">Sand</option>
                  <option value="SOIL">Erde</option>
                  <option value="OTHER">Sonstiges</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Einheit
                </label>
                <input
                  type="text"
                  required
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="kg, L, Stück"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aktueller Bestand
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.currentStock}
                  onChange={(e) =>
                    setFormData({ ...formData, currentStock: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mindestbestand
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.minStock}
                  onChange={(e) =>
                    setFormData({ ...formData, minStock: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximalbestand
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.maxStock}
                  onChange={(e) =>
                    setFormData({ ...formData, maxStock: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preis pro Einheit (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.costPerUnit}
                  onChange={(e) =>
                    setFormData({ ...formData, costPerUnit: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isHazardous"
                  checked={formData.isHazardous}
                  onChange={(e) =>
                    setFormData({ ...formData, isHazardous: e.target.checked })
                  }
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isHazardous"
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  Gefahrstoff
                </label>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                Erstellen
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'LOW', 'HAZARDOUS', 'FERTILIZER', 'PESTICIDE', 'SEED'].map(
          (filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg transition ${
                filter === filterType
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterType === 'ALL'
                ? 'Alle'
                : filterType === 'LOW'
                ? 'Niedriger Bestand'
                : filterType === 'HAZARDOUS'
                ? 'Gefahrstoffe'
                : filterType}
            </button>
          )
        )}
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => {
          const stockStatus = getStockStatus(material)
          const badge = getStockBadge(stockStatus)

          return (
            <div
              key={material.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`rounded-lg p-3 ${getTypeIcon(material.type)}`}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {material.name}
                    </h3>
                    <p className="text-sm text-gray-500">{material.type}</p>
                  </div>
                </div>
                {material.isHazardous && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                    ⚠️
                  </span>
                )}
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm text-gray-600">Bestand</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">
                    {material.currentStock}
                  </span>
                  <span className="ml-2 text-gray-600">{material.unit}</span>
                </div>
                {material.minStock && (
                  <div className="mt-2 bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        stockStatus === 'LOW' || stockStatus === 'OUT_OF_STOCK'
                          ? 'bg-red-500'
                          : stockStatus === 'FULL'
                          ? 'bg-blue-500'
                          : 'bg-green-500'
                      }`}
                      style={{
                        width: `${Math.min(
                          (material.currentStock /
                            (material.maxStock || material.minStock * 2)) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                )}
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  {material.minStock && <span>Min: {material.minStock}</span>}
                  {material.maxStock && <span>Max: {material.maxStock}</span>}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Preis/Einheit:</span>
                  <span className="font-semibold text-gray-900">
                    {material.costPerUnit.toFixed(2)} €
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Gesamtwert:</span>
                  <span className="font-semibold text-gray-900">
                    {(material.currentStock * material.costPerUnit).toFixed(2)}{' '}
                    €
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-2">
                <button
                  onClick={() => {
                    const qty = prompt('Menge hinzufügen:')
                    if (qty) handleAddStock(material.id, parseFloat(qty))
                  }}
                  className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition text-sm"
                >
                  + Hinzufügen
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition text-sm">
                  Details
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
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
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <p className="text-gray-600">
            {filter === 'ALL'
              ? 'Keine Materialien gefunden. Erstellen Sie Ihr erstes Material.'
              : `Keine Materialien mit Filter "${filter}" gefunden.`}
          </p>
        </div>
      )}
    </div>
  )
}
