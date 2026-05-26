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
  
  // Calculate squad stats based on player form & goals (NOT player rating or ELO)
  const getSquadMetric = (squad = []) => {
    if (squad.length === 0) return { form: 7.5, goals: 5 };
    const avgForm = squad.reduce((acc, p) => acc + (p.form || 7.5), 0) / squad.length;
    const totalGoals = squad.reduce((acc, p) => acc + (p.goals || 0), 0);
    return { form: avgForm, goals: totalGoals };
  };

  const homeMetric = getSquadMetric(squads[teamA]);
  const awayMetric = getSquadMetric(squads[teamB]);

  // Squad Score is weighted by player form (avg 7.5) and season goals
  const homeSquadScore = homeMetric.form * 8 + homeMetric.goals;
  const awaySquadScore = awayMetric.form * 8 + awayMetric.goals;
  
  // Adjust win probabilities dynamically based on squad form & goals instead of Elo
  const scoreDiff = homeSquadScore - awaySquadScore;
  const probabilityAdj = Math.tanh(scoreDiff / 40) * 0.25; // limit adjustment to +/- 25%
  home_win_prob += probabilityAdj;
  away_win_prob -= probabilityAdj;

  // Ensure probabilities are valid and normalized
  if (home_win_prob < 0.05) home_win_prob = 0.05;
  if (away_win_prob < 0.05) away_win_prob = 0.05;
  const probSum = home_win_prob + draw_prob + away_win_prob;
  home_win_prob /= probSum;
  draw_prob /= probSum;
  away_win_prob /= probSum;

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
        // Tie breaker based on squad form & goals (instead of Elo)
        const homeWins = homeSquadScore >= awaySquadScore;
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
      // Shootout win probability based on squad form & goals (instead of Elo)
      const homeShootoutProb = 1 / (1 + Math.exp(-scoreDiff / 15));
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

    // Backtracking match algorithm to assign third place qualifiers to their allowed slots
    const assignThirdsToSlots = (thirdsList) => {
      const slots = [
        { name: 'ABCDF3', allowed: ['A', 'B', 'C', 'D', 'F'] },
        { name: 'CDFGH3', allowed: ['C', 'D', 'F', 'G', 'H'] },
        { name: 'BEFIJ3', allowed: ['B', 'E', 'F', 'I', 'J'] },
        { name: 'AEHIJ3', allowed: ['A', 'E', 'H', 'I', 'J'] },
        { name: 'CEFHI3', allowed: ['C', 'E', 'F', 'H', 'I'] },
        { name: 'EHIJK3', allowed: ['E', 'H', 'I', 'J', 'K'] },
        { name: 'EFGIJ3', allowed: ['E', 'F', 'G', 'I', 'J'] },
        { name: 'DEIJL3', allowed: ['D', 'E', 'I', 'J', 'L'] }
      ];
      
      const assignment = {};
      const usedTeams = new Set();
      
      const backtrack = (slotIdx) => {
        if (slotIdx === slots.length) return true;
        const slot = slots[slotIdx];
        
        for (let i = 0; i < thirdsList.length; i++) {
          const teamObj = thirdsList[i];
          if (usedTeams.has(teamObj.team)) continue;
          
          if (slot.allowed.includes(teamObj.group)) {
            assignment[slot.name] = teamObj.team;
            usedTeams.add(teamObj.team);
            
            if (backtrack(slotIdx + 1)) return true;
            
            // backtrack
            delete assignment[slot.name];
            usedTeams.delete(teamObj.team);
          }
        }
        return false;
      };
      
      const success = backtrack(0);
      if (!success) {
        console.warn("Could not find perfect matching for third-place teams. Using rank order fallback.");
        slots.forEach((slot, idx) => {
          assignment[slot.name] = thirdsList[idx] ? thirdsList[idx].team : null;
        });
      }
      return assignment;
    };
    
    const thirdAssignments = assignThirdsToSlots(advancedThirds);
    
    const r32Matchups = [
      { id: 'R32_1', teamA: get2nd('A'), teamB: get2nd('B') },
      { id: 'R32_2', teamA: get1st('F'), teamB: get2nd('C') },
      { id: 'R32_3', teamA: get1st('E'), teamB: thirdAssignments['ABCDF3'] },
      { id: 'R32_4', teamA: get1st('I'), teamB: thirdAssignments['CDFGH3'] },
      { id: 'R32_5', teamA: get2nd('K'), teamB: get2nd('L') },
      { id: 'R32_6', teamA: get1st('H'), teamB: get2nd('J') },
      { id: 'R32_7', teamA: get1st('D'), teamB: thirdAssignments['BEFIJ3'] },
      { id: 'R32_8', teamA: get1st('G'), teamB: thirdAssignments['AEHIJ3'] },
      
      { id: 'R32_9', teamA: get1st('C'), teamB: get2nd('F') },
      { id: 'R32_10', teamA: get2nd('E'), teamB: get2nd('I') },
      { id: 'R32_11', teamA: get1st('A'), teamB: thirdAssignments['CEFHI3'] },
      { id: 'R32_12', teamA: get1st('L'), teamB: thirdAssignments['EHIJK3'] },
      { id: 'R32_13', teamA: get1st('J'), teamB: get2nd('H') },
      { id: 'R32_14', teamA: get2nd('D'), teamB: get2nd('G') },
      { id: 'R32_15', teamA: get1st('B'), teamB: thirdAssignments['EFGIJ3'] },
      { id: 'R32_16', teamA: get1st('K'), teamB: thirdAssignments['DEIJL3'] }
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
