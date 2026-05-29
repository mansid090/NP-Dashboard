import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Users, BarChart3, ChevronDown, Info, AlertCircle, RefreshCw, Loader2, CheckCircle } from 'lucide-react'

import Header       from './components/Header'
import EmployeeCard from './components/EmployeeCard'
import ProbationBadge from './components/ProbationBadge'
import MonthlyScore from './components/MonthlyScore'
import WeeklyRemarks from './components/WeeklyRemarks'
import { SkeletonCard } from './components/LoadingOverlay'

import { useConfig }          from './hooks/useConfig'
import { useGoogleSheets }    from './hooks/useGoogleSheets'
import { groupByMonth, averageScore } from './utils/dateUtils'
import ProbationEndedPage     from './components/ProbationEndedPage'

export default function App() {
  const { employees, managers, loading: configLoading, error: configError, configured } = useConfig()

  const [activePage,    setActivePage]    = useState('active') // 'active' | 'ended'
  const [selectedMgrId, setSelectedMgrId] = useState('')
  const [selectedEmpId, setSelectedEmpId] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedWeeks, setSelectedWeeks] = useState([])
  const [refreshKey,    setRefreshKey]    = useState(0)

  const { sheetData, loadingIds, errorIds, loadEmployee, loadAll, clearCache } = useGoogleSheets()

  // ── Split employees by probation status ──────────────────────────────────
  const activeEmployees = useMemo(() => employees.filter(e => !e.probationEnded), [employees])
  const endedEmployees  = useMemo(() => employees.filter(e => e.probationEnded),  [employees])

  // ── Derived lists ─────────────────────────────────────────────────────────
  const filteredByMgr = useMemo(() => {
    const pool = activePage === 'ended' ? endedEmployees : activeEmployees
    return selectedMgrId ? pool.filter(e => e.managerId === selectedMgrId) : pool
  }, [activeEmployees, endedEmployees, activePage, selectedMgrId])

  const selectedEmployee = useMemo(() =>
    employees.find(e => e.id === selectedEmpId) ?? null, [employees, selectedEmpId])

  const selectedManager = useMemo(() =>
    managers.find(m => m.id === selectedEmployee?.managerId) ?? null, [managers, selectedEmployee])

  const empWeeklyData = useMemo(() =>
    (selectedEmpId ? sheetData[selectedEmpId] : null) ?? [], [sheetData, selectedEmpId])

  // ── Auto-select first employee when filter changes ────────────────────────
  useEffect(() => {
    if (filteredByMgr.length > 0 && !filteredByMgr.find(e => e.id === selectedEmpId)) {
      setSelectedEmpId(filteredByMgr[0].id)
    } else if (filteredByMgr.length === 0) {
      setSelectedEmpId('')
    }
  }, [filteredByMgr])

  // ── Load sheet whenever selected employee changes ─────────────────────────
  useEffect(() => {
    if (selectedEmployee) loadEmployee(selectedEmployee)
  }, [selectedEmployee, refreshKey])

  // ── Auto-refresh on tab focus ─────────────────────────────────────────────
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible' && selectedEmployee)
        loadEmployee(selectedEmployee, true)
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [selectedEmployee, loadEmployee])

  // ── Poll every 2 min for current employee ─────────────────────────────────
  useEffect(() => {
    if (!selectedEmployee) return
    const t = setInterval(() => loadEmployee(selectedEmployee, true), 2 * 60 * 1000)
    return () => clearInterval(t)
  }, [selectedEmployee, loadEmployee])

  // ── Auto-select latest month ──────────────────────────────────────────────
  useEffect(() => {
    if (!empWeeklyData.length) return
    const months = Object.keys(groupByMonth(empWeeklyData)).sort()
    if (months.length && !months.includes(selectedMonth))
      setSelectedMonth(months[months.length - 1])
  }, [empWeeklyData])

  // ── Auto-select all weeks on employee change ──────────────────────────────
  useEffect(() => {
    if (empWeeklyData.length)
      setSelectedWeeks(empWeeklyData.map(w => w.weekRange))
  }, [selectedEmpId, empWeeklyData.length])

  // ── Initial load of all sheets once config is ready ──────────────────────
  useEffect(() => {
    if (employees.length) loadAll(employees)
  }, [employees, refreshKey])

  const handleRefresh = useCallback(() => {
    clearCache()
    setRefreshKey(k => k + 1)
  }, [clearCache])

  // ── Show config not set ───────────────────────────────────────────────────
  if (!configured) return <SetupScreen />

  // ── Show loading config ───────────────────────────────────────────────────
  if (configLoading) return <LoadingScreen />

  // ── Show config error ─────────────────────────────────────────────────────
  if (configError) return <ErrorScreen message={configError} />

  return (
    <div className="min-h-screen bg-np-bg font-sans">
      <Header
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

          <div className="ml-auto">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200">
              <Users size={11}/> {employees.length} Employees
            </span>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="bg-white border-b border-np-border px-6 flex items-end gap-1">
          <button
            onClick={() => { setActivePage('active'); setSelectedEmpId('') }}
            className={activePage === 'active' ? 'tab-btn-active' : 'tab-btn-inactive'}
          >
            <span className="flex items-center gap-1.5">
              <Users size={13}/> Active Probation
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                {activeEmployees.length}
              </span>
            </span>
          </button>
          <button
            onClick={() => { setActivePage('ended'); setSelectedEmpId('') }}
            className={activePage === 'ended' ? 'tab-btn-active' : 'tab-btn-inactive'}
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle size={13}/> Probation Ended
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                {endedEmployees.length}
              </span>
            </span>
          </button>
        </div>

        {/* ── Main layout ── */}
        <div className="flex gap-0 min-h-[calc(100vh-144px)]">

          {/* ── Probation Ended tab — full width card grid ── */}
          {activePage === 'ended' && (
            <div className="flex-1 overflow-y-auto">
              <ProbationEndedPage
                employees={endedEmployees}
                managers={managers}
                sheetData={sheetData}
                loadingIds={loadingIds}
              />
            </div>
          )}

          {/* ── Active Probation tab — sidebar + detail ── */}
          {activePage === 'active' && <>
          <aside className="w-80 shrink-0 border-r border-np-border bg-white overflow-y-auto">
            <div className="p-4 space-y-2">
              <p className="section-title mb-3">
                Employees <span className="ml-2 font-bold text-np-text">{filteredByMgr.length}</span>
              </p>
              {filteredByMgr.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={28} className="text-np-muted mx-auto mb-2" />
                  <p className="text-sm text-np-muted">No employees found</p>
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

          <main className="flex-1 overflow-y-auto p-6">
            {!selectedEmployee ? (
              <SelectPrompt />
            ) : (
              <div className="max-w-5xl mx-auto space-y-5 animate-fade-in-up" key={selectedEmpId}>
                {/* Employee header */}
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
                          No tracker sheet linked — add the sheet URL in the Master Config Sheet.
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

                {/* Probation + Monthly */}
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
                              ? `${Math.round(averageScore(empWeeklyData))}%` : '—'}
                            color="#1579be"
                          />
                          <SummaryStat
                            label="Best Score"
                            value={(() => {
                              const s = empWeeklyData.filter(w => w.managerScore !== null).map(w => w.managerScore)
                              return s.length ? `${Math.round(Math.max(...s))}%` : '—'
                            })()}
                            color="#16A34A"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="section-title mb-3">Monthly Performance</p>
                    {loadingIds.has(selectedEmpId) ? <SkeletonCard /> : (
                      <MonthlyScore
                        weeklyData={empWeeklyData}
                        selectedMonth={selectedMonth}
                        onMonthChange={setSelectedMonth}
                      />
                    )}
                  </div>
                </div>

                {/* Weekly remarks */}
                <div>
                  <p className="section-title mb-3">Weekly Performance Remarks</p>
                  {loadingIds.has(selectedEmpId) ? (
                    <div className="space-y-3"><SkeletonCard/><SkeletonCard/></div>
                  ) : (
                    <WeeklyRemarks
                      weeklyData={empWeeklyData}
                      selectedWeeks={selectedWeeks}
                      onWeeksChange={setSelectedWeeks}
                    />
                  )}
                </div>

              </div>
            )}
          </main>
          </>}
        </div>
      </div>
    </div>
  )
}

// ── Full-page screens ─────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-np-bg flex flex-col items-center justify-center gap-4">
      <Loader2 size={36} className="text-np-blue animate-spin" />
      <p className="text-sm font-semibold text-np-text">Loading employee data…</p>
      <p className="text-xs text-np-muted">Fetching from Master Config Sheet</p>
    </div>
  )
}

function ErrorScreen({ message }) {
  return (
    <div className="min-h-screen bg-np-bg flex flex-col items-center justify-center gap-4 px-6">
      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
        <AlertCircle size={30} className="text-red-500" />
      </div>
      <h2 className="text-lg font-bold text-np-text">Could not load config</h2>
      <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 max-w-md text-center">
        {message}
      </p>
      <p className="text-xs text-np-muted text-center max-w-sm">
        Check that the Master Config Sheet URL in <code className="bg-np-border px-1 rounded">src/config.js</code> is correct and the sheet is shared/published.
      </p>
    </div>
  )
}

function SetupScreen() {
  return (
    <div className="min-h-screen bg-np-bg flex flex-col items-center justify-center px-6">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-np-blue-light border border-np-blue/20 flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={30} className="text-np-blue" />
          </div>
          <h1 className="text-2xl font-extrabold text-np-text mb-2">NP Probation Dashboard</h1>
          <p className="text-sm text-np-muted">One-time setup required — takes 2 minutes</p>
        </div>

        <div className="card space-y-5">
          <SetupStep n="1" title="Create the Master Config Sheet">
            <p>Create a Google Sheet with these column headers in Row 1:</p>
            <div className="mt-2 bg-np-bg rounded-lg p-3 font-mono text-xs overflow-x-auto text-np-text border border-np-border">
              Employee Name &nbsp;|&nbsp; Manager Name &nbsp;|&nbsp; Manager Role &nbsp;|&nbsp; Joining Date &nbsp;|&nbsp; Tracker Sheet URL
            </div>
            <p className="mt-2">Then add one employee per row from Row 2 onwards.</p>
          </SetupStep>

          <SetupStep n="2" title="Publish the sheet">
            <p>In your Google Sheet: <strong>File → Share → Publish to web → CSV → Publish</strong></p>
            <p className="mt-1">Copy the published URL.</p>
          </SetupStep>

          <SetupStep n="3" title="Add the URL to config.js">
            <p>Open <code className="bg-np-border px-1.5 py-0.5 rounded text-xs">src/config.js</code> and paste the URL:</p>
            <div className="mt-2 bg-np-bg rounded-lg p-3 font-mono text-xs border border-np-border text-np-text overflow-x-auto">
              export const CONFIG_SHEET_URL = <span className="text-np-blue">'https://docs.google.com/...'</span>
            </div>
          </SetupStep>

          <SetupStep n="4" title="Rebuild and open the dashboard">
            <p>Run <code className="bg-np-border px-1.5 py-0.5 rounded text-xs">npm run dev</code> (or redeploy). The dashboard will load your team automatically.</p>
          </SetupStep>
        </div>

        <p className="text-center text-xs text-np-muted mt-6">
          After setup, no further configuration is needed. Add/remove employees by editing the Master Config Sheet.
        </p>
      </div>
    </div>
  )
}

function SetupStep({ n, title, children }) {
  return (
    <div className="flex gap-4">
      <div className="w-7 h-7 rounded-full bg-np-blue text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
        {n}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-np-text mb-1">{title}</p>
        <div className="text-xs text-np-muted space-y-1 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

function SelectPrompt() {
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

function SummaryStat({ label, value, color }) {
  return (
    <div className="bg-np-bg rounded-lg px-2 py-2.5">
      <p className="text-lg font-extrabold" style={{ color: color || '#1E293B' }}>{value}</p>
      <p className="text-[10px] text-np-muted font-medium">{label}</p>
    </div>
  )
}
