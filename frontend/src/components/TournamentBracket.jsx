import React, { useState } from 'react'

export default function TournamentBracket() {
  const [simulation, setSimulation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deterministic, setDeterministic] = useState(true)

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

  const getMatchByRoundAndId = (roundKey, matchId) => {
    if (!simulation) return null
    if (roundKey === 'third_place') return simulation.third_place
    if (roundKey === 'final') return simulation.final
    return simulation[roundKey]?.find((m) => m.id === matchId)
  }

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
          <div className="flex justify-between items-center">
            <span className={`truncate w-24 ${isWinnerA ? 'text-primary-container font-black drop-shadow-[0_0_5px_#00ff85]' : 'text-on-background'}`}>
              {teamA.toUpperCase()}
            </span>
            <span className={`font-mono text-[11px] ${isWinnerA ? 'text-primary-container font-bold' : 'text-text-muted'}`}>
              {match ? score.split('-')[0] : '-'}
            </span>
          </div>
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
  
  // Calculate top scorer
  let topScorers = [];
  if (simulation && simulation.team_squads) {
      const allMatches = [];
      Object.values(simulation.groups).forEach(g => allMatches.push(...g.matches));
      ['round_of_32', 'round_of_16', 'quarter_finals', 'semi_finals'].forEach(r => allMatches.push(...simulation[r]));
      allMatches.push(simulation.third_place, simulation.final);
      
      const teamGoals = {};
      allMatches.forEach(m => {
          if(!m) return;
          teamGoals[m.home_team] = (teamGoals[m.home_team] || 0) + m.home_goals;
          teamGoals[m.away_team] = (teamGoals[m.away_team] || 0) + m.away_goals;
      });
      
      const players = [];
      Object.entries(simulation.team_squads).forEach(([team, squad]) => {
          if (teamGoals[team] > 0 && squad[0]) {
              const goals = Math.round(teamGoals[team] * 0.6);
              if (goals > 0) {
                players.push({ name: squad[0].name, team, goals });
              }
          }
      });
      topScorers = players.sort((a,b) => b.goals - a.goals).slice(0, 3);
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
                {loading ? 'SIMULATING...' : 'SIMULATE FULL TOURNAMENT'}
              </span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger-red bg-opacity-20 border border-danger-red text-on-background font-label-caps text-label-caps">
            ⚠️ {error}
          </div>
        )}
        
        {simulation && (
          <div className="mb-12">
            <h3 className="font-display-lg text-2xl text-secondary-container uppercase tracking-widest mb-6 border-b border-zinc-800 pb-2">Phase 1: Group Stage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Object.entries(simulation.groups).map(([group, data]) => (
                    <div key={group} className="bg-[#09090b] border border-outline-variant p-4 transition-all duration-300 hover:border-secondary-container hover:shadow-[0_0_15px_rgba(0,224,255,0.15)]">
                        <div className="font-display-lg text-lg text-on-background mb-3 uppercase tracking-widest border-b border-zinc-800 pb-1">Group {group}</div>
                        <table className="w-full text-left text-xs font-mono text-text-muted">
                            <thead>
                                <tr className="border-b border-zinc-800">
                                    <th className="pb-1 w-1/2">Team</th>
                                    <th className="pb-1 text-center">P</th>
                                    <th className="pb-1 text-center">GD</th>
                                    <th className="pb-1 text-center font-bold text-on-background">Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.standings.map((st, idx) => {
                                    const isTop2 = idx < 2;
                                    const isBest3rd = simulation.best_third.some(t => t.team === st.team);
                                    return (
                                        <tr key={st.team} className="border-b border-zinc-900 last:border-0">
                                            <td className={`py-1.5 truncate pr-2 ${isTop2 ? 'text-primary-container font-bold' : isBest3rd ? 'text-[#00e0ff] font-bold' : 'text-text-muted'}`}>
                                                {st.team}
                                            </td>
                                            <td className="py-1.5 text-center">{st.p}</td>
                                            <td className="py-1.5 text-center">{st.gd > 0 ? `+${st.gd}` : st.gd}</td>
                                            <td className={`py-1.5 text-center font-bold ${isTop2 ? 'text-primary-container' : isBest3rd ? 'text-[#00e0ff]' : 'text-on-background'}`}>{st.pts}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
            
            {/* Stats Panel */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#09090b] border border-[#ffdc49] p-4 flex flex-col justify-center items-center text-center shadow-[0_0_15px_rgba(255,220,73,0.1)] transition-all hover:scale-105">
                    <div className="text-[10px] uppercase font-label-caps tracking-widest text-[#ffdc49] mb-2">Golden Boot Prediction</div>
                    {topScorers.length > 0 ? (
                        <>
                            <div className="text-2xl font-black font-display-lg text-on-background uppercase tracking-wider">{topScorers[0].name}</div>
                            <div className="text-sm font-mono text-text-muted mt-1">{topScorers[0].team} • <span className="text-[#ffdc49] font-bold">{topScorers[0].goals} Goals</span></div>
                        </>
                    ) : (
                        <div className="text-sm text-text-muted italic">Run simulation</div>
                    )}
                </div>
                <div className="bg-[#09090b] border border-outline-variant p-4">
                    <div className="text-[10px] uppercase font-label-caps tracking-widest text-text-muted mb-2 border-b border-zinc-800 pb-1">Tournament Stats</div>
                    <div className="space-y-2 mt-3 font-mono text-xs">
                        <div className="flex justify-between">
                            <span className="text-text-muted">Matches Played</span>
                            <span className="text-on-background">104</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-muted">Teams Advanced</span>
                            <span className="text-on-background">32</span>
                        </div>
                    </div>
                </div>
                <div className="bg-[#09090b] border border-outline-variant p-4">
                    <div className="text-[10px] uppercase font-label-caps tracking-widest text-text-muted mb-2 border-b border-zinc-800 pb-1">Legend</div>
                    <div className="space-y-2 mt-3 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-primary-container rounded-sm"></div>
                            <span className="text-text-muted font-label-caps">Top 2 Qualifiers</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#00e0ff] rounded-sm"></div>
                            <span className="text-text-muted font-label-caps">Best 3rd Place Qualifiers</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* Bracket Grid Container */}
        <div className="bg-[#09090b] border border-outline-variant overflow-x-auto relative mt-8">
          <div className="absolute top-4 left-6 font-display-lg text-2xl text-secondary-container uppercase tracking-widest">Phase 2: Knockout Stage</div>
          <div className="p-8 pt-16 min-w-[1200px] flex justify-between items-center gap-6">

            {/* LEFT SIDE BRACKET (Top Half) */}
            <div className="flex gap-6 items-center">
              
              {/* L1: Round of 32 (Left) */}
              <div className="flex flex-col gap-2">
                <RenderMatch roundKey="round_of_32" matchId="R32_1" placeholderA="2A" placeholderB="2B" />
                <RenderMatch roundKey="round_of_32" matchId="R32_2" placeholderA="1F" placeholderB="2C" />
                <RenderMatch roundKey="round_of_32" matchId="R32_3" placeholderA="1E" placeholderB="ABCDF3" />
                <RenderMatch roundKey="round_of_32" matchId="R32_4" placeholderA="1I" placeholderB="CDFGH3" />
                <RenderMatch roundKey="round_of_32" matchId="R32_5" placeholderA="2K" placeholderB="2L" />
                <RenderMatch roundKey="round_of_32" matchId="R32_6" placeholderA="1H" placeholderB="2J" />
                <RenderMatch roundKey="round_of_32" matchId="R32_7" placeholderA="1D" placeholderB="BEFIJ3" />
                <RenderMatch roundKey="round_of_32" matchId="R32_8" placeholderA="1G" placeholderB="AEHIJ3" />
              </div>

              {/* L2: Round of 16 (Left) */}
              <div className="flex flex-col justify-around py-4 h-full" style={{ gap: '4.5rem' }}>
                <RenderMatch roundKey="round_of_16" matchId="R16_1" placeholderA="W_R32_1" placeholderB="W_R32_2" />
                <RenderMatch roundKey="round_of_16" matchId="R16_2" placeholderA="W_R32_3" placeholderB="W_R32_4" />
                <RenderMatch roundKey="round_of_16" matchId="R16_3" placeholderA="W_R32_5" placeholderB="W_R32_6" />
                <RenderMatch roundKey="round_of_16" matchId="R16_4" placeholderA="W_R32_7" placeholderB="W_R32_8" />
              </div>

              {/* L3: Quarter-finals (Left) */}
              <div className="flex flex-col justify-around py-12 h-full" style={{ gap: '12rem' }}>
                <RenderMatch roundKey="quarter_finals" matchId="QF_1" placeholderA="W_R16_1" placeholderB="W_R16_2" />
                <RenderMatch roundKey="quarter_finals" matchId="QF_2" placeholderA="W_R16_3" placeholderB="W_R16_4" />
              </div>

            </div>

            {/* CENTER: Semi-finals, Finals, Champion */}
            <div className="flex flex-col items-center gap-12 py-10 w-64 border-x border-zinc-900 px-6">
              
              {/* Semi-final 1 (Left Winner) */}
              <div className="text-center">
                <div className="font-label-caps text-[10px] text-text-muted mb-2 tracking-widest uppercase">Semi-Final 1</div>
                <RenderMatch roundKey="semi_finals" matchId="SF_1" placeholderA="W_QF_1" placeholderB="W_QF_2" />
              </div>

              {/* Grand Final & Champion Screen */}
              <div className="flex flex-col items-center bg-[#0d0d12] border-2 border-secondary-container border-opacity-30 rounded-lg p-5 shadow-[0_0_25px_rgba(0,224,255,0.15)] relative overflow-hidden w-52 transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,224,255,0.3)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,e0,ff,0.05)_0%,_transparent_70%)] pointer-events-none" />
                
                <h3 className="font-display-lg text-lg italic text-[#ffdc49] skew-x-[-12deg] tracking-widest mb-3 uppercase font-black drop-shadow-[0_0_5px_currentColor]">
                  GRAND FINAL
                </h3>
                
                <RenderMatch roundKey="final" matchId="FINAL" placeholderA="W_SF_1" placeholderB="W_SF_2" />

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
                <RenderMatch roundKey="third_place" matchId="THIRD" placeholderA="L_SF_1" placeholderB="L_SF_2" />
              </div>

              {/* Semi-final 2 (Right Winner) */}
              <div className="text-center">
                <div className="font-label-caps text-[10px] text-text-muted mb-2 tracking-widest uppercase">Semi-Final 2</div>
                <RenderMatch roundKey="semi_finals" matchId="SF_2" placeholderA="W_QF_3" placeholderB="W_QF_4" />
              </div>

            </div>

            {/* RIGHT SIDE BRACKET (Bottom Half) */}
            <div className="flex gap-6 items-center">

              {/* R3: Quarter-finals (Right) */}
              <div className="flex flex-col justify-around py-12 h-full" style={{ gap: '12rem' }}>
                <RenderMatch roundKey="quarter_finals" matchId="QF_3" placeholderA="W_R16_5" placeholderB="W_R16_6" />
                <RenderMatch roundKey="quarter_finals" matchId="QF_4" placeholderA="W_R16_7" placeholderB="W_R16_8" />
              </div>

              {/* R2: Round of 16 (Right) */}
              <div className="flex flex-col justify-around py-4 h-full" style={{ gap: '4.5rem' }}>
                <RenderMatch roundKey="round_of_16" matchId="R16_5" placeholderA="W_R32_9" placeholderB="W_R32_10" />
                <RenderMatch roundKey="round_of_16" matchId="R16_6" placeholderA="W_R32_11" placeholderB="W_R32_12" />
                <RenderMatch roundKey="round_of_16" matchId="R16_7" placeholderA="W_R32_13" placeholderB="W_R32_14" />
                <RenderMatch roundKey="round_of_16" matchId="R16_8" placeholderA="W_R32_15" placeholderB="W_R32_16" />
              </div>

              {/* R1: Round of 32 (Right) */}
              <div className="flex flex-col gap-2">
                <RenderMatch roundKey="round_of_32" matchId="R32_9" placeholderA="1C" placeholderB="2F" />
                <RenderMatch roundKey="round_of_32" matchId="R32_10" placeholderA="2E" placeholderB="2I" />
                <RenderMatch roundKey="round_of_32" matchId="R32_11" placeholderA="1A" placeholderB="CEFHI3" />
                <RenderMatch roundKey="round_of_32" matchId="R32_12" placeholderA="1L" placeholderB="EHIJK3" />
                <RenderMatch roundKey="round_of_32" matchId="R32_13" placeholderA="1J" placeholderB="2H" />
                <RenderMatch roundKey="round_of_32" matchId="R32_14" placeholderA="2D" placeholderB="2G" />
                <RenderMatch roundKey="round_of_32" matchId="R32_15" placeholderA="1B" placeholderB="EFGIJ3" />
                <RenderMatch roundKey="round_of_32" matchId="R32_16" placeholderA="1K" placeholderB="DEIJL3" />
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
