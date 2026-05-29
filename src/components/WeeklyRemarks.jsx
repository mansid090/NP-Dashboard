import React, { useState } from 'react'
import { MessageSquare, ChevronDown, ChevronUp, CheckSquare, Square } from 'lucide-react'

function scoreColor(score) {
  if (score === null) return '#94A3B8'
  if (score >= 90)   return '#16A34A'
  if (score >= 70)   return '#1579be'
  if (score >= 50)   return '#D97706'
  return '#DC2626'
}

function WeekCard({ week }) {
  const [open, setOpen] = useState(true)
  const score = week.managerScore
  const color = scoreColor(score)

  return (
    <div className="border border-np-border rounded-xl overflow-hidden week-card transition-all duration-200 animate-fade-in-up">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-np-bg hover:bg-np-blue-light transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-5 rounded-full" style={{ background: color }} />
          <span className="text-sm font-semibold text-np-text">{week.weekRange}</span>
          {score !== null && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
              style={{ background: color }}
            >
              {Math.round(score)}%
            </span>
          )}
        </div>
        {open ? <ChevronUp size={15} className="text-np-muted" /> : <ChevronDown size={15} className="text-np-muted" />}
      </button>

      {open && (
        <div className="px-4 py-4 space-y-3 bg-white border-t border-np-border">
          <Field label="One Thing"             value={week.oneThing}       accent="#1579be" />
          <Field label="Additional Goal"       value={week.additionalGoal} accent="#8B5CF6" />
          <Field label="Learnings of the Week" value={week.learnings}      accent="#0891B2" />
          <Field label="Self Comments"         value={week.selfComments}   accent="#64748B" />

          <div className="mt-3 pt-3 border-t border-dashed border-np-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-np-text uppercase tracking-wide">Manager Review</span>
              {score !== null && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg text-white"
                      style={{ background: color }}>
                  {Math.round(score)}% completion
                </span>
              )}
            </div>
            {week.managerComment ? (
              <div className="px-3 py-2.5 rounded-lg text-sm text-np-text leading-relaxed"
                   style={{ background: `${color}12`, borderLeft: `3px solid ${color}` }}>
                {week.managerComment}
              </div>
            ) : (
              <p className="text-xs text-np-muted italic">No manager comment recorded</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, accent }) {
  if (!value) return null
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: accent }}>
        {label}
      </p>
      <p className="text-sm text-np-text leading-relaxed">{value}</p>
    </div>
  )
}

export default function WeeklyRemarks({ weeklyData, selectedWeeks, onWeeksChange }) {
  const allWeekRanges = (weeklyData || []).map(w => w.weekRange)
  const hasData = allWeekRanges.length > 0

  function toggleWeek(range) {
    onWeeksChange(prev =>
      prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]
    )
  }
  function toggleAll() {
    if (selectedWeeks.length === allWeekRanges.length) {
      onWeeksChange([])
    } else {
      onWeeksChange([...allWeekRanges])
    }
  }

  const visibleWeeks = (weeklyData || []).filter(w => selectedWeeks.includes(w.weekRange))

  if (!hasData) {
    return (
      <div className="card flex flex-col items-center justify-center py-10 gap-2">
        <MessageSquare size={28} className="text-np-muted" />
        <p className="text-sm text-np-muted text-center">No weekly data available</p>
        <p className="text-xs text-np-muted text-center">
          Add a Google Sheet URL in Settings to pull real data
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare size={14} className="text-np-blue" />
            <span className="text-sm font-semibold text-np-text">Select Weeks</span>
          </div>
          <button onClick={toggleAll} className="text-xs text-np-blue font-medium hover:underline">
            {selectedWeeks.length === allWeekRanges.length ? 'Deselect all' : 'Select all'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {allWeekRanges.map((range, i) => {
            const checked = selectedWeeks.includes(range)
            const score   = weeklyData[i]?.managerScore
            const color   = scoreColor(score)
            return (
              <button
                key={range}
                onClick={() => toggleWeek(range)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                  border transition-all duration-150 ${checked
                    ? 'text-white shadow-sm'
                    : 'bg-white text-np-text border-np-border hover:border-np-blue'}`}
                style={checked ? { background: color, borderColor: color } : {}}
              >
                {checked ? <CheckSquare size={11} /> : <Square size={11} className="text-np-muted" />}
                {range}
                {score !== null && (
                  <span className={`font-bold ${checked ? 'text-white/80' : ''}`}>
                    · {Math.round(score)}%
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {selectedWeeks.length === 0 ? (
        <div className="text-center py-8 text-np-muted text-sm">
          Select one or more weeks above to view details
        </div>
      ) : (
        <div className="space-y-3">
          {visibleWeeks.map((week, i) => (
            <WeekCard key={i} week={week} />
          ))}
        </div>
      )}
    </div>
  )
}
