const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Read environment variables (will fall back to defaults)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'world_cup_analytics'
};

const pool = new Pool(dbConfig);
let useFallback = false;
const fallbackLogPath = path.join(__dirname, 'logs', 'predictions.json');

// Ensure fallback log directory exists
const ensureFallbackLogDir = () => {
  const dir = path.dirname(fallbackLogPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Log to fallback file
const writeFallbackLog = (type, payload) => {
  try {
    ensureFallbackLogDir();
    let logs = [];
    if (fs.existsSync(fallbackLogPath)) {
      const fileContent = fs.readFileSync(fallbackLogPath, 'utf8');
      if (fileContent.trim()) {
        logs = JSON.parse(fileContent);
      }
    }
    logs.push({
      id: Date.now() + Math.random().toString(36).substr(2, 5),
      type,
      timestamp: new Date().toISOString(),
      data: payload
    });
    fs.writeFileSync(fallbackLogPath, JSON.stringify(logs, null, 2));
    console.log(`[resilience fallback] Logged prediction of type "${type}" to local file: ${fallbackLogPath}`);
  } catch (error) {
    console.error('Failed to write to fallback log file:', error);
  }
};

// Initialize database tables
const initializeDb = async () => {
  try {
    // Attempt database check connection
    console.log(`Attempting PostgreSQL connection on ${dbConfig.host}:${dbConfig.port}...`);
    await pool.query('SELECT 1');
    console.log('PostgreSQL connected successfully! Creating schemas if they do not exist...');

    // Create Match Predictor table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS predictions_match (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        home_team VARCHAR(100) NOT NULL,
        away_team VARCHAR(100) NOT NULL,
        home_win_prob DOUBLE PRECISION NOT NULL,
        draw_prob DOUBLE PRECISION NOT NULL,
        away_win_prob DOUBLE PRECISION NOT NULL
      );
    `);

    // Create xG Predictor table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS predictions_xg (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        location_x DOUBLE PRECISION NOT NULL,
        location_y DOUBLE PRECISION NOT NULL,
        body_part VARCHAR(50) NOT NULL,
        shot_technique VARCHAR(50) NOT NULL,
        xg DOUBLE PRECISION NOT NULL
      );
    `);

    // Create Penalty Simulator table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS predictions_penalty (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        kicker VARCHAR(100) NOT NULL,
        keeper VARCHAR(100) NOT NULL,
        quadrant INTEGER NOT NULL,
        score_probability DOUBLE PRECISION NOT NULL,
        save_probability DOUBLE PRECISION NOT NULL,
        miss_probability DOUBLE PRECISION NOT NULL
      );
    `);

    console.log('Database schemas initialized successfully.');
  } catch (err) {
    console.warn('\n⚠️ WARNING: PostgreSQL connection failed.');
    console.warn(`Error detail: ${err.message}`);
    console.warn('System will automatically run in fallback mode: saving predictions to JSON files.\n');
    useFallback = true;
  }
};

// Export DB operations
module.exports = {
  initializeDb,
  logMatchPrediction: async (homeTeam, awayTeam, homeWin, draw, awayWin) => {
    const payload = { homeTeam, awayTeam, homeWin, draw, awayWin };
    if (useFallback) {
      writeFallbackLog('match', payload);
      return;
    }
    try {
      await pool.query(
        'INSERT INTO predictions_match (home_team, away_team, home_win_prob, draw_prob, away_win_prob) VALUES ($1, $2, $3, $4, $5)',
        [homeTeam, awayTeam, homeWin, draw, awayWin]
      );
    } catch (err) {
      console.error('Failed to log match prediction to database, writing to fallback log instead:', err.message);
      writeFallbackLog('match', payload);
    }
  },
  logXGPrediction: async (locationX, locationY, bodyPart, shotTechnique, xg) => {
    const payload = { locationX, locationY, bodyPart, shotTechnique, xg };
    if (useFallback) {
      writeFallbackLog('xg', payload);
      return;
    }
    try {
      await pool.query(
        'INSERT INTO predictions_xg (location_x, location_y, body_part, shot_technique, xg) VALUES ($1, $2, $3, $4, $5)',
        [locationX, locationY, bodyPart, shotTechnique, xg]
      );
    } catch (err) {
      console.error('Failed to log xG prediction to database, writing to fallback log instead:', err.message);
      writeFallbackLog('xg', payload);
    }
  },
  logPenaltyPrediction: async (kicker, keeper, quadrant, scoreProb, saveProb, missProb) => {
    const payload = { kicker, keeper, quadrant, scoreProb, saveProb, missProb };
    if (useFallback) {
      writeFallbackLog('penalty', payload);
      return;
    }
    try {
      await pool.query(
        'INSERT INTO predictions_penalty (kicker, keeper, quadrant, score_probability, save_probability, miss_probability) VALUES ($1, $2, $3, $4, $5, $6)',
        [kicker, keeper, quadrant, scoreProb, saveProb, missProb]
      );
    } catch (err) {
      console.error('Failed to log penalty prediction to database, writing to fallback log instead:', err.message);
      writeFallbackLog('penalty', payload);
    }
  }
};
