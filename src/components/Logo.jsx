import React from 'react'

/** Simple maritime mark: a load line (Plimsoll) circle. */
export default function Logo({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth="2" />
      <line x1="12" y1="12" x2="12" y2="17" stroke={color} strokeWidth="2" />
    </svg>
  )
}
