import React from 'react'
import TopAppBar from './components/TopAppBar'
import Hero from './components/Hero'
import MatchOutcomeEngine from './components/MatchOutcomeEngine'
import SpatialXGAnalytics from './components/SpatialXGAnalytics'
import PenaltySimulator from './components/PenaltySimulator'
import Footer from './components/Footer'

function App() {
  return (
    <div className="dark bg-background text-on-background min-h-screen flex flex-col font-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container relative">
      {/* Ambient depth glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-[radial-gradient(circle_at_center,_rgba(0,255,133,0.05)_0%,_transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_rgba(0,224,255,0.05)_0%,_transparent_70%)]" />
      </div>

      <TopAppBar />
      <Hero />
      <MatchOutcomeEngine />
      <SpatialXGAnalytics />
      <PenaltySimulator />
      <Footer />
    </div>
  )
}

export default App
