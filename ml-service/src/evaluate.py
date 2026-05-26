"""
evaluate.py
-----------
Loads serialized models and prints validation performance metrics.
"""

import os
import logging
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score, brier_score_loss, confusion_matrix
import torch
import torch.nn as nn

# Import PenaltyMLP definition
from train import PenaltyMLP

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

SRC_DIR = os.path.dirname(os.path.abspath(__file__))
PROCESSED_DIR = os.path.join(SRC_DIR, "..", "data", "processed")
MODELS_DIR = os.path.join(SRC_DIR, "..", "models")


def evaluate_model1():
    logger.info("============================================================")
    logger.info("EVALUATING MODEL 1: Match Outcome Predictor")
    logger.info("============================================================")

    model_path = os.path.join(MODELS_DIR, "match_predictor.joblib")
    if not os.path.exists(model_path):
        logger.error(f"Model file not found at: {model_path}. Run train.py first.")
        return

    bundle = joblib.load(model_path)
    model = bundle["model"]
    scaler = bundle["scaler"]
    le = bundle["label_encoder"]
    features = bundle["features"]

    df = pd.read_csv(os.path.join(PROCESSED_DIR, "model1_features.csv"))
    X = df[features]
    y = le.transform(df["result"])

    _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    X_test_scaled = scaler.transform(X_test)

    preds = model.predict(X_test_scaled)
    probs = model.predict_proba(X_test_scaled)

    # Metrics
    logger.info(f"Accuracy: {np.mean(preds == y_test):.4f}")
    logger.info("Classification Report:")
    print(classification_report(y_test, preds, target_names=le.classes_))

    cm = confusion_matrix(y_test, preds)
    logger.info(f"Confusion Matrix (Actual vs Predicted):\n{cm}")


def evaluate_model2():
    logger.info("============================================================")
    logger.info("EVALUATING MODEL 2: Expected Goals (xG) Engine")
    logger.info("============================================================")

    model_path = os.path.join(MODELS_DIR, "xg_model.joblib")
    if not os.path.exists(model_path):
        logger.error(f"Model file not found at: {model_path}. Run train.py first.")
        return

    bundle = joblib.load(model_path)
    model = bundle["model"]
    features = bundle["features"]

    df = pd.read_csv(os.path.join(PROCESSED_DIR, "model2_features.csv"))
    X = df[features]
    y = df["is_goal"]

    _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    preds = model.predict(X_test)
    probs = model.predict_proba(X_test)[:, 1]

    # Metrics
    accuracy = np.mean(preds == y_test)
    roc_auc = roc_auc_score(y_test, probs)
    brier = brier_score_loss(y_test, probs)

    logger.info(f"Accuracy : {accuracy:.4f}")
    logger.info(f"ROC-AUC  : {roc_auc:.4f}")
    logger.info(f"Brier (Calibration) Score: {brier:.4f}")
    logger.info("\nClassification Report:")
    print(classification_report(y_test, preds, target_names=["No Goal", "Goal"]))


def evaluate_model3():
    logger.info("============================================================")
    logger.info("EVALUATING MODEL 3: Penalty Simulator (PyTorch)")
    logger.info("============================================================")

    model_path = os.path.join(MODELS_DIR, "penalty_model.joblib")
    if not os.path.exists(model_path):
        logger.error(f"Model file not found at: {model_path}. Run train.py first.")
        return

    bundle = joblib.load(model_path)
    state_dict = bundle["model_state_dict"]
    input_dim = bundle["input_dim"]
    output_dim = bundle["output_dim"]
    scaler = bundle["scaler"]
    numeric_features = bundle["numeric_features"]
    quad_cols = bundle["quad_cols"]

    df = pd.read_csv(os.path.join(PROCESSED_DIR, "model3_features.csv"))

    # Synthesize the exact same dataset (same seed 42)
    np.random.seed(42)
    kicker_power = []
    kicker_accuracy = []
    keeper_reach = []
    keeper_reflexes = []
    outcomes = []

    for _, row in df.iterrows():
        outcome = row["outcome_raw"]
        if outcome == "Goal":
            kicker_power.append(np.random.normal(88, 4))
            kicker_accuracy.append(np.random.normal(88, 4))
            keeper_reach.append(np.random.normal(76, 4))
            keeper_reflexes.append(np.random.normal(76, 4))
            outcomes.append(0)
        elif outcome in ["Saved", "Saved to Post"]:
            kicker_power.append(np.random.normal(82, 4))
            kicker_accuracy.append(np.random.normal(80, 4))
            keeper_reach.append(np.random.normal(88, 4))
            keeper_reflexes.append(np.random.normal(88, 4))
            outcomes.append(1)
        else:
            kicker_power.append(np.random.normal(84, 4))
            kicker_accuracy.append(np.random.normal(65, 4))
            keeper_reach.append(np.random.normal(80, 4))
            keeper_reflexes.append(np.random.normal(80, 4))
            outcomes.append(2)

    synth_df = pd.DataFrame({
        "kicker_power": kicker_power,
        "kicker_accuracy": kicker_accuracy,
        "keeper_reach": keeper_reach,
        "keeper_reflexes": keeper_reflexes,
        "shot_quadrant": df["shot_quadrant"],
        "outcome": outcomes
    })

    quadrants_encoded = pd.get_dummies(synth_df["shot_quadrant"], prefix="quad").astype(float)
    for i in range(6):
        col_name = f"quad_{i}"
        if col_name not in quadrants_encoded.columns:
            quadrants_encoded[col_name] = 0.0
    quadrants_encoded = quadrants_encoded[quad_cols]

    X = pd.concat([synth_df[numeric_features], quadrants_encoded], axis=1)
    y = synth_df["outcome"]

    X_numeric_scaled = scaler.transform(X[numeric_features])
    X_scaled = np.hstack([X_numeric_scaled, X[quad_cols].values])

    X_tensor = torch.tensor(X_scaled, dtype=torch.float32)
    y_tensor = torch.tensor(y.values, dtype=torch.long)

    _, X_test, _, y_test = train_test_split(X_tensor, y_tensor, test_size=0.15, random_state=42, stratify=y_tensor)

    # Initialize PyTorch network & load weight state
    model = PenaltyMLP(input_dim=input_dim, output_dim=output_dim)
    model.load_state_dict(state_dict)
    model.eval()

    with torch.no_grad():
        logits = model(X_test)
        preds = torch.argmax(logits, dim=1).numpy()
        probs = torch.softmax(logits, dim=1).numpy()

    accuracy = np.mean(preds == y_test.numpy())
    logger.info(f"Accuracy: {accuracy:.4f}")
    logger.info("\nClassification Report:")
    print(classification_report(y_test.numpy(), preds, target_names=["Goal", "Saved", "Missed"]))


if __name__ == "__main__":
    evaluate_model1()
    evaluate_model2()
    evaluate_model3()
