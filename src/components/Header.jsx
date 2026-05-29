import React from 'react'
import { RefreshCw } from 'lucide-react'

function NowPurchaseLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center border border-white/20">
        <svg viewBox="0 0 36 36" width="28" height="28" fill="none">
          <rect width="36" height="36" rx="8" fill="white" fillOpacity="0.1"/>
          <text x="18" y="25" fontFamily="Inter,sans-serif" fontSize="14" fontWeight="800"
                fill="white" textAnchor="middle" letterSpacing="-0.5">NP</text>
        </svg>
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-white font-extrabold text-base tracking-tight">NowPurchase</span>
        <span className="text-white/60 text-[10px] font-medium tracking-widest uppercase">Metal Cloud</span>
      </div>
    </div>
  )
}

export default function Header({ onRefresh, isRefreshing }) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-0 shadow-header"
      style={{ background: 'linear-gradient(135deg, #1B2B3A 0%, #1B3A5C 60%, #1579be 100%)', height: 64 }}
    >
      <div className="flex flex-col">
        <h1 className="text-white font-bold text-lg leading-tight tracking-tight">Probation Dashboard</h1>
        <p className="text-white/55 text-xs font-medium">Employee performance &amp; probation tracking</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          title="Refresh all data"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20
                     text-white text-xs font-medium transition-all border border-white/10"
        >
          <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
        <div className="h-8 w-px bg-white/20 mx-1" />
        <NowPurchaseLogo />
      </div>
    </header>
  )
}
