import React from 'react';

export default function SpatialXGAnalytics() {
  return (
    <section className="relative z-20 py-16">
      <div className="max-w-max-width mx-auto px-margin-desktop">
        <div className="mb-12">
          <h2 className="font-display-lg text-headline-lg uppercase tracking-tighter text-on-background drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">SPATIAL xG ANALYTICS</h2>
          <div className="w-48 h-[2px] bg-primary-container shadow-[0_0_15px_#00ff85] mt-2"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-8 bg-[#0a0f0d] border border-outline-variant relative h-[500px] overflow-hidden rounded-lg">
            <div className="absolute inset-4 border-2 border-primary-container/40 rounded-sm shadow-[0_0_10px_rgba(0,255,133,0.1)]">
              <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-primary-container/40 -translate-x-1/2"></div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-primary-container/40 rounded-full"></div>
              <div className="absolute left-0 top-1/4 bottom-1/4 w-32 border-r-2 border-y-2 border-secondary-container/40"></div>
              <div className="absolute right-0 top-1/4 bottom-1/4 w-32 border-l-2 border-y-2 border-secondary-container/40"></div>
            </div>
            <div className="absolute top-[40%] left-[70%] w-6 h-6 bg-danger-red rounded-full shadow-[0_0_15px_#FF4B4B] opacity-80 animate-pulse"></div>
            <div className="absolute top-[40%] left-[70%] w-20 h-20 -translate-x-1/3 -translate-y-1/3 bg-[radial-gradient(circle,_rgba(255,75,75,0.3)_0%,_transparent_70%)] pointer-events-none"></div>
            <div className="absolute top-[60%] left-[80%] w-5 h-5 bg-tertiary-container rounded-full shadow-[0_0_15px_#ffdc49] opacity-80"></div>
            <div className="absolute top-[60%] left-[80%] w-16 h-16 -translate-x-1/3 -translate-y-1/3 bg-[radial-gradient(circle,_rgba(255,220,73,0.3)_0%,_transparent_70%)] pointer-events-none"></div>
            <div className="absolute top-[30%] left-[20%] w-4 h-4 bg-secondary-container rounded-full shadow-[0_0_15px_#00e0ff] opacity-80"></div>
            <div className="absolute bottom-4 left-4 font-label-caps text-[10px] text-text-muted">
              SYSTEM_STATUS: SPATIAL_MAPPING_ACTIVE
            </div>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-[#0f1412] border-l-4 border-primary-container p-6 shadow-[0_0_20px_rgba(0,255,133,0.1)]">
              <h3 className="font-display-lg text-2xl italic skew-x-[-12deg] text-primary-container mb-4">FORWARDS</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="font-label-caps text-text-muted">xG CONVERSION</span>
                  <span className="font-stat-lg text-primary-container skew-x-[-12deg]">1.24</span>
                </div>
                <div className="h-1 w-full bg-surface-container-highest">
                  <div className="h-full bg-primary-container" style={{width: "75%"}}></div>
                </div>
              </div>
            </div>
            <div className="bg-[#0f1412] border-l-4 border-secondary-container p-6 shadow-[0_0_20px_rgba(0,224,255,0.1)]">
              <h3 className="font-display-lg text-2xl italic skew-x-[-12deg] text-secondary-container mb-4">MIDFIELDERS</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="font-label-caps text-text-muted">xG CONVERSION</span>
                  <span className="font-stat-lg text-secondary-container skew-x-[-12deg]">0.89</span>
                </div>
                <div className="h-1 w-full bg-surface-container-highest">
                  <div className="h-full bg-secondary-container" style={{width: "55%"}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
