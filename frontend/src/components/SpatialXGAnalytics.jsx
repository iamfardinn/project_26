import React, { useState } from 'react'

export default function SpatialXGAnalytics() {
  const [shotLoc, setShotLoc] = useState({ x: 108.0, y: 40.0, pctX: 0.9, pctY: 0.5 })
  const [bodyPart, setBodyPart] = useState('Right Foot')
  const [technique, setTechnique] = useState('Normal')
  const [underPressure, setUnderPressure] = useState(false)
  const [xg, setXg] = useState(0.648)
  const [loading, setLoading] = useState(false)

  const handlePitchClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    const pctX = clickX / rect.width
    const pctY = clickY / rect.height

    // Scale to StatsBomb coordinate grid [0-120] x [0-80]
    const sbX = Math.round(pctX * 120 * 10) / 10
    const sbY = Math.round(pctY * 80 * 10) / 10

    setShotLoc({ x: sbX, y: sbY, pctX, pctY })
    triggerPrediction(sbX, sbY, bodyPart, technique, underPressure)
  }

  const triggerPrediction = async (x, y, bp, tech, press) => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/predict/xg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_x: x,
          location_y: y,
          body_part: bp,
          shot_technique: tech,
          under_pressure: press
        })
      })

      if (!res.ok) throw new Error('xG prediction failed')
      const data = await res.json()
      setXg(data.xg)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleBpChange = (val) => {
    setBodyPart(val)
    triggerPrediction(shotLoc.x, shotLoc.y, val, technique, underPressure)
  }

  const handleTechChange = (val) => {
    setTechnique(val)
    triggerPrediction(shotLoc.x, shotLoc.y, bodyPart, val, underPressure)
  }

  const handlePressureChange = (val) => {
    setUnderPressure(val)
    triggerPrediction(shotLoc.x, shotLoc.y, bodyPart, technique, val)
  }

  return (
    <section id="xg" className="relative z-20 py-12 lg:py-16">
      <div className="max-w-max-width mx-auto px-4 sm:px-6 lg:px-margin-desktop">

        {/* Section Header */}
        <div className="mb-8 lg:mb-12">
          <h2 className="font-display-lg text-headline-lg uppercase tracking-tighter text-on-background drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            SPATIAL xG ANALYTICS
          </h2>
          <div className="w-48 h-[2px] bg-primary-container shadow-[0_0_15px_#00ff85] mt-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-gutter">

          {/* Pitch Schematic */}
          <div
            onClick={handlePitchClick}
            className="lg:col-span-8 bg-[#0a0f0d] border border-outline-variant relative overflow-hidden rounded-lg cursor-crosshair group"
            style={{ height: '420px' }}
          >
            {/* Pitch lines */}
            <div className="absolute inset-4 border-2 border-primary-container border-opacity-40 rounded-sm pointer-events-none">
              {/* Center line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-primary-container opacity-40 -translate-x-1/2" />
              {/* Center circle */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-2 border-primary-container border-opacity-40 rounded-full" />
              {/* Left penalty area */}
              <div className="absolute left-0 top-1/4 bottom-1/4 w-28 border-r-2 border-y-2 border-secondary-container border-opacity-40" />
              {/* Right penalty area */}
              <div className="absolute right-0 top-1/4 bottom-1/4 w-28 border-l-2 border-y-2 border-secondary-container border-opacity-40" />
            </div>

            {/* Glowing target marker at click location */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-primary-container rounded-full shadow-[0_0_20px_#00ff85] opacity-90 transition-all duration-300 pointer-events-none"
              style={{ left: `${shotLoc.pctX * 100}%`, top: `${shotLoc.pctY * 100}%` }}
            />
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[radial-gradient(circle,_rgba(0,255,133,0.3)_0%,_transparent_70%)] transition-all duration-300 pointer-events-none"
              style={{ left: `${shotLoc.pctX * 100}%`, top: `${shotLoc.pctY * 100}%` }}
            />

            <div className="absolute bottom-4 left-4 font-label-caps text-[10px] text-text-muted tracking-widest pointer-events-none">
              {loading ? 'SYSTEM_STATUS: COMPUTING...' : `CLICKED_COORDINATES: X=${shotLoc.x}m, Y=${shotLoc.y}m`}
            </div>
          </div>

          {/* Stat Cards & Controllers */}
          <div className="lg:col-span-4 flex flex-col gap-5 lg:gap-6">
            
            {/* Live xG Outcome Card */}
            <div className="bg-surface border-l-4 border-primary-container p-5 lg:p-6 shadow-[0_0_20px_rgba(0,255,133,0.15)]">
              <h3 className="font-display-lg text-xl lg:text-2xl italic skew-x-[-12deg] text-primary-container mb-4">
                EXPECTED GOALS (xG)
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="font-label-caps text-label-caps text-text-muted">PROBABILITY</span>
                  <span className="font-stat-lg text-4xl lg:text-5xl text-primary-container skew-x-[-12deg] drop-shadow-[0_0_8px_#00ff85] font-black">
                    {Math.round(xg * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-container shadow-[0_0_8px_#00ff85] transition-all duration-500" 
                    style={{ width: `${xg * 100}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Controller Card */}
            <div className="bg-surface border-l-4 border-secondary-container p-5 lg:p-6 shadow-[0_0_20px_rgba(0,224,255,0.1)]">
              <h3 className="font-display-lg text-lg italic skew-x-[-12deg] text-secondary-container mb-4">
                SHOT PARAMETERS
              </h3>
              <div className="space-y-4 font-label-caps text-label-caps">
                {/* Body Part */}
                <div>
                  <label className="block text-[11px] text-text-muted mb-1">BODY PART</label>
                  <select
                    value={bodyPart}
                    onChange={(e) => handleBpChange(e.target.value)}
                    className="w-full bg-[#09090b] border border-outline-variant text-on-background py-2 px-3 focus:outline-none focus:border-secondary-container transition-all cursor-pointer text-xs"
                  >
                    <option value="Right Foot">RIGHT FOOT</option>
                    <option value="Left Foot">LEFT FOOT</option>
                    <option value="Head">HEAD</option>
                    <option value="Other">OTHER</option>
                  </select>
                </div>

                {/* Shot Technique */}
                <div>
                  <label className="block text-[11px] text-text-muted mb-1">SHOT TECHNIQUE</label>
                  <select
                    value={technique}
                    onChange={(e) => handleTechChange(e.target.value)}
                    className="w-full bg-[#09090b] border border-outline-variant text-on-background py-2 px-3 focus:outline-none focus:border-secondary-container transition-all cursor-pointer text-xs"
                  >
                    <option value="Normal">NORMAL</option>
                    <option value="Volley">VOLLEY</option>
                    <option value="Half Volley">HALF VOLLEY</option>
                    <option value="Lob">LOB</option>
                    <option value="Diving Header">DIVING HEADER</option>
                    <option value="Overhead Kick">OVERHEAD KICK</option>
                    <option value="Backheel">BACKHEEL</option>
                  </select>
                </div>

                {/* Under Pressure */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-text-muted">UNDER DEFENSIVE PRESSURE</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={underPressure}
                      onChange={(e) => handlePressureChange(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-muted after:border-zinc-800 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary-container peer-checked:after:bg-[#09090b]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Key Insight */}
            <div className="bg-surface border-l-4 border-tertiary-container p-5 lg:p-6 shadow-[0_0_20px_rgba(255,220,73,0.1)]">
              <h3 className="font-display-lg text-lg italic skew-x-[-12deg] text-tertiary-container mb-2">
                KEY INSIGHT
              </h3>
              <p className="font-body-md text-body-md text-text-muted text-xs leading-relaxed">
                {xg > 0.6 
                  ? "Extreme scoring zone. Shots from this location have very high conversion rates."
                  : xg > 0.25
                  ? "Moderate scoring zone. Placing the shot with high accuracy or catching the keeper off-guard is key."
                  : "Low probability zone. Long-range attempts are highly likely to be blocked or saved."
                }
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
