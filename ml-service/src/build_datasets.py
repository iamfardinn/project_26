"""
build_datasets.py
-----------------
Orchestration script for Phase 1: Data Acquisition & Engineering.

Usage:
    # Download data + build features (full pipeline)
    python src/build_datasets.py

    # Skip download, just re-run feature engineering
    python src/build_datasets.py --no-download

Steps:
    1. (Optional) Download results.csv from Kaggle
    2. Load raw data (match results + StatsBomb shots/penalties)
    3. Compute historical Elo ratings across all matches
    4. Engineer features for each of the 3 models
    5. Save processed CSVs to data/processed/
"""

import os
import sys
import argparse
import logging
import subprocess
import pandas as pd

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from data_loader import load_match_results, load_statsbomb_shots, load_statsbomb_penalties
from elo import compute_elo_ratings
from feature_engineering import (
    build_model1_features,
    build_model2_features,
    build_model3_features,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── Paths ─────────────────────────────────────────────────────────────────────
ROOT_DIR      = os.path.join(os.path.dirname(__file__), "..")
RAW_DIR       = os.path.join(ROOT_DIR, "data", "raw")
PROCESSED_DIR = os.path.join(ROOT_DIR, "data", "processed")

KAGGLE_DATASET = "martj42/international-football-results-from-1872-to-2017"
RESULTS_CSV    = os.path.join(RAW_DIR, "results.csv")


def download_kaggle_data():
    """
    Download the international football results dataset from Kaggle.
    Requires KAGGLE_USERNAME and KAGGLE_KEY environment variables
    (or a ~/.kaggle/kaggle.json credentials file).
    """
    if os.path.exists(RESULTS_CSV):
        logger.info("results.csv already exists — skipping Kaggle download")
        return

    os.makedirs(RAW_DIR, exist_ok=True)
    logger.info(f"Downloading dataset: {KAGGLE_DATASET}")

    result = subprocess.run(
        ["kaggle", "datasets", "download", "-d", KAGGLE_DATASET,
         "--unzip", "-p", RAW_DIR],
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        logger.error(f"Kaggle download failed:\n{result.stderr}")
        raise RuntimeError(
            "Kaggle download failed. Ensure KAGGLE_USERNAME and KAGGLE_KEY "
            "are set as environment variables, or kaggle.json is configured."
        )

    logger.info("Kaggle download complete")


def save_csv(df: pd.DataFrame, filename: str):
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    path = os.path.join(PROCESSED_DIR, filename)
    df.to_csv(path, index=False)
    logger.info(f"Saved → {path}  ({len(df):,} rows)")


def run(download: bool = True):
    logger.info("=" * 60)
    logger.info("Phase 1 — Data Acquisition & Feature Engineering")
    logger.info("=" * 60)

    # ── Step 1: Download ───────────────────────────────────────────
    if download:
        download_kaggle_data()

    # ── Step 2: Load raw data ──────────────────────────────────────
    logger.info("\n[1/4] Loading raw data...")
    match_df   = load_match_results()
    shots_df   = load_statsbomb_shots()
    penalty_df = load_statsbomb_penalties()

    # ── Step 3: Elo ratings ────────────────────────────────────────
    logger.info("\n[2/4] Computing Elo ratings...")
    match_elo_df, final_ratings = compute_elo_ratings(match_df)
    save_csv(final_ratings, "elo_ratings.csv")

    # ── Step 4: Feature engineering ───────────────────────────────
    logger.info("\n[3/4] Engineering features...")
    m1 = build_model1_features(match_elo_df)
    m2 = build_model2_features(shots_df)
    m3 = build_model3_features(penalty_df)

    # ── Step 5: Save ──────────────────────────────────────────────
    logger.info("\n[4/4] Saving processed datasets...")
    save_csv(m1, "model1_features.csv")
    save_csv(m2, "model2_features.csv")
    save_csv(m3, "model3_features.csv")

    logger.info("\n" + "=" * 60)
    logger.info("Phase 1 complete! Summary:")
    logger.info(f"  Match results processed : {len(match_elo_df):,}")
    logger.info(f"  Unique teams tracked    : {len(final_ratings):,}")
    logger.info(f"  Shot events (xG)        : {len(m2):,}")
    logger.info(f"  Penalty events          : {len(m3):,}")
    logger.info(f"  Outputs → {PROCESSED_DIR}")
    logger.info("=" * 60)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the Phase 1 data pipeline")
    parser.add_argument(
        "--no-download",
        action="store_true",
        help="Skip Kaggle download (use if results.csv already exists in data/raw/)",
    )
    args = parser.parse_args()
    run(download=not args.no_download)
