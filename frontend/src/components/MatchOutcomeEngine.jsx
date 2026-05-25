import React from 'react';

export default function MatchOutcomeEngine() {
  return (
    <section className="relative z-20 py-16">
      <div className="max-w-max-width mx-auto px-margin-desktop">
        <div className="mb-12">
          <h2 className="font-display-lg text-headline-lg uppercase tracking-tighter text-on-background drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">MATCH OUTCOME ENGINE</h2>
          <div className="w-48 h-[2px] bg-secondary-container shadow-[0_0_15px_#00e0ff] mt-2"></div>
        </div>
        <div className="bg-[#09090b] neoclassical-frame relative overflow-hidden">
          <div className="neoclassical-inner p-8">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-center">
              <div className="space-y-2">
                <label className="font-label-caps text-label-caps text-primary-container uppercase drop-shadow-[0_0_5px_rgba(0,255,133,0.5)]">Team A Selection</label>
                <div className="relative">
                  <select className="w-full bg-[#09090b] border border-primary-container text-on-background font-label-caps py-4 px-4 appearance-none focus:outline-none focus:shadow-[0_0_15px_rgba(0,255,133,0.5)] transition-shadow">
                    <option>SELECT TEAM ALPHA</option>
                    <option>LONDON REDS</option>
                    <option>MANCHESTER BLUES</option>
                    <option>MADRID WHITES</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary-container">expand_more</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-primary-container/30 mt-4">
                  <div className="text-center">
                    <div className="font-stat-sm text-stat-sm text-text-muted uppercase">HISTORICAL ELO</div>
                    <div className="font-stat-lg text-stat-lg drop-shadow-[0_0_5px_currentColor]">1842</div>
                  </div>
                  <div className="text-center">
                    <div className="font-stat-sm text-stat-sm text-text-muted uppercase">FORM (LAST 5)</div>
                    <div className="flex gap-1 mt-1">
                      <span className="w-2 h-2 bg-primary-container shadow-[0_0_5px_#00ff85]"></span>
                      <span className="w-2 h-2 bg-primary-container shadow-[0_0_5px_#00ff85]"></span>
                      <span className="w-2 h-2 bg-text-muted"></span>
                      <span className="w-2 h-2 bg-primary-container shadow-[0_0_5px_#00ff85]"></span>
                      <span className="w-2 h-2 bg-danger-red shadow-[0_0_5px_#FF4B4B]"></span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-6">
                <div className="font-display-lg text-4xl font-black italic text-text-muted skew-x-[-12deg] drop-shadow-[0_0_5px_currentColor]">VS</div>
                <button className="bg-[#09090b] border border-[#00ff85] text-[#00ff85] hover:bg-[#00ff85] hover:text-[#09090b] font-label-caps text-label-caps px-10 py-5 skew-x-[-12deg] transform transition-all active:scale-95 shadow-[0_0_20px_rgba(0,255,133,0.4)] hover:shadow-[0_0_30px_rgba(0,255,133,0.8)] cursor-pointer">
                  <span className="block skew-x-[12deg] font-black tracking-widest drop-shadow-[0_0_2px_currentColor]">PREDICT</span>
                </button>
              </div>
              <div className="space-y-2">
                <label className="font-label-caps text-label-caps text-secondary-container uppercase text-right block drop-shadow-[0_0_5px_rgba(0,224,255,0.5)]">Team B Selection</label>
                <div className="relative">
                  <select className="w-full bg-[#09090b] border border-secondary-container text-on-background font-label-caps py-4 px-4 appearance-none focus:outline-none focus:shadow-[0_0_15px_rgba(0,224,255,0.5)] transition-shadow">
                    <option>SELECT TEAM BETA</option>
                    <option>MUNICH GIANTS</option>
                    <option>PARIS SAINTS</option>
                    <option>MILAN DEVILS</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-container">expand_more</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-secondary-container/30 mt-4">
                  <div className="text-center">
                    <div className="font-stat-sm text-stat-sm text-text-muted uppercase">FORM (LAST 5)</div>
                    <div className="flex gap-1 mt-1">
                      <span className="w-2 h-2 bg-primary-container shadow-[0_0_5px_#00ff85]"></span>
                      <span className="w-2 h-2 bg-danger-red shadow-[0_0_5px_#FF4B4B]"></span>
                      <span className="w-2 h-2 bg-danger-red shadow-[0_0_5px_#FF4B4B]"></span>
                      <span className="w-2 h-2 bg-primary-container shadow-[0_0_5px_#00ff85]"></span>
                      <span className="w-2 h-2 bg-primary-container shadow-[0_0_5px_#00ff85]"></span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-stat-sm text-stat-sm text-text-muted uppercase">HISTORICAL ELO</div>
                    <div className="font-stat-lg text-stat-lg drop-shadow-[0_0_5px_currentColor]">1795</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 space-y-4">
              <div className="flex justify-between font-label-caps text-label-caps">
                <span className="text-primary-container drop-shadow-[0_0_5px_rgba(0,255,133,0.8)]">WIN 45%</span>
                <span className="text-text-muted">DRAW 25%</span>
                <span className="text-secondary-container drop-shadow-[0_0_5px_rgba(0,224,255,0.8)]">LOSS 30%</span>
              </div>
              <div className="h-4 w-full flex bg-[#09090b] border border-outline-variant shadow-[0_0_10px_rgba(255,255,255,0.05)]">
                <div className="h-full bg-primary-container shadow-[0_0_15px_#00ff85]" style={{width: "45%"}}></div>
                <div className="h-full bg-zinc-800" style={{width: "25%"}}></div>
                <div className="h-full bg-secondary-container shadow-[0_0_15px_#00e0ff]" style={{width: "30%"}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
