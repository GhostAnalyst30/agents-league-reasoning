"""CertPilot web application backend.

FastAPI server that wraps the CertPilot multi-agent system:

- GET  /api/learners                 learner roster joined with work signals
- GET  /api/teams                    team-level aggregates (BR-005 compliant)
- GET  /api/evals                    self-evaluation history
- GET  /api/flow/{learner_id}/stream live pipeline run streamed over SSE
- POST /api/chat                     ad-hoc chat with a single agent
- /                                  serves the built React frontend

Run:
    python -m uvicorn app.server:app --port 8000
"""

import asyncio
import json
import sys
from contextlib import asynccontextmanager
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from fastapi import FastAPI
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from certpilot import context, semantic
from certpilot.agents import build_agents, make_kb_tool, run_resilient
from certpilot.main import parse_verdict

AGENT_META = {
    "curator": {"name": "LearningPathCurator", "label": "Learning Path Curator"},
    "planner": {"name": "StudyPlanGenerator", "label": "Study Plan Generator"},
    "engagement": {"name": "EngagementAgent", "label": "Engagement Agent"},
    "assessor": {"name": "AssessmentAgent", "label": "Assessment Agent"},
    "manager_insights": {"name": "ManagerInsightsAgent", "label": "Manager Insights"},
    "critic": {"name": "CriticAgent", "label": "Critic / Verifier"},
}

state: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    kb_tool = make_kb_tool()
    if kb_tool is not None:
        await kb_tool.__aenter__()
    state["kb_tool"] = kb_tool
    state["agents"] = build_agents(kb_tool=kb_tool)
    yield
    if kb_tool is not None:
        await kb_tool.__aexit__(None, None, None)


app = FastAPI(title="CertPilot", lifespan=lifespan)


@app.get("/api/learners")
def learners():
    result = []
    for learner in context.list_learners():
        signals = context.get_work_signals(learner["learner_id"]) or {}
        cert = semantic.get_certification(learner["certification_target"]) or {}
        result.append(
            {
                **learner,
                "signals": signals,
                "certification": cert,
                "max_weekly_study_hours": semantic.max_weekly_study_hours(
                    signals.get("focus_hours_per_week", 0),
                    signals.get("meeting_hours_per_week", 0),
                ),
            }
        )
    return result


@app.get("/api/teams")
def teams():
    names = sorted({l["team"] for l in context.list_learners()})
    return [context.team_aggregates(t) for t in names]


@app.get("/api/rules")
def rules():
    return semantic.list_business_rules()


@app.get("/api/evals")
def evals():
    path = ROOT / "evals" / "results.json"
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


class ChatRequest(BaseModel):
    agent: str
    message: str


@app.post("/api/chat")
async def chat(req: ChatRequest):
    agents = state["agents"]
    if req.agent not in agents:
        return {"error": f"unknown agent {req.agent}"}
    text = await run_resilient(agents[req.agent], req.message)
    return {"agent": req.agent, "text": text}


def sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


@app.get("/api/flow/{learner_id}/stream")
async def flow_stream(learner_id: str):
    """Run the full pipeline for a learner, streaming each step as SSE."""

    async def generate():
        agents = state["agents"]
        steps = [
            ("curator", f"Learner {learner_id} wants to prepare for their target certification. Propose the learning path."),
            ("planner", f"Create a weekly study plan for learner {learner_id} based on the learning path above."),
            ("engagement", f"Propose a reminder schedule for learner {learner_id} aligned to their work patterns."),
            ("assessor", f"Evaluate exam readiness for learner {learner_id} and recommend next steps."),
        ]
        learner = context.get_learner(learner_id) or {}
        team = learner.get("team", "")

        try:
            transcript: list[str] = []
            for key, prompt in steps:
                yield sse("step_start", {"agent": key, "label": AGENT_META[key]["label"], "prompt": prompt})
                ctx = transcript[-1].split("\n", 1)[1] if transcript else ""
                full = f"{prompt}\n\nPrevious step output:\n{ctx}" if ctx else prompt
                text = await run_resilient(agents[key], full)
                transcript.append(f"[{AGENT_META[key]['name']}]\n{text}")
                yield sse("step_done", {"agent": key, "text": text})

            mgr_prompt = f"Give the manager of team {team} a readiness summary with recommended actions."
            yield sse("step_start", {"agent": "manager_insights", "label": AGENT_META["manager_insights"]["label"], "prompt": mgr_prompt})
            mgr_text = await run_resilient(agents["manager_insights"], mgr_prompt)
            transcript.append(f"[ManagerInsightsAgent]\n{mgr_text}")
            yield sse("step_done", {"agent": "manager_insights", "text": mgr_text})

            full_transcript = "\n\n".join(transcript)
            for round_num in range(2):
                yield sse("step_start", {"agent": "critic", "label": AGENT_META["critic"]["label"], "prompt": "Validate the transcript against business rules", "round": round_num + 1})
                verdict_text = await run_resilient(
                    agents["critic"],
                    "Review the following multi-agent transcript for rule violations:\n\n" + full_transcript,
                )
                verdict = parse_verdict(verdict_text)
                yield sse(
                    "verdict",
                    {
                        "round": round_num + 1,
                        "verdict": verdict.get("verdict", "revise"),
                        "violations": verdict.get("violations", []),
                        "suggested_fix": verdict.get("suggested_fix", ""),
                    },
                )
                if verdict.get("verdict") == "approve" or round_num == 1:
                    break
                fix_prompt = (
                    "The critic found these violations in the previous output:\n"
                    + json.dumps(verdict.get("violations", []), indent=2)
                    + f"\nSuggested fix: {verdict.get('suggested_fix', 'n/a')}\n"
                    "Produce a corrected final summary for the learner that resolves every violation. "
                    "Preserve every [ref_id:N] citation from the transcript next to the claims it supports."
                )
                yield sse("step_start", {"agent": "curator", "label": "Revision (Curator)", "prompt": "Apply the critic's corrections", "revision": True})
                corrected = await run_resilient(agents["curator"], fix_prompt + "\n\nTranscript:\n" + full_transcript)
                full_transcript += f"\n\n[REVISED OUTPUT]\n{corrected}"
                yield sse("step_done", {"agent": "curator", "text": corrected, "revision": True})

            yield sse("done", {})
        except Exception as exc:  # surface failures to the UI instead of dropping the stream
            yield sse("error", {"message": str(exc)})

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


DIST = ROOT / "app" / "web" / "dist"
if DIST.exists():
    app.mount("/assets", StaticFiles(directory=DIST / "assets"), name="assets")

    @app.get("/{path:path}")
    def spa(path: str):
        file = DIST / path
        if path and file.is_file():
            return FileResponse(file)
        return FileResponse(DIST / "index.html")
