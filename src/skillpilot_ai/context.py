"""Work-context layer (Work IQ concept): synthetic signals about meetings,
focus time and preferred learning windows.

This simulates the kind of organizational signals Work IQ derives from
Microsoft 365 activity. The data is fully synthetic. If a Work IQ token is
available, this module is the integration point to swap to live signals.
"""

import json
from typing import Optional

from .config import DATA_DIR

_SIGNALS = json.loads(
    (DATA_DIR / "synthetic" / "work_signals.json").read_text(encoding="utf-8")
)["work_signals"]

_LEARNERS = json.loads(
    (DATA_DIR / "synthetic" / "learners.json").read_text(encoding="utf-8")
)["learners"]


def get_learner(learner_id: str) -> Optional[dict]:
    for learner in _LEARNERS:
        if learner["learner_id"].upper() == learner_id.upper():
            return learner
    return None


def list_learners(team: Optional[str] = None) -> list[dict]:
    if team is None:
        return list(_LEARNERS)
    return [l for l in _LEARNERS if l["team"].upper() == team.upper()]


def get_work_signals(learner_id: str) -> Optional[dict]:
    for signal in _SIGNALS:
        if signal["learner_id"].upper() == learner_id.upper():
            return signal
    return None


def team_aggregates(team: str) -> dict:
    """Aggregated, privacy-preserving view for manager insights (BR-005)."""
    members = list_learners(team)
    if not members:
        return {"team": team, "members": 0}
    avg_score = sum(m["practice_score_avg"] for m in members) / len(members)
    avg_hours = sum(m["hours_studied"] for m in members) / len(members)
    at_risk = sum(
        1
        for m in members
        if (s := get_work_signals(m["learner_id"])) and s["meeting_hours_per_week"] > 20
    )
    return {
        "team": team,
        "members": len(members),
        "avg_practice_score": round(avg_score, 1),
        "avg_hours_studied": round(avg_hours, 1),
        "capacity_constrained_members": at_risk,
        "certifications_in_progress": sorted({m["certification_target"] for m in members}),
    }
