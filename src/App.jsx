import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Users, BarChart3, ChevronDown, Info, AlertCircle, RefreshCw, Layers } from 'lucide-react'

import Header            from './components/Header'
import EmployeeCard      from './components/EmployeeCard'
import ProbationBadge    from './components/ProbationBadge'
import MonthlyScore      from './components/MonthlyScore'
import WeeklyRemarks     from './components/WeeklyRemarks'
import ReportDownload    from './components/ReportDownload'
import SheetLinkManager  from './components/SheetLinkManager'
import { LoadingOverlay, SkeletonCard } from './components/LoadingOverlay'

import { useGoogleSheets }  from './hooks/useGoogleSheets'
import { groupByMonth, averageScore }   from './utils/dateUtils'

// ── LocalStorage helpers ──────────────────────────────────────────────────────
const LS_EMP = 'np_employees_v2'
const LS_MGR = 'np_managers_v2'

function loadFromLS(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}
function saveToLS(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [employees,     setEmployees]   = useState(() => loadFromLS(LS_EMP, []))
  const [managers,      setManagers]    = useState(() => loadFromLS(LS_MGR, []))
  const [selectedMgrId, setSelectedMgrId] = useState('')
  const [selectedEmpId, setSelectedEmpId] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedWeeks, setSelectedWeeks] = useState([])
  const [showAdmin,     setShowAdmin]    = useState(false)
  const [refreshKey,    setRefreshKey]   = useState(0)

  const { sheetData, loadingIds, errorIds, loadEmployee, loadAll } = useGoogleSheets()

  // ── Derived lists ──────────────────────────────────────────────────────────
  const filteredByMgr = useMemo(() =>
    selectedMgrId ? employees.filter(e => e.managerId === selectedMgrId) : employees,
    [employees, selectedMgrId])

  const selectedEmployee = useMemo(() =>
    employees.find(e => e.id === selectedEmpId) ?? null, [employees, selectedEmpId])

  const selectedManager = useMemo(() =>
    managers.find(m => m.id === selectedEmployee?.managerId) ?? null, [managers, selectedEmployee])

  const empWeeklyData = useMemo(() =>
    (selectedEmpId ? sheetData[selectedEmpId] : null) ?? [], [sheetData, selectedEmpId])

  // ── Auto-select first employee when filter changes ─────────────────────────
  useEffect(() => {
    if (filteredByMgr.length > 0 && !filteredByMgr.find(e => e.id === selectedEmpId)) {
      setSelectedEmpId(filteredByMgr[0].id)
    } else if (filteredByMgr.length === 0) {
      setSelectedEmpId('')
    }
  }, [filteredByMgr])

  // ── Load sheet data whenever selected employee changes ─────────────────────
  useEffect(() => {
    if (selectedEmployee) loadEmployee(selectedEmployee)
  }, [selectedEmployee, refreshKey])

  // ── Auto-refresh: re-fetch when user returns to this tab ──────────────────
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === 'visible' && selectedEmployee) {
        loadEmployee(selectedEmployee, true)
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [selectedEmployee, loadEmployee])

  // ── Auto-refresh: poll every 2 min for the current employee ───────────────
  useEffect(() => {
    if (!selectedEmployee) return
    const timer = setInterval(() => {
      loadEmployee(selectedEmployee, true)
    }, 2 * 60 * 1000)
    return () => clearInterval(timer)
  }, [selectedEmployee, loadEmployee])

  // ── Auto-select latest month with data ────────────────────────────────────
  useEffect(() => {
    if (!empWeeklyData.length) return
    const months = Object.keys(groupByMonth(empWeeklyData)).sort()
    if (months.length && !months.includes(selectedMonth)) {
      setSelectedMonth(months[months.length - 1])
    }
  }, [empWeeklyData])

  // ── Auto-select all weeks on employee change ───────────────────────────────
  useEffect(() => {
    if (empWeeklyData.length) {
      setSelectedWeeks(empWeeklyData.map(w => w.weekRange))
    }
  }, [selectedEmpId, empWeeklyData.length])

  // ── Persist changes ───────────────────────────────────────────────────────
  useEffect(() => { saveToLS(LS_EMP, employees) }, [employees])
  useEffect(() => { saveToLS(LS_MGR, managers)  }, [managers])

  // ── Initial load — all employees ──────────────────────────────────────────
  useEffect(() => {
    loadAll(employees)
  }, [refreshKey])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSaveEmployees = useCallback(emps => {
    setEmployees(emps)
    setRefreshKey(k => k + 1)
  }, [])

  const handleSaveManagers = useCallback(mgrs => {
    setManagers(mgrs)
  }, [])

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  const employeeCount = employees.length

  return (
    <div className="min-h-screen bg-np-bg font-sans">
      <Header
        onAdminClick={() => setShowAdmin(true)}
        onRefresh={handleRefresh}
        isRefreshing={loadingIds.size > 0}
      />

      <div className="pt-16">
        {/* ── Filter bar ── */}
        <div className="bg-white border-b border-np-border px-6 py-3 flex items-center gap-4 flex-wrap shadow-sm">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-np-muted uppercase tracking-wide whitespace-nowrap">Manager</label>
            <div className="relative">
              <select
                className="select text-sm pr-8 min-w-[180px]"
                value={selectedMgrId}
                onChange={e => { setSelectedMgrId(e.target.value); setSelectedEmpId('') }}
              >
                <option value="">All Managers</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-np-muted pointer-events-none" />
            </div>
          </div>

          <div className="h-5 w-px bg-np-border" />

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-np-muted uppercase tracking-wide whitespace-nowrap">Employee</label>
            <div className="relative">
              <select
                className="select text-sm pr-8 min-w-[200px]"
                value={selectedEmpId}
                onChange={e => setSelectedEmpId(e.target.value)}
              >
                <option value="">— Select employee —</option>
                {filteredByMgr.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-np-muted pointer-events-none" />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Chip icon={<Users size={11}/>} label={`${employeeCount} Employees`} color="blue" />
          </div>
        </div>

        {/* ── Main layout ── */}
        <div className="flex gap-0 min-h-[calc(100vh-112px)]">
          {/* Left: employee list */}
          <aside className="w-80 shrink-0 border-r border-np-border bg-white overflow-y-auto">
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <p className="section-title">
                  Employees
                  <span className="ml-2 font-bold text-np-text">{filteredByMgr.length}</span>
                </p>
              </div>

              {filteredByMgr.length === 0 ? (
                <div className="text-center py-12 px-3">
                  <Layers size={28} className="text-np-muted mx-auto mb-2" />
                  <p className="text-sm font-semibold text-np-text mb-1">
                    {employees.length === 0 ? 'No employees yet' : 'No employees found'}
                  </p>
                  <p className="text-xs text-np-muted mb-3">
                    {employees.length === 0
                      ? 'Add managers and employees in Settings to get started.'
                      : 'Try selecting a different manager.'}
                  </p>
                  {employees.length === 0 && (
                    <button onClick={() => setShowAdmin(true)}
                      className="btn-primary text-xs mx-auto">
                      <Users size={12}/> Open Settings
                    </button>
                  )}
                </div>
              ) : (
                filteredByMgr.map(emp => (
                  <EmployeeCard
                    key={emp.id}
                    employee={emp}
                    manager={managers.find(m => m.id === emp.managerId)}
                    weeklyData={sheetData[emp.id]}
                    isSelected={emp.id === selectedEmpId}
                    isLoading={loadingIds.has(emp.id)}
                    onClick={() => setSelectedEmpId(emp.id)}
                  />
                ))
              )}
            </div>
          </aside>

          {/* Right: employee detail */}
          <main className="flex-1 overflow-y-auto p-6">
            {!selectedEmployee ? (
              <EmptyState onAdmin={() => setShowAdmin(true)} hasEmployees={employees.length > 0} />
            ) : (
              <div className="max-w-5xl mx-auto space-y-5 animate-fade-in-up" key={selectedEmpId}>
                {/* ── Employee header ── */}
                <div className="card">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <h2 className="text-xl font-extrabold text-np-text">{selectedEmployee.name}</h2>
                      <p className="text-sm text-np-muted mt-0.5">
                        Manager: <span className="font-semibold text-np-text">{selectedManager?.name || '—'}</span>
                        {selectedManager?.role && ` · ${selectedManager.role}`}
                      </p>
                      {errorIds[selectedEmpId] && (
                        <div className="mt-2 flex items-start gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 max-w-lg">
                          <AlertCircle size={12} className="shrink-0 mt-0.5"/>
                          <span>{errorIds[selectedEmpId]}</span>
                        </div>
                      )}
                      {!selectedEmployee.sheetUrl && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
                          <Info size={12}/>
                          No Google Sheet linked — showing sample data.{' '}
                          <button onClick={() => setShowAdmin(true)} className="underline">Add sheet URL</button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => loadEmployee(selectedEmployee, true)}
                      className="btn-secondary text-xs"
                      disabled={loadingIds.has(selectedEmpId)}
                    >
                      <RefreshCw size={12} className={loadingIds.has(selectedEmpId) ? 'animate-spin' : ''}/>
                      Refresh
                    </button>
                  </div>
                </div>

                {/* ── Probation + Monthly score row ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="card">
                    <p className="section-title mb-3">Probation Status</p>
                    <ProbationBadge employee={selectedEmployee} />

                    {empWeeklyData.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-np-border">
                        <p className="section-title mb-2">Overall Summary</p>
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <SummaryStat label="Total Weeks" value={empWeeklyData.length} />
                          <SummaryStat
                            label="Avg Score"
                            value={averageScore(empWeeklyData) !== null
                              ? `${Math.round(averageScore(empWeeklyData))}%`
                              : '—'}
                            color="#1579be"
                          />
                          <SummaryStat
                            label="Best Score"
                            value={(() => {
                              const scores = empWeeklyData.filter(w => w.managerScore !== null).map(w => w.managerScore)
                              return scores.length ? `${Math.round(Math.max(...scores))}%` : '—'
                            })()}
                            color="#16A34A"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="section-title mb-3">Monthly Performance</p>
                    {loadingIds.has(selectedEmpId) ? (
                      <SkeletonCard />
                    ) : (
                      <MonthlyScore
                        weeklyData={empWeeklyData}
                        selectedMonth={selectedMonth}
                        onMonthChange={setSelectedMonth}
                      />
                    )}
                  </div>
                </div>

                {/* ── Weekly Remarks ── */}
                <div>
                  <p className="section-title mb-3">Weekly Performance Remarks</p>
                  {loadingIds.has(selectedEmpId) ? (
                    <div className="space-y-3">
                      <SkeletonCard/><SkeletonCard/>
                    </div>
                  ) : (
                    <WeeklyRemarks
                      weeklyData={empWeeklyData}
                      selectedWeeks={selectedWeeks}
                      onWeeksChange={setSelectedWeeks}
                    />
                  )}
                </div>

                {/* ── Report Download ── */}
                <div>
                  <p className="section-title mb-3">Export Report</p>
                  <ReportDownload
                    employee={selectedEmployee}
                    manager={selectedManager}
                    weeklyData={empWeeklyData}
                    selectedWeeks={selectedWeeks}
                    selectedMonth={selectedMonth}
                    allEmployees={employees}
                    managers={managers}
                    allSheetData={sheetData}
                  />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {showAdmin && (
        <SheetLinkManager
          employees={employees}
          managers={managers}
          onSaveEmployees={handleSaveEmployees}
          onSaveManagers={handleSaveManagers}
          onClose={() => setShowAdmin(false)}
        />
      )}
    </div>
  )
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function Chip({ icon, label, color }) {
  const colors = {
    blue:  'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    green: 'bg-green-50 text-green-700 border-green-200',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${colors[color]}`}>
      {icon} {label}
    </span>
  )
}

function SummaryStat({ label, value, color }) {
  return (
    <div className="bg-np-bg rounded-lg px-2 py-2.5">
      <p className="text-lg font-extrabold" style={{ color: color || '#1E293B' }}>{value}</p>
      <p className="text-[10px] text-np-muted font-medium">{label}</p>
    </div>
  )
}

function EmptyState({ onAdmin, hasEmployees }) {
  if (!hasEmployees) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center animate-fade-in px-6">
        <div className="w-20 h-20 rounded-2xl bg-np-blue-light border border-np-blue/20 flex items-center justify-center mb-5">
          <BarChart3 size={36} className="text-np-blue" />
        </div>
        <h3 className="text-xl font-bold text-np-text mb-2">Welcome to NP Probation Dashboard</h3>
        <p className="text-sm text-np-muted max-w-sm mb-6">
          No data yet. Set up your team in Settings to get started.
        </p>

        {/* Setup steps */}
        <div className="text-left max-w-sm w-full space-y-3 mb-6">
          <Step n="1" title="Add Managers" desc="Add each reporting manager with their name and role." />
          <Step n="2" title="Add Employees" desc="Add each probation employee and assign them to a manager." />
          <Step n="3" title="Link Google Sheets" desc="Paste each employee's 30-60-90 tracker sheet URL." />
        </div>

        <button onClick={onAdmin} className="btn-primary text-sm">
          <Users size={14}/> Open Settings to Get Started
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-np-blue-light border border-np-blue/20 flex items-center justify-center mb-5">
        <BarChart3 size={36} className="text-np-blue" />
      </div>
      <h3 className="text-xl font-bold text-np-text mb-2">Select an Employee</h3>
      <p className="text-sm text-np-muted max-w-xs">
        Choose a manager and employee from the list on the left to view their performance snapshot.
      </p>
    </div>
  )
}

function Step({ n, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-np-blue text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
        {n}
      </div>
      <div>
        <p className="text-sm font-semibold text-np-text">{title}</p>
        <p className="text-xs text-np-muted">{desc}</p>
      </div>
    </div>
  )
}
