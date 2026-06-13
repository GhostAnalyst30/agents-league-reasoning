"""Self-evaluation harness for CertPilot.

Runs a battery of scenario cases through the live agents and scores every
answer on four metrics, mirroring the Foundry Agent evaluator taxonomy:

- groundedness      LLM judge: is every claim supported by the knowledge docs?
- citation_coverage deterministic: KB-grounded answers must carry [ref_id:N] tags
- task_adherence    LLM judge: did the agent do what the scenario asked?
- rule_compliance   LLM judge + deterministic checks against BR-001..BR-005

Results are printed as a table and written to evals/results.json so runs can
be compared over time (the auto-evaluation loop).

Usage:
    python -m certpilot.evals
"""

import asyncio
import json
import re
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path

from rich.console import Console
from rich.table import Table

from . import context, semantic
from .agents import build_agents, make_chat_client, make_kb_tool, run_resilient
from .config import DATA_DIR, ROOT_DIR

console = Console()

KNOWLEDGE_DOCS = "\n\n---\n\n".join(
    p.read_text(encoding="utf-8") for p in sorted((DATA_DIR / "knowledge").glob("*.md"))
)
BUSINESS_RULES = json.dumps(semantic.list_business_rules(), indent=2)

# Tolerant to the citation spellings gpt-oss produces: [ref_id:0], 【ref_id:0】,
# (ref_id 0), [ref id: 0], "ref_id=0", etc.
CITATION_PATTERN = re.compile(r"ref[\s_]?id\s*[:=]?\s*\d+", re.IGNORECASE)


@dataclass
class EvalCase:
    case_id: str
    agent_key: str
    prompt: str
    expect_citations: bool
    rule_focus: str
    deterministic_checks: list[str] = field(default_factory=list)
    tool_context: str = ""  # data the agent's tools returned, given to the judge as valid grounding


CASES = [
    EvalCase(
        case_id="curator-grounded-path",
        agent_key="curator",
        prompt=(
            "Learner L-1001 wants to prepare for their target certification. "
            "Propose the learning path."
        ),
        expect_citations=True,
        rule_focus="Recommendations must cite knowledge sources; no Expert cert without prerequisites (BR-003).",
    ),
    EvalCase(
        case_id="planner-capacity-cap",
        agent_key="planner",
        prompt=(
            "Create a weekly study plan for learner L-1004 (target AZ-204). "
            "L-1004 has heavy meeting load; respect their computed study capacity."
        ),
        expect_citations=False,
        rule_focus="Weekly allocated hours must not exceed compute_study_capacity (BR-002/BR-004).",
        deterministic_checks=["capacity"],
    ),
    EvalCase(
        case_id="assessor-not-ready-gate",
        agent_key="assessor",
        prompt="Evaluate exam readiness for learner L-1001 and recommend next steps.",
        expect_citations=True,
        rule_focus="Must report NOT ready (67% < 75% threshold, BR-001) and loop back to study plan.",
        deterministic_checks=["not_ready"],
    ),
    EvalCase(
        case_id="manager-privacy-aggregates",
        agent_key="manager_insights",
        prompt="Give the manager of TEAM-A a certification readiness summary with recommended actions.",
        expect_citations=False,
        rule_focus=(
            "Only team-level aggregates; never individual raw practice scores (BR-005). "
            "Note: this agent's numbers come from the get_team_insights tool (live team "
            "aggregates), not from the knowledge documents — treat tool-derived aggregates "
            "as grounded."
        ),
        deterministic_checks=["privacy"],
        tool_context=json.dumps(context.team_aggregates("TEAM-A")),
    ),
]

JUDGE_PROMPT = """You are a strict evaluation judge for an enterprise AI agent.

SCENARIO GIVEN TO THE AGENT:
{prompt}

RULE FOCUS FOR THIS SCENARIO:
{rule_focus}

ORGANIZATION BUSINESS RULES:
{rules}

APPROVED KNOWLEDGE DOCUMENTS (valid grounding sources):
{docs}

LIVE TOOL DATA THE AGENT RECEIVED (equally valid grounding; numbers from here are NOT fabricated):
{tool_context}

AGENT ANSWER TO EVALUATE:
{answer}

Score the answer on a 1-5 scale for each metric:
- groundedness: factual claims are supported by the knowledge documents or by tool data the agent reasonably had; 5 = fully supported, 1 = fabricated.
- task_adherence: the answer fully accomplishes the scenario instructions; 5 = complete, 1 = off-task.
- rule_compliance: the answer respects the business rules and the rule focus; 5 = compliant, 1 = clear violation.

Respond with ONLY a JSON object:
{{"groundedness": n, "task_adherence": n, "rule_compliance": n, "rationale": "one short sentence per metric"}}"""


def _normalize(text: str) -> str:
    """Fold the unicode punctuation gpt-oss likes (non-breaking hyphens/spaces) to ASCII."""
    table = str.maketrans({c: "-" for c in "\u2010\u2011\u2012\u2013\u2014"} | {"\u202f": " ", "\xa0": " "})
    return text.translate(table).lower()


def deterministic_score(check: str, answer: str) -> tuple[bool, str]:
    lower = _normalize(answer)
    if check == "capacity":
        signals = json.loads((DATA_DIR / "synthetic" / "work_signals.json").read_text(encoding="utf-8"))
        sig = next(s for s in signals["work_signals"] if s["learner_id"] == "L-1004")
        cap = semantic.max_weekly_study_hours(sig["focus_hours_per_week"], sig["meeting_hours_per_week"])
        over = [
            float(h)
            for h in re.findall(r"(\d+(?:\.\d+)?)\s*(?:h|hours|hrs)\b(?:[^.]{0,40}(?:per week|/week|weekly))", lower)
            if float(h) > cap
        ]
        return (not over, f"weekly allocations exceeding cap {cap}h: {over or 'none'}")
    if check == "not_ready":
        says_not_ready = bool(re.search(r"\bnot\b[\s\-]{0,3}(?:yet[\s\-]{0,3})?(?:exam[\s\-]{0,3})?ready", lower))
        return (says_not_ready, "answer must state the learner is NOT ready")
    if check == "privacy":
        leaks = re.findall(r"L-10\d\d[^.\n]{0,40}\b\d{2}\s*%", answer)
        return (not leaks, f"individual score leaks: {leaks or 'none'}")
    return (True, "n/a")


async def judge(judge_agent, case: EvalCase, answer: str) -> dict:
    judge_agent_prompt = JUDGE_PROMPT.format(
        prompt=case.prompt,
        rule_focus=case.rule_focus,
        rules=BUSINESS_RULES,
        docs=KNOWLEDGE_DOCS,
        tool_context=case.tool_context or "(none provided)",
        answer=answer,
    )
    text = await run_resilient(judge_agent, judge_agent_prompt)
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
    return {"groundedness": 0, "task_adherence": 0, "rule_compliance": 0, "rationale": f"unparseable: {text[:120]}"}


async def run_evals() -> None:
    from agent_framework import Agent

    kb_tool = make_kb_tool()
    results = []
    judge_agent = Agent(
        client=make_chat_client(),
        name="EvalJudge",
        instructions="You are a strict evaluation judge. Always respond with only the requested JSON object.",
    )

    async def _run(kb):
        agents = build_agents(kb_tool=kb)
        for case in CASES:
            console.print(f"[dim]running {case.case_id}...[/dim]")
            answer = await run_resilient(agents[case.agent_key], case.prompt)

            citation_ok = bool(CITATION_PATTERN.search(answer)) if case.expect_citations else True
            self_corrected = False
            if not citation_ok:
                # Auto-correction loop: feed the failure back to the agent once.
                console.print(f"[yellow]{case.case_id}: missing citations, requesting self-correction[/yellow]")
                answer = await run_resilient(
                    agents[case.agent_key],
                    case.prompt
                    + "\n\nYour previous answer was rejected because it lacked [ref_id:N] "
                    "citations. Call knowledge_base_retrieve and produce the answer again, "
                    "citing every grounded claim with [ref_id:N] and ending with a Sources section.",
                )
                citation_ok = bool(CITATION_PATTERN.search(answer))
                self_corrected = citation_ok

            det_results = {}
            for check in case.deterministic_checks:
                passed, detail = deterministic_score(check, answer)
                det_results[check] = {"passed": passed, "detail": detail}

            scores = await judge(judge_agent, case, answer)
            results.append(
                {
                    "case_id": case.case_id,
                    "agent": case.agent_key,
                    "citation_coverage": citation_ok,
                    "self_corrected": self_corrected,
                    "deterministic": det_results,
                    **{k: scores.get(k) for k in ("groundedness", "task_adherence", "rule_compliance")},
                    "rationale": scores.get("rationale", ""),
                    "answer_preview": answer[:400],
                }
            )

    if kb_tool is not None:
        async with kb_tool:
            await _run(kb_tool)
    else:
        await _run(None)

    out_dir = ROOT_DIR / "evals"
    out_dir.mkdir(exist_ok=True)
    payload = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "results": results,
    }
    history_file = out_dir / "results.json"
    history = json.loads(history_file.read_text(encoding="utf-8")) if history_file.exists() else []
    history.append(payload)
    history_file.write_text(json.dumps(history, indent=2), encoding="utf-8")

    table = Table(title="CertPilot self-evaluation")
    for col in ("case", "ground.", "task adh.", "rule comp.", "citations", "deterministic"):
        table.add_column(col)
    for r in results:
        det = ", ".join(f"{k}:{'PASS' if v['passed'] else 'FAIL'}" for k, v in r["deterministic"].items()) or "-"
        citation_cell = "PASS" if r["citation_coverage"] else "FAIL"
        if r.get("self_corrected"):
            citation_cell = "PASS (self-corrected)"
        table.add_row(
            r["case_id"],
            str(r["groundedness"]),
            str(r["task_adherence"]),
            str(r["rule_compliance"]),
            citation_cell,
            det,
        )
    console.print(table)

    failures = [
        r["case_id"]
        for r in results
        if not r["citation_coverage"]
        or any(not v["passed"] for v in r["deterministic"].values())
        or min(r.get("groundedness") or 0, r.get("rule_compliance") or 0) < 3
    ]
    if failures:
        console.print(f"[red]Cases needing attention: {failures}[/red]")
    else:
        console.print("[green]All cases passed.[/green]")


if __name__ == "__main__":
    asyncio.run(run_evals())
