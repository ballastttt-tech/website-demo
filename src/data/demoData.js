// ─────────────────────────────────────────────────────────────
// Ballast — single source of truth for all simulated data.
// Everything in this file is hardcoded and illustrative.
// ─────────────────────────────────────────────────────────────

export const BRAND = 'Ballast';
export const TAGLINE = 'Know what could sink your business — and hedge it for pennies on the dollar.';

export const DISCLAIMER =
  `${BRAND} is not an insurance carrier, broker-dealer, or investment adviser. ` +
  'Event contracts involve risk and can lose their full value. All figures shown are illustrative.';

// ── The four-layer Event-Driver Decomposition framework ──────
export const LAYERS = {
  L1: {
    id: 'L1',
    name: 'Impact Channel',
    color: '#1a5276',
    question: 'How does it hurt your P&L?',
    items: [
      { name: 'Revenue/Demand', detail: 'occupancy, ADR, cancellations, booking volume' },
      { name: 'Cost/Margin', detail: 'labor, supplies, energy, insurance premiums' },
      { name: 'Asset/Property', detail: 'physical damage, depreciation, impairment' },
      { name: 'Liability/Compliance', detail: 'fines, lawsuits, regulatory costs' },
      { name: 'Capital/Liquidity', detail: 'refinancing, cash-flow timing, capex pressure' },
      { name: 'Reputation', detail: 'reviews, trust erosion, churn' },
    ],
  },
  L2: {
    id: 'L2',
    name: 'Causal Domain',
    color: '#6c3483',
    question: 'What category of force drives the impact? (PESTLE/COSO scan)',
    items: [
      { name: 'Macroeconomic' }, { name: 'Environmental' }, { name: 'Political/Regulatory' },
      { name: 'Geopolitical' }, { name: 'Competitive' }, { name: 'Event-Dependent' },
      { name: 'Technological' }, { name: 'Operational' },
    ],
  },
  L3: {
    id: 'L3',
    name: 'Triggering Events',
    color: '#8B6914',
    question: 'Decompose each risk into specific, observable, tradeable events.',
    items: [
      { name: 'Observable', detail: 'tied to an authoritative source — BLS, Fed, NHC, FIFA' },
      { name: 'Binary/Bounded', detail: 'yes/no or above/below a threshold' },
      { name: 'Time-Bound', detail: 'resolves on a known date' },
      { name: 'Market Exists', detail: 'liquid contract with volume to enter and exit' },
    ],
  },
  L4: {
    id: 'L4',
    name: 'Basis Risk Grade',
    color: '#1e8449',
    question: 'How well does the contract payout match your actual business loss?',
    items: [],
  },
};

export const FLOW_LABELS = { l2ToL3: 'DECOMPOSE', l3ToL4: 'ASSESS FIT' };

export const GRADES = {
  Tight: {
    color: '#1e8449',
    meaning: 'Contract outcome is a direct, proximate cause of your loss.',
    sizing: 'Size aggressively relative to estimated loss.',
    example: 'Hurricane-landfall contract when your property is in the flood zone.',
  },
  Moderate: {
    color: '#b8860b',
    meaning: 'Strongly correlated but mediated by other factors.',
    sizing: 'Size conservatively — hedge 30–60% of exposure.',
    example: 'Recession contract → lower hotel occupancy, but not deterministic.',
  },
  Loose: {
    color: '#c0392b',
    meaning: 'One contributing factor among many.',
    sizing: 'Supplementary protection only, not the primary hedge.',
    example: 'Team elimination → maybe fewer fans, but substitution effects unknown.',
  },
  None: {
    color: '#666666',
    meaning: 'No causal link to any available contract.',
    sizing: 'Use insurance, operational controls, or cash reserves.',
    example: '',
  },
};

// ── Demo business ────────────────────────────────────────────
export const DEMO_BUSINESS = {
  name: 'Meadowlands Grand Hotel',
  location: 'East Rutherford, NJ',
  industry: 'Independent hotel · 220 rooms',
  revenue: '$14M annual revenue',
  note: 'Adjacent to MetLife Stadium',
};

export const AUTOCOMPLETE_SUGGESTIONS = [
  { name: 'Meadowlands Grand Hotel', detail: 'Hotel · East Rutherford, NJ' },
  { name: 'Meadowbrook Diner', detail: 'Restaurant · Nutley, NJ' },
  { name: 'Meadow Lane Landscaping', detail: 'Landscaping · Hackensack, NJ' },
  { name: 'Grand Meadows Event Barn', detail: 'Event venue · Warwick, NY' },
];

export const RISK_SCORE = 62; // out of 100
export const TOTAL_EXPOSURE = 775000; // modeled 12-month exposure

// ── Risk register ────────────────────────────────────────────
// suggested.cost → suggested.maxPayout at contract price; all illustrative.
export const RISKS = [
  {
    id: 'recession',
    name: 'Recession-driven demand drop',
    exposure: 180000,
    l1: ['Revenue/Demand', 'Cost/Margin'],
    l2: 'Macroeconomic',
    trigger: {
      question: 'Will the NBER declare a U.S. recession in 2026?',
      source: 'NBER',
    },
    tests: { observable: true, binary: true, timeBound: true, marketExists: true },
    contract: {
      venue: 'Kalshi',
      name: 'US recession in 2026',
      side: 'Yes',
      price: 0.30,
      liquidity: 'Deep book — $2.1M open interest',
    },
    grade: 'Moderate',
    sizingNote:
      'Transmission is imperfect — market mix and the event calendar mediate the hit. Hedge 30–60% of exposure.',
    suggested: { cost: 10000, maxPayout: 33000, coveragePct: 18 },
  },
  {
    id: 'hurricane',
    name: 'Hurricane / major storm landfall (Aug–Oct)',
    exposure: 250000,
    l1: ['Asset/Property', 'Revenue/Demand'],
    l2: 'Environmental',
    trigger: {
      question: 'Hurricane landfall in the NY/NJ zone this season?',
      source: 'NHC/NOAA',
    },
    tests: { observable: true, binary: true, timeBound: true, marketExists: true },
    contract: {
      venue: 'Kalshi',
      name: 'NY/NJ hurricane landfall — 2026 season',
      side: 'Yes',
      price: 0.12,
      liquidity: 'Seasonal contract — liquid Jun–Nov',
    },
    grade: 'Tight',
    sizingNote:
      'Property sits in the surge-adjacent zone — contract outcome is a proximate cause of loss. Size aggressively.',
    suggested: { cost: 22000, maxPayout: 183000, coveragePct: 73 },
  },
  {
    id: 'cpi',
    name: 'Cost-inflation squeeze',
    exposure: 90000,
    l1: ['Cost/Margin'],
    l2: 'Macroeconomic',
    trigger: {
      question: 'Will CPI exceed 4% in July?',
      source: 'BLS',
    },
    tests: { observable: true, binary: true, timeBound: true, marketExists: true },
    contract: {
      venue: 'Kalshi',
      name: 'CPI above 4.0% — July bracket',
      side: 'Yes',
      price: 0.22,
      liquidity: 'Monthly series — moderate volume',
    },
    grade: 'Moderate',
    sizingNote:
      'CPI is a proxy for your supplier and labor costs, not a direct match. Hedge 30–60% of exposure.',
    suggested: { cost: 6000, maxPayout: 27300, coveragePct: 30 },
  },
  {
    id: 'refi',
    name: 'Refinancing risk on 2027 balloon',
    exposure: 120000,
    l1: ['Capital/Liquidity'],
    l2: 'Macroeconomic',
    trigger: {
      question: 'Fed rate cut before December?',
      source: 'Federal Reserve',
    },
    tests: { observable: true, binary: true, timeBound: true, marketExists: true },
    contract: {
      venue: 'Kalshi / Polymarket US',
      name: 'Fed rate cut before December',
      side: 'No',
      price: 0.45,
      liquidity: 'Very liquid — flagship macro market',
    },
    grade: 'Moderate',
    sizingNote:
      'Rates drive your refi cost, but spreads and lender appetite also matter. Size conservatively.',
    suggested: { cost: 9000, maxPayout: 20000, coveragePct: 17 },
  },
  {
    id: 'worldcup',
    name: 'World Cup demand shortfall',
    exposure: 60000,
    l1: ['Revenue/Demand'],
    l2: 'Event-Dependent',
    trigger: {
      question: 'USA eliminated before the Final?',
      source: 'FIFA',
    },
    tests: { observable: true, binary: true, timeBound: true, marketExists: true },
    contract: {
      venue: 'Kalshi / Polymarket US',
      name: 'USA eliminated before the Final',
      side: 'Yes',
      price: 0.58,
      liquidity: 'High volume through tournament',
    },
    grade: 'Loose',
    sizingNote:
      'Supplementary only — substitution effects unknown (other fans still book rooms near the stadium).',
    suggested: { cost: 2900, maxPayout: 5000, coveragePct: 8 },
  },
  {
    id: 'reputation',
    name: 'Viral reputation event / key-staff loss',
    exposure: 75000,
    l1: ['Reputation', 'Cost/Margin'],
    l2: 'Operational',
    trigger: {
      question: 'No observable, tradeable trigger exists for this risk.',
      source: '—',
    },
    tests: { observable: false, binary: false, timeBound: false, marketExists: false },
    contract: null,
    grade: 'None',
    sizingNote: 'No causal link to any available contract — route to non-market protection.',
    suggested: null,
    nonMarket: [
      {
        title: 'Reputation-monitoring SOP',
        detail: 'Daily review alerts + a written 24-hour response protocol for the front desk and GM.',
      },
      {
        title: 'Key-person insurance quote',
        detail: 'Traditional coverage for GM and executive chef — we can point you to three brokers.',
      },
      {
        title: '6-week cash reserve',
        detail: 'Hold ~$95K liquid to absorb a booking trough while reviews recover.',
      },
    ],
  },
];

// ── Watchlist (breadth demo — not sized for this business) ──
export const WATCHLIST = [
  {
    question: 'China–Taiwan clash before 2027?',
    venue: 'Polymarket US',
    price: 0.14,
    grade: 'Loose',
    note: 'Loose fit for supply-chain-heavy businesses. N/A for this hotel — shown for breadth.',
  },
];

// ── Venues ───────────────────────────────────────────────────
export const VENUES = [
  { id: 'kalshi', name: 'Kalshi', desc: 'CFTC-regulated event exchange' },
  { id: 'polymarket', name: 'Polymarket US', desc: 'Regulated US prediction market' },
  { id: 'coinbase', name: 'Coinbase', desc: 'Event contracts via Coinbase' },
];

// ── Landing page content ─────────────────────────────────────
export const TESTIMONIALS = [
  {
    quote: 'Hedged $180K of recession exposure for $6,200. When the slowdown hit our corporate bookings, the contract paid before our lender even called.',
    name: 'Dana Okafor',
    role: 'GM, Harborview Hotel — Portsmouth, NH',
  },
  {
    quote: 'Our storm-season hedge paid out 3 days after landfall. Insurance took 7 months on the same event.',
    name: 'Sal Marino',
    role: 'Owner, Marino’s Marina — Barnegat, NJ',
  },
  {
    quote: 'We run four restaurants. The CPI bracket hedge covered a third of our food-cost spike last summer — $21K payout on a $4,800 position.',
    name: 'Priya Raman',
    role: 'CFO, Fig & Iron Restaurant Group — Philadelphia, PA',
  },
  {
    quote: 'A drought contract sounds abstract until it pays for the crew you didn’t have to lay off.',
    name: 'Marcus Bell',
    role: 'Owner, Bellgreen Landscaping — Cherry Hill, NJ',
  },
  {
    quote: 'Ballast told us one of our risks was unhedgeable and sent us to an insurance broker instead. That honesty is why we trust the ones it does hedge.',
    name: 'Ellen Zhao',
    role: 'Owner, The Fern Room Event Venue — Beacon, NY',
  },
  {
    quote: 'Fed didn’t cut, our refi got expensive — and the No-side contract we held paid $18K against it. First time a macro headline worked for us.',
    name: 'Tom Reyes',
    role: 'Owner, Reyes Hardware (3 locations) — Trenton, NJ',
  },
  {
    quote: 'The report found a World Cup exposure we hadn’t priced at all. We hedged it for less than one night’s comped suite.',
    name: 'Ingrid Bauer',
    role: 'Revenue Manager, Hotel Vasa — Jersey City, NJ',
  },
];

export const BELIEFS = [
  {
    title: 'Small businesses carry big-company risks with none of the tools.',
    body: 'A Fortune 500 hotel chain hedges rates, weather, and demand as a matter of course. A 220-room independent carries the same exposures and, until now, could only buy insurance — which covers damage, not demand. We exist to close that gap.',
  },
  {
    title: 'Honesty about basis risk is the product.',
    body: 'A hedge that doesn’t match your loss is a lottery ticket. We grade every match — Tight, Moderate, Loose — and when there’s no real link, we say "None" and route you to insurance or reserves. We’d rather lose the trade than your trust.',
  },
  {
    title: 'Protection should cost pennies on the dollar, and you should see every penny.',
    body: 'Every position we suggest shows the cost, the fees, and the maximum loss next to the maximum payout. If the math doesn’t make sense for your business, the right answer is not to hedge — and the product will tell you so.',
  },
];

export const FAQS = [
  {
    q: 'Is this insurance?',
    a: 'No. Insurance indemnifies you for a proven loss after adjustment. Event contracts pay a fixed amount when a public, observable event resolves — fast, but not tied to your actual loss amount. Ballast is designed to complement insurance, not replace it, and we route unhedgeable risks to insurance recommendations.',
  },
  {
    q: 'Is this gambling?',
    a: 'The same contract can be a gamble or a hedge — the difference is whether you hold the underlying risk. A hotelier buying a hurricane contract on their own coastline is transferring a risk they already have, which is the textbook definition of hedging. We only suggest positions against risks our analysis finds in your business, and we cap suggested sizing against your modeled exposure.',
  },
  {
    q: 'What if there’s no market for my risk?',
    a: 'Then we tell you. Every risk gets a basis grade, and "None" means no liquid contract has a real causal link to your loss. Those risks route to non-market recommendations: insurance quotes, operational controls, or cash reserves. In our demo report, one of six risks is unhedgeable — that’s typical.',
  },
  {
    q: 'Where do the hedges actually execute?',
    a: 'On regulated venues — Kalshi, Polymarket US, and Coinbase. Ballast analyzes, sizes, and routes; the contracts, custody, and settlement live with the venue. You connect your own accounts and approve every order.',
  },
  {
    q: 'Can I lose money?',
    a: 'Yes. If the event doesn’t happen, the contract expires worthless and you lose the premium — like an insurance premium you paid for a year with no claim. Every position we show includes the maximum loss alongside the maximum payout. Never hedge with money you need for operations.',
  },
  {
    q: 'How much does Ballast cost?',
    a: 'The risk scan and report are free. If you execute hedges through Ballast, we charge a flat routing fee shown on every order before you confirm — no percentage of payout, no hidden spread.',
  },
];

// ── /scan pipeline stages ────────────────────────────────────
export const SCAN_STAGES = [
  {
    id: 'profile',
    layer: null,
    color: '#4a6a8a',
    title: 'Profiling your business',
    sub: 'Industry, location, seasonality, customer mix, revenue drivers',
    findings: [
      'Independent hotel · 220 rooms · East Rutherford, NJ',
      'Adjacent to MetLife Stadium — event-driven demand mix',
      '~$14M annual revenue · seasonality peaks Aug–Oct',
      'Customer mix: 55% leisure/event · 30% corporate · 15% group',
    ],
  },
  {
    id: 'l1',
    layer: 'L1',
    color: '#1a5276',
    title: 'L1 · Mapping impact channels',
    sub: 'Which P&L lines are exposed',
    findings: [
      'Revenue/Demand — occupancy, ADR, cancellations',
      'Cost/Margin — labor, supplies, energy',
      'Asset/Property — storm and flood exposure',
      'Capital/Liquidity — 2027 balloon refinancing',
      'Reputation — review-driven demand',
    ],
  },
  {
    id: 'l2',
    layer: 'L2',
    color: '#6c3483',
    title: 'L2 · Scanning causal domains',
    sub: 'PESTLE/COSO sweep of the forces that drive those impacts',
    findings: [
      'Macroeconomic — recession, CPI, rate path',
      'Environmental — Atlantic hurricane season',
      'Event-Dependent — World Cup at MetLife Stadium',
      'Operational — key staff, reputation events',
      'Geopolitical — screened, low relevance for this profile',
    ],
  },
  {
    id: 'l3',
    layer: 'L3',
    color: '#8B6914',
    title: 'L3 · Decomposing into triggering events',
    sub: 'Applying the Four Tests to each candidate event',
    findings: [
      '“Will the NBER declare a U.S. recession in 2026?” (NBER)',
      '“Hurricane landfall in the NY/NJ zone this season?” (NHC/NOAA)',
      '“Will CPI exceed 4% in July?” (BLS)',
      '“Fed rate cut before December?” (Federal Reserve)',
      '“USA eliminated before the Final?” (FIFA)',
    ],
    fourTests: true,
  },
  {
    id: 'l4',
    layer: 'L4',
    color: '#1e8449',
    title: 'L4 · Matching markets & grading basis risk',
    sub: 'Searching Kalshi / Polymarket US for live contracts, grading fit',
    findings: [
      'Kalshi · US recession in 2026 · Yes @ 30¢ — Moderate',
      'Kalshi · NY/NJ hurricane landfall · Yes @ 12¢ — Tight',
      'Kalshi · CPI above 4.0% (July) · Yes @ 22¢ — Moderate',
      'Kalshi/Polymarket · Fed cut before Dec · No @ 45¢ — Moderate',
      'Kalshi/Polymarket · USA out before Final · Yes @ 58¢ — Loose',
      'Reputation/key-staff risk — no market → non-market recommendations',
    ],
  },
  {
    id: 'compile',
    layer: null,
    color: '#4a6a8a',
    title: 'Compiling your risk report',
    sub: 'Scoring, sizing guidance, and non-market routing',
    findings: [
      'Business Risk Score: 62/100',
      'Modeled 12-month exposure: $775,000',
      '5 of 6 risks matched to live contracts',
    ],
  },
];

export const SCAN_COUNTERS = [
  { label: 'candidate events found', target: 14, startAtStage: 3 },
  { label: 'liquid markets matched', target: 6, startAtStage: 4 },
  { label: 'risk unhedgeable → routed to non-market recs', target: 1, startAtStage: 4 },
];

// ── Formatting helpers ───────────────────────────────────────
export const fmtUSD = (n, opts = {}) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0, ...opts });

export const fmtCents = (p) => `${Math.round(p * 100)}¢`;

export const FEE_RATE = 0.017; // illustrative flat routing + venue fee estimate
