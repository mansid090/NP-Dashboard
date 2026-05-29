import React from 'react'
import { User, CheckCircle, ChevronRight, ExternalLink } from 'lucide-react'
import ProbationBadge from './ProbationBadge'
import { averageScore } from '../utils/dateUtils'
import { InlineSpinner } from './LoadingOverlay'

function InitialAvatar({ name, size = 36 }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const colors = [
    ['#EFF6FF', '#1579be'], ['#FFF7ED', '#EA580C'], ['#F0FDF4', '#16A34A'],
    ['#FAF5FF', '#7C3AED'], ['#FFF1F2', '#BE123C'], ['#ECFEFF', '#0891B2'],
  ]
  const [bg, fg] = colors[name.charCodeAt(0) % colors.length]
  return (
    <div style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.38, borderRadius: size * 0.3 }}
         className="flex items-center justify-center font-extrabold border border-current/10 shrink-0">
      {initials}
    </div>
  )
}

export default function EmployeeCard({
  employee, manager, weeklyData, isSelected, isLoading, onClick, onConfirm,
}) {
  const avgScore = averageScore(weeklyData || [])
  const isConfirmed = employee.probationStatus === 'confirmed'

  return (
    <div
      onClick={onClick}
      className={`card-hover relative animate-fade-in-up transition-all duration-200
        ${isSelected ? 'border-np-blue ring-2 ring-np-blue/20 shadow-card-hover' : ''}`}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-np-blue" />
      )}

      <div className="flex items-start gap-3">
        {/* Avatar */}
        <InitialAvatar name={employee.name} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-np-text truncate">{employee.name}</span>
            <ProbationBadge employee={employee} compact />
          </div>
          <p className="text-xs text-np-muted mt-0.5">
            {manager?.name || 'No manager'} · {manager?.role || ''}
          </p>

          <div className="flex items-center gap-3 mt-2">
            {isLoading ? (
              <InlineSpinner size={14} />
            ) : avgScore !== null ? (
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-np-text">
                  Avg: {avgScore.toFixed(1)}/10
                </span>
                <ScoreBar score={avgScore} />
              </div>
            ) : (
              <span className="text-xs text-np-muted italic">No score data</span>
            )}

            {!isConfirmed && (
              <button
                onClick={e => { e.stopPropagation(); onConfirm(employee) }}
                className="ml-auto text-[11px] text-green-600 hover:text-green-700 font-semibold
                           flex items-center gap-0.5 hover:underline"
              >
                <CheckCircle size={11}/> Confirm
              </button>
            )}
          </div>
        </div>

        <ChevronRight size={14} className={`text-np-muted shrink-0 mt-1 transition-transform ${isSelected ? 'rotate-90 text-np-blue' : ''}`} />
      </div>
    </div>
  )
}

function ScoreBar({ score, max = 10 }) {
  const pct = (score / max) * 100
  const color = score >= 9 ? '#16A34A' : score >= 7 ? '#1579be' : score >= 5 ? '#D97706' : '#DC2626'
  return (
    <div className="w-16 h-1.5 bg-np-border rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }}/>
    </div>
  )
}
