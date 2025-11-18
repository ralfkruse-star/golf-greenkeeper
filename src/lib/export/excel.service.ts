/**
 * Excel Export Service
 */

import * as XLSX from 'xlsx'

export class ExcelExportService {
  /**
   * Export Task Report to Excel
   */
  static exportTaskReport(data: any): void {
    const wb = XLSX.utils.book_new()

    // Summary sheet
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Tasks', data.totalTasks],
      ['Completed', data.completedTasks],
      ['In Progress', data.inProgressTasks],
      ['Overdue', data.overdueTask],
      ['Completion Rate', `${Math.round(data.completionRate)}%`],
      ['Avg Completion Time (h)', data.averageCompletionTime],
    ]
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')

    // Priority breakdown
    if (data.tasksByPriority) {
      const priorityData = [
        ['Priority', 'Count'],
        ...Object.entries(data.tasksByPriority).map(([k, v]) => [k, v]),
      ]
      const wsPriority = XLSX.utils.aoa_to_sheet(priorityData)
      XLSX.utils.book_append_sheet(wb, wsPriority, 'By Priority')
    }

    // Zone breakdown
    if (data.tasksByZone && data.tasksByZone.length > 0) {
      const zoneData = [
        ['Zone', 'Tasks'],
        ...data.tasksByZone.map((item: any) => [item.zoneName, item.count]),
      ]
      const wsZone = XLSX.utils.aoa_to_sheet(zoneData)
      XLSX.utils.book_append_sheet(wb, wsZone, 'By Zone')
    }

    XLSX.writeFile(wb, 'task-report.xlsx')
  }

  /**
   * Export Equipment Report to Excel
   */
  static exportEquipmentReport(data: any): void {
    const wb = XLSX.utils.book_new()

    const summaryData = [
      ['Metric', 'Value'],
      ['Total Equipment', data.totalEquipment],
      ['Active Equipment', data.activeEquipment],
      ['Total Operating Hours', Math.round(data.totalOperatingHours)],
      ['Avg Hours/Equipment', Math.round(data.averageHoursPerEquipment)],
      ['Maintenance Due', data.maintenanceDue],
    ]
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')

    if (data.usageByType) {
      const typeData = [
        ['Type', 'Count', 'Total Hours', 'Avg Hours'],
        ...Object.entries(data.usageByType).map(([type, info]: [string, any]) => [
          type,
          info.count,
          Math.round(info.totalHours),
          Math.round(info.totalHours / info.count),
        ]),
      ]
      const wsType = XLSX.utils.aoa_to_sheet(typeData)
      XLSX.utils.book_append_sheet(wb, wsType, 'By Type')
    }

    XLSX.writeFile(wb, 'equipment-report.xlsx')
  }

  /**
   * Export Material Report to Excel
   */
  static exportMaterialReport(data: any): void {
    const wb = XLSX.utils.book_new()

    const summaryData = [
      ['Metric', 'Value'],
      ['Total Materials', data.totalMaterials],
      ['Low Stock Items', data.lowStockItems],
      ['Total Applications', data.totalApplications],
    ]
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')

    if (data.topConsumers && data.topConsumers.length > 0) {
      const consumerData = [
        ['Material', 'Quantity', 'Unit'],
        ...data.topConsumers.map((item: any) => [
          item.materialName,
          item.quantity,
          item.unit,
        ]),
      ]
      const wsConsumers = XLSX.utils.aoa_to_sheet(consumerData)
      XLSX.utils.book_append_sheet(wb, wsConsumers, 'Top Consumers')
    }

    if (data.consumptionByType) {
      const typeData = [
        ['Type', 'Quantity', 'Cost (€)'],
        ...Object.entries(data.consumptionByType).map(([type, info]: [string, any]) => [
          type,
          Math.round(info.quantity * 10) / 10,
          Math.round(info.cost * 100) / 100,
        ]),
      ]
      const wsType = XLSX.utils.aoa_to_sheet(typeData)
      XLSX.utils.book_append_sheet(wb, wsType, 'By Type')
    }

    XLSX.writeFile(wb, 'material-report.xlsx')
  }
}
