"""
elo.py
------
Computes historical Elo ratings for every international football team
by replaying the full match results chronologically.

Elo formula:
  new_rating = old_rating + K * (actual - expected)
  expected   = 1 / (1 + 10^((opponent_rating - own_rating) / 400))

K factors (following World Football Elo Ratings convention):
  - World Cup final/semi-final  : 60
  - World Cup other             : 50
  - Continental championship    : 40
  - World Cup qualifiers        : 40
  - Friendly                    : 20
  - All other tournaments       : 30
"""

import logging
import pandas as pd

logger = logging.getLogger(__name__)

# Starting Elo for any new team
DEFAULT_ELO = 1500

# K-factor mapping by tournament type (partial string match)
K_FACTOR_MAP = {
    "FIFA World Cup":              50,
    "UEFA Euro":                   40,
    "Copa América":                40,
    "African Cup of Nations":      40,
    "AFC Asian Cup":               40,
    "Qualification":               40,
    "Friendly":                    20,
}
DEFAULT_K = 30


def _get_k_factor(tournament: str) -> int:
    for keyword, k in K_FACTOR_MAP.items():
        if keyword.lower() in tournament.lower():
            return k
    return DEFAULT_K


def _expected_score(own_elo: float, opp_elo: float) -> float:
    return 1.0 / (1.0 + 10 ** ((opp_elo - own_elo) / 400))


def _actual_score(home_score: int, away_score: int) -> tuple[float, float]:
    """Returns (home_actual, away_actual) where win=1, draw=0.5, loss=0."""
    if home_score > away_score:
        return 1.0, 0.0
    elif home_score == away_score:
        return 0.5, 0.5
    else:
        return 0.0, 1.0


def compute_elo_ratings(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Replay all matches chronologically and compute Elo ratings.

    Args:
        df: Match results DataFrame with columns:
            date, home_team, away_team, home_score, away_score,
            tournament, neutral

    Returns:
        (match_elos_df, final_ratings_df)

        match_elos_df: Original df with added columns:
            home_elo_before, away_elo_before, home_elo_after, away_elo_after,
            elo_diff (home minus away, before match), result (W/D/L for home)

        final_ratings_df: DataFrame with columns:
            team, elo_rating (current/final rating for every team)
    """
    df = df.sort_values("date").reset_index(drop=True)

    ratings: dict[str, float] = {}  # team -> current elo

    home_elo_before_list = []
    away_elo_before_list = []
    home_elo_after_list = []
    away_elo_after_list = []
    result_list = []

    for _, row in df.iterrows():
        home = row["home_team"]
        away = row["away_team"]
        tournament = row.get("tournament", "")

        home_elo = ratings.get(home, DEFAULT_ELO)
        away_elo = ratings.get(away, DEFAULT_ELO)

        home_elo_before_list.append(home_elo)
        away_elo_before_list.append(away_elo)

        k = _get_k_factor(tournament)
        home_exp = _expected_score(home_elo, away_elo)
        away_exp = _expected_score(away_elo, home_elo)

        home_actual, away_actual = _actual_score(row["home_score"], row["away_score"])

        new_home_elo = home_elo + k * (home_actual - home_exp)
        new_away_elo = away_elo + k * (away_actual - away_exp)

        ratings[home] = new_home_elo
        ratings[away] = new_away_elo

        home_elo_after_list.append(new_home_elo)
        away_elo_after_list.append(new_away_elo)

        # Result from home team perspective
        if home_actual == 1.0:
            result_list.append("W")
        elif home_actual == 0.5:
            result_list.append("D")
        else:
            result_list.append("L")

    df = df.copy()
    df["home_elo_before"] = home_elo_before_list
    df["away_elo_before"] = away_elo_before_list
    df["home_elo_after"] = home_elo_after_list
    df["away_elo_after"] = away_elo_after_list
    df["elo_diff"] = df["home_elo_before"] - df["away_elo_before"]
    df["result"] = result_list

    final_ratings = pd.DataFrame(
        [{"team": team, "elo_rating": elo} for team, elo in ratings.items()]
    ).sort_values("elo_rating", ascending=False).reset_index(drop=True)

    logger.info(f"Elo computed for {len(final_ratings)} teams across {len(df)} matches")

    return df, final_ratings
