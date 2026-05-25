import React from 'react';

export default function Hero() {
  return (
    <main className="flex-grow flex items-center relative py-16 z-10">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage: "linear-gradient(#00ff85 1px, transparent 1px), linear-gradient(90deg, #00ff85 1px, transparent 1px)", backgroundSize: "40px 40px"}}></div>
      </div>
      <div className="max-w-max-width w-full mx-auto px-margin-mobile md:px-margin-desktop py-24 z-10 grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
        <div className="lg:col-span-6 flex flex-col justify-center items-start">
          <div className="border border-primary-container mb-8 flex items-center bg-[#09090b] p-1 shadow-[0_0_15px_rgba(0,255,133,0.3)]">
            <div className="border border-primary-container px-3 py-1 bg-[#09090b]">
              <span className="font-label-caps text-label-caps text-primary-container tracking-widest uppercase drop-shadow-[0_0_5px_rgba(0,255,133,0.8)]">
                &lt;&lt; THE MOST AWAITED FOOTBALL EVENT IS HERE &gt;&gt;
              </span>
            </div>
          </div>
          <h1 className="font-display-lg text-[64px] leading-[64px] md:text-[96px] md:leading-[88px] font-black italic tracking-tighter mb-8 uppercase drop-shadow-[0_0_20px_rgba(0,255,133,0.2)]">
            <span className="block text-on-surface">PROJECT</span>
            <span className="block bg-gradient-to-r from-primary-container via-secondary-container to-secondary-fixed bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,255,133,0.5)]">
              26
            </span>
          </h1>
          <p className="font-body-lg text-body-lg text-text-muted mb-12 max-w-lg border-l-2 border-primary-container pl-4 shadow-[-5px_0_10px_rgba(0,255,133,0.1)]">
            Deploy advanced predictive models. Analyze real-time spatial data. Dominate the pitch with tournament-grade machine learning infrastructure.
          </p>
          <div className="flex flex-wrap gap-6 items-center">
            <button className="group relative px-8 py-4 skew-x-[-12deg] bg-[#09090b] border border-primary-container text-primary-container overflow-hidden transition-all hover:bg-primary-container hover:text-[#09090b] shadow-[0_0_20px_rgba(0,255,133,0.4)] hover:shadow-[0_0_30px_rgba(0,255,133,0.8)] active:scale-95">
              <span className="block skew-x-[12deg] font-label-caps text-label-caps font-bold uppercase tracking-widest relative z-10 drop-shadow-[0_0_2px_currentColor]">
                Launch Predictor
              </span>
            </button>
            <button className="group px-8 py-4 skew-x-[-12deg] border border-secondary-container text-secondary-container bg-[#09090b] transition-all hover:bg-secondary-container hover:text-[#09090b] shadow-[0_0_15px_rgba(0,224,255,0.3)] hover:shadow-[0_0_25px_rgba(0,224,255,0.6)] active:scale-95">
              <span className="block skew-x-[12deg] font-label-caps text-label-caps font-bold uppercase tracking-widest flex items-center gap-2 drop-shadow-[0_0_2px_currentColor]">
                View xG Data
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </span>
            </button>
          </div>
        </div>
        <div className="lg:col-span-6 relative mt-16 lg:mt-0 perspective-1000">
          <div className="relative aspect-square w-full max-w-[600px] mx-auto bg-[#09090b] neoclassical-frame transform lg:rotate-y-[-5deg] lg:rotate-x-[5deg] transition-transform duration-700 hover:rotate-y-0 hover:rotate-x-0 group">
            <div className="w-full h-full neoclassical-inner relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,133,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,133,0.1)_1px,transparent_1px)] bg-[size:20px_20px] z-10 pointer-events-none mix-blend-screen"></div>
              <div className="absolute inset-0 bg-[#09090b] flex items-center justify-center overflow-hidden">
                <img alt="Technical Football Rendering" className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-1000 ease-out" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdw3D_6rf3UavZpHt4IL1jVD4eiQt1vCcPtLu8moeAxUDb71aEPDX7OFeZUqaQwPCLIf7b-LKC99JJK4_MtgNDSKtSWBqjvW815dIYseRsmUL2htiFNW3-_0JxDeBoabM79onXtW0PukeEsDveFLXrwmQjLU8fpsZUYykfpCs5VeZMG_xSonf3-ItZFt51W_h79lFYWkG8f93rNoQ1m_s-a27TUDWG_CGqoRXd-SO9kXSRbNIOpK22al6Ne0lOcL2j_a2SFlvM1BA" style={{filter: "contrast(1.3) brightness(0.9)"}} />
                <div className="absolute w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_rgba(0,255,133,0.2)_0%,_transparent_60%)] z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-screen pointer-events-none"></div>
              </div>
              <div className="absolute top-4 left-4 z-20 font-label-caps text-label-caps text-primary-container tracking-widest flex items-center gap-2 drop-shadow-[0_0_5px_rgba(0,255,133,0.8)]">
                <div className="w-2 h-2 bg-danger-red rounded-full animate-pulse shadow-[0_0_5px_#FF4B4B]"></div>
                LIVE INGESTION
              </div>
              <div className="absolute bottom-4 right-4 z-20 font-label-caps text-[10px] text-primary-container text-right drop-shadow-[0_0_3px_rgba(0,255,133,0.5)]">
                LATENCY: 12ms<br/>FRAME_RATE: 60FPS
              </div>
            </div>
          </div>
          <div className="absolute -top-6 left-12 lg:-left-8 z-30 skew-x-[15deg] bg-[#09090b] border border-primary-container px-4 py-2 shadow-[0_0_15px_rgba(0,255,133,0.5)] animate-[float_6s_ease-in-out_infinite]">
            <span className="block skew-x-[-15deg] font-label-caps text-label-caps text-primary-container font-bold flex items-center gap-2 drop-shadow-[0_0_3px_currentColor]">
              <span className="material-symbols-outlined text-[14px]">psychology</span>
              XGBOOST
            </span>
          </div>
          <div className="absolute bottom-12 -right-4 lg:-right-12 z-30 skew-x-[-15deg] bg-[#09090b] border border-secondary-container px-4 py-2 shadow-[0_0_15px_rgba(0,224,255,0.5)] animate-[float_8s_ease-in-out_infinite_reverse]">
            <span className="block skew-x-[15deg] font-label-caps text-label-caps text-secondary-container font-bold flex items-center gap-2 drop-shadow-[0_0_3px_currentColor]">
              <span className="material-symbols-outlined text-[14px]">memory</span>
              PYTORCH
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
