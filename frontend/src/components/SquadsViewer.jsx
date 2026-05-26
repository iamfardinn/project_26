import React, { useState, useEffect } from 'react'

export default function SquadsViewer() {
  const [squads, setSquads] = useState(null)
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSquads = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/squads')
        if (!res.ok) throw new Error('Failed to load squads')
        const data = await res.json()
        setSquads(data)
        const sortedTeams = Object.keys(data).sort()
        setTeams(sortedTeams)
        if (sortedTeams.length > 0) {
          setSelectedTeam(sortedTeams[0])
          if (data[sortedTeams[0]] && data[sortedTeams[0]].length > 0) {
            setSelectedPlayer(data[sortedTeams[0]][0])
          }
        }
      } catch (err) {
        console.error(err)
        setError('Failed to fetch player squads from server.')
      } finally {
        setLoading(false)
      }
    }

    fetchSquads()
  }, [])

  const handleTeamChange = (e) => {
    const team = e.target.value
    setSelectedTeam(team)
    if (squads && squads[team] && squads[team].length > 0) {
      setSelectedPlayer(squads[team][0])
    } else {
      setSelectedPlayer(null)
    }
  }

  const handlePlayerChange = (e) => {
    const playerName = e.target.value
    if (squads && selectedTeam && squads[selectedTeam]) {
      const player = squads[selectedTeam].find((p) => p.name === playerName)
      setSelectedPlayer(player || null)
    }
  }

  // Get color for rating
  const getRatingColor = (rating) => {
    if (rating >= 90) return 'text-[#00ff85] border-[#00ff85] shadow-[0_0_15px_rgba(0,255,133,0.3)]'
    if (rating >= 80) return 'text-[#00e0ff] border-[#00e0ff] shadow-[0_0_15px_rgba(0,224,255,0.3)]'
    if (rating >= 70) return 'text-[#ffdc49] border-[#ffdc49] shadow-[0_0_15px_rgba(255,220,73,0.3)]'
    return 'text-text-muted border-outline-variant'
  }

  return (
    <section id="squads-explorer" className="relative z-20 py-12 lg:py-16 bg-[#09090b] border-t border-zinc-900">
      <div className="max-w-[1000px] mx-auto px-4">
        
        {/* Section Header */}
        <div className="mb-10 text-center md:text-left">
          <h2 className="font-display-lg text-headline-lg uppercase tracking-tighter text-on-background drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            WORLD CUP SQUAD EXPLORER
          </h2>
          <div className="w-48 h-[2px] bg-primary-container shadow-[0_0_15px_#00ff85] mt-2 mx-auto md:mx-0" />
          <p className="text-text-muted text-xs font-mono uppercase tracking-wider mt-3">
            Explore 2025-26 season statistics, forms, and ratings for all 48 qualified countries
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger-red bg-opacity-20 border border-danger-red text-on-background font-label-caps text-label-caps">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-container"></div>
            <span className="ml-3 font-mono text-xs text-text-muted uppercase tracking-widest">Loading squads database...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Dropdowns */}
            <div className="md:col-span-5 bg-[#060608] border border-outline-variant p-6 space-y-6 shadow-lg rounded-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_center,_rgba(0,255,133,0.03)_0%,_transparent_70%)] pointer-events-none" />
              
              <div>
                <label className="block text-[10px] font-label-caps uppercase tracking-widest text-text-muted mb-2">
                  Select Country
                </label>
                <select
                  value={selectedTeam}
                  onChange={handleTeamChange}
                  className="w-full bg-[#0d0d12] border border-outline-variant text-on-background p-3 rounded-none focus:outline-none focus:border-primary-container font-mono text-xs uppercase tracking-wider cursor-pointer"
                >
                  {teams.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-label-caps uppercase tracking-widest text-text-muted mb-2">
                  Select Squad Player
                </label>
                <select
                  value={selectedPlayer ? selectedPlayer.name : ''}
                  onChange={handlePlayerChange}
                  disabled={!selectedPlayer}
                  className="w-full bg-[#0d0d12] border border-outline-variant text-on-background p-3 rounded-none focus:outline-none focus:border-primary-container font-mono text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {squads[selectedTeam]?.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name.toUpperCase()} ({p.position})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-zinc-900">
                <div className="text-[10px] text-text-muted font-mono uppercase tracking-wider leading-relaxed">
                  💡 Custom ratings & 2025-26 performance metrics directly feed the match simulation neural networks for outcome predictions.
                </div>
              </div>
            </div>

            {/* Right Column: Premium Player Card */}
            <div className="md:col-span-7">
              {selectedPlayer ? (
                <div className="bg-[#0c0c0e] border border-outline-variant rounded-md p-6 md:p-8 relative shadow-2xl transition-all duration-300 hover:border-primary-container hover:shadow-[0_0_20px_rgba(0,255,133,0.1)]">
                  
                  {/* Subtle Grid Accent */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.01)_1px,_transparent_1px)] bg-[size:20px_20px] pointer-events-none rounded-md" />
                  
                  {/* Top Details */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-5 relative z-10">
                    <div>
                      <span className="inline-block bg-zinc-900 border border-zinc-800 text-primary-container text-[10px] font-mono font-bold px-2 py-0.5 tracking-widest uppercase mb-1">
                        {selectedPlayer.position} • {selectedTeam.toUpperCase()}
                      </span>
                      <h3 className="font-display-lg text-2xl sm:text-3xl text-on-background uppercase tracking-tight font-black leading-none mt-1">
                        {selectedPlayer.name}
                      </h3>
                      <p className="text-[#00e0ff] text-xs font-mono tracking-wider mt-1.5">
                        🏃‍♂️ {selectedPlayer.club}
                      </p>
                    </div>

                    {/* Overall Rating Circle */}
                    <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-full border-2 bg-[#09090b] ${getRatingColor(selectedPlayer.rating)}`}>
                      <span className="font-mono text-3xl font-black leading-none">
                        {selectedPlayer.rating}
                      </span>
                      <span className="text-[8px] font-label-caps tracking-widest text-text-muted mt-0.5">
                        OVR
                      </span>
                    </div>
                  </div>

                  {/* Player Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 relative z-10">
                    
                    {/* Season goals */}
                    <div className="bg-[#09090b] border border-zinc-900 p-4">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-label-caps uppercase tracking-widest text-text-muted">Season Goals</span>
                        <span className="font-mono text-sm font-bold text-on-background">{selectedPlayer.goals}</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary-container h-full rounded-full shadow-[0_0_8px_#00ff85] transition-all duration-1000" 
                          style={{ width: `${Math.min((selectedPlayer.goals / 50) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="block text-[8px] font-mono text-text-muted text-right mt-1">Max ref: 50 goals</span>
                    </div>

                    {/* Season assists */}
                    <div className="bg-[#09090b] border border-zinc-900 p-4">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-label-caps uppercase tracking-widest text-text-muted">Season Assists</span>
                        <span className="font-mono text-sm font-bold text-on-background">{selectedPlayer.assists}</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#00e0ff] h-full rounded-full shadow-[0_0_8px_#00e0ff] transition-all duration-1000" 
                          style={{ width: `${Math.min((selectedPlayer.assists / 30) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="block text-[8px] font-mono text-text-muted text-right mt-1">Max ref: 30 assists</span>
                    </div>

                  </div>

                  {/* Form & Card Bottom Footer */}
                  <div className="mt-6 pt-5 border-t border-zinc-800 flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-label-caps uppercase tracking-widest text-text-muted">
                        Recent Form Score:
                      </span>
                      <span className="font-mono text-xs font-bold text-[#ffdc49] bg-zinc-900 border border-zinc-800 px-2 py-0.5">
                        ⭐ {selectedPlayer.form} / 10
                      </span>
                    </div>

                    <div className="text-[8px] font-mono text-text-muted uppercase tracking-widest">
                      2025-26 ACTIVE SQUAD
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-[#0c0c0e] border border-dashed border-outline-variant rounded-md p-12 text-center text-text-muted font-mono text-sm uppercase tracking-widest">
                  No player selected
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </section>
  )
}
