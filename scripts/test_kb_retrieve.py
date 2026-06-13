"""Smoke test: call the Foundry IQ KB over its MCP endpoint (JSON-RPC 2.0)."""

import json
import os
from pathlib import Path

import httpx
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")

SEARCH_ENDPOINT = os.environ["AZURE_SEARCH_ENDPOINT"]
SEARCH_API_KEY = os.environ["AZURE_SEARCH_API_KEY"]
KB_NAME = "certpilot-kb"
MCP_URL = f"{SEARCH_ENDPOINT}/knowledgebases/{KB_NAME}/mcp?api-version=2026-05-01-preview"
HEADERS = {
    "api-key": SEARCH_API_KEY,
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream",
}


def parse_mcp(resp: httpx.Response) -> dict:
    if resp.headers.get("content-type", "").startswith("text/event-stream"):
        for line in resp.text.splitlines():
            if line.startswith("data:"):
                return json.loads(line[5:])
        raise ValueError("no data line in SSE response")
    return resp.json()


with httpx.Client(timeout=120) as http:
    tools_resp = http.post(
        MCP_URL,
        headers=HEADERS,
        json={"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}},
    )
    tools = parse_mcp(tools_resp)
    print("Tools:", [t["name"] for t in tools["result"]["tools"]])

    call_resp = http.post(
        MCP_URL,
        headers=HEADERS,
        json={
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/call",
            "params": {
                "name": "knowledge_base_retrieve",
                "arguments": {
                    "queries": ["What are the retake policy rules for certification exams?"]
                },
            },
        },
    )
    payload = parse_mcp(call_resp)
    if "error" in payload:
        print("ERROR:", json.dumps(payload["error"], indent=2)[:2000])
    else:
        for block in payload["result"].get("content", []):
            text = block.get("text", "")
            print(text[:3000])
