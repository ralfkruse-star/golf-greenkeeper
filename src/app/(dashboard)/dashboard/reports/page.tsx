'use client'

import { useEffect, useState } from 'react'
import { PDFExportService } from '@/lib/export/pdf.service'
import { ExcelExportService } from '@/lib/export/excel.service'

type ReportType = 'task' | 'equipment' | 'material'

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('task')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const reportTypes = [
    {
      id: 'task' as ReportType,
      name: 'Task-Bericht',
      description: 'Überblick über Tasks, Status und Abschlussraten',
      icon: (
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'equipment' as ReportType,
      name: 'Equipment-Bericht',
      description: 'Nutzungsstatistiken und Wartungsinformationen',
      icon: (
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
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 'material' as ReportType,
      name: 'Material-Bericht',
      description: 'Verbrauchsstatistiken und Bestandsübersicht',
      icon: (
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
      ),
      color: 'bg-purple-100 text-purple-600',
    },
  ]

  const fetchReport = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(
        `/api/reports/${selectedReport}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      const data = await response.json()
      if (data.success) {
        setReportData(data.data)
      }
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch report:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [selectedReport, dateRange])

  const handleExportPDF = () => {
    if (!reportData) return

    if (selectedReport === 'task') {
      PDFExportService.exportTaskReport(reportData)
    } else if (selectedReport === 'equipment') {
      PDFExportService.exportEquipmentReport(reportData)
    } else if (selectedReport === 'material') {
      PDFExportService.exportMaterialReport(reportData)
    }
  }

  const handleExportExcel = () => {
    if (!reportData) return

    if (selectedReport === 'task') {
      ExcelExportService.exportTaskReport(reportData)
    } else if (selectedReport === 'equipment') {
      ExcelExportService.exportEquipmentReport(reportData)
    } else if (selectedReport === 'material') {
      ExcelExportService.exportMaterialReport(reportData)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Berichte & Analysen
        </h1>
        <p className="text-gray-600 mt-1">
          Exportieren Sie detaillierte Berichte als PDF oder Excel
        </p>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reportTypes.map((report) => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            className={`p-6 rounded-lg border-2 transition text-left ${
              selectedReport === report.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`rounded-lg p-3 inline-block ${report.color}`}>
              {report.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mt-3">
              {report.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{report.description}</p>
          </button>
        ))}
      </div>

      {/* Date Range Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Zeitraum auswählen
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Von
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bis
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchReport}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Bericht aktualisieren
            </button>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Lade Bericht...</p>
          </div>
        </div>
      ) : reportData ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Berichtsvorschau
            </h2>
            <div className="flex space-x-3 mt-4 md:mt-0">
              <button
                onClick={handleExportPDF}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center"
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Als PDF exportieren
              </button>
              <button
                onClick={handleExportExcel}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center"
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Als Excel exportieren
              </button>
            </div>
          </div>

          {/* Task Report Preview */}
          {selectedReport === 'task' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Gesamt Tasks</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {reportData.totalTasks}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Abgeschlossen</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {reportData.completedTasks}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">In Arbeit</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {reportData.inProgressTasks}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Überfällig</p>
                  <p className="text-2xl font-bold text-red-900 mt-1">
                    {reportData.overdueTask}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Abschlussrate</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">
                    {Math.round(reportData.completionRate)}%
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Ø Abschlusszeit</p>
                  <p className="text-2xl font-bold text-orange-900 mt-1">
                    {reportData.averageCompletionTime}h
                  </p>
                </div>
              </div>

              {reportData.tasksByPriority && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Nach Priorität
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(reportData.tasksByPriority).map(
                      ([priority, count]) => (
                        <div
                          key={priority}
                          className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                        >
                          <span className="font-medium">{priority}</span>
                          <span className="text-gray-600">{count as number}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Equipment Report Preview */}
          {selectedReport === 'equipment' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Gesamt Equipment</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {reportData.totalEquipment}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Aktiv</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {reportData.activeEquipment}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Betriebsstunden</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {Math.round(reportData.totalOperatingHours)}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Ø Stunden/Gerät</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">
                    {Math.round(reportData.averageHoursPerEquipment)}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Wartung fällig</p>
                  <p className="text-2xl font-bold text-yellow-900 mt-1">
                    {reportData.maintenanceDue}
                  </p>
                </div>
              </div>

              {reportData.usageByType && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Nutzung nach Typ
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(reportData.usageByType).map(
                      ([type, info]: [string, any]) => (
                        <div
                          key={type}
                          className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                        >
                          <span className="font-medium">{type}</span>
                          <div className="text-right">
                            <div className="text-gray-900">
                              {Math.round(info.totalHours)}h
                            </div>
                            <div className="text-sm text-gray-600">
                              {info.count} Geräte
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Material Report Preview */}
          {selectedReport === 'material' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Gesamt Materialien</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {reportData.totalMaterials}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Niedriger Bestand</p>
                  <p className="text-2xl font-bold text-yellow-900 mt-1">
                    {reportData.lowStockItems}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Anwendungen</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {reportData.totalApplications}
                  </p>
                </div>
              </div>

              {reportData.topConsumers && reportData.topConsumers.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Top Verbraucher
                  </h3>
                  <div className="space-y-2">
                    {reportData.topConsumers.map((item: any) => (
                      <div
                        key={item.materialName}
                        className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                      >
                        <span className="font-medium">{item.materialName}</span>
                        <span className="text-gray-600">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">
            Wählen Sie einen Berichtstyp und Zeitraum aus
          </p>
        </div>
      )}
    </div>
  )
}
