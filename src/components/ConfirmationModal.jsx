import React, { useEffect } from 'react'
import { CheckCircle, X, AlertTriangle } from 'lucide-react'
import { formatDate, getProbationEndDate } from '../utils/dateUtils'

export default function ConfirmationModal({ employee, manager, onConfirm, onCancel }) {
  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onCancel])

  if (!employee) return null

  const endDate = formatDate(getProbationEndDate(employee.joiningDate))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up border border-np-border">
        {/* Close */}
        <button onClick={onCancel}
          className="absolute top-4 right-4 text-np-muted hover:text-np-text transition-colors">
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={28} className="text-green-600" />
        </div>

        <h2 className="text-lg font-bold text-np-text text-center mb-1">
          Confirm Probation
        </h2>
        <p className="text-sm text-np-muted text-center mb-5">
          This action marks the employee as permanently confirmed and moves them to the Confirmed Records tab.
        </p>

        {/* Employee summary */}
        <div className="bg-np-bg rounded-xl border border-np-border p-4 mb-5 space-y-2">
          <Row label="Employee"  value={employee.name} />
          <Row label="Manager"   value={manager?.name || '—'} />
          <Row label="Joined"    value={formatDate(employee.joiningDate)} />
          <Row label="Probation end date" value={endDate} />
          <Row label="Confirmation date"  value={formatDate(new Date())} accent />
        </div>

        {/* Warning */}
        <div className="flex gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg mb-5">
          <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            This action cannot be undone. All historical performance data will be preserved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1 justify-center">
            Cancel
          </button>
          <button onClick={() => onConfirm(employee.id)} className="btn-success flex-1 justify-center">
            <CheckCircle size={14} />
            Mark as Confirmed
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, accent }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-np-muted">{label}</span>
      <span className={`font-semibold ${accent ? 'text-green-600' : 'text-np-text'}`}>{value}</span>
    </div>
  )
}
