import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBallast } from '../App'
import Logo from '../components/Logo'
import {
  BRAND, LAYERS, GRADES, FLOW_LABELS, TESTIMONIALS, BELIEFS, FAQS, VENUES,
  AUTOCOMPLETE_SUGGESTIONS,
} from '../data/demoData'

function ScanForm({ compact = false }) {
  const navigate = useNavigate()
  const { setBusinessName, setSignedUp, setScanComplete } = useBallast()
  const [value, setValue] = useState('')
  const [industry, setIndustry] = useState('')
  const [open, setOpen] = useState(false)
  const [hl, setHl] = useState(-1)
  const wrapRef = useRef(null)

  const matches = value.trim().length > 0
    ? AUTOCOMPLETE_SUGGESTIONS.filter((s) =>
        s.name.toLowerCase().includes(value.trim().toLowerCase()))
    : []
  const suggestions = matches.length > 0 ? matches : (value.trim() ? AUTOCOMPLETE_SUGGESTIONS : [])

  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const run = (name) => {
    const biz = (name || value).trim() || AUTOCOMPLETE_SUGGESTIONS[0].name
    setBusinessName(biz)
    setSignedUp(false)
    setScanComplete(false)
    navigate('/scan')
  }

  const onKeyDown = (e) => {
    if (!open || suggestions.length === 0) {
      if (e.key === 'Enter') { e.preventDefault(); run() }
      return
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHl((h) => (h + 1) % suggestions.length) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHl((h) => (h - 1 + suggestions.length) % suggestions.length) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      if (hl >= 0) { setValue(suggestions[hl].name); setOpen(false); run(suggestions[hl].name) }
      else run()
    } else if (e.key === 'Escape') setOpen(false)
  }

  return (
    <form
      className="scan-form"
      onSubmit={(e) => { e.preventDefault(); run() }}
      aria-label="Run a free risk scan"
    >
      <div className="scan-form-row">
        <div className="scan-input-wrap" ref={wrapRef}>
          <label className="visually-hidden" htmlFor={compact ? 'biz2' : 'biz'}>Business name</label>
          <input
            id={compact ? 'biz2' : 'biz'}
            className="scan-input"
            type="text"
            placeholder="Your business name…"
            autoComplete="off"
            value={value}
            onChange={(e) => { setValue(e.target.value); setOpen(true); setHl(-1) }}
            onFocus={() => value && setOpen(true)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={open && suggestions.length > 0}
            aria-controls="biz-listbox"
          />
          {open && suggestions.length > 0 && (
            <div className="autocomplete">
              <ul id="biz-listbox" role="listbox">
                {suggestions.map((s, i) => (
                  <li key={s.name} role="option" aria-selected={i === hl}>
                    <button
                      type="button"
                      className={i === hl ? 'hl' : ''}
                      onMouseEnter={() => setHl(i)}
                      onClick={() => { setValue(s.name); setOpen(false); run(s.name) }}
                    >
                      <span className="ac-name">{s.name}</span>
                      <span className="ac-detail">{s.detail}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="scan-industry-wrap">
          <label className="visually-hidden" htmlFor={compact ? 'ind2' : 'ind'}>Industry or location (optional)</label>
          <input
            id={compact ? 'ind2' : 'ind'}
            className="scan-industry"
            type="text"
            placeholder="Industry / location (optional)"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />
        </div>
      </div>
      <button type="submit" className="btn btn-primary">Run my free risk scan</button>
      <p className="scan-form-hint">
        Takes about 20 seconds. No card required. Try “Meadowlands” to see the demo business.
      </p>
    </form>
  )
}

function Pipeline() {
  const steps = [LAYERS.L1, LAYERS.L2, LAYERS.L3, LAYERS.L4]
  const flowLabel = (i) => (i === 1 ? FLOW_LABELS.l2ToL3 : i === 2 ? FLOW_LABELS.l3ToL4 : null)
  return (
    <div className="pipeline">
      {steps.map((layer, i) => (
        <React.Fragment key={layer.id}>
          <div className="pipeline-step">
            <div className="pipeline-card" style={{ borderTopColor: layer.color }}>
              <span className="layer-tag" style={{ background: layer.color }}>{layer.id}</span>
              <h3 style={{ marginTop: 10 }}>{layer.name}</h3>
              <p className="pl-q">“{layer.question}”</p>
              {layer.id === 'L4' ? (
                <ul>
                  {Object.entries(GRADES).map(([g, v]) => (
                    <li key={g}>
                      <strong style={{ color: v.color }}>{g}</strong> — {v.meaning}
                    </li>
                  ))}
                </ul>
              ) : (
                <ul>
                  {layer.items.slice(0, 6).map((it) => (
                    <li key={it.name}>
                      <strong>{it.name}</strong>{it.detail ? ` — ${it.detail}` : ''}
                    </li>
                  ))}
                  {layer.items.length > 6 && <li>+ {layer.items.length - 6} more</li>}
                </ul>
              )}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div className="pipeline-flow" aria-hidden="true">
              <span className="pipeline-flow-label">
                {flowLabel(i) && <span>{flowLabel(i)}</span>}
                <span style={{ fontSize: 18, color: 'var(--ink-faint)' }}>→</span>
              </span>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(0)
  return (
    <main>
      <header className="landing-header">
        <Link to="/" className="brand"><Logo size={24} /> {BRAND}</Link>
        <div className="landing-header-actions">
          <a className="btn btn-ghost btn-sm" href="#scan" onClick={(e) => e.preventDefault()}>Sign in</a>
          <a className="btn btn-navy btn-sm" href="#top-scan">Run my free risk scan</a>
        </div>
      </header>

      {/* Hero */}
      <section className="hero container" id="top-scan">
        <span className="hero-kicker">Risk discovery &amp; hedging for small business</span>
        <h1>
          Know what could sink your business — <em>and hedge it for pennies on the dollar.</em>
        </h1>
        <p className="hero-sub">
          {BRAND} finds the recessions, storms, rate moves, and one-off events hiding in your
          P&amp;L, then matches each one to real, tradeable contracts on regulated markets.
          Where insurance ends, {BRAND} begins.
        </p>
        <ScanForm />
      </section>

      {/* How it works */}
      <section className="section section-alt">
        <div className="container">
          <h2>How the scan works</h2>
          <p className="section-lede">
            Every report is built by walking four layers of our Event-Driver Decomposition
            framework — from the line items it would hurt, to the exact contract that pays
            when it happens.
          </p>
          <Pipeline />
        </div>
      </section>

      {/* Proof wall */}
      <section className="section">
        <div className="container">
          <h2>Owners who hedged before it happened</h2>
          <p className="section-lede">Concrete outcomes from businesses like yours. (Illustrative.)</p>
          <div className="proof-grid">
            {TESTIMONIALS.map((t) => (
              <figure className="proof-card" key={t.name} style={{ margin: 0 }}>
                <blockquote>{t.quote}</blockquote>
                <figcaption>
                  <div className="proof-name">{t.name}</div>
                  <div className="proof-role">{t.role}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Venue strip */}
      <section className="venue-strip">
        <div className="venue-strip-inner">
          <span className="venue-strip-label">Hedges executed on</span>
          {VENUES.map((v) => (
            <span className="venue-wordmark" key={v.id} title={v.desc}>{v.name}</span>
          ))}
        </div>
      </section>

      {/* Beliefs */}
      <section className="section beliefs">
        <div className="container">
          <h2>Beliefs that guide our company</h2>
          <p className="section-lede">Why we built {BRAND}, and where we draw the line.</p>
          <div className="beliefs-grid">
            {BELIEFS.map((b, i) => (
              <div className="belief-card" key={b.title}>
                <div className="belief-num">BELIEF {String(i + 1).padStart(2, '0')}</div>
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container">
          <h2>Fair questions</h2>
          <p className="section-lede">Asked by every skeptical owner we talk to. Answered plainly.</p>
          <div className="faq-list">
            {FAQS.map((f, i) => (
              <div className="faq-item" key={f.q}>
                <button
                  className="faq-q"
                  aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                >
                  {f.q}
                  <span className="faq-icon" aria-hidden="true">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <p className="faq-a">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta section-alt">
        <div className="container">
          <h2>See what’s below your waterline.</h2>
          <p className="section-lede" style={{ margin: '0 auto 30px' }}>
            The scan is free, takes 20 seconds, and tells you honestly when a risk can’t be hedged.
          </p>
          <ScanForm compact />
        </div>
      </section>
    </main>
  )
}
