import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Users, UserCheck, BarChart3, ChevronDown, Info, AlertCircle, RefreshCw, Layers } from 'lucide-react'

import Header            from './components/Header'
import EmployeeCard      from './components/EmployeeCard'
import ProbationBadge    from './components/ProbationBadge'
import MonthlyScore      from './components/MonthlyScore'
import WeeklyRemarks     from './components/WeeklyRemarks'
import ReportDownload    from './components/ReportDownload'
import ConfirmationModal from './components/ConfirmationModal'
import SheetLinkManager  from './components/SheetLinkManager'
import { LoadingOverlay, SkeletonCard } from './components/LoadingOverlay'

import { useGoogleSheets }  from './hooks/useGoogleSheets'
import { MOCK_MANAGERS, MOCK_EMPLOYEES } from './data/mockData'
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
  const [employees,      setEmployees]    = useState(() => loadFromLS(LS_EMP, MOCK_EMPLOYEES))
  const [managers,       setManagers]     = useState(() => loadFromLS(LS_MGR, MOCK_MANAGERS))
  const [selectedMgrId,  setSelectedMgrId] = useState('')
  const [selectedEmpId,  setSelectedEmpId] = useState('')
  const [activeTab,      setActiveTab]    = useState('active') // 'active' | 'confirmed'
  const [selectedMonth,  setSelectedMonth] = useState('')
  const [selectedWeeks,  setSelectedWeeks] = useState([])
  const [showAdmin,      setShowAdmin]     = useState(false)
  const [confirmTarget,  setConfirmTarget] = useState(null)  // employee to confirm
  const [refreshKey,     setRefreshKey]    = useState(0)

  const { sheetData, loadingIds, errorIds, loadEmployee, loadAll } = useGoogleSheets()

  // ── Derived lists ──────────────────────────────────────────────────────────
  const activeMgrIds = useMemo(() =>
    [...new Set(employees.filter(e => e.probationStatus === 'active').map(e => e.managerId))],
    [employees])

  const tabEmployees = useMemo(() =>
    employees.filter(e => e.probationStatus === (activeTab === 'active' ? 'active' : 'confirmed')),
    [employees, activeTab])

  const filteredByMgr = useMemo(() =>
    selectedMgrId ? tabEmployees.filter(e => e.managerId === selectedMgrId) : tabEmployees,
    [tabEmployees, selectedMgrId])

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

  // ── Initial load — all employees (to prefill scores in list) ──────────────
  useEffect(() => {
    loadAll(employees)
  }, [refreshKey])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleConfirmProbation = useCallback(empId => {
    setEmployees(prev => prev.map(e =>
      e.id === empId ? { ...e, probationStatus: 'confirmed', confirmationDate: new Date().toISOString().slice(0, 10) } : e
    ))
    setConfirmTarget(null)
    // Switch to confirmed tab to show the moved employee
    setActiveTab('confirmed')
  }, [])

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

  const isLoading = loadingIds.size > 0 && Array.from(loadingIds).some(id =>
    filteredByMgr.find(e => e.id === id))

  const activeCount    = employees.filter(e => e.probationStatus === 'active').length
  const confirmedCount = employees.filter(e => e.probationStatus === 'confirmed').length

  return (
    <div className="min-h-screen bg-np-bg font-sans">
      {/* Header */}
      <Header
        onAdminClick={() => setShowAdmin(true)}
        onRefresh={handleRefresh}
        isRefreshing={loadingIds.size > 0}
      />

      {/* Content — offset for fixed header */}
      <div className="pt-16">
        {/* ── Top filter bar ── */}
        <div className="bg-white border-b border-np-border px-6 py-3 flex items-center gap-4 flex-wrap shadow-sm">
          {/* Manager selector */}
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

          {/* Employee selector */}
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

          {/* Stats chips */}
          <div className="ml-auto flex items-center gap-2">
            <Chip icon={<Users size={11}/>} label={`${activeCount} Active`}    color="amber" />
            <Chip icon={<UserCheck size={11}/>} label={`${confirmedCount} Confirmed`} color="green" />
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="bg-white border-b border-np-border px-6 flex items-end gap-1">
          <button
            onClick={() => setActiveTab('active')}
            className={activeTab === 'active' ? 'tab-btn-active' : 'tab-btn-inactive'}
          >
            <span className="flex items-center gap-1.5">
              <Users size={13}/> Active Probation
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                {activeCount}
              </span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('confirmed')}
            className={activeTab === 'confirmed' ? 'tab-btn-active' : 'tab-btn-inactive'}
          >
            <span className="flex items-center gap-1.5">
              <UserCheck size={13}/> Confirmed Records
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                {confirmedCount}
              </span>
            </span>
          </button>
        </div>

        {/* ── Main layout ── */}
        <div className="flex gap-0 min-h-[calc(100vh-128px)]">
          {/* Left: employee list */}
          <aside className="w-80 shrink-0 border-r border-np-border bg-white overflow-y-auto">
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <p className="section-title">
                  {activeTab === 'active' ? 'Active Employees' : 'Confirmed Employees'}
                  <span className="ml-2 font-bold text-np-text">{filteredByMgr.length}</span>
                </p>
              </div>

              {filteredByMgr.length === 0 ? (
                <div className="text-center py-12">
                  <Layers size={28} className="text-np-muted mx-auto mb-2" />
                  <p className="text-sm text-np-muted">No employees found</p>
                  <button onClick={() => setShowAdmin(true)}
                    className="mt-3 text-xs text-np-blue hover:underline">
                    + Add employees in Settings
                  </button>
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
                    onConfirm={setConfirmTarget}
                  />
                ))
              )}
            </div>
          </aside>

          {/* Right: employee detail */}
          <main className="flex-1 overflow-y-auto p-6">
            {!selectedEmployee ? (
              <EmptyState onAdmin={() => setShowAdmin(true)} />
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
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
                          <AlertCircle size={12}/>
                          Sheet error: {errorIds[selectedEmpId]} — showing demo data
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
                    <div className="flex items-center gap-2">
                      {selectedEmployee.probationStatus === 'active' && (
                        <button
                          onClick={() => setConfirmTarget(selectedEmployee)}
                          className="btn-success text-xs"
                        >
                          <UserCheck size={13}/> Mark as Confirmed
                        </button>
                      )}
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
                </div>

                {/* ── Probation + Monthly score row ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Probation status */}
                  <div className="card">
                    <p className="section-title mb-3">Probation Status</p>
                    <ProbationBadge employee={selectedEmployee} />

                    {selectedEmployee.probationStatus === 'confirmed' && (
                      <div className="mt-3 px-3 py-2.5 rounded-lg bg-green-50 border border-green-200 text-xs text-green-700 font-medium">
                        Confirmed — Probation ended on:{' '}
                        <span className="font-bold">{selectedEmployee.confirmationDate
                          ? new Date(selectedEmployee.confirmationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}</span>
                      </div>
                    )}

                    {/* Performance summary */}
                    {empWeeklyData.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-np-border">
                        <p className="section-title mb-2">Overall Summary</p>
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <SummaryStat label="Total Weeks" value={empWeeklyData.length} />
                          <SummaryStat
                            label="Avg Score"
                            value={averageScore(empWeeklyData)?.toFixed(1) ?? '—'}
                            color="#1579be"
                          />
                          <SummaryStat
                            label="Best Score"
                            value={Math.max(...empWeeklyData.filter(w => w.managerScore).map(w => w.managerScore)).toFixed(1)}
                            color="#16A34A"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Monthly score gauge */}
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

      {/* ── Modals ── */}
      {showAdmin && (
        <SheetLinkManager
          employees={employees}
          managers={managers}
          onSaveEmployees={handleSaveEmployees}
          onSaveManagers={handleSaveManagers}
          onClose={() => setShowAdmin(false)}
        />
      )}

      {confirmTarget && (
        <ConfirmationModal
          employee={confirmTarget}
          manager={managers.find(m => m.id === confirmTarget.managerId)}
          onConfirm={handleConfirmProbation}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  )
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function Chip({ icon, label, color }) {
  const colors = {
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

function EmptyState({ onAdmin }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-np-blue-light border border-np-blue/20 flex items-center justify-center mb-5">
        <BarChart3 size={36} className="text-np-blue" />
      </div>
      <h3 className="text-xl font-bold text-np-text mb-2">Select an Employee</h3>
      <p className="text-sm text-np-muted max-w-xs">
        Choose a manager and employee from the list on the left to view their performance snapshot.
      </p>
      <button onClick={onAdmin}
        className="mt-5 btn-secondary text-xs">
        <Users size={13}/> Manage Employees
      </button>
    </div>
  )
}
