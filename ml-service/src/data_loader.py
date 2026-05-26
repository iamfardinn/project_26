"""
data_loader.py
--------------
Handles loading raw data sources into clean pandas DataFrames.

Data sources:
  - results.csv  : historical international match results (Kaggle)
  - StatsBomb    : open shot/penalty event data via statsbombpy
"""

import os
import logging
import pandas as pd
from statsbombpy import sb

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")


def load_match_results(filename: str = "results.csv") -> pd.DataFrame:
    """
    Load the international football results CSV from data/raw/.

    Expected columns: date, home_team, away_team, home_score, away_score,
                      tournament, city, country, neutral
    """
    path = os.path.join(RAW_DIR, filename)
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Match results file not found at: {path}\n"
            "Run `python src/build_datasets.py --download` to fetch it automatically."
        )
    df = pd.read_csv(path, parse_dates=["date"])
    logger.info(f"Loaded {len(df):,} match results from {path}")
    return df


def load_statsbomb_shots(competition_ids: list[int] | None = None) -> pd.DataFrame:
    """
    Pull shot event data from StatsBomb open data via statsbombpy.

    Filters to World Cup (competition_id=43) and UEFA Euro (competition_id=55)
    by default, covering all available seasons.

    Returns a flat DataFrame of shot events with key spatial columns.
    """
    if competition_ids is None:
        competition_ids = [43, 55]  # FIFA World Cup, UEFA Euro

    all_shots = []

    competitions = sb.competitions()
    relevant = competitions[competitions["competition_id"].isin(competition_ids)]
    logger.info(f"Found {len(relevant)} relevant competition-season combinations")

    for _, row in relevant.iterrows():
        comp_id = row["competition_id"]
        season_id = row["season_id"]
        comp_name = row["competition_name"]
        season_name = row["season_name"]

        try:
            matches = sb.matches(competition_id=comp_id, season_id=season_id)
            for match_id in matches["match_id"]:
                events = sb.events(match_id=match_id)
                shots = events[events["type"] == "Shot"].copy()
                if not shots.empty:
                    shots["competition"] = comp_name
                    shots["season"] = season_name
                    all_shots.append(shots)
        except Exception as e:
            logger.warning(f"Skipping {comp_name} {season_name}: {e}")

    if not all_shots:
        raise RuntimeError("No StatsBomb shot data could be loaded.")

    df = pd.concat(all_shots, ignore_index=True)
    logger.info(f"Loaded {len(df):,} shot events from StatsBomb")
    return df


def load_statsbomb_penalties(competition_ids: list[int] | None = None) -> pd.DataFrame:
    """
    Pull penalty-specific shot events from StatsBomb open data.
    Filters to shots where shot_type == 'Penalty'.
    """
    shots = load_statsbomb_shots(competition_ids)
    penalties = shots[shots["shot_type"] == "Penalty"].copy()
    logger.info(f"Isolated {len(penalties):,} penalty events")
    return penalties
