# 🏆 World Cup Analytics Platform: Project Master Plan

## 📖 Project Overview
A comprehensive, full-stack machine learning application designed to predict football match outcomes, analyze shot probabilities (xG), and simulate penalty shootouts. This project combines data science, machine learning, and modern web development into a unified microservices architecture.

---

## 🏗️ System Architecture
The platform is divided into three core microservices:

1. **Frontend (User Interface)**
   - **Tech:** React.js, Tailwind CSS
   - **Role:** Interactive dashboard with three main views (Pre-Match, xG Analysis, Penalty Simulator).
2. **Backend Gateway (API Controller)**
   - **Tech:** Node.js, Express.js, PostgreSQL
   - **Role:** Handles user routing, saves historical scenarios, and communicates with the ML engine.
3. **Machine Learning Service (The Brain)**
   - **Tech:** Python, FastAPI
   - **Libraries:** Pandas, Scikit-learn, XGBoost, PyTorch
   - **Role:** Exposes REST endpoints to run predictions on the trained models.

---

## 🚀 Phase-by-Phase Execution Plan

### Phase 1: Data Acquisition & Engineering (Weeks 1-2)
* **Task 1.1:** Gather historical international match data (Kaggle/FBref) for the past 10 years.
* **Task 1.2:** Engineer features for Model 1: Calculate historical Elo ratings, team form (last 5 matches), and travel distance/continent familiarity.
* **Task 1.3:** Download open StatsBomb data for World Cup/Euro tournaments (for Models 2 & 3).
* **Task 1.4:** Calculate spatial features: visible goal angle, distance to goal, and coordinate mapping for shots and dives.

### Phase 2: Machine Learning Development (Weeks 3-5)
* **Model 1: Match Outcome Predictor**
  * Train a **Logistic Regression** model using Scikit-learn.
  * Target: Win/Draw/Loss. Features: Elo diff, Form, Goals Scored.
  * Save model as a `.pkl` file.
* **Model 2: Expected Goals (xG) Engine**
  * Train an **XGBoost** classifier.
  * Target: Goal (1) / No Goal (0). Features: Distance, Angle, Body Part, Assist Type.
  * Generate spatial heatmaps using `mplsoccer` or export data for frontend rendering.
* **Model 3: Penalty Shootout Simulator**
  * Train **PyTorch/XGBoost** models for dual-prediction.
  * Target A: Player shot placement (coordinates). Target B: Keeper dive direction.
  * Evaluate using historical penalty datasets.

### Phase 3: ML API & Backend Integration (Weeks 6-7)
* **Task 3.1 (Python):** Wrap the trained models in a **FastAPI** application. Create endpoints like `/predict/match`, `/predict/xg`, and `/predict/penalty`.
* **Task 3.2 (Node.js):** Build the Express server. Set up Axios to forward frontend requests to the FastAPI Python service.
* **Task 3.3 (Database):** Initialize PostgreSQL to store team stats and user-generated prediction logs.

### Phase 4: Frontend Development (Weeks 8-9)
* **View 1: Pre-Match Hub:** Dropdowns to select Team A vs Team B. Display win probabilities using pie charts or progress bars.
* **View 2: xG Interactive Pitch:** A visual football pitch where clicking on a zone triggers the backend to calculate the xG for a specific player type (Forward vs Midfielder) from that spot.
* **View 3: Penalty Showdown:** Select a kicker and keeper. Display a heat map of the goal net showing shot probability vs dive probability.

### Phase 5: Testing & Deployment (Week 10)
* Containerize the Python and Node.js services using **Docker**.
* Deploy Frontend to **Vercel** or **Netlify**.
* Deploy Node and Python APIs to **Render**, **Railway**, or **AWS/GCP**.

---
## 🛠️ Next Steps
1. Set up a GitHub repository and define folder structures (e.g., `/frontend`, `/backend`, `/ml-service`).
2. Initialize your Python virtual environment for the ML work.
3. Start hunting for the dataset for Phase 1!
