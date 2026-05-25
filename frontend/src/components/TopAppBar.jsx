import React from 'react';

export default function TopAppBar() {
  return (
    <header className="hidden md:flex bg-[#09090b] docked full-width top-0 border-b border-primary-container shadow-[0_0_20px_rgba(0,255,133,0.3)] z-50 sticky">
      <div className="flex justify-between items-center w-full px-margin-desktop py-4 max-w-max-width mx-auto">
        <div className="font-display-lg text-display-lg font-black italic tracking-tighter text-primary dark:text-primary skew-x-[-12deg] transform transition-transform active:scale-95 text-shadow-[0_0_15px_rgba(240,255,238,0.5)]">
          PROJECT 26
        </div>
        <nav className="flex items-center gap-8 font-label-caps text-label-caps">
          <a className="text-primary font-bold border-b-2 border-primary pb-1 skew-x-[-12deg] transform transition-transform active:scale-95 hover:text-primary hover:bg-[#09090b] px-2" href="#">LIVE PITCH</a>
          <a className="text-text-muted hover:text-on-surface transition-colors skew-x-[-12deg] transform transition-transform active:scale-95 hover:text-primary hover:bg-[#09090b] px-2 py-1" href="#">XG ENGINE</a>
          <a className="text-text-muted hover:text-on-surface transition-colors skew-x-[-12deg] transform transition-transform active:scale-95 hover:text-primary hover:bg-[#09090b] px-2 py-1" href="#">MODEL STATUS</a>
          <a className="text-text-muted hover:text-on-surface transition-colors skew-x-[-12deg] transform transition-transform active:scale-95 hover:text-primary hover:bg-[#09090b] px-2 py-1" href="#">TACTICS</a>
        </nav>
        <div className="flex items-center gap-6">
          <div className="relative hidden lg:block group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">search</span>
            <input className="bg-[#09090b] border-b border-outline-variant focus:border-primary-container text-on-surface pl-10 pr-4 py-2 w-48 transition-all focus:w-64 outline-none font-body-md text-body-md placeholder:text-text-muted focus:bg-[#09090b] shadow-[inset_0_-1px_5px_rgba(0,255,133,0.1)] focus:shadow-[inset_0_-1px_10px_rgba(0,255,133,0.3)]" placeholder="Search parameters..." type="text" />
          </div>
          <div className="flex items-center gap-3 text-primary">
            <button className="hover:text-primary-container transition-colors drop-shadow-[0_0_5px_rgba(0,255,133,0.5)]"><span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>monitoring</span></button>
            <button className="hover:text-primary-container transition-colors drop-shadow-[0_0_5px_rgba(0,255,133,0.5)]"><span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>settings</span></button>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-primary-container overflow-hidden bg-[#09090b] shadow-[0_0_10px_rgba(0,255,133,0.5)]">
            <img alt="Analyst Profile" className="w-full h-full object-cover grayscale opacity-90 mix-blend-luminosity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCo1KVXeEcOAEGVxjn7Cx4nLQIrYGlzpbb7vnfuCx4PM3KJxz7VAJvi5kz16Aer-w9O2k7Xk8I7mGFbpqGAlzrfEK8U3zJsmQu9hXq5e83_EVLWRN7I3mOKUztX1ll2HHsiBDCJM0zC308ey2lbK2ZdRSDZbWdl-wwsfMrhKo82Ojj2GmMAJTl-CVwoe9wDaStz3s85m1512bWOzm2Wr-8daAJHTZpmnnePwknwQDA74RxpAU_P3mKOkBpDDK179neUOBfU6g2Q7PE" />
          </div>
        </div>
      </div>
    </header>
  );
}
