import React, { useState, useEffect } from 'react'

export default function PenaltySimulator() {
  const [kicker, setKicker] = useState('K. MBAPPE')
  const [keeper, setKeeper] = useState('T. COURTOIS')
  const [probabilities, setProbabilities] = useState([
    { quadrant: 0, score_probability: 0.73, save_probability: 0.16, miss_probability: 0.11 },
    { quadrant: 1, score_probability: 0.75, save_probability: 0.24, miss_probability: 0.01 },
    { quadrant: 2, score_probability: 0.79, save_probability: 0.20, miss_probability: 0.01 },
    { quadrant: 3, score_probability: 0.74, save_probability: 0.25, miss_probability: 0.01 },
    { quadrant: 4, score_probability: 0.69, save_probability: 0.31, miss_probability: 0.00 },
    { quadrant: 5, score_probability: 0.65, save_probability: 0.33, miss_probability: 0.02 }
  ])
  const [loading, setLoading] = useState(false)

  const fetchPenaltyPredictions = async (kName, gName) => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/predict/penalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kicker_name: kName,
          keeper_name: gName
        })
      })

      if (!res.ok) throw new Error('Failed to fetch penalty prediction')
      const data = await res.json()
      setProbabilities(data.results)
    } catch (err) {
      console.error('Error fetching penalty simulation:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch initial predictions on load
  useEffect(() => {
    fetchPenaltyPredictions(kicker, keeper)
  }, [])

  const handleKickerChange = (val) => {
    setKicker(val)
    fetchPenaltyPredictions(val, keeper)
  }

  const handleKeeperChange = (val) => {
    setKeeper(val)
    fetchPenaltyPredictions(kicker, val)
  }

  // Map 6 quadrants to grid elements:
  // indices: 0=top-left, 1=top-centre, 2=top-right, 3=bot-left, 4=bot-centre, 5=bot-right
  const getZoneDetails = (qIdx) => {
    const prob = probabilities.find((p) => p.quadrant === qIdx) || {
      score_probability: 0.7,
      save_probability: 0.2,
      miss_probability: 0.1
    }

    // Determine type: if score probability > 0.72, classify as high score zone
    const isScoreZone = prob.score_probability > 0.72
    const scorePct = Math.round(prob.score_probability * 100)
    const savePct = Math.round(prob.save_probability * 100)

    return {
      label: isScoreZone ? `${scorePct}% SCORE` : `${savePct}% SAVE`,
      type: isScoreZone ? 'score' : 'save',
      details: `G:${scorePct}% | S:${savePct}% | M:${Math.round(prob.miss_probability * 100)}%`
    }
  }

  return (
    <section id="penalty" className="relative z-20 py-12 lg:py-16">
      <div className="max-w-max-width mx-auto px-4 sm:px-6 lg:px-margin-desktop">

        {/* Section Header */}
        <div className="mb-8 lg:mb-12">
          <h2 className="font-display-lg text-headline-lg uppercase tracking-tighter text-on-background drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            PENALTY SIMULATOR ENGINE
          </h2>
          <div className="w-48 h-[2px] bg-secondary-container shadow-[0_0_15px_#00e0ff] mt-2" />
        </div>

        <div className="bg-[#09090b] neoclassical-frame">
          <div className="neoclassical-inner p-6 lg:p-8">

            {/* Player Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 lg:mb-12">
              <div>
                <label className="block font-label-caps text-label-caps text-secondary-container uppercase mb-2">
                  Select Kicker
                </label>
                <div className="relative">
                  <select
                    value={kicker}
                    onChange={(e) => handleKickerChange(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant text-on-background font-label-caps text-label-caps py-4 px-4 focus:outline-none focus:border-secondary-container transition-all cursor-pointer"
                  >
                    <option value="K. MBAPPE">K. MBAPPE</option>
                    <option value="H. KANE">H. KANE</option>
                    <option value="L. MESSI">L. MESSI</option>
                    <option value="C. RONALDO">C. RONALDO</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-container" style={{ fontSize: '20px' }}>expand_more</span>
                </div>
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-secondary-container uppercase mb-2">
                  Select Keeper
                </label>
                <div className="relative">
                  <select
                    value={keeper}
                    onChange={(e) => handleKeeperChange(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant text-on-background font-label-caps text-label-caps py-4 px-4 focus:outline-none focus:border-secondary-container transition-all cursor-pointer"
                  >
                    <option value="T. COURTOIS">T. COURTOIS</option>
                    <option value="M. MAIGNAN">M. MAIGNAN</option>
                    <option value="E. MARTINEZ">E. MARTINEZ</option>
                    <option value="A. ONANA">A. ONANA</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-container" style={{ fontSize: '20px' }}>expand_more</span>
                </div>
              </div>
            </div>

            {/* Goal Mesh */}
            <div
              className={`relative w-full border-x-4 border-t-4 border-secondary-fixed shadow-[0_0_30px_rgba(0,224,255,0.3)] bg-pitch-green-dark overflow-hidden rounded-t-lg transition-opacity duration-200 ${
                loading ? 'opacity-60' : 'opacity-100'
              }`}
              style={{ aspectRatio: '21/8' }}
            >
              {/* Grid overlay */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-2">
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const zone = getZoneDetails(idx)
                  return (
                    <div
                      key={idx}
                      className={`group relative border border-secondary-container border-opacity-20 cursor-crosshair flex flex-col items-center justify-center transition-all duration-200 ${
                        zone.type === 'score'
                          ? 'hover:bg-danger-red hover:bg-opacity-20'
                          : 'hover:bg-secondary-container hover:bg-opacity-20'
                      }`}
                    >
                      {/* Main label showing score/save rate */}
                      <span
                        className={`font-stat-sm text-stat-sm skew-x-[-12deg] drop-shadow-[0_0_5px_currentColor] transition-colors duration-200 text-sm font-bold ${
                          zone.type === 'score' ? 'text-danger-red' : 'text-secondary-container'
                        }`}
                      >
                        {zone.label}
                      </span>
                      
                      {/* Sub-label visible on hover showing full breakdown */}
                      <span className="absolute bottom-2 font-mono text-[9px] text-[#ffffff] opacity-0 group-hover:opacity-80 transition-opacity duration-200 tracking-wider">
                        {zone.details}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Corner posts */}
              <div className="absolute top-0 left-0 w-1 h-4 bg-secondary-fixed" />
              <div className="absolute top-0 right-0 w-1 h-4 bg-secondary-fixed" />
            </div>

            {/* Goal post bottom bar */}
            <div className="w-full h-3 bg-secondary-fixed border-x-4 border-secondary-fixed shadow-[0_0_20px_rgba(0,224,255,0.4)]" />

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-6 font-label-caps text-label-caps">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-danger-red rounded-sm shadow-[0_0_5px_#FF4B4B]" />
                <span className="text-text-muted">KICKER SCORE PROBABILITY</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-secondary-container rounded-sm shadow-[0_0_5px_#00e0ff]" />
                <span className="text-text-muted">KEEPER SAVE PROBABILITY</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-muted text-xs italic">
                  * Hover over net zones to view detailed breakdown: G (Goal), S (Saved), M (Missed)
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
