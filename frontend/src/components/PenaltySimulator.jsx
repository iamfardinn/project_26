import React from 'react';

export default function PenaltySimulator() {
  return (
    <section className="relative z-20 py-16">
      <div className="max-w-max-width mx-auto px-margin-desktop">
        <div className="mb-12">
          <h2 className="font-display-lg text-headline-lg uppercase tracking-tighter text-on-background drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">PENALTY SIMULATOR ENGINE</h2>
          <div className="w-48 h-[2px] bg-secondary-container shadow-[0_0_15px_#00e0ff] mt-2"></div>
        </div>
        <div className="bg-[#09090b] neoclassical-frame relative overflow-hidden">
          <div className="neoclassical-inner p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div>
                <label className="font-label-caps text-label-caps text-secondary-container uppercase mb-2 block">Select Kicker</label>
                <select className="w-full bg-[#1c211e] border border-outline-variant text-on-background font-label-caps py-4 px-4 appearance-none focus:outline-none focus:border-secondary-container transition-all">
                  <option>K. MBAPPE</option>
                  <option>H. KANE</option>
                  <option>L. MESSI</option>
                </select>
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-secondary-container uppercase mb-2 block">Select Keeper</label>
                <select className="w-full bg-[#1c211e] border border-outline-variant text-on-background font-label-caps py-4 px-4 appearance-none focus:outline-none focus:border-secondary-container transition-all">
                  <option>T. COURTOIS</option>
                  <option>M. MAIGNAN</option>
                  <option>E. MARTINEZ</option>
                </select>
              </div>
            </div>
            <div className="relative aspect-[21/9] w-full border-x-4 border-t-4 border-[#a5eeff] shadow-[0_0_30px_rgba(0,224,255,0.3)] bg-pitch-green-dark overflow-hidden rounded-t-lg">
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-2">
                <div className="group relative border border-secondary-container/20 hover:bg-danger-red/20 transition-all cursor-crosshair flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 font-stat-sm text-danger-red skew-x-[-12deg] drop-shadow-[0_0_5px_currentColor]">87% SCORE</span>
                </div>
                <div className="group relative border border-secondary-container/20 hover:bg-secondary-container/20 transition-all cursor-crosshair flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 font-stat-sm text-secondary-container skew-x-[-12deg] drop-shadow-[0_0_5px_currentColor]">42% SAVE</span>
                </div>
                <div className="group relative border border-secondary-container/20 hover:bg-danger-red/20 transition-all cursor-crosshair flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 font-stat-sm text-danger-red skew-x-[-12deg] drop-shadow-[0_0_5px_currentColor]">91% SCORE</span>
                </div>
                <div className="group relative border border-secondary-container/20 hover:bg-secondary-container/20 transition-all cursor-crosshair flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 font-stat-sm text-secondary-container skew-x-[-12deg] drop-shadow-[0_0_5px_currentColor]">65% SAVE</span>
                </div>
                <div className="group relative border border-secondary-container/20 hover:bg-danger-red/20 transition-all cursor-crosshair flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 font-stat-sm text-danger-red skew-x-[-12deg] drop-shadow-[0_0_5px_currentColor]">78% SCORE</span>
                </div>
                <div className="group relative border border-secondary-container/20 hover:bg-secondary-container/20 transition-all cursor-crosshair flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 font-stat-sm text-secondary-container skew-x-[-12deg] drop-shadow-[0_0_5px_currentColor]">50% SAVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
