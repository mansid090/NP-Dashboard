import React, { useState, useMemo } from 'react'
import { CheckCircle, ChevronDown, Users, Calendar, Clock, BarChart3 } from 'lucide-react'
import { getProbationEndDate, formatDate, averageScore } from '../utils/dateUtils'
import { InlineSpinner } from './LoadingOverlay'

function InitialAvatar({ name, size = 40 }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const colors = [
    ['#EFF6FF','#1579be'],['#FFF7ED','#EA580C'],['#F0FDF4','#16A34A'],
    ['#FAF5FF','#7C3AED'],['#FFF1F2','#BE123C'],['#ECFEFF','#0891B2'],
  ]
  const [bg, fg] = colors[name.charCodeAt(0) % colors.length]
  return (
    <div style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.38, borderRadius: size * 0.28 }}
         className="flex items-center justify-center font-extrabold border border-current/10 shrink-0">
      {initials}
    </div>
  )
}

function EmployeeRow({ employee, manager, weeklyData, isSelected, isLoading, onClick }) {
  const endDate  = employee.joiningDate ? getProbationEndDate(employee.joiningDate, employee.probationDays || 90) : null
  const avgScore = averageScore(weeklyData || [])

  return (
    <div
      onClick={onClick}
      className={`card-hover relative cursor-pointer transition-all duration-200 animate-fade-in-up
        ${isSelected ? 'border-np-blue ring-2 ring-np-blue/20 shadow-card-hover' : ''}`}
    >
      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-np-blue" />}

      <div className="flex items-center gap-4">
        <InitialAvatar name={employee.name} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-np-text">{employee.name}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 border border-green-200">
              <CheckCircle size={10} /> Probation Ended
            </span>
          </div>
          <p className="text-xs text-np-muted mt-0.5">
            {manager?.name || '—'} · {manager?.role || ''}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-6 shrink-0 text-right">
          {employee.joiningDate && (
            <div>
              <p className="text-[10px] text-np-muted font-semibold uppercase tracking-wide">Joined</p>
              <p className="text-xs font-semibold text-np-text">{formatDate(employee.joiningDate)}</p>
            </div>
          )}
          {endDate && (
            <div>
              <p className="text-[10px] text-np-muted font-semibold uppercase tracking-wide">Ended</p>
              <p className="text-xs font-semibold text-np-text">{formatDate(endDate)}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] text-np-muted font-semibold uppercase tracking-wide">Duration</p>
            <p className="text-xs font-semibold text-np-text">{employee.probationDays || 90} days</p>
          </div>
          <div>
            <p className="text-[10px] text-np-muted font-semibold uppercase tracking-wide">Avg Score</p>
            {isLoading ? <InlineSpinner size={12} /> : (
              <p className="text-xs font-bold" style={{
                color: avgScore === null ? '#94A3B8'
                  : avgScore >= 90 ? '#16A34A'
                  : avgScore >= 70 ? '#1579be'
                  : avgScore >= 50 ? '#D97706' : '#DC2626'
              }}>
                {avgScore !== null ? `${Math.round(avgScore)}%` : '—'}
              </p>
            )}
          </div>
        </div>

        <ChevronDown size={14} className={`text-np-muted shrink-0 transition-transform ${isSelected ? '-rotate-90 text-np-blue' : '-rotate-90'}`} />
      </div>
    </div>
  )
}

export default function ProbationEndedPage({
  employees, managers, sheetData, loadingIds,
  selectedEmpId, onSelectEmployee,
  selectedMgrId, onSelectManager,
}) {
  const filteredByMgr = useMemo(() =>
    selectedMgrId ? employees.filter(e => e.managerId === selectedMgrId) : employees,
    [employees, selectedMgrId])

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in px-6">
        <div className="w-20 h-20 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mb-5">
          <CheckCircle size={36} className="text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-np-text mb-2">No ended probations yet</h3>
        <p className="text-sm text-np-muted max-w-xs">
          Employees will appear here once you mark <strong>Probation Ended = Yes</strong> in Column G of the Master Config Sheet.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Summary chips */}
        <div className="flex items-center gap-3 flex-wrap mb-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-np-muted uppercase tracking-wide">Manager</label>
            <div className="relative">
              <select
                className="select text-sm pr-8 min-w-[160px]"
                value={selectedMgrId}
                onChange={e => onSelectManager(e.target.value)}
              >
                <option value="">All Managers</option>
                {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-np-muted pointer-events-none" />
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-green-50 text-green-700 border-green-200">
            <CheckCircle size={11} /> {filteredByMgr.length} Ended
          </span>
        </div>

        {/* Employee rows */}
        <div className="space-y-2">
          {filteredByMgr.map(emp => (
            <EmployeeRow
              key={emp.id}
              employee={emp}
              manager={managers.find(m => m.id === emp.managerId)}
              weeklyData={sheetData[emp.id]}
              isSelected={emp.id === selectedEmpId}
              isLoading={loadingIds.has(emp.id)}
              onClick={() => onSelectEmployee(emp.id === selectedEmpId ? '' : emp.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
