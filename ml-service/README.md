# 🧠 ML Service — World Cup Analytics Platform

The Python brain of the platform. Contains all data acquisition, feature engineering, model training, and FastAPI serving logic.

## Setup

```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt
```

## Folder Structure

```
ml-service/
├── data/
│   ├── raw/          # Raw downloaded data (git-ignored)
│   └── processed/    # Engineered feature CSVs (git-ignored)
├── models/           # Saved .pkl / .pt model files (git-ignored)
├── notebooks/        # Jupyter exploration notebooks
└── src/
    ├── data_loader.py          # Load raw CSVs & StatsBomb events
    ├── elo.py                  # Historical Elo rating calculator
    ├── feature_engineering.py  # Feature pipelines for all 3 models
    └── build_datasets.py       # Orchestration: run full data pipeline
```

## Pipeline

Run the full Phase 1 data pipeline:

```bash
python src/build_datasets.py
```

This will:
1. Load `data/raw/results.csv` (international match history)
2. Compute historical Elo ratings for every team
3. Pull StatsBomb open shot & penalty event data
4. Engineer features for Models 1, 2, and 3
5. Save final CSVs to `data/processed/`
