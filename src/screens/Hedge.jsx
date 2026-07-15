import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBallast } from '../App'
import {
  BRAND, RISKS, VENUES, GRADES, TOTAL_EXPOSURE, FEE_RATE, fmtUSD, fmtCents,
} from '../data/demoData'

// ── Waterline coverage visual ────────────────────────────────
// A hull cross-section: the water level = % of exposure covered.
function Waterline({ pct }) {
  const clamped = Math.max(0, Math.min(100, pct))
  const H = 170
  const waterY = 30 + (H - 40) * (1 - clamped / 100)
  return (
    <svg
      width="200" height="210" viewBox="0 0 200 210" className="num"
      role="img"
      aria-label={`Coverage waterline: ${Math.round(clamped)} percent of modeled exposure covered`}
    >
      {/* hull */}
      <path
        d="M30 30 L30 140 Q30 185 100 190 Q170 185 170 140 L170 30"
        fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5"
      />
      {/* water fill (clipped to hull) */}
      <clipPath id="hullClip">
        <path d="M30 30 L30 140 Q30 185 100 190 Q170 185 170 140 L170 30" />
      </clipPath>
      <rect
        x="30" y={waterY} width="140" height={200 - waterY}
        fill="rgba(46, 134, 193, 0.45)" clipPath="url(#hullClip)"
      />
      {/* waterline mark */}
      <line x1="18" y1={waterY} x2="182" y2={waterY} stroke="var(--accent)" strokeWidth="2.5" strokeDasharray="6 4" />
      <text x="100" y={waterY - 8} textAnchor="middle" fill="var(--accent)"
        fontSize="13" fontWeight="700" fontFamily="Space Grotesk, sans-serif">
        {Math.round(clamped)}% covered
      </text>
      {/* load-line mark */}
      <circle cx="100" cy="105" r="13" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
      <line x1="83" y1="105" x2="117" y2="105" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
      <text x="100" y="206" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11">
        modeled exposure hull
      </text>
    </svg>
  )
}

// ── Fake OAuth modal ─────────────────────────────────────────
function OAuthModal({ venue, onApprove, onCancel }) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="oauth-title">
      <div className="modal">
        <h2 id="oauth-title">Connect {venue.name}</h2>
        <p className="modal-sub">
          <strong>{BRAND}</strong> is requesting <strong>read + trade</strong> permissions on your{' '}
          {venue.name} account.
        </p>
        <ul style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '14px 0 20px', paddingLeft: 20 }}>
          <li>Read balances and open positions</li>
          <li>Place and cancel orders you approve</li>
          <li>Never withdraw funds</li>
        </ul>
        <button className="btn btn-primary" onClick={onApprove}>Approve connection</button>
        <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={onCancel}>Cancel</button>
        <p className="trust-copy">Simulated OAuth — no real account is contacted.</p>
      </div>
    </div>
  )
}

// ── Place-order modals ───────────────────────────────────────
function ConfirmModal({ rows, totals, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="modal">
        <h2 id="confirm-title">Review your hedge orders</h2>
        <p className="modal-sub">All orders are limit orders at the shown price. You can cancel any time before fill.</p>
        <ul className="order-list">
          {rows.map((r) => (
            <li key={r.risk.id}>
              <span>{r.risk.contract.venue} · {r.risk.contract.name} · {r.risk.contract.side}</span>
              <span className="num">{fmtUSD(r.size)}</span>
            </li>
          ))}
        </ul>
        <div className="sim-line total num">
          <span>Total cost (max loss) + est. fees</span>
          <span>{fmtUSD(totals.cost + totals.fees)}</span>
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--ink-faint)', margin: '10px 0 18px' }}>
          If no hedged event occurs, these positions expire worthless — your maximum loss is the
          full amount above.
        </p>
        <button className="btn btn-primary" onClick={onConfirm}>Place hedges</button>
        <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={onCancel}>Back</button>
      </div>
    </div>
  )
}

function SuccessModal({ rows, onClose }) {
  const byVenue = {}
  rows.forEach((r) => {
    const v = r.risk.contract.venue.includes('Polymarket') && !r.risk.contract.venue.includes('Kalshi')
      ? 'Polymarket US' : r.risk.contract.venue.split(' / ')[0]
    byVenue[v] = (byVenue[v] || 0) + 1
  })
  const summary = Object.entries(byVenue).map(([v, n]) => `${v} (${n})`).join(', ')
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="success-title">
      <div className="modal" style={{ textAlign: 'center' }}>
        <div className="success-check" aria-hidden="true">✓</div>
        <h2 id="success-title">Hedges placed</h2>
        <p className="modal-sub">Orders routed to {summary}. You’ll see fills in your connected accounts. (Simulated.)</p>
        <button className="btn btn-navy" style={{ marginTop: 14 }} onClick={onClose}>Done</button>
      </div>
    </div>
  )
}

// ── Hedge screen ─────────────────────────────────────────────
export default function Hedge() {
  const { plan, addToPlan, removeFromPlan, setPlanSize, connections, setConnections } = useBallast()
  const [oauthVenue, setOauthVenue] = useState(null)
  const [simOn, setSimOn] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [placed, setPlaced] = useState(false)

  const rows = useMemo(() =>
    RISKS.filter((r) => plan[r.id] && r.contract)
      .map((r) => {
        const size = Math.max(0, Number(plan[r.id].size) || 0)
        const maxPayout = Math.round(size / r.contract.price)
        return {
          risk: r,
          size,
          maxPayout,
          fees: Math.round(size * FEE_RATE),
          coveragePct: Math.min(100, Math.round((maxPayout / r.exposure) * 100)),
        }
      }), [plan])

  const totals = useMemo(() => ({
    cost: rows.reduce((s, r) => s + r.size, 0),
    payout: rows.reduce((s, r) => s + r.maxPayout, 0),
    fees: rows.reduce((s, r) => s + r.fees, 0),
  }), [rows])

  const coveragePct = (totals.payout / TOTAL_EXPOSURE) * 100
  const costPct = ((totals.cost + totals.fees) / TOTAL_EXPOSURE) * 100
  const hedgeableNotInPlan = RISKS.filter((r) => r.contract && !plan[r.id])

  // Recession scenario: risks whose trigger correlates with a recession event
  const recessionRiskIds = ['recession']
  const recessionLoss = 180000
  const recessionRows = rows.filter((r) => recessionRiskIds.includes(r.risk.id))
  const recessionPayout = recessionRows.reduce((s, r) => s + r.maxPayout, 0)
  const hedgeDrag = totals.cost + totals.fees

  return (
    <div>
      <main className="container" style={{ paddingBottom: 40 }}>
        <header className="hedge-header">
          <h1>Hedge center</h1>
          <p style={{ color: 'var(--ink-soft)', maxWidth: 640 }}>
            Connect your venue accounts, size each position, and review cost against coverage.
            Every number below shows maximum loss next to maximum payout.
          </p>
        </header>

        {/* Connect accounts */}
        <section aria-labelledby="connect-h">
          <h2 id="connect-h" style={{ fontSize: 20 }}>Connected venues</h2>
          <div className="connect-row">
            {VENUES.map((v) => (
              <div className="connect-tile" key={v.id}>
                <div>
                  <div className="connect-name">{v.name}</div>
                  <div className="connect-desc">{v.desc}</div>
                </div>
                {connections[v.id] ? (
                  <span className="connected-pill"><span className="dot" aria-hidden="true" />Connected</span>
                ) : (
                  <button className="btn btn-sm btn-navy" onClick={() => setOauthVenue(v)}>
                    Connect
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Plan table */}
        <section aria-labelledby="plan-h" style={{ marginTop: 30 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
            <h2 id="plan-h" style={{ fontSize: 20, margin: 0 }}>Hedge plan</h2>
            {hedgeableNotInPlan.length > 0 && (
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => hedgeableNotInPlan.forEach((r) => addToPlan(r.id))}
              >
                Add all suggested positions ({hedgeableNotInPlan.length})
              </button>
            )}
          </div>

          <div className="plan-table-wrap">
            {rows.length === 0 ? (
              <p className="plan-empty">
                No positions yet. Add risks from your <Link to="/report">risk report</Link>, or use
                “Add all suggested positions” above.
              </p>
            ) : (
              <table className="plan-table">
                <thead>
                  <tr>
                    <th scope="col">Contract</th>
                    <th scope="col">Side</th>
                    <th scope="col">Price</th>
                    <th scope="col">Size (cost = max loss)</th>
                    <th scope="col">Max payout</th>
                    <th scope="col">Risk covered</th>
                    <th scope="col">Est. fees</th>
                    <th scope="col"><span className="visually-hidden">Remove</span></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.risk.id}>
                      <td className="td-contract">
                        {r.risk.contract.venue} · {r.risk.contract.name}
                        <small>
                          hedges: {r.risk.name} ·{' '}
                          <span style={{ color: GRADES[r.risk.grade].color, fontWeight: 700 }}>
                            {r.risk.grade} basis
                          </span>
                        </small>
                      </td>
                      <td>{r.risk.contract.side}</td>
                      <td className="num">{fmtCents(r.risk.contract.price)}</td>
                      <td>
                        <label className="visually-hidden" htmlFor={`size-${r.risk.id}`}>
                          Position size for {r.risk.name}
                        </label>
                        $<input
                          id={`size-${r.risk.id}`}
                          className="size-input"
                          type="number" min="0" step="500"
                          value={r.size}
                          onChange={(e) => setPlanSize(r.risk.id, e.target.value)}
                        />
                      </td>
                      <td className="num">{fmtUSD(r.maxPayout)}</td>
                      <td className="num">{r.coveragePct}% of {fmtUSD(r.risk.exposure)}</td>
                      <td className="num">{fmtUSD(r.fees)}</td>
                      <td>
                        <button
                          className="remove-btn"
                          aria-label={`Remove ${r.risk.name} from plan`}
                          onClick={() => removeFromPlan(r.risk.id)}
                        >✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Coverage meter */}
        <section className="coverage-panel" aria-labelledby="cov-h">
          <div className="waterline-visual">
            <Waterline pct={coveragePct} />
          </div>
          <div className="coverage-stats">
            <h2 id="cov-h" className="visually-hidden">Coverage summary</h2>
            <p className="cov-headline">
              <strong className="num">{fmtUSD(totals.payout)}</strong> max hedge payout against{' '}
              <strong className="num">{fmtUSD(TOTAL_EXPOSURE)}</strong> modeled exposure
            </p>
            <div className="cov-row">
              <span className="cov-label">Exposure covered at max payout</span>
              <span className="cov-value num">{Math.round(coveragePct)}%</span>
            </div>
            <div className="cov-row">
              <span className="cov-label">Cost of protection (incl. est. fees) — your max loss</span>
              <span className="cov-value accent num">
                {fmtUSD(totals.cost + totals.fees)} ≈ {costPct.toFixed(1)}% of exposure
              </span>
            </div>
            <div className="cov-row">
              <span className="cov-label">Guideline hedging budget</span>
              <span className="cov-value num">1–3% of exposure</span>
            </div>
          </div>
        </section>

        {/* Simulate + place */}
        <section className="simulate-panel" aria-labelledby="sim-h">
          <div className="sim-toggle-row">
            <h2 id="sim-h" style={{ fontSize: 20, margin: 0, flex: '1 1 auto' }}>Review &amp; simulate</h2>
            <button
              className={`switch${simOn ? ' on' : ''}`}
              role="switch" aria-checked={simOn}
              onClick={() => setSimOn((v) => !v)}
            >
              <span className="track" aria-hidden="true"><span className="thumb" /></span>
              Simulate: recession hits
            </button>
            <button
              className="btn btn-primary"
              disabled={rows.length === 0}
              onClick={() => setConfirming(true)}
            >
              Place hedges
            </button>
          </div>

          {simOn && (
            <div className="sim-compare">
              <div className="sim-card">
                <h4>Without hedges</h4>
                <div className="sim-line num"><span>Recession demand loss</span><span className="neg">−{fmtUSD(recessionLoss)}</span></div>
                <div className="sim-line total num"><span>Net P&amp;L impact</span><span className="neg">−{fmtUSD(recessionLoss)}</span></div>
              </div>
              <div className="sim-card">
                <h4>With this hedge plan</h4>
                <div className="sim-line num"><span>Recession demand loss</span><span className="neg">−{fmtUSD(recessionLoss)}</span></div>
                <div className="sim-line num">
                  <span>Recession contract payout</span>
                  <span className="pos">+{fmtUSD(recessionPayout)}</span>
                </div>
                <div className="sim-line num"><span>Hedge cost + fees (all positions)</span><span className="neg">−{fmtUSD(hedgeDrag)}</span></div>
                <div className="sim-line total num">
                  <span>Net P&amp;L impact</span>
                  <span className={recessionLoss - recessionPayout + hedgeDrag > 0 ? 'neg' : 'pos'}>
                    −{fmtUSD(Math.max(0, recessionLoss - recessionPayout + hedgeDrag))}
                  </span>
                </div>
              </div>
            </div>
          )}
          {simOn && recessionPayout === 0 && (
            <p style={{ fontSize: 13, color: 'var(--ink-faint)', marginTop: 12, marginBottom: 0 }}>
              Note: your plan has no recession-linked position, so this scenario shows no offsetting payout.
            </p>
          )}
        </section>
      </main>

      {/* Persistent disclaimer band */}
      <div className="disclaimer-band">
        <div className="container">
          Event contracts can expire worthless — the “Size” column is money at risk. Payouts are
          fixed by contract terms and may not equal your actual loss. All prices and fees shown
          are illustrative.
        </div>
      </div>

      {oauthVenue && (
        <OAuthModal
          venue={oauthVenue}
          onApprove={() => {
            setConnections((c) => ({ ...c, [oauthVenue.id]: true }))
            setOauthVenue(null)
          }}
          onCancel={() => setOauthVenue(null)}
        />
      )}
      {confirming && (
        <ConfirmModal
          rows={rows} totals={totals}
          onConfirm={() => { setConfirming(false); setPlaced(true) }}
          onCancel={() => setConfirming(false)}
        />
      )}
      {placed && <SuccessModal rows={rows} onClose={() => setPlaced(false)} />}
    </div>
  )
}
