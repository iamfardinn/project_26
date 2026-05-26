"""
feature_engineering.py
-----------------------
Transforms raw/Elo-enriched DataFrames into final feature matrices
ready for model training.

Model 1 — Match Outcome Predictor (Logistic Regression)
  Features: elo_diff, home_form, away_form, home_goals_avg, away_goals_avg,
            is_neutral, tournament_weight
  Target:   result (W / D / L)

Model 2 — Expected Goals Engine (XGBoost)
  Features: distance, angle_deg, body_part_enc, assist_type_enc,
            under_pressure, location_x, location_y
  Target:   is_goal (1 / 0)

Model 3 — Penalty Simulator (XGBoost / PyTorch)
  Features: kicker_id, keeper_id, location_x, location_y,
            end_location_x, end_location_y
  Targets:  shot_quadrant (0–5), outcome (goal/saved/missed/post)
"""

import logging
import math
import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder

logger = logging.getLogger(__name__)

# ── Goal dimensions (FIFA standard) ──────────────────────────────────────────
GOAL_CENTER_X = 120.0   # StatsBomb pitch: 120m wide
GOAL_LINE_Y   = 40.0    # Centre of goal on y-axis (80m pitch, goal centred at 40)
GOAL_WIDTH    = 7.32    # metres

# ── Helpers ───────────────────────────────────────────────────────────────────

def _rolling_form(df: pd.DataFrame, team_col: str, result_col: str,
                  team: str, before_date, window: int = 5) -> float:
    """
    Compute a team's form score (sum of points) over their last `window` matches
    played before `before_date`.
    W=3, D=1, L=0  →  normalised to [0, 1] by dividing by max possible (3*window).
    """
    past = df[(df[team_col] == team) & (df["date"] < before_date)].tail(window)
    if past.empty:
        return 0.5  # neutral prior for unknown teams
    score = past[result_col].map({"W": 3, "D": 1, "L": 0}).sum()
    return score / (3 * window)


def _rolling_goals(df: pd.DataFrame, team_col: str, goals_col: str,
                   team: str, before_date, window: int = 5) -> float:
    past = df[(df[team_col] == team) & (df["date"] < before_date)].tail(window)
    if past.empty:
        return 1.0  # rough league average prior
    return past[goals_col].mean()


def _shot_distance(x: float, y: float) -> float:
    """Euclidean distance (metres) from shot location to centre of goal."""
    dx = GOAL_CENTER_X - x
    dy = GOAL_LINE_Y - y
    return math.sqrt(dx ** 2 + dy ** 2)


def _shot_angle(x: float, y: float) -> float:
    """
    Visible goal angle in degrees.
    Uses the law of cosines on the triangle formed by the shot position
    and the two goalposts.
    """
    post1_y = GOAL_LINE_Y - GOAL_WIDTH / 2
    post2_y = GOAL_LINE_Y + GOAL_WIDTH / 2

    # Vectors from shot to each post
    a = math.sqrt((GOAL_CENTER_X - x) ** 2 + (post1_y - y) ** 2)
    b = math.sqrt((GOAL_CENTER_X - x) ** 2 + (post2_y - y) ** 2)
    c = GOAL_WIDTH  # distance between posts

    # Clamp for numerical safety
    cos_angle = (a ** 2 + b ** 2 - c ** 2) / (2 * a * b + 1e-9)
    cos_angle = max(-1.0, min(1.0, cos_angle))
    return math.degrees(math.acos(cos_angle))


def _penalty_quadrant(end_loc: list | None) -> int:
    """
    Map penalty end-location to one of 6 goal quadrants:
      0=top-left  1=top-centre  2=top-right
      3=bot-left  4=bot-centre  5=bot-right
    Returns -1 if location is unavailable.
    """
    if end_loc is None or (isinstance(end_loc, float) and math.isnan(end_loc)):
        return -1
    try:
        x, y, z = end_loc[0], end_loc[1], end_loc[2] if len(end_loc) > 2 else 0
    except (TypeError, IndexError):
        return -1

    col = 0 if y < 36 else (1 if y < 44 else 2)   # left / centre / right
    row = 0 if z > 1.2 else 1                       # top / bottom
    return row * 3 + col


# ── Public API ────────────────────────────────────────────────────────────────

def build_model1_features(match_elo_df: pd.DataFrame) -> pd.DataFrame:
    """
    Build the feature matrix for Model 1 (Match Outcome Predictor).

    Input:  match_elo_df from elo.compute_elo_ratings() — already has
            elo_diff, result, date, home_team, away_team, home_score,
            away_score, tournament, neutral columns.

    Output: DataFrame with columns:
            elo_diff, home_form, away_form, home_goals_avg, away_goals_avg,
            is_neutral, result
    """
    logger.info("Building Model 1 features...")
    records = []

    df = match_elo_df.sort_values("date").reset_index(drop=True)

    # Prepare home/away perspective DataFrames for rolling lookups
    home_df = df[["date", "home_team", "result", "home_score"]].rename(
        columns={"home_team": "team", "result": "form_result", "home_score": "goals_scored"}
    )
    away_df = df[["date", "away_team", "result", "away_score"]].copy()
    away_df["form_result"] = away_df["result"].map({"W": "L", "L": "W", "D": "D"})
    away_df = away_df.rename(
        columns={"away_team": "team", "away_score": "goals_scored"}
    ).drop(columns=["result"])

    all_games = pd.concat([home_df, away_df]).sort_values("date").reset_index(drop=True)

    for _, row in df.iterrows():
        home_form = _rolling_form(all_games, "team", "form_result", row["home_team"], row["date"])
        away_form = _rolling_form(all_games, "team", "form_result", row["away_team"], row["date"])
        home_goals = _rolling_goals(all_games, "team", "goals_scored", row["home_team"], row["date"])
        away_goals = _rolling_goals(all_games, "team", "goals_scored", row["away_team"], row["date"])

        records.append({
            "date":           row["date"],
            "home_team":      row["home_team"],
            "away_team":      row["away_team"],
            "elo_diff":       row["elo_diff"],
            "home_form":      home_form,
            "away_form":      away_form,
            "form_diff":      home_form - away_form,
            "home_goals_avg": home_goals,
            "away_goals_avg": away_goals,
            "is_neutral":     int(row.get("neutral", False)),
            "result":         row["result"],           # W / D / L
        })

    out = pd.DataFrame(records)
    logger.info(f"Model 1 features: {len(out):,} rows, {out.columns.tolist()}")
    return out


def build_model2_features(shots_df: pd.DataFrame) -> pd.DataFrame:
    """
    Build the feature matrix for Model 2 (xG Engine).

    Input:  shots_df from data_loader.load_statsbomb_shots()
    Output: DataFrame with columns:
            distance, angle_deg, body_part_enc, assist_type_enc,
            under_pressure, location_x, location_y, is_goal
    """
    logger.info("Building Model 2 features...")

    body_part_enc = LabelEncoder()
    assist_type_enc = LabelEncoder()

    df = shots_df.copy()

    # Parse location list → x, y
    df["location_x"] = df["location"].apply(lambda loc: loc[0] if isinstance(loc, list) else np.nan)
    df["location_y"] = df["location"].apply(lambda loc: loc[1] if isinstance(loc, list) else np.nan)

    df = df.dropna(subset=["location_x", "location_y"])

    df["distance"]  = df.apply(lambda r: _shot_distance(r["location_x"], r["location_y"]), axis=1)
    df["angle_deg"] = df.apply(lambda r: _shot_angle(r["location_x"], r["location_y"]), axis=1)

    df["body_part"]   = df.get("shot_body_part",   pd.Series("Foot",   index=df.index)).fillna("Foot")
    df["assist_type"] = df.get("shot_technique",   pd.Series("Normal", index=df.index)).fillna("Normal")

    df["body_part_enc"]   = body_part_enc.fit_transform(df["body_part"].astype(str))
    df["assist_type_enc"] = assist_type_enc.fit_transform(df["assist_type"].astype(str))

    df["under_pressure"] = df.get("under_pressure", pd.Series(False, index=df.index)).fillna(False).astype(int)

    df["is_goal"] = (df.get("shot_outcome", pd.Series("", index=df.index)).fillna("") == "Goal").astype(int)

    cols = ["distance", "angle_deg", "body_part_enc", "assist_type_enc",
            "under_pressure", "location_x", "location_y", "is_goal"]
    out = df[cols].reset_index(drop=True)

    logger.info(f"Model 2 features: {len(out):,} rows | Goal rate: {out['is_goal'].mean():.3f}")
    return out


def build_model3_features(penalties_df: pd.DataFrame) -> pd.DataFrame:
    """
    Build the feature matrix for Model 3 (Penalty Simulator).

    Input:  penalties_df from data_loader.load_statsbomb_penalties()
    Output: DataFrame with columns:
            location_x, location_y, shot_quadrant, outcome_enc
    """
    logger.info("Building Model 3 features...")

    df = penalties_df.copy()

    df["location_x"] = df["location"].apply(lambda loc: loc[0] if isinstance(loc, list) else np.nan)
    df["location_y"] = df["location"].apply(lambda loc: loc[1] if isinstance(loc, list) else np.nan)
    df = df.dropna(subset=["location_x", "location_y"])

    df["shot_quadrant"] = df.get("shot_end_location", pd.Series([None] * len(df), index=df.index)).apply(_penalty_quadrant)
    df = df[df["shot_quadrant"] >= 0]

    outcome_enc = LabelEncoder()
    df["outcome_raw"] = df.get("shot_outcome", pd.Series("Unknown", index=df.index)).fillna("Unknown").astype(str)
    df["outcome_enc"] = outcome_enc.fit_transform(df["outcome_raw"])

    cols = ["location_x", "location_y", "shot_quadrant", "outcome_enc", "outcome_raw"]
    out = df[cols].reset_index(drop=True)

    logger.info(f"Model 3 features: {len(out):,} penalty rows")
    return out
