"""CertPilot demo entry point.

Runs the full end-to-end flow for one learner, grounded in the Foundry IQ
knowledge base over MCP:

    curator -> planner -> engagement -> assessor -> manager insights
    -> critic gate (approve / revise loop)

Usage:
    python -m certpilot.main [learner_id]
"""

import asyncio
import json
import re
import sys

from rich.console import Console
from rich.panel import Panel

from .agents import build_agents, make_kb_tool, run_resilient

console = Console()

MAX_REVISIONS = 1


def parse_verdict(text: str) -> dict:
    """Extract the critic's JSON verdict, tolerating surrounding prose."""
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
    return {"verdict": "approve" if "approve" in text.lower() else "revise", "violations": []}


async def run_step(agent, prompt: str, context: str = "") -> str:
    full_prompt = f"{prompt}\n\nPrevious step output:\n{context}" if context else prompt
    console.print(Panel(f"[bold]{agent.name}[/bold] <- {prompt}", style="dim"))
    text = await run_resilient(agent, full_prompt)
    console.print(Panel(text, title=agent.name, border_style="cyan"))
    return text


async def run_flow(learner_id: str) -> None:
    kb_tool = make_kb_tool()
    if kb_tool is None:
        console.print("[yellow]Foundry IQ KB not configured - running ungrounded.[/yellow]")
        await _run_flow_inner(learner_id, None)
        return
    async with kb_tool:
        await _run_flow_inner(learner_id, kb_tool)


async def _run_flow_inner(learner_id: str, kb_tool) -> None:
    agents = build_agents(kb_tool=kb_tool)
    grounded = "grounded in Foundry IQ" if kb_tool else "ungrounded"
    console.rule(f"[bold cyan]CertPilot - end-to-end flow for {learner_id} ({grounded})")

    steps = [
        (
            "curator",
            f"Learner {learner_id} wants to prepare for their target certification. "
            "Propose the learning path.",
        ),
        (
            "planner",
            f"Create a weekly study plan for learner {learner_id} based on the learning path above.",
        ),
        (
            "engagement",
            f"Propose a reminder schedule for learner {learner_id} aligned to their work patterns.",
        ),
        (
            "assessor",
            f"Evaluate exam readiness for learner {learner_id} and recommend next steps.",
        ),
    ]

    transcript: list[str] = []
    for agent_key, prompt in steps:
        context = transcript[-1].split("\n", 1)[1] if transcript else ""
        text = await run_step(agents[agent_key], prompt, context)
        transcript.append(f"[{agents[agent_key].name}]\n{text}")

    # Manager view runs independently of the learner chain.
    manager_text = await run_step(
        agents["manager_insights"],
        f"Give the manager of learner {learner_id}'s team a readiness summary with recommended actions.",
    )
    transcript.append(f"[ManagerInsightsAgent]\n{manager_text}")

    # Critic gate: validate, and give the offending agent one chance to fix.
    critic = agents["critic"]
    full_transcript = "\n\n".join(transcript)
    for round_num in range(MAX_REVISIONS + 1):
        verdict_text = await run_resilient(
            critic,
            "Review the following multi-agent transcript for rule violations:\n\n" + full_transcript,
        )
        verdict = parse_verdict(verdict_text)
        style = "green" if verdict.get("verdict") == "approve" else "red"
        console.print(Panel(verdict_text, title=f"CriticAgent verdict (round {round_num + 1})", border_style=style))

        if verdict.get("verdict") == "approve" or round_num == MAX_REVISIONS:
            break

        fix_prompt = (
            "The critic found these violations in the previous output:\n"
            + json.dumps(verdict.get("violations", []), indent=2)
            + f"\nSuggested fix: {verdict.get('suggested_fix', 'n/a')}\n"
            "Produce a corrected final summary for the learner that resolves every violation. "
            "Preserve every [ref_id:N] citation from the transcript next to the claims it "
            "supports, and re-retrieve from the knowledge base if you need fresh grounding."
        )
        corrected = await run_step(agents["curator"], fix_prompt, full_transcript)
        full_transcript += f"\n\n[REVISED OUTPUT]\n{corrected}"

    console.rule("[bold green]Flow complete")


def main() -> None:
    learner_id = sys.argv[1] if len(sys.argv) > 1 else "L-1001"
    asyncio.run(run_flow(learner_id))


if __name__ == "__main__":
    main()
