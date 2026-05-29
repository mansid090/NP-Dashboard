import React, { useState, useMemo } from 'react'
import { CheckCircle, ChevronDown, X, Calendar, Clock, TrendingUp, User, BarChart3, ChevronRight } from 'lucide-react'
import { getProbationEndDate, formatDate, averageScore } from '../utils/dateUtils'
import MonthlyScore from './MonthlyScore'
import WeeklyRemarks from './WeeklyRemarks'
import { SkeletonCard } from './LoadingOverlay'

function InitialAvatar({ name, size = 44 }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const colors = [
    ['#EFF6FF','#1579be'],['#FFF7ED','#EA580C'],['#F0FDF4','#16A34A'],
    ['#FAF5FF','#7C3AED'],['#FFF1F2','#BE123C'],['#ECFEFF','#0891B2'],
  ]
  const [bg, fg] = colors[name.charCodeAt(0) % colors.length]
  return (
    <div style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.36, borderRadius: size * 0.28 }}
         className="flex items-center justify-center font-extrabold border border-current/10 shrink-0">
      {initials}
    </div>
  )
}

function ScoreBar({ score }) {
  if (score === null) return <span className="text-np-muted text-xs">No data</span>
  const color = score >= 90 ? '#16A34A' : score >= 70 ? '#1579be' : score >= 50 ? '#D97706' : '#DC2626'
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-extrabold" style={{ color }}>{Math.round(score)}%</span>
      <div className="flex-1 h-1.5 bg-np-border rounded-full overflow-hidden min-w-[60px]">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  )
}

// ── Summary card shown in the grid ───────────────────────────────────────────
function EndedCard({ employee, manager, weeklyData, isLoading, onView }) {
  const probDays = employee.probationDays || 90
  const endDate  = employee.joiningDate ? getProbationEndDate(employee.joiningDate, probDays) : null
  const avg      = averageScore(weeklyData || [])
  const weeks    = weeklyData?.length ?? 0

  return (
    <div className="card flex flex-col gap-4 hover:shadow-card-hover transition-all duration-200 animate-fade-in-up">
      {/* Top: avatar + name + badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <InitialAvatar name={employee.name} />
          <div className="min-w-0">
            <p className="text-sm font-bold text-np-text truncate">{employee.name}</p>
            <p className="text-xs text-np-muted truncate">{manager?.name || '—'} · {manager?.role || ''}</p>
          </div>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
          <CheckCircle size={9}/> Ended
        </span>
      </div>

      {/* Timeline */}
      <div className="flex items-center gap-2 bg-np-bg rounded-lg px-3 py-2">
        <div className="text-center min-w-0">
          <p className="text-[10px] text-np-muted font-semibold uppercase tracking-wide">Joined</p>
          <p className="text-xs font-bold text-np-text">
            {employee.joiningDate ? formatDate(employee.joiningDate) : '—'}
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center gap-1">
          <div className="h-px flex-1 bg-np-border" />
          <span className="text-[10px] text-np-muted font-semibold bg-white border border-np-border px-1.5 py-0.5 rounded-full whitespace-nowrap">
            {probDays}d
          </span>
          <div className="h-px flex-1 bg-np-border" />
        </div>
        <div className="text-center min-w-0">
          <p className="text-[10px] text-np-muted font-semibold uppercase tracking-wide">Ended</p>
          <p className="text-xs font-bold text-np-text">
            {endDate ? formatDate(endDate) : '—'}
          </p>
        </div>
      </div>

      {/* Score + weeks */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-np-muted font-semibold uppercase tracking-wide mb-1">Avg Score</p>
          {isLoading ? <div className="h-4 bg-np-border rounded animate-pulse w-16" /> : <ScoreBar score={avg} />}
        </div>
        <div>
          <p className="text-[10px] text-np-muted font-semibold uppercase tracking-wide mb-1">Weeks Tracked</p>
          <p className="text-sm font-extrabold text-np-text">{isLoading ? '—' : weeks}</p>
        </div>
      </div>

      {/* View button */}
      <button
        onClick={onView}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-np-border
                   text-xs font-semibold text-np-text hover:bg-np-blue-light hover:border-np-blue hover:text-np-blue
                   transition-all duration-150"
      >
        View Full Report <ChevronRight size={12}/>
      </button>
    </div>
  )
}

// ── Slide-in detail panel ────────────────────────────────────────────────────
function DetailDrawer({ employee, manager, weeklyData, isLoading, onClose }) {
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedWeeks, setSelectedWeeks] = useState(
    weeklyData ? weeklyData.map(w => w.weekRange) : []
  )
  const probDays = employee.probationDays || 90
  const endDate  = employee.joiningDate ? getProbationEndDate(employee.joiningDate, probDays) : null
  const avg      = averageScore(weeklyData || [])

  // Auto-select all weeks when data loads
  React.useEffect(() => {
    if (weeklyData?.length) setSelectedWeeks(weeklyData.map(w => w.weekRange))
  }, [weeklyData])

  return (
    <div className="fixed inset-0 z-40 flex justify-end animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-white shadow-2xl overflow-y-auto animate-slide-up flex flex-col"
           style={{ maxHeight: '100vh' }}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-np-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <InitialAvatar name={employee.name} size={38} />
            <div>
              <p className="text-base font-bold text-np-text">{employee.name}</p>
              <p className="text-xs text-np-muted">
                {manager?.name || '—'}{manager?.role ? ` · ${manager.role}` : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-np-bg text-np-muted hover:text-np-text transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Summary strip */}
          <div className="grid grid-cols-4 gap-3">
            <StatBox label="Joined"    value={employee.joiningDate ? formatDate(employee.joiningDate) : '—'} small />
            <StatBox label="Ended"     value={endDate ? formatDate(endDate) : '—'} small />
            <StatBox label="Duration"  value={`${probDays} days`} />
            <StatBox label="Avg Score" value={avg !== null ? `${Math.round(avg)}%` : '—'}
              color={avg === null ? undefined : avg >= 90 ? '#16A34A' : avg >= 70 ? '#1579be' : avg >= 50 ? '#D97706' : '#DC2626'} />
          </div>

          {/* Monthly gauge */}
          {isLoading ? <SkeletonCard /> : (
            <MonthlyScore weeklyData={weeklyData || []} selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
          )}

          {/* Weekly remarks */}
          <div>
            <p className="section-title mb-3">Weekly Remarks</p>
            {isLoading ? (
              <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>
            ) : (
              <WeeklyRemarks weeklyData={weeklyData || []} selectedWeeks={selectedWeeks} onWeeksChange={setSelectedWeeks} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value, color, small }) {
  return (
    <div className="bg-np-bg rounded-lg px-3 py-2.5 text-center">
      <p className="text-[10px] text-np-muted font-semibold uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`font-extrabold ${small ? 'text-xs' : 'text-sm'}`} style={{ color: color || '#1E293B' }}>{value}</p>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function ProbationEndedPage({ employees, managers, sheetData, loadingIds }) {
  const [selectedMgrId, setSelectedMgrId] = useState('')
  const [drawerEmpId,   setDrawerEmpId]   = useState(null)

  const filteredByMgr = useMemo(() =>
    selectedMgrId ? employees.filter(e => e.managerId === selectedMgrId) : employees,
    [employees, selectedMgrId])

  const drawerEmployee = employees.find(e => e.id === drawerEmpId)
  const drawerManager  = drawerEmployee ? managers.find(m => m.id === drawerEmployee.managerId) : null

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
        <div className="w-20 h-20 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mb-4">
          <CheckCircle size={34} className="text-green-500" />
        </div>
        <h3 className="text-lg font-bold text-np-text mb-2">No ended probations yet</h3>
        <p className="text-sm text-np-muted max-w-xs">
          Set <strong>Probation Ended = Yes</strong> in Column G of the Master Config Sheet to move employees here.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-np-muted uppercase tracking-wide">Manager</label>
          <div className="relative">
            <select className="select text-sm pr-8 min-w-[160px]" value={selectedMgrId}
              onChange={e => setSelectedMgrId(e.target.value)}>
              <option value="">All Managers</option>
              {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-np-muted pointer-events-none" />
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-green-50 text-green-700 border-green-200">
          <CheckCircle size={11}/> {filteredByMgr.length} records
        </span>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredByMgr.map(emp => (
          <EndedCard
            key={emp.id}
            employee={emp}
            manager={managers.find(m => m.id === emp.managerId)}
            weeklyData={sheetData[emp.id]}
            isLoading={loadingIds.has(emp.id)}
            onView={() => setDrawerEmpId(emp.id)}
          />
        ))}
      </div>

      {/* Slide-in drawer */}
      {drawerEmpId && drawerEmployee && (
        <DetailDrawer
          employee={drawerEmployee}
          manager={drawerManager}
          weeklyData={sheetData[drawerEmpId]}
          isLoading={loadingIds.has(drawerEmpId)}
          onClose={() => setDrawerEmpId(null)}
        />
      )}
    </div>
  )
}
