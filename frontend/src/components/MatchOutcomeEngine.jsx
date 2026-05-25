import React from 'react'

export default function MatchOutcomeEngine() {
  return (
    <section id="match" className="relative z-20 py-12 lg:py-16">
      <div className="max-w-max-width mx-auto px-4 sm:px-6 lg:px-margin-desktop">

        {/* Section Header */}
        <div className="mb-8 lg:mb-12">
          <h2 className="font-display-lg text-headline-lg uppercase tracking-tighter text-on-background drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            MATCH OUTCOME ENGINE
          </h2>
          <div className="w-48 h-[2px] bg-secondary-container shadow-[0_0_15px_#00e0ff] mt-2" />
        </div>

        {/* Engine Card */}
        <div className="bg-[#09090b] neoclassical-frame">
          <div className="neoclassical-inner p-6 lg:p-8">

            {/* Team Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-8 items-start">

              {/* Team A */}
              <div className="space-y-4">
                <label className="block font-label-caps text-label-caps text-primary-container uppercase drop-shadow-[0_0_5px_rgba(0,255,133,0.5)]">
                  Team A Selection
                </label>
                <div className="relative">
                  <select className="w-full bg-[#09090b] border border-primary-container text-on-background font-label-caps text-label-caps py-4 px-4 focus:outline-none focus:shadow-[0_0_15px_rgba(0,255,133,0.5)] transition-shadow cursor-pointer">
                    <option>SELECT TEAM ALPHA</option>
                    <option>LONDON REDS</option>
                    <option>MANCHESTER BLUES</option>
                    <option>MADRID WHITES</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary-container" style={{ fontSize: '20px' }}>expand_more</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-primary-container border-opacity-30 mt-2">
                  <div className="text-center">
                    <div className="font-stat-sm text-stat-sm text-text-muted uppercase mb-1">HISTORICAL ELO</div>
                    <div className="font-stat-lg text-stat-lg text-primary-container drop-shadow-[0_0_5px_currentColor]">1842</div>
                  </div>
                  <div className="text-center">
                    <div className="font-stat-sm text-stat-sm text-text-muted uppercase mb-1">FORM (LAST 5)</div>
                    <div className="flex gap-1 mt-1">
                      <span className="w-2.5 h-2.5 bg-primary-container shadow-[0_0_5px_#00ff85] rounded-sm" />
                      <span className="w-2.5 h-2.5 bg-primary-container shadow-[0_0_5px_#00ff85] rounded-sm" />
                      <span className="w-2.5 h-2.5 bg-text-muted rounded-sm" />
                      <span className="w-2.5 h-2.5 bg-primary-container shadow-[0_0_5px_#00ff85] rounded-sm" />
                      <span className="w-2.5 h-2.5 bg-danger-red shadow-[0_0_5px_#FF4B4B] rounded-sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* VS + Predict */}
              <div className="flex flex-row md:flex-col items-center justify-center gap-4 md:gap-6 py-4 md:py-0">
                <div className="font-display-lg text-3xl lg:text-4xl font-black italic text-text-muted skew-x-[-12deg] drop-shadow-[0_0_5px_currentColor]">
                  VS
                </div>
                <button className="bg-[#09090b] border border-primary-container text-primary-container hover:bg-primary-container hover:text-[#09090b] font-label-caps text-label-caps px-6 lg:px-10 py-3 lg:py-5 skew-x-[-12deg] transform transition-all active:scale-95 shadow-[0_0_20px_rgba(0,255,133,0.4)] hover:shadow-[0_0_30px_rgba(0,255,133,0.8)] cursor-pointer">
                  <span className="block skew-x-[12deg] font-black tracking-widest">PREDICT</span>
                </button>
              </div>

              {/* Team B */}
              <div className="space-y-4">
                <label className="block font-label-caps text-label-caps text-secondary-container uppercase text-left md:text-right drop-shadow-[0_0_5px_rgba(0,224,255,0.5)]">
                  Team B Selection
                </label>
                <div className="relative">
                  <select className="w-full bg-[#09090b] border border-secondary-container text-on-background font-label-caps text-label-caps py-4 px-4 focus:outline-none focus:shadow-[0_0_15px_rgba(0,224,255,0.5)] transition-shadow cursor-pointer">
                    <option>SELECT TEAM BETA</option>
                    <option>MUNICH GIANTS</option>
                    <option>PARIS SAINTS</option>
                    <option>MILAN DEVILS</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-container" style={{ fontSize: '20px' }}>expand_more</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-secondary-container border-opacity-30 mt-2">
                  <div className="text-center">
                    <div className="font-stat-sm text-stat-sm text-text-muted uppercase mb-1">FORM (LAST 5)</div>
                    <div className="flex gap-1 mt-1">
                      <span className="w-2.5 h-2.5 bg-primary-container shadow-[0_0_5px_#00ff85] rounded-sm" />
                      <span className="w-2.5 h-2.5 bg-danger-red shadow-[0_0_5px_#FF4B4B] rounded-sm" />
                      <span className="w-2.5 h-2.5 bg-danger-red shadow-[0_0_5px_#FF4B4B] rounded-sm" />
                      <span className="w-2.5 h-2.5 bg-primary-container shadow-[0_0_5px_#00ff85] rounded-sm" />
                      <span className="w-2.5 h-2.5 bg-primary-container shadow-[0_0_5px_#00ff85] rounded-sm" />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-stat-sm text-stat-sm text-text-muted uppercase mb-1">HISTORICAL ELO</div>
                    <div className="font-stat-lg text-stat-lg text-secondary-container drop-shadow-[0_0_5px_currentColor]">1795</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Probability Bar */}
            <div className="mt-10 lg:mt-12 space-y-3">
              <div className="flex justify-between font-label-caps text-label-caps">
                <span className="text-primary-container drop-shadow-[0_0_5px_rgba(0,255,133,0.8)]">WIN 45%</span>
                <span className="text-text-muted">DRAW 25%</span>
                <span className="text-secondary-container drop-shadow-[0_0_5px_rgba(0,224,255,0.8)]">LOSS 30%</span>
              </div>
              <div className="h-4 w-full flex bg-[#09090b] border border-outline-variant overflow-hidden">
                <div className="h-full bg-primary-container shadow-[0_0_15px_#00ff85] transition-all duration-700" style={{ width: '45%' }} />
                <div className="h-full bg-zinc-800 transition-all duration-700" style={{ width: '25%' }} />
                <div className="h-full bg-secondary-container shadow-[0_0_15px_#00e0ff] transition-all duration-700" style={{ width: '30%' }} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
