# Ballast — clickable website mockup

High-fidelity, multi-screen React SPA mockup for **Ballast**, a risk-discovery and hedging
platform for SMBs. Everything is simulated — no backend, no real APIs, auth, or market data.

"Ballast" is a working name: change `BRAND` in `src/data/demoData.js` to rebrand the whole site.

## Run it

```bash
npm install
npm run dev        # → http://localhost:5173
```

Production build: `npm run build && npm run preview`.

## The demo story

1. On `/`, type **"Meadowlands"** in the hero input and pick **Meadowlands Grand Hotel** from
   the autocomplete (or type anything and hit "Run my free risk scan").
2. `/scan` runs the staged analysis pipeline (~20 s; near-instant with reduced motion enabled).
3. "View my risk report" → `/report` renders blurred behind the **signup gate**. Submit
   anything (or "Continue with Google") to unlock.
4. In the report, click **"Add to hedge plan"** on graded risks, then **"Build my hedge plan →"**.
5. On `/hedge`, connect venues (fake OAuth), edit position sizes, toggle
   **"Simulate: recession hits"**, then **"Place hedges"** → confirm → success state.

## Screen map

| Route | File | What it is |
|---|---|---|
| `/` | `src/screens/Landing.jsx` | Hero + business-name autocomplete, 4-layer pipeline explainer, proof wall, venue strip, founder beliefs, FAQ, final CTA |
| `/scan` | `src/screens/Scan.jsx` | Full-screen staged pipeline run: progress rail, running counters, streaming findings, Four-Tests checkmarks |
| `/report` (gated) | `src/screens/Report.jsx` | Signup modal over blurred report; score dial, risk register with filters/sort, watchlist, non-market routing |
| `/hedge` | `src/screens/Hedge.jsx` | Venue connect tiles + fake OAuth, editable hedge-plan table, waterline coverage meter, recession simulation, place-hedges flow, persistent disclaimer band |

Shared: `src/App.jsx` (routes + app state via context), `src/components/Nav.jsx` (persists on
report/hedge, shows demo business), `Footer.jsx` (compliance disclaimer, on every screen except
`/scan`), `Logo.jsx` (Plimsoll load-line mark), `src/styles.css` (design system).

**All content and figures live in `src/data/demoData.js`** — framework layers and colors,
grades, the six demo risks, watchlist, testimonials, beliefs, FAQ, scan stages, counters.

## Framework color coding (functional — do not repurpose)

- Layers: L1 Impact Channel `#1a5276` · L2 Causal Domain `#6c3483` · L3 Triggering Events
  `#8B6914` · L4 Basis Grade `#1e8449`
- Grades: Tight `#1e8449` · Moderate `#b8860b` · Loose `#c0392b` · None `#666`

## Every simulated element (what to build for real later)

**Landing**
- Business-name autocomplete — hardcoded 4 suggestions (`AUTOCOMPLETE_SUGGESTIONS`); real version needs a business-lookup API
- Industry/location field — collected, unused
- "Sign in" button — inert
- All 7 testimonials, all dollar outcomes — invented
- Venue wordmarks — text placeholders, not licensed logos

**Scan**
- Entire pipeline — `setTimeout` choreography over hardcoded stage findings (`SCAN_STAGES`); no analysis happens
- Counters (14 candidate events / 6 markets / 1 unhedgeable) — hardcoded targets with count-up animation
- Four-Tests checkmarks — timed reveals, not real test evaluation

**Report**
- Signup gate — accepts any input incl. empty; "Continue with Google" is a plain button; no account is created
- Risk Score (62/100), $775K exposure, all six risks, contracts, prices, liquidity notes — hardcoded
- Basis grades and sizing guidance — hardcoded per risk
- Watchlist row — hardcoded

**Hedge**
- Venue "Connect" OAuth modal — pure UI; no venue is contacted
- Contract prices (30¢/12¢/22¢/45¢/58¢) — static; real version needs live order books
- Max payout = size ÷ price; fees = flat 1.7% estimate (`FEE_RATE`) — placeholder economics
- Recession simulation — only the recession risk pays out; single hardcoded scenario
- "Place hedges" → confirmation → success — no orders exist; venue routing summary is derived from the plan client-side
- Coverage waterline — computed from the simulated plan

**Global**
- No persistence: refresh resets plan, signup, and connections (in-memory React state)
- No real compliance review — footer/band language is draft copy

## Accessibility notes

Semantic headings per screen, visible focus rings, `aria-live` on the scan feed,
`role="switch"`/`role="combobox"` where applicable, and full `prefers-reduced-motion`
support (scan collapses to a fast, low-motion run). Desktop-first, holds up at 375 px.

## Dev extras

`scripts/smoke.jsx` — jsdom smoke test that renders all four routes
(`npx esbuild scripts/smoke.jsx --bundle --format=esm --jsx=automatic --platform=node --external:jsdom --outfile=scripts/smoke.bundle.mjs && node scripts/smoke.bundle.mjs`).
