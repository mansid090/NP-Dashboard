import React, { useMemo } from 'react'
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import ScoreGauge from './ScoreGauge'
import { groupByMonth, averageScore, monthLabel } from '../utils/dateUtils'

export default function MonthlyScore({ weeklyData, selectedMonth, onMonthChange }) {
  const grouped = useMemo(() => groupByMonth(weeklyData || []), [weeklyData])
  const months  = Object.keys(grouped).sort()

  const currentData  = grouped[selectedMonth] || []
  const currentAvg   = averageScore(currentData)

  // Trend vs previous month
  const prevIdx = months.indexOf(selectedMonth) - 1
  const prevAvg = prevIdx >= 0 ? averageScore(grouped[months[prevIdx]] || []) : null
  const trend   = currentAvg !== null && prevAvg !== null ? currentAvg - prevAvg : null

  if (!weeklyData?.length) {
    return (
      <div className="card flex flex-col items-center justify-center py-8 gap-2">
        <Calendar size={28} className="text-np-muted" />
        <p className="text-sm text-np-muted">No performance data available</p>
      </div>
    )
  }

  return (
    <div className="card flex flex-col items-center gap-3">
      {/* Month selector */}
      <div className="w-full flex items-center gap-2">
        <Calendar size={14} className="text-np-muted shrink-0" />
        <select
          className="select text-sm flex-1"
          value={selectedMonth || ''}
          onChange={e => onMonthChange(e.target.value)}
        >
          <option value="">— Select month —</option>
          {months.map(m => (
            <option key={m} value={m}>{monthLabel(m)}</option>
          ))}
        </select>
      </div>

      {selectedMonth && (
        <>
          <ScoreGauge
            score={currentAvg}
            label={`${monthLabel(selectedMonth)} Avg`}
            size={200}
          />

          {/* Week breakdown */}
          <div className="w-full space-y-1 border-t border-np-border pt-3">
            <p className="section-title mb-2">Week Breakdown</p>
            {currentData.length === 0 ? (
              <p className="text-xs text-np-muted">No data for this month</p>
            ) : currentData.map((w, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1">
                <span className="text-np-muted truncate max-w-[160px]">{w.weekRange}</span>
                <ScoreChip score={w.managerScore} />
              </div>
            ))}
          </div>

          {/* Trend indicator */}
          {trend !== null && (
            <div className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
                ${trend > 0 ? 'bg-green-50 text-green-700' : trend < 0 ? 'bg-red-50 text-red-700' : 'bg-np-bg text-np-muted'}`}>
              {trend > 0 ? <TrendingUp size={13}/> : trend < 0 ? <TrendingDown size={13}/> : <Minus size={13}/>}
              {trend > 0 ? '+' : ''}{Math.round(trend)}% vs previous month
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ScoreChip({ score }) {
  if (score === null || isNaN(score)) return <span className="text-np-muted">—</span>
  const s = Number(score)
  const cls = s >= 90 ? 'bg-green-100 text-green-700'
            : s >= 70 ? 'bg-blue-100 text-blue-700'
            : s >= 50 ? 'bg-amber-100 text-amber-700'
            : 'bg-red-100 text-red-700'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] ${cls}`}>
      {Math.round(s)}%
    </span>
  )
}
