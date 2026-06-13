"""Agent definitions for the SkillPilot-AI multi-agent system.

Six specialised agents built with Microsoft Agent Framework. The Foundry IQ
knowledge base is attached as an MCP tool to the Curator and Assessment agents
once FOUNDRY_IQ_KB_MCP_URL is configured; until then they rely on their
instructions to state that grounding is unavailable.
"""

import httpx
from agent_framework import Agent, MCPStreamableHTTPTool
from agent_framework.openai import OpenAIChatCompletionClient

from . import tools
from .config import (
    AZURE_AI_API_KEY,
    AZURE_OPENAI_ENDPOINT,
    AZURE_SEARCH_API_KEY,
    FOUNDRY_IQ_KB_MCP_URL,
    MODEL_DEPLOYMENT,
    require,
)

GROUNDING_RULE = (
    "You MUST call the knowledge_base_retrieve tool at least once before producing your final "
    "answer, to ground it in the approved knowledge base. Preserve the [ref_id:N] citations it "
    "returns next to every claim that comes from it — your answer is rejected if grounded "
    "claims lack [ref_id:N] tags. ALWAYS end your answer with a 'Sources' section listing every "
    "[ref_id:N] you used and the document it points to. If retrieval returns nothing relevant, "
    "say grounding was unavailable instead of inventing sources. "
)


async def run_resilient(agent: Agent, prompt: str, attempts: int = 3) -> str:
    """Run an agent, retrying when the model returns an empty answer (intermittent with gpt-oss)."""
    last_text = ""
    for _ in range(attempts):
        result = await agent.run(prompt)
        last_text = (result.text or "").strip()
        if last_text:
            return last_text
    return last_text or "(no answer produced)"


def make_chat_client() -> OpenAIChatCompletionClient:
    return OpenAIChatCompletionClient(
        model=MODEL_DEPLOYMENT,
        base_url=require(AZURE_OPENAI_ENDPOINT, "AZURE_OPENAI_ENDPOINT"),
        api_key=require(AZURE_AI_API_KEY, "AZURE_AI_API_KEY"),
    )


def make_kb_tool() -> MCPStreamableHTTPTool | None:
    """Foundry IQ knowledge base exposed over MCP. Use as an async context manager."""
    if not (FOUNDRY_IQ_KB_MCP_URL and AZURE_SEARCH_API_KEY):
        return None
    http_client = httpx.AsyncClient(
        headers={"api-key": AZURE_SEARCH_API_KEY, "Accept": "application/json, text/event-stream"},
        timeout=httpx.Timeout(120.0, connect=30.0),
    )
    return MCPStreamableHTTPTool(
        name="foundry_iq_kb",
        url=FOUNDRY_IQ_KB_MCP_URL,
        http_client=http_client,
        allowed_tools=["knowledge_base_retrieve"],
        approval_mode="never_require",
        load_prompts=False,
    )


def build_agents(
    chat_client: OpenAIChatCompletionClient | None = None,
    kb_tool: MCPStreamableHTTPTool | None = None,
) -> dict[str, Agent]:
    client = chat_client or make_chat_client()
    kb_tools = [kb_tool] if kb_tool else []
    grounding = GROUNDING_RULE if kb_tool else ""

    curator = Agent(
        client=client,
        name="LearningPathCurator",
        instructions=(
            "You are the Learning Path Curator for an enterprise certification program. "
            "Given a learner's certification target, map it to the skills and the approved "
            "study sequence using the certification semantic model. "
            "Always look up the learner profile and the certification details with your tools. "
            + grounding +
            "Cite the knowledge source for every content recommendation. If grounded knowledge "
            "is unavailable, say so explicitly instead of inventing sources. "
            "Never recommend an Expert certification when prerequisites are missing."
        ),
        tools=[tools.lookup_learner, tools.lookup_certification, *kb_tools],
    )

    planner = Agent(
        client=client,
        name="StudyPlanGenerator",
        instructions=(
            "You are the Study Plan Generator. Convert a learning path into a practical weekly "
            "schedule. You MUST respect the learner's study capacity: always call "
            "compute_study_capacity and never allocate more weekly hours than it returns. "
            "Sequence topics by prerequisite order and difficulty. Output a concise week-by-week "
            "plan with milestones and an assessment checkpoint each week. "
            "Flag capacity-constrained learners explicitly."
        ),
        tools=[tools.lookup_learner, tools.lookup_certification, tools.compute_study_capacity],
    )

    engagement = Agent(
        client=client,
        name="EngagementAgent",
        instructions=(
            "You are the Engagement Agent. Given a learner and their study plan, propose "
            "reminder timing aligned to their work rhythm: use their preferred learning slot, "
            "best days and focus windows from work signals. Be supportive and privacy-conscious. "
            "Never propose reminders during meeting-heavy windows. Never reference another "
            "employee's calendar details."
        ),
        tools=[tools.lookup_work_signals],
    )

    assessor = Agent(
        client=client,
        name="AssessmentAgent",
        instructions=(
            "You are the Assessment Agent. Evaluate learner readiness for their target "
            "certification. Always call check_exam_readiness to apply the business rules; never "
            "guess readiness. "
            + grounding +
            "When generating practice questions, ground each question in the "
            "approved knowledge sources and cite the source section; questions must map to "
            "specific certification skills with a 40/40/20 difficulty mix per the assessment "
            "policy. If the learner is not ready, identify the weakest skills and recommend "
            "looping back to the study plan."
        ),
        tools=[tools.lookup_learner, tools.lookup_certification, tools.check_exam_readiness, *kb_tools],
    )

    manager_insights = Agent(
        client=client,
        name="ManagerInsightsAgent",
        instructions=(
            "You are the Manager Insights Agent. Provide team-level visibility into "
            "certification readiness. Use get_team_insights for aggregates. You must follow "
            "rule BR-005: only expose team-level aggregates, never individual raw scores. "
            "Highlight capacity-constrained members as a count, recommend actions, and keep "
            "summaries concise and decision-oriented."
        ),
        tools=[tools.get_team_insights, tools.get_business_rules],
    )

    critic = Agent(
        client=client,
        name="CriticAgent",
        instructions=(
            "You are the Critic/Verifier. You review a draft response produced by another agent "
            "before it reaches the user. Validate that: (1) content recommendations include "
            "citations or explicitly state grounding was unavailable; (2) study plans do not "
            "exceed the learner's computed study capacity; (3) no Expert certification is "
            "recommended with missing prerequisites; (4) manager-facing output contains no "
            "individual raw scores. Use your tools to verify claims. "
            "Respond with a JSON object: {\"verdict\": \"approve\"|\"revise\", \"violations\": "
            "[list of specific issues], \"suggested_fix\": \"...\"}."
        ),
        tools=[
            tools.lookup_learner,
            tools.lookup_certification,
            tools.compute_study_capacity,
            tools.get_business_rules,
        ],
    )

    return {
        "curator": curator,
        "planner": planner,
        "engagement": engagement,
        "assessor": assessor,
        "manager_insights": manager_insights,
        "critic": critic,
    }
