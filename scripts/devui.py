"""Launch the Agent Framework DevUI with all six CertPilot agents.

Opens a browser chat UI where each agent can be selected and exercised
individually, with full visibility of tool calls (including Foundry IQ
knowledge_base_retrieve) and reasoning traces.

Usage:
    python scripts/devui.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from agent_framework.devui import serve

from certpilot.agents import build_agents, make_kb_tool


def main() -> None:
    kb_tool = make_kb_tool()
    agents = build_agents(kb_tool=kb_tool)
    serve(
        entities=list(agents.values()),
        port=8090,
        auto_open=True,
        auth_enabled=False,
    )


if __name__ == "__main__":
    main()
