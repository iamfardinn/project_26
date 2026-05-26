"""
train.py
--------
Trains and serializes the three machine learning models for the platform:
1. Match Outcome Predictor (Logistic Regression using scikit-learn)
2. Expected Goals (xG) Engine (XGBoost Classifier)
3. Penalty Simulator (PyTorch Neural Network)
"""

import os
import logging
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier

import torch
import torch.nn as nn
import torch.optim as optim

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# ── Paths ─────────────────────────────────────────────────────────────────────
SRC_DIR = os.path.dirname(os.path.abspath(__file__))
PROCESSED_DIR = os.path.join(SRC_DIR, "..", "data", "processed")
MODELS_DIR = os.path.join(SRC_DIR, "..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)


# ── Model 1: Match Outcome Predictor ──────────────────────────────────────────

def train_model1():
    logger.info("--- Training Model 1: Match Outcome Predictor ---")
    data_path = os.path.join(PROCESSED_DIR, "model1_features.csv")
    df = pd.read_csv(data_path)

    features = [
        "elo_diff", "home_form", "away_form", "form_diff",
        "home_goals_avg", "away_goals_avg", "is_neutral",
        "squad_rating_diff", "squad_goals_diff", "squad_assists_diff", "squad_form_diff"
    ]
    X = df[features]
    y = df["result"]  # W, D, L

    # Map target: W=2, D=1, L=0
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)

    # Train Logistic Regression
    model = LogisticRegression(multi_class="multinomial", max_iter=1000, random_state=42)
    model.fit(X_train_scaled, y_train)

    train_acc = model.score(X_train_scaled, y_train)
    X_test_scaled = scaler.transform(X_test)
    test_acc = model.score(X_test_scaled, y_test)

    logger.info(f"Model 1 Train Accuracy: {train_acc:.4f}")
    logger.info(f"Model 1 Test Accuracy:  {test_acc:.4f}")

    # Save bundle
    bundle = {
        "model": model,
        "scaler": scaler,
        "label_encoder": le,
        "features": features
    }
    model_path = os.path.join(MODELS_DIR, "match_predictor.joblib")
    joblib.dump(bundle, model_path)
    logger.info(f"Saved Model 1 to {model_path}\n")


# ── Model 2: Expected Goals (xG) Engine ───────────────────────────────────────

def train_model2():
    logger.info("--- Training Model 2: Expected Goals (xG) Engine ---")
    data_path = os.path.join(PROCESSED_DIR, "model2_features.csv")
    df = pd.read_csv(data_path)

    features = [
        "distance", "angle_deg", "body_part_enc", "assist_type_enc",
        "under_pressure", "location_x", "location_y"
    ]
    X = df[features]
    y = df["is_goal"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    model = XGBClassifier(
        n_estimators=150,
        max_depth=4,
        learning_rate=0.05,
        random_state=42,
        eval_metric="logloss"
    )
    model.fit(X_train, y_train)

    train_acc = model.score(X_train, y_train)
    test_acc = model.score(X_test, y_test)

    logger.info(f"Model 2 Train Accuracy: {train_acc:.4f}")
    logger.info(f"Model 2 Test Accuracy:  {test_acc:.4f}")

    # Save bundle
    bundle = {
        "model": model,
        "features": features
    }
    model_path = os.path.join(MODELS_DIR, "xg_model.joblib")
    joblib.dump(bundle, model_path)
    logger.info(f"Saved Model 2 to {model_path}\n")


# ── Model 3: Penalty Simulator ────────────────────────────────────────────────

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


def train_model3():
    logger.info("--- Training Model 3: Penalty Simulator (PyTorch) ---")
    data_path = os.path.join(PROCESSED_DIR, "model3_features.csv")
    df = pd.read_csv(data_path)

    # 1. Synthesize kicker and keeper profiles based on outcomes
    np.random.seed(42)
    kicker_power = []
    kicker_accuracy = []
    keeper_reach = []
    keeper_reflexes = []
    outcomes = []  # Goal=0, Saved=1, Missed=2

    for _, row in df.iterrows():
        outcome = row["outcome_raw"]
        if outcome == "Goal":
            kicker_power.append(np.random.normal(88, 12))
            kicker_accuracy.append(np.random.normal(88, 12))
            keeper_reach.append(np.random.normal(76, 12))
            keeper_reflexes.append(np.random.normal(76, 12))
            outcomes.append(0)
        elif outcome in ["Saved", "Saved to Post"]:
            kicker_power.append(np.random.normal(82, 12))
            kicker_accuracy.append(np.random.normal(80, 12))
            keeper_reach.append(np.random.normal(88, 12))
            keeper_reflexes.append(np.random.normal(88, 12))
            outcomes.append(1)
        else:  # Off T, Post
            kicker_power.append(np.random.normal(84, 12))
            kicker_accuracy.append(np.random.normal(65, 12))
            keeper_reach.append(np.random.normal(80, 12))
            keeper_reflexes.append(np.random.normal(80, 12))
            outcomes.append(2)

    synth_df = pd.DataFrame({
        "kicker_power": kicker_power,
        "kicker_accuracy": kicker_accuracy,
        "keeper_reach": keeper_reach,
        "keeper_reflexes": keeper_reflexes,
        "shot_quadrant": df["shot_quadrant"],
        "outcome": outcomes
    })

    # One-hot encode quadrants (0 to 5)
    quadrants_encoded = pd.get_dummies(synth_df["shot_quadrant"], prefix="quad").astype(float)
    # Ensure all 6 quadrants exist in df columns
    for i in range(6):
        col_name = f"quad_{i}"
        if col_name not in quadrants_encoded.columns:
            quadrants_encoded[col_name] = 0.0

    # Order columns consistently
    quad_cols = [f"quad_{i}" for i in range(6)]
    quadrants_encoded = quadrants_encoded[quad_cols]

    # Combine numerical features and one-hot quadrant features
    numeric_features = ["kicker_power", "kicker_accuracy", "keeper_reach", "keeper_reflexes"]
    X = pd.concat([synth_df[numeric_features], quadrants_encoded], axis=1)
    y = synth_df["outcome"]

    # Scale numeric features
    scaler = StandardScaler()
    X_numeric_scaled = scaler.fit_transform(X[numeric_features])
    X_scaled = np.hstack([X_numeric_scaled, X[quad_cols].values])

    # Convert to PyTorch Tensors
    X_tensor = torch.tensor(X_scaled, dtype=torch.float32)
    y_tensor = torch.tensor(y.values, dtype=torch.long)

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(X_tensor, y_tensor, test_size=0.15, random_state=42, stratify=y_tensor)

    # Instantiate PyTorch network
    model = PenaltyMLP(input_dim=10, output_dim=3)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.01)

    # Train loop
    model.train()
    for epoch in range(150):
        optimizer.zero_grad()
        outputs = model(X_train)
        loss = criterion(outputs, y_train)
        loss.backward()
        optimizer.step()

    # Evaluation
    model.eval()
    with torch.no_grad():
        train_preds = torch.argmax(model(X_train), dim=1)
        train_acc = (train_preds == y_train).float().mean().item()

        test_preds = torch.argmax(model(X_test), dim=1)
        test_acc = (test_preds == y_test).float().mean().item()

    logger.info(f"Model 3 Train Accuracy: {train_acc:.4f}")
    logger.info(f"Model 3 Test Accuracy:  {test_acc:.4f}")

    # Save PyTorch state dictionary and preprocessors
    bundle = {
        "model_state_dict": model.state_dict(),
        "input_dim": 10,
        "output_dim": 3,
        "scaler": scaler,
        "numeric_features": numeric_features,
        "quad_cols": quad_cols
    }
    model_path = os.path.join(MODELS_DIR, "penalty_model.joblib")
    joblib.dump(bundle, model_path)
    logger.info(f"Saved Model 3 state & scaler to {model_path}\n")


# ── Execution ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    train_model1()
    train_model2()
    train_model3()
    logger.info("All model training and serialization completed successfully!")
