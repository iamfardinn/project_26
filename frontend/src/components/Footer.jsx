import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant relative py-10 lg:py-12">
      <div className="max-w-max-width mx-auto px-4 sm:px-6 lg:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex-1 hidden md:block" />

        <div className="font-display-lg text-xl lg:text-2xl font-black italic tracking-tighter text-text-muted skew-x-[-12deg] select-none">
          PRJCT//26
        </div>

        <div className="flex-1 flex justify-center md:justify-end items-center gap-2 font-label-caps text-[10px] text-text-muted tracking-widest">
          <span className="w-2 h-2 bg-primary-container rounded-full animate-pulse shadow-[0_0_8px_#00ff85]" />
          SYSTEM ONLINE // MODELS ACTIVE
        </div>
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#00ff85 1px, transparent 1px), linear-gradient(90deg, #00ff85 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
    </footer>
  )
}
