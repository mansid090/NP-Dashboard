import React, { useState, useEffect } from 'react'

const R   = 85
const CX  = 100
const CY  = 110
const LX  = CX - R
const RX  = CX + R
const ARC = `M ${LX},${CY} A ${R},${R} 0 0,1 ${RX},${CY}`
const CIRC = Math.PI * R

function scoreColor(s) {
  if (s === null || s === undefined) return '#94A3B8'
  if (s >= 90) return '#16A34A'
  if (s >= 70) return '#1579be'
  if (s >= 50) return '#D97706'
  return '#DC2626'
}

function scoreLabel(s) {
  if (s === null || s === undefined) return '—'
  if (s >= 90) return 'Excellent'
  if (s >= 70) return 'Good'
  if (s >= 50) return 'Average'
  return 'Needs Improvement'
}

export default function ScoreGauge({ score, label = 'Monthly Avg', size = 220 }) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    setAnimated(false)
    const t = setTimeout(() => setAnimated(true), 80)
    return () => clearTimeout(t)
  }, [score])

  const safeScore  = score !== null && !isNaN(score) ? Math.min(100, Math.max(0, score)) : 0
  const fraction   = safeScore / 100
  const fillLen    = CIRC * fraction
  const dashOffset = animated ? CIRC - fillLen : CIRC
  const color      = scoreColor(score)

  return (
    <div className="flex flex-col items-center select-none" style={{ width: size }}>
      <svg viewBox="0 0 200 130" width={size} height={size * 0.65}>
        <path d={ARC} fill="none" stroke="#E2E8F0" strokeWidth="14" strokeLinecap="round" />
        <path
          d={ARC}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${CIRC}`}
          strokeDashoffset={dashOffset}
          className="gauge-path-fill"
        />
        {score !== null && animated && (
          <GaugeDot fraction={fraction} r={R} cx={CX} cy={CY} color={color} />
        )}
        <text x={CX} y={CY - 10} textAnchor="middle" fontSize="30" fontWeight="800" fill={color}
              fontFamily="Inter,sans-serif">
          {score !== null ? `${Math.round(score)}%` : '—'}
        </text>
        <text x={CX} y={CY + 10} textAnchor="middle" fontSize="11" fill="#94A3B8"
              fontFamily="Inter,sans-serif">
          completion
        </text>
      </svg>

      <div className="flex justify-between w-full px-3 -mt-1">
        <span className="text-[10px] text-np-muted font-medium">0%</span>
        <span className="text-xs font-semibold" style={{ color }}>{scoreLabel(score)}</span>
        <span className="text-[10px] text-np-muted font-medium">100%</span>
      </div>
      <p className="text-xs text-np-muted mt-1 font-medium">{label}</p>
    </div>
  )
}

function GaugeDot({ fraction, r, cx, cy, color }) {
  const angleDeg = 180 - fraction * 180
  const rad = (angleDeg * Math.PI) / 180
  const dx  = cx + r * Math.cos(rad)
  const dy  = cy - r * Math.sin(rad)
  return <circle cx={dx} cy={dy} r="7" fill={color} stroke="white" strokeWidth="2.5" />
}
