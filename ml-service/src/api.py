import os
import sys
import math
import logging
import joblib
import pandas as pd
import numpy as np

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import torch
import torch.nn as nn

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Add project root to path
SRC_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SRC_DIR)

app = FastAPI(
    title="World Cup Analytics Platform: ML Engine",
    description="Python FastAPI machine learning engine predicting outcomes, xG, and penalties",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Goal dimensions (fifa standard) ──────────────────────────────────────────
GOAL_CENTER_X = 120.0
GOAL_LINE_Y   = 40.0
GOAL_WIDTH    = 7.32

# ── Load models and cache stats at startup ───────────────────────────────────

MODELS_DIR = os.path.join(SRC_DIR, "..", "models")
PROCESSED_DIR = os.path.join(SRC_DIR, "..", "data", "processed")

# Pre-cached team statistics
elo_dict = {}
team_stats = {}

# Label Encoder category lookups (as verified from training set)
BODY_PARTS = ["Head", "Left Foot", "Other", "Right Foot"]
TECHNIQUES = ["Backheel", "Diving Header", "Half Volley", "Lob", "Normal", "Overhead Kick", "Volley"]

# Model placeholders
match_model_bundle = None
xg_model_bundle = None
penalty_model_bundle = None
penalty_nn = None


class PenaltyMLP(nn.Module):
    def __init__(self, input_dim=10, output_dim=3):
        super(PenaltyMLP, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, 16),
            nn.ReLU(),
            nn.Linear(16, 8),
            nn.ReLU(),
            nn.Linear(8, output_dim)
        )

    def forward(self, x):
        return self.network(x)


@app.on_event("startup")
def startup_event():
    global elo_dict, team_stats, match_model_bundle, xg_model_bundle, penalty_model_bundle, penalty_nn

    # 1. Load team ELO and form stats
    try:
        elo_df = pd.read_csv(os.path.join(PROCESSED_DIR, "elo_ratings.csv"))
        elo_dict = dict(zip(elo_df["team"], elo_df["elo_rating"]))
        logger.info(f"Loaded {len(elo_dict)} team ELO ratings")
    except Exception as e:
        logger.error(f"Failed to load ELO ratings: {e}")

    try:
        m1_df = pd.read_csv(os.path.join(PROCESSED_DIR, "model1_features.csv")).sort_values("date")
        for _, row in m1_df.iterrows():
            h = row["home_team"]
            a = row["away_team"]
            team_stats[h] = {
                "form": row["home_form"],
                "goals_avg": row["home_goals_avg"]
            }
            team_stats[a] = {
                "form": row["away_form"],
                "goals_avg": row["away_goals_avg"]
            }
        logger.info(f"Loaded dynamic stats for {len(team_stats)} teams")
    except Exception as e:
        logger.error(f"Failed to load match feature stats: {e}")

    # 2. Load Model 1 (Match outcome)
    try:
        match_model_bundle = joblib.load(os.path.join(MODELS_DIR, "match_predictor.joblib"))
        logger.info("Loaded Model 1: Match Outcome Predictor")
    except Exception as e:
        logger.error(f"Failed to load Model 1: {e}")

    # 3. Load Model 2 (xG engine)
    try:
        xg_model_bundle = joblib.load(os.path.join(MODELS_DIR, "xg_model.joblib"))
        logger.info("Loaded Model 2: xG Engine")
    except Exception as e:
        logger.error(f"Failed to load Model 2: {e}")

    # 4. Load Model 3 (Penalty simulator)
    try:
        penalty_model_bundle = joblib.load(os.path.join(MODELS_DIR, "penalty_model.joblib"))
        penalty_nn = PenaltyMLP(input_dim=10, output_dim=3)
        penalty_nn.load_state_dict(penalty_model_bundle["model_state_dict"])
        penalty_nn.eval()
        logger.info("Loaded Model 3: Penalty Simulator")
    except Exception as e:
        logger.error(f"Failed to load Model 3: {e}")


# ── Helpers ───────────────────────────────────────────────────────────────────

def _shot_distance(x: float, y: float) -> float:
    dx = GOAL_CENTER_X - x
    dy = GOAL_LINE_Y - y
    return math.sqrt(dx ** 2 + dy ** 2)


def _shot_angle(x: float, y: float) -> float:
    post1_y = GOAL_LINE_Y - GOAL_WIDTH / 2
    post2_y = GOAL_LINE_Y + GOAL_WIDTH / 2
    a = math.sqrt((GOAL_CENTER_X - x) ** 2 + (post1_y - y) ** 2)
    b = math.sqrt((GOAL_CENTER_X - x) ** 2 + (post2_y - y) ** 2)
    c = GOAL_WIDTH
    cos_angle = (a ** 2 + b ** 2 - c ** 2) / (2 * a * b + 1e-9)
    cos_angle = max(-1.0, min(1.0, cos_angle))
    return math.degrees(math.acos(cos_angle))


# ── Schemas ───────────────────────────────────────────────────────────────────

class MatchRequest(BaseModel):
    home_team: str = Field(..., example="Argentina")
    away_team: str = Field(..., example="France")
    is_neutral: bool = Field(default=False, example=True)


class XGRequest(BaseModel):
    location_x: float = Field(..., ge=0.0, le=120.0, example=108.0)
    location_y: float = Field(..., ge=0.0, le=80.0, example=40.0)
    body_part: str = Field(default="Right Foot", example="Right Foot")
    shot_technique: str = Field(default="Normal", example="Normal")
    under_pressure: bool = Field(default=False, example=False)


class PenaltyRequest(BaseModel):
    kicker_name: str = Field(..., example="L. MESSI")
    keeper_name: str = Field(..., example="E. MARTINEZ")


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "models_loaded": {
            "match_predictor": match_model_bundle is not None,
            "xg_engine": xg_model_bundle is not None,
            "penalty_simulator": penalty_nn is not None
        }
    }


@app.get("/teams")
def get_teams():
    return [
        {
            "name": team,
            "elo": round(elo, 1),
            "form": team_stats.get(team, {}).get("form", 0.5),
            "goals_avg": round(team_stats.get(team, {}).get("goals_avg", 1.0), 2)
        }
        for team, elo in sorted(elo_dict.items())
    ]


@app.post("/predict/match")
def predict_match(req: MatchRequest):
    if not match_model_bundle:
        raise HTTPException(status_code=503, detail="Match Outcome Predictor model is not loaded")

    # Look up stats or use default priors
    home_elo = elo_dict.get(req.home_team, 1500.0)
    away_elo = elo_dict.get(req.away_team, 1500.0)
    elo_diff = home_elo - away_elo

    home_form = team_stats.get(req.home_team, {}).get("form", 0.5)
    away_form = team_stats.get(req.away_team, {}).get("form", 0.5)
    form_diff = home_form - away_form

    home_goals = team_stats.get(req.home_team, {}).get("goals_avg", 1.0)
    away_goals = team_stats.get(req.away_team, {}).get("goals_avg", 1.0)

    # Scale features
    features = np.array([[
        elo_diff, home_form, away_form, form_diff, home_goals, away_goals, int(req.is_neutral)
    ]])
    scaler = match_model_bundle["scaler"]
    features_scaled = scaler.transform(features)

    # Predict
    model = match_model_bundle["model"]
    probs = model.predict_proba(features_scaled)[0]
    le = match_model_bundle["label_encoder"]

    # Map output: W (home team wins), D (draw), L (home team loses => away team wins)
    class_probs = {le.classes_[i]: float(probs[i]) for i in range(len(probs))}

    return {
        "home_team": req.home_team,
        "away_team": req.away_team,
        "home_elo": home_elo,
        "away_elo": away_elo,
        "home_form": home_form,
        "away_form": away_form,
        "home_goals_avg": home_goals,
        "away_goals_avg": away_goals,
        "home_win_prob": class_probs.get("W", 0.0),
        "draw_prob": class_probs.get("D", 0.0),
        "away_win_prob": class_probs.get("L", 0.0)
    }


@app.post("/predict/xg")
def predict_xg(req: XGRequest):
    if not xg_model_bundle:
        raise HTTPException(status_code=503, detail="xG Engine model is not loaded")

    # Calculate spatial columns
    dist = _shot_distance(req.location_x, req.location_y)
    angle = _shot_angle(req.location_x, req.location_y)

    # Handle body part mapping
    bp = req.body_part
    if bp == "Foot":
        bp = "Right Foot"
    bp_enc = BODY_PARTS.index(bp) if bp in BODY_PARTS else BODY_PARTS.index("Right Foot")

    # Handle technique mapping
    tech = req.shot_technique
    tech_enc = TECHNIQUES.index(tech) if tech in TECHNIQUES else TECHNIQUES.index("Normal")

    # Create input vector
    features = pd.DataFrame([{
        "distance": dist,
        "angle_deg": angle,
        "body_part_enc": bp_enc,
        "assist_type_enc": tech_enc,
        "under_pressure": int(req.under_pressure),
        "location_x": req.location_x,
        "location_y": req.location_y
    }])

    # Predict
    model = xg_model_bundle["model"]
    # XGBoost outputs probability list of shapes [N, 2]
    prob = float(model.predict_proba(features)[0][1])

    return {
        "distance": dist,
        "angle_deg": angle,
        "xg": prob
    }


@app.post("/predict/penalty")
def predict_penalty(req: PenaltyRequest):
    if not penalty_nn or not penalty_model_bundle:
        raise HTTPException(status_code=503, detail="Penalty Simulator model is not loaded")

    # 1. Map names to attributes (Messi, Mbappe, Courtois, Martinez, etc.)
    # Kicker power and accuracy
    kickers_db = {
        "K. MBAPPE":   {"power": 88.0, "accuracy": 87.0},
        "H. KANE":     {"power": 87.0, "accuracy": 88.0},
        "L. MESSI":     {"power": 84.0, "accuracy": 92.0},
        "C. RONALDO":   {"power": 90.0, "accuracy": 86.0}
    }
    # Keeper reach and reflexes
    keepers_db = {
        "T. COURTOIS":  {"reach": 91.0, "reflexes": 88.0},
        "M. MAIGNAN":   {"reach": 86.0, "reflexes": 89.0},
        "E. MARTINEZ":  {"reach": 89.0, "reflexes": 88.0},
        "A. ONANA":     {"reach": 87.0, "reflexes": 90.0}
    }

    k_stats = kickers_db.get(req.kicker_name.upper(), {"power": 85.0, "accuracy": 85.0})
    g_stats = keepers_db.get(req.keeper_name.upper(), {"reach": 85.0, "reflexes": 85.0})

    scaler = penalty_model_bundle["scaler"]

    quadrant_results = []

    # Predict for each of the 6 quadrants
    for quad_idx in range(6):
        # Numeric attributes: kicker_power, kicker_accuracy, keeper_reach, keeper_reflexes
        numeric_feats = np.array([[
            k_stats["power"], k_stats["accuracy"], g_stats["reach"], g_stats["reflexes"]
        ]])
        numeric_scaled = scaler.transform(numeric_feats)[0]

        # One-hot encoded quadrants (quad_0, quad_1, ..., quad_5)
        quad_onehot = np.zeros(6)
        quad_onehot[quad_idx] = 1.0

        # Combine
        full_feats = np.hstack([numeric_scaled, quad_onehot])
        feats_tensor = torch.tensor(full_feats, dtype=torch.float32).unsqueeze(0)

        # Predict
        with torch.no_grad():
            logits = penalty_nn(feats_tensor)
            probs = torch.softmax(logits, dim=1)[0].numpy()

        # outcomes: 0=Goal, 1=Saved, 2=Missed
        quadrant_results.append({
            "quadrant": quad_idx,
            "score_probability": float(probs[0]),
            "save_probability": float(probs[1]),
            "miss_probability": float(probs[2])
        })

    return {
        "kicker": req.kicker_name,
        "keeper": req.keeper_name,
        "results": quadrant_results
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="127.0.0.1", port=8000, reload=True)
