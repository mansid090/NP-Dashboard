import React, { useState, useEffect } from 'react'

// Semi-circular (half-moon) gauge
// Arc: M 15,110 A 85,85 0 0,1 185,110  (sweep=1 = clockwise = upper half)
// Circumference of semicircle (r=85): π × 85 ≈ 267.04
const R   = 85
const CX  = 100
const CY  = 110
const LX  = CX - R  // 15
const RX  = CX + R  // 185
const ARC = `M ${LX},${CY} A ${R},${R} 0 0,1 ${RX},${CY}`
const CIRC = Math.PI * R // ≈ 267.04

function scoreColor(s) {
  if (s === null || s === undefined) return '#94A3B8'
  if (s >= 9)  return '#16A34A'  // green
  if (s >= 7)  return '#1579be'  // np-blue
  if (s >= 5)  return '#D97706'  // amber
  return '#DC2626'               // red
}

function scoreLabel(s) {
  if (s === null || s === undefined) return '—'
  if (s >= 9)  return 'Excellent'
  if (s >= 7)  return 'Good'
  if (s >= 5)  return 'Average'
  return 'Needs Improvement'
}

export default function ScoreGauge({ score, maxScore = 10, label = 'Monthly Avg', size = 220 }) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    setAnimated(false)
    const t = setTimeout(() => setAnimated(true), 80)
    return () => clearTimeout(t)
  }, [score])

  const safeScore  = score !== null && !isNaN(score) ? Math.min(maxScore, Math.max(0, score)) : 0
  const fraction   = safeScore / maxScore
  const fillLen    = CIRC * fraction
  const dashOffset = animated ? CIRC - fillLen : CIRC
  const color      = scoreColor(score)

  return (
    <div className="flex flex-col items-center select-none" style={{ width: size }}>
      <svg viewBox="0 0 200 130" width={size} height={size * 0.65}>
        {/* Track */}
        <path d={ARC} fill="none" stroke="#E2E8F0" strokeWidth="14" strokeLinecap="round" />

        {/* Fill */}
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

        {/* Dot at score end */}
        {score !== null && animated && (
          <GaugeDot fraction={fraction} r={R} cx={CX} cy={CY} color={color} />
        )}

        {/* Score text */}
        <text x={CX} y={CY - 10} textAnchor="middle" fontSize="30" fontWeight="800" fill={color}
              fontFamily="Inter,sans-serif">
          {score !== null ? score.toFixed(1) : '—'}
        </text>
        <text x={CX} y={CY + 10} textAnchor="middle" fontSize="11" fill="#94A3B8"
              fontFamily="Inter,sans-serif">
          out of {maxScore}
        </text>
      </svg>

      {/* Labels below arc */}
      <div className="flex justify-between w-full px-3 -mt-1">
        <span className="text-[10px] text-np-muted font-medium">0</span>
        <span className="text-xs font-semibold" style={{ color }}>{scoreLabel(score)}</span>
        <span className="text-[10px] text-np-muted font-medium">{maxScore}</span>
      </div>
      <p className="text-xs text-np-muted mt-1 font-medium">{label}</p>
    </div>
  )
}

// Small dot that travels along the arc to show current score position
function GaugeDot({ fraction, r, cx, cy, color }) {
  // Angle: arc goes from 180° to 0° (clockwise in screen coords)
  // At fraction=0: angle=180°, at fraction=1: angle=0°
  const angleDeg = 180 - fraction * 180
  const rad = (angleDeg * Math.PI) / 180
  const dx  = cx + r * Math.cos(rad)
  const dy  = cy - r * Math.sin(rad)  // SVG y flipped
  return <circle cx={dx} cy={dy} r="7" fill={color} stroke="white" strokeWidth="2.5" />
}
