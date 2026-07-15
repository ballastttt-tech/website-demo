import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useBallast } from '../App'
import { BRAND } from '../data/demoData'
import Logo from './Logo'

export default function Nav() {
  const { businessName } = useBallast()
  return (
    <nav className="topnav">
      <div className="topnav-inner">
        <Link to="/" className="topnav-brand" aria-label={`${BRAND} home`}>
          <Logo size={22} />
          <span>{BRAND}</span>
        </Link>
        <span className="topnav-biz" title="Demo business">
          <span className="topnav-biz-dot" aria-hidden="true" />
          {businessName}
        </span>
        <div className="topnav-links">
          <NavLink to="/report" className={({ isActive }) => 'topnav-link' + (isActive ? ' active' : '')}>
            Risk report
          </NavLink>
          <NavLink to="/hedge" className={({ isActive }) => 'topnav-link' + (isActive ? ' active' : '')}>
            Hedge center
          </NavLink>
        </div>
      </div>
    </nav>
  )
}
