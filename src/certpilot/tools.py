"""Function tools exposed to the agents.

Each function is a plain Python callable that Agent Framework converts into a
tool definition. Docstrings become tool descriptions, so they are written for
the model, not for humans.
"""

import json
from typing import Annotated

from . import context, semantic


def lookup_learner(
    learner_id: Annotated[str, "Learner identifier, e.g. L-1001"],
) -> str:
    """Get a learner's profile: role, team, certification target, practice scores and study hours."""
    learner = context.get_learner(learner_id)
    return json.dumps(learner) if learner else f"No learner found with id {learner_id}"


def lookup_work_signals(
    learner_id: Annotated[str, "Learner identifier, e.g. L-1001"],
) -> str:
    """Get work-context signals for a learner: weekly meeting hours, focus hours, preferred learning slot and best days."""
    signals = context.get_work_signals(learner_id)
    return json.dumps(signals) if signals else f"No work signals found for {learner_id}"


def lookup_certification(
    certification_id: Annotated[str, "Certification id, e.g. AZ-204"],
) -> str:
    """Get certification details from the semantic model: skills covered, recommended hours, pass threshold and prerequisites."""
    cert = semantic.get_certification(certification_id)
    return json.dumps(cert) if cert else f"Unknown certification {certification_id}"


def check_exam_readiness(
    learner_id: Annotated[str, "Learner identifier, e.g. L-1001"],
) -> str:
    """Evaluate whether a learner is exam-ready by applying the organization's business rules (score threshold, minimum study hours, capacity constraints)."""
    learner = context.get_learner(learner_id)
    if learner is None:
        return f"No learner found with id {learner_id}"
    signals = context.get_work_signals(learner_id) or {"meeting_hours_per_week": 0}
    verdict = semantic.evaluate_readiness(
        learner["certification_target"],
        learner["practice_score_avg"],
        learner["hours_studied"],
        signals["meeting_hours_per_week"],
    )
    return json.dumps(
        {
            "learner_id": learner_id,
            "certification": learner["certification_target"],
            "exam_ready": verdict.ready,
            "blocking_reasons": verdict.reasons,
            "capacity_constrained": verdict.capacity_constrained,
        }
    )


def compute_study_capacity(
    learner_id: Annotated[str, "Learner identifier, e.g. L-1001"],
) -> str:
    """Compute the maximum weekly study hours a plan may allocate for a learner, applying the focus-buffer and capacity-cap business rules."""
    signals = context.get_work_signals(learner_id)
    if signals is None:
        return f"No work signals found for {learner_id}"
    hours = semantic.max_weekly_study_hours(
        signals["focus_hours_per_week"], signals["meeting_hours_per_week"]
    )
    return json.dumps(
        {
            "learner_id": learner_id,
            "max_weekly_study_hours": hours,
            "preferred_learning_slot": signals["preferred_learning_slot"],
            "best_days": signals["best_days"],
        }
    )


def get_team_insights(
    team: Annotated[str, "Team identifier, e.g. TEAM-A"],
) -> str:
    """Get privacy-preserving aggregated learning metrics for a team: average scores, study hours, capacity-constrained member count. Never exposes individual raw scores."""
    return json.dumps(context.team_aggregates(team))


def get_business_rules() -> str:
    """List the organization's learning business rules (BR-001..BR-005) used to validate plans and recommendations."""
    return json.dumps(semantic.list_business_rules())
