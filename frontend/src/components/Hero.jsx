import React from 'react'

export default function Hero() {
  return (
    <main className="relative flex-grow flex items-center z-10 py-16 lg:py-24 min-h-[85vh] overflow-hidden bg-[#09090b]">
      {/* Full-bleed Background Image Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/bg1.jpg"
          alt="World Cup Champions Background"
          className="w-full h-full object-cover object-center lg:object-right opacity-35 lg:opacity-45 select-none pointer-events-none"
        />
        {/* Soft radial and linear gradients to blend background and ensure text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]/30" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'linear-gradient(#00ff85 1px, transparent 1px), linear-gradient(90deg, #00ff85 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-max-width mx-auto px-4 sm:px-6 lg:px-margin-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-gutter items-center">

          {/* Left Column (Text & CTAs) */}
          <div className="lg:col-span-6 flex flex-col items-start">
            {/* Badge */}
            <div className="border border-primary-container mb-6 lg:mb-8 flex items-center bg-[#09090b] p-1 shadow-[0_0_15px_rgba(0,255,133,0.3)]">
              <div className="border border-primary-container px-3 py-1 bg-[#09090b]">
                <span className="font-label-caps text-label-caps text-primary-container tracking-widest uppercase drop-shadow-[0_0_5px_rgba(0,255,133,0.8)]">
                  &lt;&lt; THE MOST AWAITED FOOTBALL EVENT IS HERE &gt;&gt;
                </span>
              </div>
            </div>

            {/* Heading */}
            <h1 className="font-display-lg font-black italic tracking-tighter mb-6 lg:mb-8 uppercase leading-none">
              <span className="block text-5xl sm:text-6xl lg:text-[96px] lg:leading-[88px] text-on-surface drop-shadow-[0_0_20px_rgba(0,255,133,0.2)]">
                PROJECT
              </span>
              <span className="block text-5xl sm:text-6xl lg:text-[96px] lg:leading-[88px] bg-gradient-to-r from-primary-container via-secondary-container to-secondary-fixed bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,255,133,0.5)]">
                26
              </span>
            </h1>

            {/* Subtext */}
            <p className="font-body-lg text-body-lg text-text-muted mb-8 lg:mb-12 max-w-lg border-l-2 border-primary-container pl-4 shadow-[-5px_0_10px_rgba(0,255,133,0.1)]">
              Experience the ultimate FIFA World Cup 2026 simulator. Leverage state-of-the-art machine learning models to analyze real-time spatial stats, predict match outcomes, and explore tournament analytics with predictive AI.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 lg:gap-6 items-center">
              <button className="relative px-6 lg:px-8 py-3 lg:py-4 skew-x-[-12deg] bg-[#09090b] border border-primary-container text-primary-container overflow-hidden transition-all hover:bg-primary-container hover:text-[#09090b] shadow-[0_0_20px_rgba(0,255,133,0.4)] hover:shadow-[0_0_30px_rgba(0,255,133,0.8)] active:scale-95 cursor-pointer">
                <span className="block skew-x-[12deg] font-label-caps text-label-caps font-black uppercase tracking-widest">
                  Launch Predictor
                </span>
              </button>
              <button className="group px-6 lg:px-8 py-3 lg:py-4 skew-x-[-12deg] border border-secondary-container text-secondary-container bg-[#09090b] transition-all hover:bg-secondary-container hover:text-[#09090b] shadow-[0_0_15px_rgba(0,224,255,0.3)] hover:shadow-[0_0_25px_rgba(0,224,255,0.6)] active:scale-95 cursor-pointer">
                <span className="block skew-x-[12deg] font-label-caps text-label-caps font-black uppercase tracking-widest flex items-center gap-2">
                  View xG Data
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" style={{ fontSize: '16px' }}>arrow_forward</span>
                </span>
              </button>
            </div>
          </div>

          {/* Right Column (Floating tech badges over background) */}
          <div className="hidden lg:flex lg:col-span-6 relative h-[450px] pointer-events-none items-center justify-end">
            {/* Float tag: XGBOOST */}
            <div className="absolute top-12 right-24 z-30 skew-x-[15deg] bg-[#09090b] border border-primary-container px-3 py-2 shadow-[0_0_15px_rgba(0,255,133,0.5)] animate-float-slow pointer-events-auto">
              <span className="block skew-x-[-15deg] font-label-caps text-label-caps text-primary-container font-bold flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>psychology</span>
                XGBOOST
              </span>
            </div>

            {/* Float tag: WC PREDICTION */}
            <div className="absolute bottom-20 right-8 z-30 skew-x-[-15deg] bg-[#09090b] border border-secondary-container px-3 py-2 shadow-[0_0_15px_rgba(0,224,255,0.5)] animate-float-slow-reverse pointer-events-auto">
              <span className="block skew-x-[15deg] font-label-caps text-label-caps text-secondary-container font-bold flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>memory</span>
                WC PREDICTION
              </span>
            </div>
          </div>

        </div>
      </div>
    </main>
    </main>
  )
}
