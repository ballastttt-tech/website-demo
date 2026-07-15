import React, { createContext, useContext, useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Landing from './screens/Landing'
import Scan from './screens/Scan'
import Report from './screens/Report'
import Hedge from './screens/Hedge'
import Nav from './components/Nav'
import Footer from './components/Footer'
import { DEMO_BUSINESS, RISKS } from './data/demoData'

const BallastContext = createContext(null)
export const useBallast = () => useContext(BallastContext)

export default function App() {
  const [businessName, setBusinessName] = useState(DEMO_BUSINESS.name)
  const [signedUp, setSignedUp] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  // plan: { [riskId]: { size } } — size = premium spent, editable in /hedge
  const [plan, setPlan] = useState({})
  const [connections, setConnections] = useState({
    kalshi: false, polymarket: false, coinbase: false,
  })

  const addToPlan = (riskId) => {
    const risk = RISKS.find((r) => r.id === riskId)
    if (!risk || !risk.suggested) return
    setPlan((p) => ({ ...p, [riskId]: { size: risk.suggested.cost } }))
  }
  const removeFromPlan = (riskId) =>
    setPlan((p) => { const q = { ...p }; delete q[riskId]; return q })
  const setPlanSize = (riskId, size) =>
    setPlan((p) => ({ ...p, [riskId]: { size } }))

  const ctx = {
    businessName, setBusinessName,
    signedUp, setSignedUp,
    scanComplete, setScanComplete,
    plan, addToPlan, removeFromPlan, setPlanSize,
    connections, setConnections,
  }

  const { pathname } = useLocation()
  const showNav = pathname === '/report' || pathname === '/hedge'
  const showFooter = pathname !== '/scan'

  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return (
    <BallastContext.Provider value={ctx}>
      {showNav && <Nav />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/report" element={<Report />} />
        <Route path="/hedge" element={<Hedge />} />
        <Route path="*" element={<Landing />} />
      </Routes>
      {showFooter && <Footer />}
    </BallastContext.Provider>
  )
}
