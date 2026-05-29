import React, { useState } from 'react'
import { Download, FileText, Table2, ChevronDown } from 'lucide-react'
import {
  downloadEmployeeReport, downloadWeekReport,
  downloadMonthReport, downloadAllEmployeesReport,
} from '../utils/downloadReport'
import { monthLabel } from '../utils/dateUtils'

export default function ReportDownload({
  employee, manager, weeklyData, selectedWeeks, selectedMonth, allEmployees, managers, allSheetData,
}) {
  const [format,   setFormat]   = useState('xlsx')
  const [scope,    setScope]    = useState('employee')
  const [busy,     setBusy]     = useState(false)

  async function handleDownload() {
    setBusy(true)
    try {
      if (scope === 'employee') {
        downloadEmployeeReport({ employee, manager, weeklyData, format })
      } else if (scope === 'week') {
        downloadWeekReport({ employee, manager, weeklyData, selectedWeeks, format })
      } else if (scope === 'month') {
        downloadMonthReport({ employee, manager, weeklyData, monthKey: selectedMonth, format })
      } else if (scope === 'all') {
        downloadAllEmployeesReport({ employees: allEmployees, managers, allSheetData, format })
      }
    } finally {
      setTimeout(() => setBusy(false), 600)
    }
  }

  const canDownload = employee || scope === 'all'

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Download size={14} className="text-np-blue" />
        <span className="text-sm font-semibold text-np-text">Download Report</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Scope */}
        <div>
          <label className="label">Report Type</label>
          <select className="select text-sm" value={scope} onChange={e => setScope(e.target.value)}>
            <option value="employee">Full Employee Report</option>
            <option value="week">Selected Weeks</option>
            <option value="month">Selected Month</option>
            <option value="all">All Employees</option>
          </select>
        </div>

        {/* Format */}
        <div>
          <label className="label">Format</label>
          <select className="select text-sm" value={format} onChange={e => setFormat(e.target.value)}>
            <option value="xlsx">Excel (.xlsx)</option>
            <option value="csv">CSV (.csv)</option>
          </select>
        </div>
      </div>

      {/* Scope description */}
      <div className="mb-4 px-3 py-2 rounded-lg bg-np-blue-light border border-np-blue/20 text-xs text-np-blue">
        {scope === 'employee' && employee && <>All {weeklyData?.length || 0} weeks for <strong>{employee.name}</strong></>}
        {scope === 'week'     && <>{selectedWeeks.length} week(s) selected for <strong>{employee?.name}</strong></>}
        {scope === 'month'    && <>{monthLabel(selectedMonth)} data for <strong>{employee?.name}</strong></>}
        {scope === 'all'      && <>All {allEmployees?.length || 0} employees — complete history</>}
        {scope !== 'all' && !employee && ' — select an employee first'}
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={!canDownload || busy}
        className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy ? (
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
            <path d="M12 2 A10 10 0 0 1 22 12" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        ) : format === 'xlsx' ? (
          <Table2 size={15} />
        ) : (
          <FileText size={15} />
        )}
        {busy ? 'Generating…' : `Download ${format.toUpperCase()}`}
      </button>

      {/* Quick links */}
      {employee && weeklyData?.length > 0 && (
        <div className="mt-3 flex gap-2 flex-wrap">
          <button
            onClick={() => { setScope('employee'); setFormat('csv') }}
            className="text-[11px] text-np-muted hover:text-np-blue transition-colors"
          >
            CSV ↗
          </button>
          <span className="text-np-border text-[11px]">·</span>
          <button
            onClick={() => { setScope('employee'); setFormat('xlsx') }}
            className="text-[11px] text-np-muted hover:text-np-blue transition-colors"
          >
            Excel ↗
          </button>
          <span className="text-np-border text-[11px]">·</span>
          <button
            onClick={() => { setScope('all'); handleDownload() }}
            className="text-[11px] text-np-muted hover:text-np-blue transition-colors"
          >
            All employees ↗
          </button>
        </div>
      )}
    </div>
  )
}
