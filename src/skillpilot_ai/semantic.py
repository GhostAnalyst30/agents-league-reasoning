"""Semantic layer (Fabric IQ concept): ontology entities, relationships and business rules.

Loads the synthetic semantic model seed and exposes typed lookups plus a small
rules engine. When the real Fabric IQ ontology is available, this module is the
single integration point to swap the JSON seed for live ontology queries.
"""

import json
from dataclasses import dataclass
from typing import Optional

from .config import DATA_DIR

_MODEL = json.loads((DATA_DIR / "ontology" / "semantic_model.json").read_text(encoding="utf-8"))


@dataclass
class ReadinessVerdict:
    ready: bool
    reasons: list[str]
    capacity_constrained: bool


def get_certification(cert_id: str) -> Optional[dict]:
    for cert in _MODEL["entities"]["certifications"]:
        if cert["id"].lower() == cert_id.lower():
            return cert
    return None


def get_role(role_name: str) -> Optional[dict]:
    for role in _MODEL["entities"]["roles"]:
        if role["name"].lower() == role_name.lower() or role["id"] == role_name.lower():
            return role
    return None


def list_business_rules() -> list[dict]:
    return _MODEL["business_rules"]


def check_prerequisites(cert_id: str, passed_certifications: list[str]) -> list[str]:
    """Return the list of missing prerequisites (BR-003)."""
    cert = get_certification(cert_id)
    if cert is None:
        return []
    passed = {c.upper() for c in passed_certifications}
    return [p for p in cert.get("prerequisites", []) if p.upper() not in passed]


def evaluate_readiness(
    cert_id: str,
    practice_score_avg: float,
    hours_studied: float,
    meeting_hours_per_week: float,
) -> ReadinessVerdict:
    """Apply BR-001 and BR-004 to decide exam readiness."""
    cert = get_certification(cert_id)
    reasons: list[str] = []
    if cert is None:
        return ReadinessVerdict(False, [f"Unknown certification: {cert_id}"], False)

    threshold = cert["pass_threshold_practice"]
    min_hours = 0.8 * cert["recommended_hours"]

    if practice_score_avg < threshold:
        reasons.append(
            f"Practice average {practice_score_avg:.0f}% is below the {threshold}% threshold (BR-001)."
        )
    if hours_studied < min_hours:
        reasons.append(
            f"Studied {hours_studied:.0f}h, below the {min_hours:.0f}h minimum "
            f"(80% of {cert['recommended_hours']}h recommended, BR-001)."
        )

    capacity_constrained = meeting_hours_per_week > 20
    return ReadinessVerdict(ready=not reasons, reasons=reasons, capacity_constrained=capacity_constrained)


def max_weekly_study_hours(focus_hours_per_week: float, meeting_hours_per_week: float) -> float:
    """Apply BR-002 (focus buffer) and BR-004 (capacity cap)."""
    allocation = max(focus_hours_per_week - 5, 0)
    if meeting_hours_per_week > 20:
        allocation = min(allocation, 4)
    return allocation
