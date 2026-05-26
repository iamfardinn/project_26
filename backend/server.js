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

const initialMatchups = [
  // Left Bracket
  { id: 'M74', teamA: 'Argentina', teamB: 'Saudi Arabia' },
  { id: 'M77', teamA: 'USA', teamB: 'Ukraine' },
  { id: 'M73', teamA: 'Belgium', teamB: 'Denmark' },
  { id: 'M75', teamA: 'Netherlands', teamB: 'South Korea' },
  { id: 'M83', teamA: 'Croatia', teamB: 'Canada' },
  { id: 'M84', teamA: 'Portugal', teamB: 'Senegal' },
  { id: 'M81', teamA: 'Italy', teamB: 'Ghana' },
  { id: 'M82', teamA: 'Spain', teamB: 'Japan' },
  
  // Right Bracket
  { id: 'M76', teamA: 'France', teamB: 'Australia' },
  { id: 'M78', teamA: 'Colombia', teamB: 'Sweden' },
  { id: 'M79', teamA: 'Uruguay', teamB: 'Turkey' },
  { id: 'M80', teamA: 'Germany', teamB: 'Iran' },
  { id: 'M86', teamA: 'England', teamB: 'Ecuador' },
  { id: 'M88', teamA: 'Switzerland', teamB: 'Austria' },
  { id: 'M85', teamA: 'Brazil', teamB: 'Nigeria' },
  { id: 'M87', teamA: 'Morocco', teamB: 'Mexico' }
];

const simulateMatch = async (teamA, teamB) => {
  const mlRes = await axios.post(`${ML_SERVICE_URL}/predict/match`, {
    home_team: teamA,
    away_team: teamB,
    is_neutral: true
  });
  
  const { home_win_prob, draw_prob, away_win_prob, home_elo, away_elo } = mlRes.data;
  
  const r = Math.random();
  let winner = '';
  let scoreStr = '';
  let shootoutStr = '';
  
  if (r < home_win_prob) {
    winner = teamA;
    const homeGoals = Math.floor(Math.random() * 3) + 1;
    const awayGoals = Math.floor(Math.random() * homeGoals);
    scoreStr = `${homeGoals}-${awayGoals}`;
  } else if (r < home_win_prob + draw_prob) {
    const goals = Math.floor(Math.random() * 3);
    scoreStr = `${goals}-${goals}`;
    
    const eloDiff = home_elo - away_elo;
    const homeShootoutProb = 1 / (1 + Math.exp(-eloDiff / 150));
    const sr = Math.random();
    
    if (sr < homeShootoutProb) {
      winner = teamA;
      const homePen = 5;
      const awayPen = Math.floor(Math.random() * 3) + 2;
      shootoutStr = `Pen: ${homePen}-${awayPen}`;
    } else {
      winner = teamB;
      const awayPen = 5;
      const homePen = Math.floor(Math.random() * 3) + 2;
      shootoutStr = `Pen: ${homePen}-${awayPen}`;
    }
  } else {
    winner = teamB;
    const awayGoals = Math.floor(Math.random() * 3) + 1;
    const homeGoals = Math.floor(Math.random() * awayGoals);
    scoreStr = `${homeGoals}-${awayGoals}`;
  }
  
  return {
    home_team: teamA,
    away_team: teamB,
    score: scoreStr,
    shootout: shootoutStr,
    winner,
    home_elo,
    away_elo
  };
};

// 5. Proxy tournament simulation
app.post('/api/simulate/tournament', async (req, res) => {
  try {
    // Round of 32 (16 matches)
    const r32Matches = await Promise.all(initialMatchups.map(m => simulateMatch(m.teamA, m.teamB)));
    
    // Round of 16 Matchups (8 matches)
    const r16Matchups = [
      { id: 'M89', teamA: r32Matches[0].winner, teamB: r32Matches[1].winner }, // W_M74 vs W_M77
      { id: 'M90', teamA: r32Matches[2].winner, teamB: r32Matches[3].winner }, // W_M73 vs W_M75
      { id: 'M93', teamA: r32Matches[4].winner, teamB: r32Matches[5].winner }, // W_M83 vs W_M84
      { id: 'M94', teamA: r32Matches[6].winner, teamB: r32Matches[7].winner }, // W_M81 vs W_M82
      
      { id: 'M91', teamA: r32Matches[8].winner,  teamB: r32Matches[9].winner },  // W_M76 vs W_M78
      { id: 'M92', teamA: r32Matches[10].winner, teamB: r32Matches[11].winner }, // W_M79 vs W_M80
      { id: 'M95', teamA: r32Matches[12].winner, teamB: r32Matches[13].winner }, // W_M86 vs W_M88
      { id: 'M96', teamA: r32Matches[14].winner, teamB: r32Matches[15].winner }  // W_M85 vs W_M87
    ];
    const r16Matches = await Promise.all(r16Matchups.map(m => simulateMatch(m.teamA, m.teamB)));
    
    // Quarter-finals Matchups (4 matches)
    const qfMatchups = [
      { id: 'M97', teamA: r16Matches[0].winner, teamB: r16Matches[1].winner }, // W_M89 vs W_M90
      { id: 'M98', teamA: r16Matches[2].winner, teamB: r16Matches[3].winner }, // W_M93 vs W_M94
      
      { id: 'M99',  teamA: r16Matches[4].winner, teamB: r16Matches[5].winner }, // W_M91 vs W_M92
      { id: 'M100', teamA: r16Matches[6].winner, teamB: r16Matches[7].winner }  // W_M95 vs W_M96
    ];
    const qfMatches = await Promise.all(qfMatchups.map(m => simulateMatch(m.teamA, m.teamB)));
    
    // Semi-finals Matchups (2 matches)
    const sfMatchups = [
      { id: 'M101', teamA: qfMatches[0].winner, teamB: qfMatches[1].winner }, // W_M97 vs W_M98
      { id: 'M102', teamA: qfMatches[2].winner, teamB: qfMatches[3].winner }  // W_M99 vs W_M100
    ];
    const sfMatches = await Promise.all(sfMatchups.map(m => simulateMatch(m.teamA, m.teamB)));
    
    // Get losers for third place
    const getLoser = (match, winner) => (match.home_team === winner) ? match.away_team : match.home_team;
    const loserSF1 = getLoser(sfMatches[0], sfMatches[0].winner);
    const loserSF2 = getLoser(sfMatches[1], sfMatches[1].winner);
    
    // Finals Matchups (2 matches: Final & Third Place)
    const finalMatch = await simulateMatch(sfMatches[0].winner, sfMatches[1].winner);
    const thirdMatch = await simulateMatch(loserSF1, loserSF2);
    
    res.json({
      round_of_32: r32Matches.map((m, idx) => ({ ...m, id: initialMatchups[idx].id })),
      round_of_16: r16Matches.map((m, idx) => ({ ...m, id: r16Matchups[idx].id })),
      quarter_finals: qfMatches.map((m, idx) => ({ ...m, id: qfMatchups[idx].id })),
      semi_finals: sfMatches.map((m, idx) => ({ ...m, id: sfMatchups[idx].id })),
      third_place: { ...thirdMatch, id: 'M103' },
      final: { ...finalMatch, id: 'M104' },
      champion: finalMatch.winner
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
