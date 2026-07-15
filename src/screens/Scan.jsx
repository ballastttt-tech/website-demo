import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBallast } from '../App'
import Logo from '../components/Logo'
import { BRAND, SCAN_STAGES, SCAN_COUNTERS } from '../data/demoData'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// timing (ms)
const FINDING_INTERVAL = 620
const STAGE_GAP = 900

const FOUR_TESTS = [
  { key: 'observable', label: 'Observable' },
  { key: 'binary', label: 'Binary' },
  { key: 'timeBound', label: 'Time-bound' },
  { key: 'market', label: 'Market exists' },
]

function CountUp({ target, run }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!run) return
    if (prefersReducedMotion() || target <= 1) { setN(target); return }
    let i = 0
    const t = setInterval(() => {
      i += 1
      setN(i)
      if (i >= target) clearInterval(t)
    }, 700 / target * 3)
    return () => clearInterval(t)
  }, [run, target])
  return <span className="counter-num num">{run ? n : '—'}</span>
}

export default function Scan() {
  const navigate = useNavigate()
  const { businessName, setScanComplete } = useBallast()
  const reduced = useMemo(prefersReducedMotion, [])

  // progress: index of active stage; findings revealed per stage
  const [stageIdx, setStageIdx] = useState(0)
  const [revealed, setRevealed] = useState(0) // findings shown in active stage
  const [testsOn, setTestsOn] = useState(0)   // four-tests checkmarks landed
  const [done, setDone] = useState(false)
  const timers = useRef([])

  const speed = reduced ? 0.12 : 1

  useEffect(() => {
    let cancelled = false
    const push = (fn, delay) => {
      const t = setTimeout(() => { if (!cancelled) fn() }, delay)
      timers.current.push(t)
    }

    let clock = 600 * speed
    SCAN_STAGES.forEach((stage, si) => {
      push(() => { setStageIdx(si); setRevealed(0); setTestsOn(0) }, clock)
      // four tests land first on the decompose stage
      if (stage.fourTests) {
        for (let k = 1; k <= 4; k++) {
          push(() => setTestsOn(k), clock + k * 420 * speed)
        }
        clock += 4 * 420 * speed + 200 * speed
      }
      stage.findings.forEach((_, fi) => {
        clock += FINDING_INTERVAL * speed
        push(() => setRevealed(fi + 1), clock)
      })
      clock += STAGE_GAP * speed
    })
    push(() => { setDone(true); setScanComplete(true) }, clock + 400 * speed)

    return () => { cancelled = true; timers.current.forEach(clearTimeout) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stageState = (i) => (done || i < stageIdx ? 'done' : i === stageIdx ? 'active' : 'pending')

  return (
    <div className="scan-screen">
      <div className="scan-topbar">
        <Link to="/" className="brand"><Logo size={20} /> {BRAND}</Link>
        <span className="scan-topbar-biz">Analyzing: <strong>{businessName}</strong></span>
      </div>

      <div className="scan-body">
        {/* Progress rail */}
        <aside className="scan-rail" aria-label="Analysis progress">
          <div className="rail-title">Soundings in progress</div>
          {SCAN_STAGES.map((s, i) => {
            const st = stageState(i)
            return (
              <div className={`rail-step ${st}`} key={s.id}>
                <span
                  className="rail-dot"
                  style={{
                    borderColor: s.color,
                    background: st === 'done' ? s.color : 'transparent',
                    color: st === 'done' ? '#fff' : s.color,
                  }}
                  aria-hidden="true"
                >
                  {st === 'done' ? '✓' : i + 1}
                </span>
                <span className="rail-label">
                  {s.title}
                  <div className="rail-sub">{s.sub}</div>
                </span>
              </div>
            )
          })}

          <div className="scan-counters" aria-live="polite">
            {SCAN_COUNTERS.map((c) => (
              <div className="counter" key={c.label}>
                <CountUp target={c.target} run={done || stageIdx >= c.startAtStage} />
                <div className="counter-label">{c.label}</div>
              </div>
            ))}
          </div>
        </aside>

        {/* Stage feed */}
        <div className="scan-feed" aria-live="polite">
          {SCAN_STAGES.map((s, i) => {
            const st = stageState(i)
            if (st === 'pending') return null
            const shown = st === 'done' ? s.findings.length : revealed
            return (
              <section className="scan-stage" key={s.id}>
                <div className="stage-head">
                  <span className="stage-chip" style={{ background: s.color }}>
                    {s.layer || '•'}
                  </span>
                  <span className="stage-title">{s.title}</span>
                  {st === 'active' && !done
                    ? <span className="stage-spinner" aria-label="running" />
                    : <span className="stage-check" aria-label="complete">✓</span>}
                </div>
                <p className="stage-sub">{s.sub}</p>

                {s.fourTests && (
                  <div className="four-tests" aria-label="The Four Tests">
                    {FOUR_TESTS.map((t, k) => {
                      const on = st === 'done' || testsOn > k
                      return (
                        <span className={`test-pill${on ? ' on' : ''}`} key={t.key}>
                          <span className="tp-check" aria-hidden="true">{on ? '✓' : '·'}</span>
                          {t.label}
                        </span>
                      )
                    })}
                  </div>
                )}

                {s.findings.map((f, fi) =>
                  fi < shown ? (
                    <div className="finding" style={{ borderLeftColor: s.color }} key={f}>
                      {f}
                    </div>
                  ) : st === 'active' && fi === shown ? (
                    <div className="finding-skel" key={`skel-${fi}`} aria-hidden="true" />
                  ) : null,
                )}
              </section>
            )
          })}

          {done && (
            <div className="scan-done">
              <h2>Your report is ready.</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 22 }}>
                6 risks found · 5 matched to live markets · 1 routed to non-market protection
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/report')}>
                View my risk report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
