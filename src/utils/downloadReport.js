import * as XLSX from 'xlsx'
import { formatDate, getProbationEndDate } from './dateUtils'

function buildRows(employee, manager, weeklyData, probationStatus) {
  const endDate = formatDate(getProbationEndDate(employee.joiningDate))
  const statusLabel = employee.probationStatus === 'confirmed'
    ? `Confirmed — Probation ended on: ${formatDate(employee.confirmationDate)}`
    : `Active — Probation ends on: ${endDate}`

  return weeklyData.map(w => ({
    'Employee Name':          employee.name,
    'Manager Name':           manager?.name ?? '—',
    'Joining Date':           formatDate(employee.joiningDate),
    'Probation Status':       statusLabel,
    'Week Date Range':        w.weekRange,
    'One Thing':              w.oneThing        || '',
    'Additional Goal':        w.additionalGoal  || '',
    'Learnings of the Week':  w.learnings       || '',
    'Self Comments':          w.selfComments     || '',
    'Manager Score':          w.managerScore !== null ? w.managerScore : '',
    'Manager Comment':        w.managerComment   || '',
  }))
}

function downloadFile(data, filename, format) {
  const ws   = XLSX.utils.json_to_sheet(data)
  const wb   = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Report')

  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map(k =>
    ({ wch: Math.max(k.length, 20) })
  )
  ws['!cols'] = colWidths

  if (format === 'xlsx') {
    XLSX.writeFile(wb, filename + '.xlsx')
  } else {
    XLSX.writeFile(wb, filename + '.csv', { bookType: 'csv' })
  }
}

export function downloadEmployeeReport({ employee, manager, weeklyData, format = 'xlsx' }) {
  if (!weeklyData?.length) return
  const rows = buildRows(employee, manager, weeklyData, employee.probationStatus)
  downloadFile(rows, `${employee.name.replace(/\s+/g, '_')}_Probation_Report`, format)
}

export function downloadWeekReport({ employee, manager, weeklyData, selectedWeeks, format = 'xlsx' }) {
  const filtered = weeklyData.filter(w => selectedWeeks.includes(w.weekRange))
  if (!filtered.length) return
  const rows = buildRows(employee, manager, filtered, employee.probationStatus)
  downloadFile(rows, `${employee.name.replace(/\s+/g, '_')}_Week_Report`, format)
}

export function downloadMonthReport({ employee, manager, weeklyData, monthKey, format = 'xlsx' }) {
  // Filter weeks belonging to selected month
  const filtered = weeklyData.filter(w => {
    const d = w.startDate ? w.startDate.slice(0, 7) : null
    return d === monthKey
  })
  const rows = buildRows(employee, manager, filtered.length ? filtered : weeklyData, employee.probationStatus)
  const label = monthKey?.replace('-', '_') || 'All'
  downloadFile(rows, `${employee.name.replace(/\s+/g, '_')}_${label}_Report`, format)
}

export function downloadAllEmployeesReport({ employees, managers, allSheetData, format = 'xlsx' }) {
  const rows = []
  employees.forEach(emp => {
    const mgr   = managers.find(m => m.id === emp.managerId)
    const weeks = allSheetData[emp.id] || []
    rows.push(...buildRows(emp, mgr, weeks, emp.probationStatus))
  })
  if (!rows.length) return
  downloadFile(rows, 'NowPurchase_Probation_Report_All', format)
}
