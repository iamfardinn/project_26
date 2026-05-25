import React from 'react'

export default function Hero() {
  return (
    <main className="relative flex-grow flex items-center z-10 py-12 lg:py-0">
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

      <div className="relative z-10 w-full max-w-max-width mx-auto px-4 sm:px-6 lg:px-margin-desktop py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-gutter items-center">

          {/* Left Column */}
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
              Deploy advanced predictive models. Analyze real-time spatial data. Dominate the pitch with tournament-grade machine learning infrastructure.
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

          {/* Right Column */}
          <div className="lg:col-span-6 relative mt-8 lg:mt-0">
            <div className="relative aspect-square w-full max-w-sm sm:max-w-md lg:max-w-[520px] mx-auto bg-[#09090b] neoclassical-frame group">
              <div className="w-full h-full neoclassical-inner relative overflow-hidden">
                {/* Scanline grid */}
                <div
                  className="absolute inset-0 z-10 pointer-events-none mix-blend-screen"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(0,255,133,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,133,0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />
                {/* Main image */}
                <div className="absolute inset-0 bg-[#09090b] flex items-center justify-center overflow-hidden">
                  <img
                    alt="Technical Football Rendering"
                    className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-1000 ease-out"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdw3D_6rf3UavZpHt4IL1jVD4eiQt1vCcPtLu8moeAxUDb71aEPDX7OFeZUqaQwPCLIf7b-LKC99JJK4_MtgNDSKtSWBqjvW815dIYseRsmUL2htiFNW3-_0JxDeBoabM79onXtW0PukeEsDveFLXrwmQjLU8fpsZUYykfpCs5VeZMG_xSonf3-ItZFt51W_h79lFYWkG8f93rNoQ1m_s-a27TUDWG_CGqoRXd-SO9kXSRbNIOpK22al6Ne0lOcL2j_a2SFlvM1BA"
                    style={{ filter: 'contrast(1.3) brightness(0.9)' }}
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,133,0.2)_0%,_transparent_60%)] z-10 mix-blend-screen pointer-events-none" />
                </div>
                {/* HUD top-left */}
                <div className="absolute top-4 left-4 z-20 font-label-caps text-label-caps text-primary-container tracking-widest flex items-center gap-2 drop-shadow-[0_0_5px_rgba(0,255,133,0.8)]">
                  <div className="w-2 h-2 bg-danger-red rounded-full animate-pulse shadow-[0_0_5px_#FF4B4B]" />
                  LIVE INGESTION
                </div>
                {/* HUD bottom-right */}
                <div className="absolute bottom-4 right-4 z-20 font-label-caps text-[10px] text-primary-container text-right drop-shadow-[0_0_3px_rgba(0,255,133,0.5)]">
                  LATENCY: 12ms<br />FRAME_RATE: 60FPS
                </div>
              </div>
            </div>

            {/* Float tag: XGBOOST */}
            <div className="absolute -top-5 left-6 lg:-left-6 z-30 skew-x-[15deg] bg-[#09090b] border border-primary-container px-3 py-2 shadow-[0_0_15px_rgba(0,255,133,0.5)] animate-float-slow">
              <span className="block skew-x-[-15deg] font-label-caps text-label-caps text-primary-container font-bold flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>psychology</span>
                XGBOOST
              </span>
            </div>

            {/* Float tag: PYTORCH */}
            <div className="absolute bottom-8 -right-2 lg:-right-10 z-30 skew-x-[-15deg] bg-[#09090b] border border-secondary-container px-3 py-2 shadow-[0_0_15px_rgba(0,224,255,0.5)] animate-float-slow-reverse">
              <span className="block skew-x-[15deg] font-label-caps text-label-caps text-secondary-container font-bold flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>memory</span>
                PYTORCH
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
