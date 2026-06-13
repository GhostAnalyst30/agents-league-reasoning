"""CertPilot Advisor - hosted agent for the Foundry Agent Service.

A single grounded advisor that fronts the CertPilot system: it answers
certification questions grounded in the Foundry IQ knowledge base (with
[ref_id:N] citations) and applies the organization's readiness business
rules through local tools over the synthetic dataset.
"""

import json
import os
from pathlib import Path

import httpx
from agent_framework import Agent, tool
from agent_framework.openai import OpenAIChatCompletionClient
from agent_framework_foundry_hosting import ResponsesHostServer
from dotenv import load_dotenv
from pydantic import Field
from typing_extensions import Annotated

load_dotenv()

DATA_DIR = Path(__file__).parent / "data"
LEARNERS = {
    l["learner_id"]: l
    for l in json.loads((DATA_DIR / "learners.json").read_text(encoding="utf-8"))["learners"]
}
SIGNALS = {
    s["learner_id"]: s
    for s in json.loads((DATA_DIR / "work_signals.json").read_text(encoding="utf-8"))["work_signals"]
}
MODEL = json.loads((DATA_DIR / "semantic_model.json").read_text(encoding="utf-8"))

KB_MCP_URL = (
    f"{os.environ['AZURE_SEARCH_ENDPOINT']}/knowledgebases/"
    f"{os.environ.get('CERTPILOT_KB_NAME', 'certpilot-kb')}/mcp?api-version=2026-05-01-preview"
)


@tool(approval_mode="never_require")
def retrieve_knowledge(
    query: Annotated[str, Field(description="Natural-language question to ground in the approved knowledge base.")],
) -> str:
    """Retrieve grounded content with [ref_id:N] citations from the Foundry IQ knowledge base (certification guides, assessment policy, learning reports)."""
    headers = {
        "api-key": os.environ["AZURE_SEARCH_API_KEY"],
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
    }
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {"name": "knowledge_base_retrieve", "arguments": {"queries": [query]}},
    }
    with httpx.Client(timeout=120) as http:
        resp = http.post(KB_MCP_URL, headers=headers, json=payload)
        if resp.headers.get("content-type", "").startswith("text/event-stream"):
            data = next(
                (json.loads(line[5:]) for line in resp.text.splitlines() if line.startswith("data:")),
                {},
            )
        else:
            data = resp.json()
    if "error" in data:
        return f"Knowledge retrieval failed: {data['error'].get('message', 'unknown error')}"
    blocks = data.get("result", {}).get("content", [])
    return "\n".join(b.get("text", "") for b in blocks) or "No grounded content found."


def _get_certification(cert_id: str) -> dict | None:
    return next(
        (c for c in MODEL["entities"]["certifications"] if c["id"].lower() == cert_id.lower()),
        None,
    )


@tool(approval_mode="never_require")
def lookup_learner(
    learner_id: Annotated[str, Field(description="Learner identifier, e.g. L-1001")],
) -> str:
    """Get a learner's profile: role, team, certification target, practice scores and study hours."""
    learner = LEARNERS.get(learner_id)
    return json.dumps(learner) if learner else f"No learner found with id {learner_id}"


@tool(approval_mode="never_require")
def check_exam_readiness(
    learner_id: Annotated[str, Field(description="Learner identifier, e.g. L-1001")],
) -> str:
    """Apply the organization's business rules (BR-001, BR-004) to decide whether a learner is exam-ready."""
    learner = LEARNERS.get(learner_id)
    if learner is None:
        return f"No learner found with id {learner_id}"
    cert = _get_certification(learner["certification_target"])
    if cert is None:
        return f"Unknown certification {learner['certification_target']}"

    reasons = []
    if learner["practice_score_avg"] < cert["pass_threshold_practice"]:
        reasons.append(
            f"Practice average {learner['practice_score_avg']}% is below the "
            f"{cert['pass_threshold_practice']}% threshold (BR-001)."
        )
    min_hours = 0.8 * cert["recommended_hours"]
    if learner["hours_studied"] < min_hours:
        reasons.append(
            f"Studied {learner['hours_studied']}h, below the {min_hours:.0f}h minimum (BR-001)."
        )
    meeting_hours = SIGNALS.get(learner_id, {}).get("meeting_hours_per_week", 0)
    return json.dumps(
        {
            "learner_id": learner_id,
            "certification": learner["certification_target"],
            "exam_ready": not reasons,
            "blocking_reasons": reasons,
            "capacity_constrained": meeting_hours > 20,
        }
    )


def main():
    client = OpenAIChatCompletionClient(
        model=os.environ["AZURE_AI_MODEL_DEPLOYMENT_NAME"],
        base_url=os.environ["AZURE_OPENAI_BASE_URL"],
        api_key=os.environ["AZURE_AI_API_KEY"],
    )

    agent = Agent(
        client=client,
        name="CertPilotAdvisor",
        instructions=(
            "You are CertPilot Advisor, an enterprise certification enablement assistant. "
            "For any question about certifications, study guidance, policies or readiness, "
            "you MUST first call retrieve_knowledge to ground your answer in the approved "
            "knowledge base, and preserve the [ref_id:N] citations next to every grounded "
            "claim. Use lookup_learner and check_exam_readiness for learner-specific "
            "questions; never guess readiness. If grounding is unavailable, say so instead "
            "of inventing sources. End grounded answers with a short Sources section."
        ),
        tools=[retrieve_knowledge, lookup_learner, check_exam_readiness],
        default_options={"store": False},
    )

    server = ResponsesHostServer(agent)
    server.run()


if __name__ == "__main__":
    main()
