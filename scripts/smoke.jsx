// Dev-only smoke test: renders every route in jsdom and reports crashes.
import React from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { JSDOM } from 'jsdom'
import App from '../src/App.jsx'

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
})
global.window = dom.window
global.document = dom.window.document
window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {} }))
window.scrollTo = () => {}
global.SVGElement = dom.window.SVGElement

const routes = ['/', '/scan', '/report', '/hedge']
let failed = 0

for (const route of routes) {
  const el = document.createElement('div')
  document.body.appendChild(el)
  try {
    const root = createRoot(el)
    await new Promise((resolve, reject) => {
      try {
        root.render(
          <MemoryRouter initialEntries={[route]}>
            <App />
          </MemoryRouter>,
        )
        setTimeout(resolve, 300)
      } catch (e) { reject(e) }
    })
    const text = el.textContent || ''
    if (text.length < 20) throw new Error(`route rendered almost nothing (${text.length} chars)`)
    console.log(`OK  ${route}  (${text.length} chars rendered)`)
    root.unmount()
  } catch (e) {
    failed++
    console.error(`FAIL ${route}:`, e.message)
  }
}
process.exit(failed ? 1 : 0)
