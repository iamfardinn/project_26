import React, { useState, useEffect } from 'react'

export default function MatchOutcomeEngine() {
  const [teams, setTeams] = useState([])
  const [selectedTeamA, setSelectedTeamA] = useState('')
  const [selectedTeamB, setSelectedTeamB] = useState('')
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch teams on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/teams')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load team list')
        return res.json()
      })
      .then((data) => {
        setTeams(data)
        // Set defaults
        const defaultA = data.find((t) => t.name === 'Argentina') || data[0]
        const defaultB = data.find((t) => t.name === 'France') || data[1]
        if (defaultA) setSelectedTeamA(defaultA.name)
        if (defaultB) setSelectedTeamB(defaultB.name)
      })
      .catch((err) => {
        console.error(err)
        setError('Error loading team data.')
      })
  }, [])

  const getTeamStats = (name) => {
    return teams.find((t) => t.name === name) || { elo: 1500, form: 0.5, goals_avg: 1.0 }
  }

  // Convert form score [0, 1] to W/D/L representations
  const getFormDots = (formScore) => {
    if (formScore >= 0.8) return ['W', 'W', 'W', 'W', 'D']
    if (formScore >= 0.6) return ['W', 'W', 'D', 'D', 'L']
    if (formScore >= 0.4) return ['W', 'D', 'D', 'L', 'L']
    if (formScore >= 0.2) return ['D', 'L', 'L', 'L', 'L']
    return ['L', 'L', 'L', 'L', 'L']
  }

  const handlePredict = async () => {
    if (!selectedTeamA || !selectedTeamB) return
    if (selectedTeamA === selectedTeamB) {
      setError('Please select two different teams.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('http://localhost:5000/api/predict/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          home_team: selectedTeamA,
          away_team: selectedTeamB,
          is_neutral: true
        })
      })

      if (!res.ok) throw new Error('Prediction request failed')
      const data = await res.json()
      setPrediction(data)
    } catch (err) {
      console.error(err)
      setError('Error calling prediction engine.')
    } finally {
      setLoading(false)
    }
  }

  const statsA = getTeamStats(selectedTeamA)
  const statsB = getTeamStats(selectedTeamB)

  const winProb = prediction ? prediction.home_win_prob : 0.45
  const drawProb = prediction ? prediction.draw_prob : 0.25
  const lossProb = prediction ? prediction.away_win_prob : 0.30

  return (
    <section id="match" className="relative z-20 py-12 lg:py-16">
      <div className="max-w-max-width mx-auto px-4 sm:px-6 lg:px-margin-desktop">

        {/* Section Header */}
        <div className="mb-8 lg:mb-12">
          <h2 className="font-display-lg text-headline-lg uppercase tracking-tighter text-on-background drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            MATCH OUTCOME ENGINE
          </h2>
          <div className="w-48 h-[2px] bg-secondary-container shadow-[0_0_15px_#00e0ff] mt-2" />
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-6 p-4 bg-danger-red bg-opacity-20 border border-danger-red text-on-background font-label-caps text-label-caps">
            ⚠️ {error}
          </div>
        )}

        {/* Engine Card */}
        <div className="bg-[#09090b] neoclassical-frame">
          <div className="neoclassical-inner p-6 lg:p-8">

            {/* Team Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-8 items-start">

              {/* Team A */}
              <div className="space-y-4">
                <label className="block font-label-caps text-label-caps text-primary-container uppercase drop-shadow-[0_0_5px_rgba(0,255,133,0.5)]">
                  Team A (Home Perspective)
                </label>
                <div className="relative">
                  <select
                    value={selectedTeamA}
                    onChange={(e) => {
                      setSelectedTeamA(e.target.value)
                      setPrediction(null)
                    }}
                    className="w-full bg-[#09090b] border border-primary-container text-on-background font-label-caps text-label-caps py-4 px-4 focus:outline-none focus:shadow-[0_0_15px_rgba(0,255,133,0.5)] transition-all cursor-pointer"
                  >
                    {teams.map((t) => (
                      <option key={t.name} value={t.name}>{t.name.toUpperCase()}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary-container" style={{ fontSize: '20px' }}>expand_more</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-primary-container border-opacity-30 mt-2">
                  <div className="text-center">
                    <div className="font-stat-sm text-stat-sm text-text-muted uppercase mb-1">HISTORICAL ELO</div>
                    <div className="font-stat-lg text-stat-lg text-primary-container drop-shadow-[0_0_5px_currentColor]">
                      {Math.round(statsA.elo)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-stat-sm text-stat-sm text-text-muted uppercase mb-1">FORM (LAST 5)</div>
                    <div className="flex gap-1 mt-1">
                      {getFormDots(statsA.form).map((res, idx) => (
                        <span
                          key={idx}
                          className={`w-2.5 h-2.5 rounded-sm ${
                            res === 'W'
                              ? 'bg-primary-container shadow-[0_0_5px_#00ff85]'
                              : res === 'D'
                              ? 'bg-text-muted'
                              : 'bg-danger-red shadow-[0_0_5px_#FF4B4B]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* VS + Predict */}
              <div className="flex flex-row md:flex-col items-center justify-center gap-4 md:gap-6 py-4 md:py-0">
                <div className="font-display-lg text-3xl lg:text-4xl font-black italic text-text-muted skew-x-[-12deg] drop-shadow-[0_0_5px_currentColor]">
                  VS
                </div>
                <button
                  onClick={handlePredict}
                  disabled={loading}
                  className="bg-[#09090b] border border-primary-container text-primary-container hover:bg-primary-container hover:text-[#09090b] disabled:opacity-50 font-label-caps text-label-caps px-6 lg:px-10 py-3 lg:py-5 skew-x-[-12deg] transform transition-all active:scale-95 shadow-[0_0_20px_rgba(0,255,133,0.4)] hover:shadow-[0_0_30px_rgba(0,255,133,0.8)] cursor-pointer"
                >
                  <span className="block skew-x-[12deg] font-black tracking-widest">
                    {loading ? 'SIMULATING...' : 'PREDICT'}
                  </span>
                </button>
              </div>

              {/* Team B */}
              <div className="space-y-4">
                <label className="block font-label-caps text-label-caps text-secondary-container uppercase text-left md:text-right drop-shadow-[0_0_5px_rgba(0,224,255,0.5)]">
                  Team B (Away Perspective)
                </label>
                <div className="relative">
                  <select
                    value={selectedTeamB}
                    onChange={(e) => {
                      setSelectedTeamB(e.target.value)
                      setPrediction(null)
                    }}
                    className="w-full bg-[#09090b] border border-secondary-container text-on-background font-label-caps text-label-caps py-4 px-4 focus:outline-none focus:shadow-[0_0_15px_rgba(0,224,255,0.5)] transition-all cursor-pointer"
                  >
                    {teams.map((t) => (
                      <option key={t.name} value={t.name}>{t.name.toUpperCase()}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-container" style={{ fontSize: '20px' }}>expand_more</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-secondary-container border-opacity-30 mt-2">
                  <div className="text-center">
                    <div className="font-stat-sm text-stat-sm text-text-muted uppercase mb-1">FORM (LAST 5)</div>
                    <div className="flex gap-1 mt-1">
                      {getFormDots(statsB.form).map((res, idx) => (
                        <span
                          key={idx}
                          className={`w-2.5 h-2.5 rounded-sm ${
                            res === 'W'
                              ? 'bg-primary-container shadow-[0_0_5px_#00ff85]'
                              : res === 'D'
                              ? 'bg-text-muted'
                              : 'bg-danger-red shadow-[0_0_5px_#FF4B4B]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-stat-sm text-stat-sm text-text-muted uppercase mb-1">HISTORICAL ELO</div>
                    <div className="font-stat-lg text-stat-lg text-secondary-container drop-shadow-[0_0_5px_currentColor]">
                      {Math.round(statsB.elo)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Probability Bar */}
            <div className="mt-10 lg:mt-12 space-y-3">
              <div className="flex justify-between font-label-caps text-label-caps">
                <span className="text-primary-container drop-shadow-[0_0_5px_rgba(0,255,133,0.8)]">
                  {selectedTeamA || 'TEAM A'} WIN {Math.round(winProb * 100)}%
                </span>
                <span className="text-text-muted">DRAW {Math.round(drawProb * 100)}%</span>
                <span className="text-secondary-container drop-shadow-[0_0_5px_rgba(0,224,255,0.8)]">
                  {selectedTeamB || 'TEAM B'} WIN {Math.round(lossProb * 100)}%
                </span>
              </div>
              <div className="h-4 w-full flex bg-[#09090b] border border-outline-variant overflow-hidden">
                <div
                  className="h-full bg-primary-container shadow-[0_0_15px_#00ff85] transition-all duration-700"
                  style={{ width: `${winProb * 100}%` }}
                />
                <div
                  className="h-full bg-zinc-800 transition-all duration-700"
                  style={{ width: `${drawProb * 100}%` }}
                />
                <div
                  className="h-full bg-secondary-container shadow-[0_0_15px_#00e0ff] transition-all duration-700"
                  style={{ width: `${lossProb * 100}%` }}
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
