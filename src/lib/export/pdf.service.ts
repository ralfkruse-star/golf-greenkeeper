/**
 * PDF Export Service
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export class PDFExportService {
  /**
   * Export Task Report to PDF
   */
  static exportTaskReport(data: any): void {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text('Task Summary Report', 14, 20)

    doc.setFontSize(11)
    doc.text(`Generated: ${new Date().toLocaleDateString('de-DE')}`, 14, 28)

    // Summary stats
    const stats = [
      ['Total Tasks', data.totalTasks],
      ['Completed', data.completedTasks],
      ['In Progress', data.inProgressTasks],
      ['Overdue', data.overdueTask],
      ['Completion Rate', `${Math.round(data.completionRate)}%`],
      ['Avg Completion Time', `${data.averageCompletionTime}h`],
    ]

    autoTable(doc, {
      startY: 35,
      head: [['Metric', 'Value']],
      body: stats,
    })

    // Tasks by Priority
    if (data.tasksByPriority) {
      const priorityData = Object.entries(data.tasksByPriority).map(([k, v]) => [k, v])
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Priority', 'Count']],
        body: priorityData,
      })
    }

    doc.save('task-report.pdf')
  }

  /**
   * Export Equipment Report to PDF
   */
  static exportEquipmentReport(data: any): void {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text('Equipment Usage Report', 14, 20)

    doc.setFontSize(11)
    doc.text(`Generated: ${new Date().toLocaleDateString('de-DE')}`, 14, 28)

    const stats = [
      ['Total Equipment', data.totalEquipment],
      ['Active Equipment', data.activeEquipment],
      ['Total Operating Hours', Math.round(data.totalOperatingHours)],
      ['Avg Hours/Equipment', Math.round(data.averageHoursPerEquipment)],
      ['Maintenance Due', data.maintenanceDue],
    ]

    autoTable(doc, {
      startY: 35,
      head: [['Metric', 'Value']],
      body: stats,
    })

    if (data.usageByType) {
      const typeData = Object.entries(data.usageByType).map(([type, info]: [string, any]) => [
        type,
        info.count,
        Math.round(info.totalHours),
      ])
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Type', 'Count', 'Total Hours']],
        body: typeData,
      })
    }

    doc.save('equipment-report.pdf')
  }

  /**
   * Export Material Report to PDF
   */
  static exportMaterialReport(data: any): void {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text('Material Consumption Report', 14, 20)

    doc.setFontSize(11)
    doc.text(`Generated: ${new Date().toLocaleDateString('de-DE')}`, 14, 28)

    const stats = [
      ['Total Materials', data.totalMaterials],
      ['Low Stock Items', data.lowStockItems],
      ['Total Applications', data.totalApplications],
    ]

    autoTable(doc, {
      startY: 35,
      head: [['Metric', 'Value']],
      body: stats,
    })

    if (data.topConsumers && data.topConsumers.length > 0) {
      const consumerData = data.topConsumers.map((item: any) => [
        item.materialName,
        `${item.quantity} ${item.unit}`,
      ])
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Material', 'Consumption']],
        body: consumerData,
      })
    }

    doc.save('material-report.pdf')
  }
}
