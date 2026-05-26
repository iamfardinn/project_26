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

// Start Express gateway
app.listen(PORT, () => {
  console.log(`============================================================`);
  console.log(`Express Gateway Server running on http://localhost:${PORT}`);
  console.log(`Proxying requests to ML Service on ${ML_SERVICE_URL}`);
  console.log(`============================================================`);
});
