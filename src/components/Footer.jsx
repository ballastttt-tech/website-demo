import React from 'react'
import { BRAND, DISCLAIMER } from '../data/demoData'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Logo size={20} />
          <span>{BRAND}</span>
        </div>
        <p className="footer-disclaimer">{DISCLAIMER}</p>
        <p className="footer-fine">
          Clickable product mockup — every figure, testimonial, market price, and integration on
          this site is simulated. © 2026 {BRAND} (working name).
        </p>
      </div>
    </footer>
  )
}
