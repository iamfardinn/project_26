import React from 'react'

export default function PenaltySimulator() {
  const zones = [
    { label: '87% SCORE', type: 'score' },
    { label: '42% SAVE', type: 'save' },
    { label: '91% SCORE', type: 'score' },
    { label: '65% SAVE', type: 'save' },
    { label: '78% SCORE', type: 'score' },
    { label: '50% SAVE', type: 'save' },
  ]

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
                  <select className="w-full bg-surface-container border border-outline-variant text-on-background font-label-caps text-label-caps py-4 px-4 focus:outline-none focus:border-secondary-container transition-all cursor-pointer">
                    <option>K. MBAPPE</option>
                    <option>H. KANE</option>
                    <option>L. MESSI</option>
                    <option>C. RONALDO</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-container" style={{ fontSize: '20px' }}>expand_more</span>
                </div>
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-secondary-container uppercase mb-2">
                  Select Keeper
                </label>
                <div className="relative">
                  <select className="w-full bg-surface-container border border-outline-variant text-on-background font-label-caps text-label-caps py-4 px-4 focus:outline-none focus:border-secondary-container transition-all cursor-pointer">
                    <option>T. COURTOIS</option>
                    <option>M. MAIGNAN</option>
                    <option>E. MARTINEZ</option>
                    <option>A. ONANA</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-container" style={{ fontSize: '20px' }}>expand_more</span>
                </div>
              </div>
            </div>

            {/* Goal Mesh */}
            <div
              className="relative w-full border-x-4 border-t-4 border-secondary-fixed shadow-[0_0_30px_rgba(0,224,255,0.3)] bg-pitch-green-dark overflow-hidden rounded-t-lg"
              style={{ aspectRatio: '21/8' }}
            >
              {/* Grid overlay */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-2">
                {zones.map((zone, i) => (
                  <div
                    key={i}
                    className={`group relative border border-secondary-container border-opacity-20 cursor-crosshair flex items-center justify-center transition-all duration-200 ${
                      zone.type === 'score'
                        ? 'hover:bg-danger-red hover:bg-opacity-20'
                        : 'hover:bg-secondary-container hover:bg-opacity-20'
                    }`}
                  >
                    <span
                      className={`opacity-0 group-hover:opacity-100 font-stat-sm text-stat-sm skew-x-[-12deg] drop-shadow-[0_0_5px_currentColor] transition-opacity duration-200 text-sm font-bold ${
                        zone.type === 'score' ? 'text-danger-red' : 'text-secondary-container'
                      }`}
                    >
                      {zone.label}
                    </span>
                  </div>
                ))}
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
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
