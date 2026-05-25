import React, { useState } from 'react'

export default function TopAppBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[#09090b] border-b border-primary-container shadow-[0_0_20px_rgba(0,255,133,0.3)]">
      <div className="max-w-max-width mx-auto px-4 sm:px-6 lg:px-margin-desktop">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Brand Logo */}
          <div className="font-display-lg text-2xl lg:text-3xl font-black italic tracking-tighter text-primary skew-x-[-12deg] transform flex-shrink-0">
            PROJECT 26
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-label-caps text-label-caps">
            <a href="#" className="text-primary-container font-bold border-b-2 border-primary-container pb-1 skew-x-[-12deg] px-2 hover:opacity-80 transition-opacity">
              LIVE PITCH
            </a>
            <a href="#match" className="text-text-muted hover:text-primary-container transition-colors skew-x-[-12deg] px-2 py-1">
              XG ENGINE
            </a>
            <a href="#xg" className="text-text-muted hover:text-primary-container transition-colors skew-x-[-12deg] px-2 py-1">
              MODEL STATUS
            </a>
            <a href="#penalty" className="text-text-muted hover:text-primary-container transition-colors skew-x-[-12deg] px-2 py-1">
              TACTICS
            </a>
          </nav>

          {/* Desktop Trailing Actions */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <div className="relative hidden lg:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" style={{ fontSize: '18px' }}>search</span>
              <input
                className="bg-[#09090b] border-b-2 border-outline-variant focus:border-primary-container text-on-surface pl-10 pr-4 py-2 w-44 transition-all focus:w-56 outline-none text-body-md font-body-md placeholder:text-text-muted"
                placeholder="Search parameters..."
                type="text"
              />
            </div>
            <div className="flex items-center gap-3 text-primary-container">
              <button className="hover:text-primary transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>monitoring</span>
              </button>
              <button className="hover:text-primary transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>settings</span>
              </button>
            </div>
            <div className="w-9 h-9 rounded-full border-2 border-primary-container overflow-hidden shadow-[0_0_10px_rgba(0,255,133,0.5)] flex-shrink-0">
              <img
                alt="Analyst Profile"
                className="w-full h-full object-cover grayscale opacity-90"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCo1KVXeEcOAEGVxjn7Cx4nLQIrYGlzpbb7vnfuCx4PM3KJxz7VAJvi5kz16Aer-w9O2k7Xk8I7mGFbpqGAlzrfEK8U3zJsmQu9hXq5e83_EVLWRN7I3mOKUztX1ll2HHsiBDCJM0zC308ey2lbK2ZdRSDZbWdl-wwsfMrhKo82Ojj2GmMAJTl-CVwoe9wDaStz3s85m1512bWOzm2Wr-8daAJHTZpmnnePwknwQDA74RxpAU_P3mKOkBpDDK179neUOBfU6g2Q7PE"
              />
            </div>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-primary-container p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-outline-variant py-4 space-y-3">
            {['LIVE PITCH', 'XG ENGINE', 'MODEL STATUS', 'TACTICS'].map((item, i) => (
              <a
                key={i}
                href="#"
                className="block font-label-caps text-label-caps text-text-muted hover:text-primary-container transition-colors px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
