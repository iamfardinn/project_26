import os
import sys
import logging
import pandas as pd

# Add current folder to path
SRC_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SRC_DIR)

from feature_engineering import build_model1_features
from elo import compute_elo_ratings
from data_loader import load_match_results
from train import train_model1

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

PROCESSED_DIR = os.path.join(SRC_DIR, "..", "data", "processed")
os.makedirs(PROCESSED_DIR, exist_ok=True)

def main():
    logger.info("Starting quick Model 1 training pipeline...")

    # 1. Load results.csv
    logger.info("Loading match results...")
    match_df = load_match_results()

    # 2. Compute Elo and build Model 1 features
    logger.info("Computing Elo ratings...")
    match_elo_df, final_ratings = compute_elo_ratings(match_df)
    
    logger.info("Saving Elo ratings to elo_ratings.csv...")
    final_ratings.to_csv(os.path.join(PROCESSED_DIR, "elo_ratings.csv"), index=False)

    logger.info("Building Model 1 features...")
    m1 = build_model1_features(match_elo_df)
    
    logger.info("Saving Model 1 features to model1_features.csv...")
    m1.to_csv(os.path.join(PROCESSED_DIR, "model1_features.csv"), index=False)

    logger.info("Saved features successfully. Starting model training...")

    # 3. Retrain Model 1
    train_model1()
    logger.info("Model 1 training completed successfully!")

if __name__ == '__main__':
    main()
