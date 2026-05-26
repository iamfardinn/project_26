import React, { useState } from 'react'

export default function TournamentBracket() {
  const [simulation, setSimulation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deterministic, setDeterministic] = useState(true) // Default to true (predict based on recent forms & stats only)

  const handleSimulate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:5000/api/simulate/tournament', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deterministic })
      })
      if (!res.ok) throw new Error('Simulation failed')
      const data = await res.json()
      setSimulation(data)
    } catch (err) {
      console.error(err)
      setError('Failed to run World Cup simulation.')
    } finally {
      setLoading(false)
    }
  }

  // Pre-cached ELO lookup helper
  const getMatchByRoundAndId = (roundKey, matchId) => {
    if (!simulation) return null
    if (roundKey === 'third_place') return simulation.third_place
    if (roundKey === 'final') return simulation.final
    return simulation[roundKey].find((m) => m.id === matchId)
  }

  // Match Block Component
  const RenderMatch = ({ roundKey, matchId, placeholderA, placeholderB }) => {
    const match = getMatchByRoundAndId(roundKey, matchId)
    const teamA = match ? match.home_team : placeholderA
    const teamB = match ? match.away_team : placeholderB
    const score = match ? match.score : '--'
    const shootout = match ? match.shootout : ''
    const winner = match ? match.winner : null

    const isWinnerA = winner && winner === teamA
    const isWinnerB = winner && winner === teamB

    return (
      <div className="bg-[#09090b] border border-outline-variant rounded-sm p-3 w-40 font-label-caps text-xs shadow-md transition-all duration-300 hover:border-secondary-container hover:shadow-[0_0_10px_rgba(0,224,255,0.2)]">
        <div className="flex justify-between items-center text-[10px] text-text-muted mb-1 tracking-wider border-b border-zinc-800 pb-1">
          <span>{matchId}</span>
          {match && <span>{Math.round(match.home_elo)} vs {Math.round(match.away_elo)}</span>}
        </div>
        <div className="space-y-1.5">
          {/* Team A */}
          <div className="flex justify-between items-center">
            <span className={`truncate w-24 ${isWinnerA ? 'text-primary-container font-black drop-shadow-[0_0_5px_#00ff85]' : 'text-on-background'}`}>
              {teamA.toUpperCase()}
            </span>
            <span className={`font-mono text-[11px] ${isWinnerA ? 'text-primary-container font-bold' : 'text-text-muted'}`}>
              {match ? score.split('-')[0] : '-'}
            </span>
          </div>
          {/* Team B */}
          <div className="flex justify-between items-center">
            <span className={`truncate w-24 ${isWinnerB ? 'text-primary-container font-black drop-shadow-[0_0_5px_#00ff85]' : 'text-on-background'}`}>
              {teamB.toUpperCase()}
            </span>
            <span className={`font-mono text-[11px] ${isWinnerB ? 'text-primary-container font-bold' : 'text-text-muted'}`}>
              {match ? score.split('-')[1] : '-'}
            </span>
          </div>
        </div>
        {shootout && (
          <div className="text-[9px] text-[#ffdc49] text-center font-mono mt-1 pt-1 border-t border-zinc-800 tracking-wider">
            {shootout}
          </div>
        )}
      </div>
    )
  }

  return (
    <section id="tournament" className="relative z-20 py-12 lg:py-16 bg-[#060608] border-t border-zinc-900">
      <div className="max-w-[1400px] mx-auto px-4">

        {/* Section Header */}
        <div className="mb-8 lg:mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="font-display-lg text-headline-lg uppercase tracking-tighter text-on-background drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              TOURNAMENT BRACKET ENGINE
            </h2>
            <div className="w-56 h-[2px] bg-secondary-container shadow-[0_0_15px_#00e0ff] mt-2" />
          </div>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            {/* Simulation Mode Toggle */}
            <div className="flex bg-[#09090b] border border-outline-variant p-1 font-label-caps text-xs">
              <button
                onClick={() => setDeterministic(true)}
                className={`px-4 py-2 cursor-pointer transition-all ${deterministic ? 'bg-secondary-container text-[#09090b] font-bold shadow-[0_0_10px_rgba(0,224,255,0.4)]' : 'text-text-muted hover:text-on-background'}`}
              >
                2026 STATS & FORM ONLY
              </button>
              <button
                onClick={() => setDeterministic(false)}
                className={`px-4 py-2 cursor-pointer transition-all ${!deterministic ? 'bg-secondary-container text-[#09090b] font-bold shadow-[0_0_10px_rgba(0,224,255,0.4)]' : 'text-text-muted hover:text-on-background'}`}
              >
                DYNAMIC CUP SIMULATOR
              </button>
            </div>

            <button
              onClick={handleSimulate}
              disabled={loading}
              className="bg-[#09090b] border border-secondary-container text-secondary-container hover:bg-secondary-container hover:text-[#09090b] disabled:opacity-50 font-label-caps text-label-caps px-8 py-4 skew-x-[-12deg] transform transition-all active:scale-95 shadow-[0_0_20px_rgba(0,224,255,0.3)] hover:shadow-[0_0_30px_rgba(0,224,255,0.6)] cursor-pointer"
            >
              <span className="block skew-x-[12deg] font-black tracking-widest">
                {loading ? 'SIMULATING BRACKET...' : 'SIMULATE KNOCKOUT STAGE'}
              </span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger-red bg-opacity-20 border border-danger-red text-on-background font-label-caps text-label-caps">
            ⚠️ {error}
          </div>
        )}

        {/* Bracket Grid Container */}
        <div className="bg-[#09090b] neoclassical-frame overflow-x-auto">
          <div className="neoclassical-inner p-8 min-w-[1200px] flex justify-between items-center gap-6">

            {/* LEFT SIDE BRACKET (Top Half) */}
            <div className="flex gap-6 items-center">
              
              {/* L1: Round of 32 (Left) */}
              <div className="flex flex-col gap-5">
                <RenderMatch roundKey="round_of_32" matchId="M74" placeholderA="1E" placeholderB="3ABCD" />
                <RenderMatch roundKey="round_of_32" matchId="M77" placeholderA="1I" placeholderB="3CDFG" />
                <RenderMatch roundKey="round_of_32" matchId="M73" placeholderA="2A" placeholderB="2B" />
                <RenderMatch roundKey="round_of_32" matchId="M75" placeholderA="1F" placeholderB="2C" />
                <RenderMatch roundKey="round_of_32" matchId="M83" placeholderA="2K" placeholderB="2L" />
                <RenderMatch roundKey="round_of_32" matchId="M84" placeholderA="1H" placeholderB="2J" />
                <RenderMatch roundKey="round_of_32" matchId="M81" placeholderA="1D" placeholderB="3BEFI" />
                <RenderMatch roundKey="round_of_32" matchId="M82" placeholderA="1G" placeholderB="3AEHI" />
              </div>

              {/* L2: Round of 16 (Left) */}
              <div className="flex flex-col gap-24 py-10">
                <RenderMatch roundKey="round_of_16" matchId="M89" placeholderA="W74" placeholderB="W77" />
                <RenderMatch roundKey="round_of_16" matchId="M90" placeholderA="W73" placeholderB="W75" />
                <RenderMatch roundKey="round_of_16" matchId="M93" placeholderA="W83" placeholderB="W84" />
                <RenderMatch roundKey="round_of_16" matchId="M94" placeholderA="W81" placeholderB="W82" />
              </div>

              {/* L3: Quarter-finals (Left) */}
              <div className="flex flex-col gap-60 py-24">
                <RenderMatch roundKey="quarter_finals" matchId="M97" placeholderA="W89" placeholderB="W90" />
                <RenderMatch roundKey="quarter_finals" matchId="M98" placeholderA="W93" placeholderB="W94" />
              </div>

            </div>

            {/* CENTER: Semi-finals, Finals, Champion */}
            <div className="flex flex-col items-center gap-12 py-10 w-64 border-x border-zinc-900 px-6">
              
              {/* Semi-final 1 (Left Winner) */}
              <div className="text-center">
                <div className="font-label-caps text-[10px] text-text-muted mb-2 tracking-widest uppercase">Semi-Final 1</div>
                <RenderMatch roundKey="semi_finals" matchId="M101" placeholderA="W97" placeholderB="W98" />
              </div>

              {/* Grand Final & Champion Screen */}
              <div className="flex flex-col items-center bg-[#0d0d12] border-2 border-secondary-container border-opacity-30 rounded-lg p-5 shadow-[0_0_25px_rgba(0,224,255,0.15)] relative overflow-hidden w-52">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,e0,ff,0.05)_0%,_transparent_70%)] pointer-events-none" />
                
                <h3 className="font-display-lg text-lg italic text-[#ffdc49] skew-x-[-12deg] tracking-widest mb-3 uppercase font-black drop-shadow-[0_0_5px_currentColor]">
                  GRAND FINAL
                </h3>
                
                <RenderMatch roundKey="final" matchId="M104" placeholderA="W101" placeholderB="W102" />

                {simulation && (
                  <div className="mt-5 text-center border-t border-zinc-800 pt-4 w-full">
                    <div className="font-label-caps text-[9px] text-text-muted mb-1 uppercase tracking-widest">WORLD CUP CHAMPION</div>
                    <div className="font-display-lg text-lg text-primary-container skew-x-[-12deg] font-black drop-shadow-[0_0_8px_#00ff85]">
                      🏆 {simulation.champion.toUpperCase()}
                    </div>
                  </div>
                )}
              </div>

              {/* Third Place Playoff */}
              <div className="text-center">
                <div className="font-label-caps text-[10px] text-text-muted mb-2 tracking-widest uppercase">Third Place Playoff</div>
                <RenderMatch roundKey="third_place" matchId="M103" placeholderA="RU101" placeholderB="RU102" />
              </div>

              {/* Semi-final 2 (Right Winner) */}
              <div className="text-center">
                <div className="font-label-caps text-[10px] text-text-muted mb-2 tracking-widest uppercase">Semi-Final 2</div>
                <RenderMatch roundKey="semi_finals" matchId="M102" placeholderA="W99" placeholderB="W100" />
              </div>

            </div>

            {/* RIGHT SIDE BRACKET (Bottom Half) */}
            <div className="flex gap-6 items-center">

              {/* R3: Quarter-finals (Right) */}
              <div className="flex flex-col gap-60 py-24">
                <RenderMatch roundKey="quarter_finals" matchId="M99" placeholderA="W91" placeholderB="W92" />
                <RenderMatch roundKey="quarter_finals" matchId="M100" placeholderA="W95" placeholderB="W96" />
              </div>

              {/* R2: Round of 16 (Right) */}
              <div className="flex flex-col gap-24 py-10">
                <RenderMatch roundKey="round_of_16" matchId="M91" placeholderA="W76" placeholderB="W78" />
                <RenderMatch roundKey="round_of_16" matchId="M92" placeholderA="W79" placeholderB="W80" />
                <RenderMatch roundKey="round_of_16" matchId="M95" placeholderA="W86" placeholderB="W88" />
                <RenderMatch roundKey="round_of_16" matchId="M96" placeholderA="W85" placeholderB="W87" />
              </div>

              {/* R1: Round of 32 (Right) */}
              <div className="flex flex-col gap-5">
                <RenderMatch roundKey="round_of_32" matchId="M76" placeholderA="1C" placeholderB="2F" />
                <RenderMatch roundKey="round_of_32" matchId="M78" placeholderA="2E" placeholderB="2I" />
                <RenderMatch roundKey="round_of_32" matchId="M79" placeholderA="1A" placeholderB="3CEFH" />
                <RenderMatch roundKey="round_of_32" matchId="M80" placeholderA="1L" placeholderB="3EHIJ" />
                <RenderMatch roundKey="round_of_32" matchId="M86" placeholderA="1J" placeholderB="2H" />
                <RenderMatch roundKey="round_of_32" matchId="M88" placeholderA="2D" placeholderB="2G" />
                <RenderMatch roundKey="round_of_32" matchId="M85" placeholderA="1B" placeholderB="3EFGI" />
                <RenderMatch roundKey="round_of_32" matchId="M87" placeholderA="1K" placeholderB="3DEIJ" />
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
