import React from 'react'

export function LoadingOverlay({ show, message = 'Loading data…' }) {
  if (!show) return null
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-np-border px-10 py-8 flex flex-col items-center gap-4">
        <SpinnerSvg />
        <p className="text-np-text font-semibold text-sm">{message}</p>
        <p className="text-np-muted text-xs">Fetching from Google Sheets…</p>
      </div>
    </div>
  )
}

export function InlineSpinner({ size = 18, color = '#1579be' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="10" stroke="#E2E8F0" strokeWidth="3" />
      <path d="M12 2 A10 10 0 0 1 22 12" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function SpinnerSvg() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <circle cx="26" cy="26" r="22" stroke="#E2E8F0" strokeWidth="4" />
      <circle cx="26" cy="26" r="22" stroke="url(#grad)" strokeWidth="4"
              strokeLinecap="round" strokeDasharray="100 38" className="animate-spin-slow"
              style={{ transformOrigin: 'center', animationDuration: '1s' }}/>
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#1579be" />
          <stop offset="100%" stopColor="#F26522" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function SkeletonCard() {
  return (
    <div className="card space-y-3">
      <div className="skeleton h-5 w-3/5" />
      <div className="skeleton h-3 w-2/5" />
      <div className="skeleton h-3 w-4/5" />
      <div className="skeleton h-3 w-3/5" />
    </div>
  )
}
