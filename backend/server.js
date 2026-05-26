const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { initializeDb, logMatchPrediction, logXGPrediction, logPenaltyPrediction } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

app.use(cors());
app.use(express.json());

// Initialize Database on startup
initializeDb();

// ── Gateway Routes ────────────────────────────────────────────────────────────

// 1. Health check
app.get('/api/health', async (req, res) => {
  let mlServiceHealthy = false;
  let mlServiceDetails = null;

  try {
    const mlRes = await axios.get(`${ML_SERVICE_URL}/health`);
    if (mlRes.status === 200) {
      mlServiceHealthy = true;
      mlServiceDetails = mlRes.data;
    }
  } catch (error) {
    console.error('Cannot connect to ML service:', error.message);
  }

  res.json({
    gateway: 'online',
    ml_service: mlServiceHealthy ? 'healthy' : 'offline',
    ml_service_details: mlServiceDetails
  });
});

// 1.5. Proxy teams list
app.get('/api/teams', async (req, res) => {
  try {
    const mlRes = await axios.get(`${ML_SERVICE_URL}/teams`);
    res.json(mlRes.data);
  } catch (error) {
    console.error('Failed to proxy /api/teams:', error.message);
    res.status(500).json({ error: 'Failed to fetch team list' });
  }
});

// 1.6. Proxy squads list
app.get('/api/squads', async (req, res) => {
  try {
    const mlRes = await axios.get(`${ML_SERVICE_URL}/squads`);
    res.json(mlRes.data);
  } catch (error) {
    console.error('Failed to proxy /api/squads:', error.message);
    res.status(500).json({ error: 'Failed to fetch squads list' });
  }
});

// 2. Proxy match outcome prediction
app.post('/api/predict/match', async (req, res) => {
  try {
    const mlRes = await axios.post(`${ML_SERVICE_URL}/predict/match`, req.body);
    const { home_team, away_team, home_win_prob, draw_prob, away_win_prob } = mlRes.data;

    // Log to DB / Fallback asynchronously (don't block response)
    logMatchPrediction(home_team, away_team, home_win_prob, draw_prob, away_win_prob)
      .catch(err => console.error('Logging match prediction failed:', err.message));

    res.json(mlRes.data);
  } catch (error) {
    console.error('Match prediction proxy failed:', error.message);
    const statusCode = error.response ? error.response.status : 500;
    const detail = error.response && error.response.data ? error.response.data : { detail: 'ML Service Unreachable' };
    res.status(statusCode).json(detail);
  }
});

// 3. Proxy xG prediction
app.post('/api/predict/xg', async (req, res) => {
  try {
    const mlRes = await axios.post(`${ML_SERVICE_URL}/predict/xg`, req.body);
    const { location_x, location_y, body_part, shot_technique } = req.body;
    const { xg } = mlRes.data;

    // Log to DB / Fallback
    logXGPrediction(location_x, location_y, body_part || 'Right Foot', shot_technique || 'Normal', xg)
      .catch(err => console.error('Logging xG prediction failed:', err.message));

    res.json(mlRes.data);
  } catch (error) {
    console.error('xG prediction proxy failed:', error.message);
    const statusCode = error.response ? error.response.status : 500;
    const detail = error.response && error.response.data ? error.response.data : { detail: 'ML Service Unreachable' };
    res.status(statusCode).json(detail);
  }
});

// 4. Proxy penalty shootout simulator
app.post('/api/predict/penalty', async (req, res) => {
  try {
    const mlRes = await axios.post(`${ML_SERVICE_URL}/predict/penalty`, req.body);
    const { kicker, keeper, results } = mlRes.data;

    // Log predictions for all 6 quadrants in parallel
    Promise.all(results.map(r => 
      logPenaltyPrediction(kicker, keeper, r.quadrant, r.score_probability, r.save_probability, r.miss_probability)
    )).catch(err => console.error('Logging penalty predictions failed:', err.message));

    res.json(mlRes.data);
  } catch (error) {
    console.error('Penalty prediction proxy failed:', error.message);
    const statusCode = error.response ? error.response.status : 500;
    const detail = error.response && error.response.data ? error.response.data : { detail: 'ML Service Unreachable' };
    res.status(statusCode).json(detail);
  }
});

// ── Tournament Simulator Helper & Matchups ───────────────────────────────

const groupsData = {
  A: ['Mexico', 'South Africa', 'South Korea', 'Czechia'],
  B: ['Canada', 'Bosnia and Herzegovina', 'Qatar', 'Switzerland'],
  C: ['Brazil', 'Morocco', 'Scotland', 'Haiti'],
  D: ['USA', 'Australia', 'Paraguay', 'Turkey'],
  E: ['Germany', 'Ecuador', 'Ivory Coast', 'Curacao'],
  F: ['Netherlands', 'Japan', 'Tunisia', 'Sweden'],
  G: ['Belgium', 'Iran', 'Egypt', 'New Zealand'],
  H: ['Spain', 'Uruguay', 'Saudi Arabia', 'Cape Verde'],
  I: ['France', 'Norway', 'Senegal', 'Iraq'],
  J: ['Argentina', 'Austria', 'Algeria', 'Jordan'],
  K: ['Portugal', 'Colombia', 'Uzbekistan', 'DR Congo'],
  L: ['England', 'Croatia', 'Ghana', 'Panama']
};

const simulateMatch = async (teamA, teamB, squads = {}, deterministic = false, isGroupStage = false) => {
  const mlRes = await axios.post(`${ML_SERVICE_URL}/predict/match`, {
    home_team: teamA,
    away_team: teamB,
    is_neutral: true
  });
  
  let { home_win_prob, draw_prob, away_win_prob, home_elo, away_elo, home_goals_avg, away_goals_avg } = mlRes.data;
  
  if (squads[teamA]) {
    const avgRating = squads[teamA].reduce((acc, p) => acc + p.rating, 0) / squads[teamA].length;
    home_elo += (avgRating - 80) * 5;
  }
  if (squads[teamB]) {
    const avgRating = squads[teamB].reduce((acc, p) => acc + p.rating, 0) / squads[teamB].length;
    away_elo += (avgRating - 80) * 5;
  }

  let winner = '';
  let scoreStr = '';
  let shootoutStr = '';
  let homeGoals = 0;
  let awayGoals = 0;
  
  if (deterministic) {
    if (home_win_prob > away_win_prob + (isGroupStage ? 0.1 : 0)) {
      winner = teamA;
      homeGoals = Math.max(1, Math.round(home_goals_avg + (home_win_prob - away_win_prob) * 1.2));
      awayGoals = Math.max(0, Math.round(away_goals_avg - (home_win_prob - away_win_prob) * 0.8));
      if (homeGoals <= awayGoals) homeGoals = awayGoals + 1;
    } else if (away_win_prob > home_win_prob + (isGroupStage ? 0.1 : 0)) {
      winner = teamB;
      awayGoals = Math.max(1, Math.round(away_goals_avg + (away_win_prob - home_win_prob) * 1.2));
      homeGoals = Math.max(0, Math.round(home_goals_avg - (away_win_prob - home_win_prob) * 0.8));
      if (awayGoals <= homeGoals) awayGoals = homeGoals + 1;
    } else {
      if (isGroupStage) {
        winner = 'Draw';
        homeGoals = awayGoals = Math.min(Math.max(Math.round((home_goals_avg + away_goals_avg) / 2), 1), 3);
      } else {
        const homeWins = home_elo >= away_elo;
        winner = homeWins ? teamA : teamB;
        homeGoals = awayGoals = Math.min(Math.max(Math.round((home_goals_avg + away_goals_avg) / 2), 1), 3);
        shootoutStr = homeWins ? 'Pen: 5-4' : 'Pen: 4-5';
      }
    }
    homeGoals = Math.min(homeGoals, 5);
    awayGoals = Math.min(awayGoals, 5);
    scoreStr = `${homeGoals}-${awayGoals}`;
  } else {
    const r = Math.random();
    if (r < home_win_prob) {
      winner = teamA;
      homeGoals = Math.floor(Math.random() * 3) + 1;
      awayGoals = Math.floor(Math.random() * homeGoals);
    } else if (r < home_win_prob + draw_prob && isGroupStage) {
      winner = 'Draw';
      homeGoals = awayGoals = Math.floor(Math.random() * 3);
    } else if (r < home_win_prob + draw_prob && !isGroupStage) {
      const eloDiff = home_elo - away_elo;
      const homeShootoutProb = 1 / (1 + Math.exp(-eloDiff / 150));
      const sr = Math.random();
      homeGoals = awayGoals = Math.floor(Math.random() * 3);
      if (sr < homeShootoutProb) {
        winner = teamA;
        shootoutStr = `Pen: 5-${Math.floor(Math.random() * 3) + 2}`;
      } else {
        winner = teamB;
        shootoutStr = `Pen: ${Math.floor(Math.random() * 3) + 2}-5`;
      }
    } else {
      winner = teamB;
      awayGoals = Math.floor(Math.random() * 3) + 1;
      homeGoals = Math.floor(Math.random() * awayGoals);
    }
    scoreStr = `${homeGoals}-${awayGoals}`;
  }
  
  return {
    home_team: teamA,
    away_team: teamB,
    home_goals: homeGoals,
    away_goals: awayGoals,
    score: scoreStr,
    shootout: shootoutStr,
    winner,
    home_elo,
    away_elo
  };
};

app.post('/api/simulate/tournament', async (req, res) => {
  try {
    const { deterministic } = req.body;

    // Fetch dynamic squads from ML Service
    let squads = {};
    try {
      const squadsRes = await axios.get(`${ML_SERVICE_URL}/squads`);
      squads = squadsRes.data;
    } catch (err) {
      console.error('Failed to fetch squads for simulation:', err.message);
    }
    
    const groupResults = {};
    const thirdPlaceTeams = [];
    let allMatches = [];

    for (const [groupName, teams] of Object.entries(groupsData)) {
      const standings = teams.map(t => ({ team: t, pts: 0, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0 }));
      const matchesToPlay = [
        [teams[0], teams[1]], [teams[2], teams[3]],
        [teams[0], teams[2]], [teams[1], teams[3]],
        [teams[0], teams[3]], [teams[1], teams[2]]
      ];
      
      const groupMatches = [];
      for (const [tA, tB] of matchesToPlay) {
        const match = await simulateMatch(tA, tB, squads, deterministic, true);
        groupMatches.push(match);
        allMatches.push(match);
        
        const stA = standings.find(s => s.team === tA);
        const stB = standings.find(s => s.team === tB);
        
        stA.p++; stB.p++;
        stA.gf += match.home_goals; stA.ga += match.away_goals;
        stB.gf += match.away_goals; stB.ga += match.home_goals;
        
        if (match.winner === tA) { stA.w++; stA.pts += 3; stB.l++; }
        else if (match.winner === tB) { stB.w++; stB.pts += 3; stA.l++; }
        else { stA.d++; stB.d++; stA.pts += 1; stB.pts += 1; }
        
        stA.gd = stA.gf - stA.ga;
        stB.gd = stB.gf - stB.ga;
      }
      
      standings.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
      groupResults[groupName] = { teams, matches: groupMatches, standings };
      thirdPlaceTeams.push({ ...standings[2], group: groupName });
    }
    
    thirdPlaceTeams.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
    const bestThirds = thirdPlaceTeams.slice(0, 8);
    const advancedThirds = bestThirds.map(t => ({ team: t.team, group: t.group }));
    
    const get1st = g => groupResults[g].standings[0].team;
    const get2nd = g => groupResults[g].standings[1].team;
    const get3rd = g => { const t = advancedThirds.find(x => x.group === g); return t ? t.team : null; };
    const thirds = advancedThirds.map(t => t.team);
    
    const r32Matchups = [
      { id: 'R32_1', teamA: get1st('A'), teamB: thirds[0] },
      { id: 'R32_2', teamA: get2nd('A'), teamB: get2nd('B') },
      { id: 'R32_3', teamA: get1st('B'), teamB: thirds[1] },
      { id: 'R32_4', teamA: get2nd('C'), teamB: get2nd('D') },
      { id: 'R32_5', teamA: get1st('C'), teamB: thirds[2] },
      { id: 'R32_6', teamA: get2nd('E'), teamB: get2nd('F') },
      { id: 'R32_7', teamA: get1st('D'), teamB: thirds[3] },
      { id: 'R32_8', teamA: get2nd('G'), teamB: get2nd('H') },
      { id: 'R32_9', teamA: get1st('E'), teamB: thirds[4] },
      { id: 'R32_10', teamA: get2nd('I'), teamB: get2nd('J') },
      { id: 'R32_11', teamA: get1st('F'), teamB: thirds[5] },
      { id: 'R32_12', teamA: get2nd('K'), teamB: get2nd('L') },
      { id: 'R32_13', teamA: get1st('G'), teamB: thirds[6] },
      { id: 'R32_14', teamA: get1st('H'), teamB: thirds[7] },
      { id: 'R32_15', teamA: get1st('I'), teamB: get1st('J') },
      { id: 'R32_16', teamA: get1st('K'), teamB: get1st('L') }
    ];
    
    const r32Matches = await Promise.all(r32Matchups.map(m => simulateMatch(m.teamA, m.teamB, squads, deterministic)));
    r32Matches.forEach(m => allMatches.push(m));
    
    const simNextRound = async (matches, idPrefix) => {
      const nextMatchups = [];
      for (let i = 0; i < matches.length; i += 2) {
        nextMatchups.push({ id: `${idPrefix}_${i/2 + 1}`, teamA: matches[i].winner, teamB: matches[i+1].winner });
      }
      const results = await Promise.all(nextMatchups.map(m => simulateMatch(m.teamA, m.teamB, squads, deterministic)));
      results.forEach(m => allMatches.push(m));
      return results.map((m, idx) => ({ ...m, id: nextMatchups[idx].id }));
    };
    
    const r16Matches = await simNextRound(r32Matches, 'R16');
    const qfMatches = await simNextRound(r16Matches, 'QF');
    const sfMatches = await simNextRound(qfMatches, 'SF');
    
    const loserSF1 = sfMatches[0].home_team === sfMatches[0].winner ? sfMatches[0].away_team : sfMatches[0].home_team;
    const loserSF2 = sfMatches[1].home_team === sfMatches[1].winner ? sfMatches[1].away_team : sfMatches[1].home_team;
    
    const thirdMatch = await simulateMatch(loserSF1, loserSF2, squads, deterministic);
    const finalMatch = await simulateMatch(sfMatches[0].winner, sfMatches[1].winner, squads, deterministic);
    
    res.json({
      groups: groupResults,
      best_third: advancedThirds,
      round_of_32: r32Matches.map((m, idx) => ({ ...m, id: r32Matchups[idx].id })),
      round_of_16: r16Matches,
      quarter_finals: qfMatches,
      semi_finals: sfMatches,
      third_place: { ...thirdMatch, id: 'THIRD' },
      final: { ...finalMatch, id: 'FINAL' },
      champion: finalMatch.winner,
      team_squads: squads
    });
  } catch (error) {
    console.error('Tournament simulation failed:', error.message);
    res.status(500).json({ error: 'Simulation failed: ' + error.message });
  }
});

// Start Express gateway
app.listen(PORT, () => {
  console.log(`============================================================`);
  console.log(`Express Gateway Server running on http://localhost:${PORT}`);
  console.log(`Proxying requests to ML Service on ${ML_SERVICE_URL}`);
  console.log(`============================================================`);
});
