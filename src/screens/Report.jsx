import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBallast } from '../App'
import {
  BRAND, DEMO_BUSINESS, RISKS, WATCHLIST, GRADES, LAYERS,
  RISK_SCORE, TOTAL_EXPOSURE, fmtUSD, fmtCents,
} from '../data/demoData'

// ── Score dial ───────────────────────────────────────────────
function ScoreDial({ score }) {
  const r = 56
  const c = 2 * Math.PI * r
  const frac = score / 100
  return (
    <div className="score-dial" role="img" aria-label={`Business Risk Score ${score} out of 100`}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="10" />
        <circle
          cx="65" cy="65" r={r} fill="none"
          stroke="var(--accent)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${c * frac} ${c}`}
          transform="rotate(-90 65 65)"
        />
      </svg>
      <div className="score-dial-num">
        <span className="val num">{score}</span>
        <span className="of">RISK SCORE / 100</span>
      </div>
    </div>
  )
}

// ── Signup gate ──────────────────────────────────────────────
function SignupGate({ businessName, onUnlock }) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="gate-title">
      <div className="modal">
        <h2 id="gate-title">Your risk report for {businessName} is ready</h2>
        <p className="modal-sub">Create a free account to open it. Takes 20 seconds.</p>
        <div className="gate-teaser">
          <div>
            <div className="gt-val num">{RISK_SCORE}/100</div>
            <div className="gt-label">Risk score</div>
          </div>
          <div>
            <div className="gt-val num">{fmtUSD(TOTAL_EXPOSURE)}</div>
            <div className="gt-label">Modeled 12-mo exposure</div>
          </div>
          <div>
            <div className="gt-val num">6</div>
            <div className="gt-label">Risks found</div>
          </div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onUnlock() }}>
          <label className="visually-hidden" htmlFor="gate-email">Email</label>
          <input id="gate-email" type="email" placeholder="Work email"
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <label className="visually-hidden" htmlFor="gate-pw">Password</label>
          <input id="gate-pw" type="password" placeholder="Password"
            value={pw} onChange={(e) => setPw(e.target.value)} />
          <button type="submit" className="btn btn-primary">Open my report</button>
        </form>
        <div className="oauth-divider">or</div>
        <button className="btn btn-ghost" onClick={onUnlock}>Continue with Google</button>
        <p className="trust-copy">No card required. Your data is never sold.</p>
      </div>
    </div>
  )
}

// ── Four-tests mini checklist ────────────────────────────────
function MiniTests({ tests }) {
  const items = [
    ['Observable', tests.observable],
    ['Binary', tests.binary],
    ['Time-bound', tests.timeBound],
    ['Market exists', tests.marketExists],
  ]
  return (
    <div className="mini-tests">
      {items.map(([label, pass]) => (
        <span className={`mini-test ${pass ? 'pass' : 'fail'}`} key={label}>
          <span className="mt-mark" aria-hidden="true">{pass ? '✓' : '✕'}</span>
          {label}
        </span>
      ))}
    </div>
  )
}

// ── Risk card ────────────────────────────────────────────────
function RiskCard({ risk }) {
  const { plan, addToPlan } = useBallast()
  const [showNonMarket, setShowNonMarket] = useState(false)
  const grade = GRADES[risk.grade]
  const inPlan = !!plan[risk.id]
  const hedgeable = risk.grade !== 'None'

  return (
    <article className="risk-card">
      <div className="risk-card-top">
        <div>
          <h3 className="risk-name">{risk.name}</h3>
          <div className="risk-tags">
            {risk.l1.map((ch) => (
              <span className="chip" key={ch} style={{ borderColor: LAYERS.L1.color, color: LAYERS.L1.color }}>
                L1 · {ch}
              </span>
            ))}
            <span className="chip" style={{ borderColor: LAYERS.L2.color, color: LAYERS.L2.color }}>
              L2 · {risk.l2}
            </span>
          </div>
        </div>
        <div className="risk-exposure num">
          {fmtUSD(risk.exposure)}
          <small>modeled 12-mo exposure</small>
        </div>
      </div>

      <div className="risk-grid">
        <div className="risk-block">
          <div className="risk-block-label">
            <span className="layer-tag" style={{ background: LAYERS.L3.color }}>L3</span>
            Triggering event
          </div>
          <p className="trigger-q">“{risk.trigger.question}”</p>
          <p className="trigger-src">Resolves via {risk.trigger.source}</p>
          <MiniTests tests={risk.tests} />
        </div>

        <div className="risk-block">
          <div className="risk-block-label">
            <span className="layer-tag" style={{ background: LAYERS.L4.color }}>L4</span>
            Matched contract &amp; basis fit
          </div>
          {risk.contract ? (
            <>
              <p className="contract-line">
                {risk.contract.venue} · {risk.contract.name} ·{' '}
                {risk.contract.side} <span className="contract-price num">@ {fmtCents(risk.contract.price)}</span>
              </p>
              <p className="contract-liq">{risk.contract.liquidity}</p>
            </>
          ) : (
            <p className="contract-line" style={{ color: 'var(--grade-none)' }}>
              No liquid contract matches this risk.
            </p>
          )}
          <div style={{ marginTop: 10 }}>
            <span className="grade-badge" style={{ background: grade.color }}>
              Basis: {risk.grade}
            </span>
          </div>
        </div>
      </div>

      <div className="risk-card-bottom">
        <p className="sizing-note">{risk.sizingNote}</p>
        {hedgeable ? (
          inPlan ? (
            <button className="btn btn-sm btn-added" disabled>✓ In hedge plan</button>
          ) : (
            <button className="btn btn-sm btn-navy" onClick={() => addToPlan(risk.id)}>
              Add to hedge plan
            </button>
          )
        ) : (
          <button
            className="btn btn-sm btn-ghost"
            aria-expanded={showNonMarket}
            onClick={() => setShowNonMarket((v) => !v)}
          >
            {showNonMarket ? 'Hide non-market options' : 'See non-market options'}
          </button>
        )}
      </div>

      {!hedgeable && showNonMarket && (
        <div className="nonmarket">
          {risk.nonMarket.map((n) => (
            <div className="nonmarket-item" key={n.title}>
              <h4>{n.title}</h4>
              <p>{n.detail}</p>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}

// ── Report screen ────────────────────────────────────────────
export default function Report() {
  const navigate = useNavigate()
  const { businessName, signedUp, setSignedUp } = useBallast()

  const [gradeFilter, setGradeFilter] = useState('All')
  const [channelFilter, setChannelFilter] = useState('All')
  const [domainFilter, setDomainFilter] = useState('All')
  const [sortDesc, setSortDesc] = useState(true)

  const channels = useMemo(() => [...new Set(RISKS.flatMap((r) => r.l1))], [])
  const domains = useMemo(() => [...new Set(RISKS.map((r) => r.l2))], [])

  const visible = useMemo(() => {
    let rs = RISKS.filter((r) =>
      (gradeFilter === 'All' || r.grade === gradeFilter) &&
      (channelFilter === 'All' || r.l1.includes(channelFilter)) &&
      (domainFilter === 'All' || r.l2 === domainFilter))
    rs = [...rs].sort((a, b) => (sortDesc ? b.exposure - a.exposure : a.exposure - b.exposure))
    return rs
  }, [gradeFilter, channelFilter, domainFilter, sortDesc])

  const gradeCounts = useMemo(() => {
    const c = { Tight: 0, Moderate: 0, Loose: 0, None: 0 }
    RISKS.forEach((r) => { c[r.grade] += 1 })
    return c
  }, [])

  return (
    <div className="report-wrap">
      <div className={signedUp ? '' : 'report-blur'} aria-hidden={!signedUp}>
        {/* Summary header */}
        <header className="report-header">
          <div className="container report-header-grid">
            <ScoreDial score={RISK_SCORE} />
            <div>
              <h1 className="report-biz-name">{businessName}</h1>
              <p className="report-biz-meta">
                {DEMO_BUSINESS.industry} · {DEMO_BUSINESS.location} · {DEMO_BUSINESS.revenue}
              </p>
              <div className="report-stats" style={{ marginTop: 18 }}>
                <div>
                  <div className="rstat-label">Modeled 12-mo exposure</div>
                  <div className="rstat-value num">{fmtUSD(TOTAL_EXPOSURE)}</div>
                </div>
                <div>
                  <div className="rstat-label">Hedgeable now</div>
                  <div className="rstat-value num">{gradeCounts.Tight + gradeCounts.Moderate}</div>
                  <div className="rstat-sub">{gradeCounts.Tight} Tight · {gradeCounts.Moderate} Moderate</div>
                </div>
                <div>
                  <div className="rstat-label">Supplementary</div>
                  <div className="rstat-value num">{gradeCounts.Loose}</div>
                  <div className="rstat-sub">Loose basis</div>
                </div>
                <div>
                  <div className="rstat-label">Unhedgeable</div>
                  <div className="rstat-value num">{gradeCounts.None}</div>
                  <div className="rstat-sub">→ non-market recs</div>
                </div>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/hedge')}>
              Build my hedge plan →
            </button>
          </div>
        </header>

        {/* Register */}
        <main className="container report-body">
          <div className="report-toolbar" role="group" aria-label="Filter and sort risks">
            <label>
              Basis grade{' '}
              <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
                {['All', 'Tight', 'Moderate', 'Loose', 'None'].map((g) => <option key={g}>{g}</option>)}
              </select>
            </label>
            <label>
              Impact channel{' '}
              <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)}>
                <option>All</option>
                {channels.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label>
              Causal domain{' '}
              <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)}>
                <option>All</option>
                {domains.map((d) => <option key={d}>{d}</option>)}
              </select>
            </label>
            <label>
              Sort{' '}
              <select value={sortDesc ? 'desc' : 'asc'} onChange={(e) => setSortDesc(e.target.value === 'desc')}>
                <option value="desc">Exposure: high → low</option>
                <option value="asc">Exposure: low → high</option>
              </select>
            </label>
            <span className="toolbar-count num">{visible.length} of {RISKS.length} risks</span>
          </div>

          {visible.map((r) => <RiskCard risk={r} key={r.id} />)}

          {/* Watchlist */}
          <section className="watchlist">
            <h3>Watchlist — beyond this business</h3>
            {WATCHLIST.map((w) => (
              <div key={w.question}>
                <div className="watchlist-row">
                  <strong>“{w.question}”</strong>
                  <span className="num">{w.venue} @ {fmtCents(w.price)}</span>
                  <span className="grade-badge" style={{ background: GRADES[w.grade].color, fontSize: 11, padding: '3px 9px' }}>
                    {w.grade}
                  </span>
                </div>
                <p className="watchlist-note">{w.note}</p>
              </div>
            ))}
          </section>
        </main>
      </div>

      {!signedUp && (
        <SignupGate businessName={businessName} onUnlock={() => setSignedUp(true)} />
      )}
    </div>
  )
}
