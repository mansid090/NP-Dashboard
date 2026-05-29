import React from 'react'
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import {
  formatDate, getProbationEndDate, getDaysRemaining,
  getProbationProgress, isProbationActive
} from '../utils/dateUtils'

export default function ProbationBadge({ employee, compact = false }) {
  const { joiningDate, probationStatus, confirmationDate, name } = employee

  if (probationStatus === 'confirmed') {
    return compact ? (
      <span className="badge-confirmed">
        <CheckCircle size={11} /> Confirmed
      </span>
    ) : (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
        <CheckCircle size={16} className="text-green-600 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-green-800">Probation Confirmed</p>
          {confirmationDate && (
            <p className="text-xs text-green-600">
              Confirmed on: <span className="font-medium">{formatDate(confirmationDate)}</span>
            </p>
          )}
        </div>
      </div>
    )
  }

  const endDate  = getProbationEndDate(joiningDate)
  const daysLeft = getDaysRemaining(joiningDate)
  const progress = getProbationProgress(joiningDate)
  const isActive = isProbationActive(joiningDate)
  const isOverdue = !isActive && probationStatus === 'active'

  if (compact) {
    return isOverdue ? (
      <span className="badge-overdue"><AlertTriangle size={11} /> Overdue</span>
    ) : (
      <span className="badge-active"><Clock size={11} /> {daysLeft}d left</span>
    )
  }

  return (
    <div className={`rounded-lg border p-3 ${isOverdue
      ? 'bg-red-50 border-red-200'
      : 'bg-amber-50 border-amber-200'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {isOverdue
            ? <AlertTriangle size={16} className="text-red-600 shrink-0" />
            : <Clock size={16} className="text-amber-600 shrink-0" />}
          <div>
            <p className={`text-xs font-semibold ${isOverdue ? 'text-red-800' : 'text-amber-800'}`}>
              {isOverdue ? 'Probation Overdue' : 'Active Probation'}
            </p>
            <p className={`text-xs ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
              Probation ends on:{' '}
              <span className="font-semibold">{formatDate(endDate)}</span>
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-lg font-extrabold leading-none ${isOverdue ? 'text-red-700' : 'text-amber-700'}`}>
            {daysLeft}
          </p>
          <p className={`text-[10px] font-medium ${isOverdue ? 'text-red-500' : 'text-amber-500'}`}>
            days left
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2.5">
        <div className="flex justify-between text-[10px] text-np-muted mb-1">
          <span>Joined: {formatDate(joiningDate)}</span>
          <span>{progress}% complete</span>
        </div>
        <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${isOverdue ? 'bg-red-500' : 'bg-amber-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
