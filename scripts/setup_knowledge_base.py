"""One-time setup: create the Foundry IQ Knowledge Base for SkillPilot-AI.

Creates a File knowledge source, uploads the synthetic knowledge documents,
and assembles a Knowledge Base with agentic retrieval. Run once:

    python scripts/setup_knowledge_base.py
"""

import os
import sys
import time
from pathlib import Path

from azure.core.credentials import AzureKeyCredential
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    AzureOpenAIVectorizerParameters,
    FileKnowledgeSource,
    FileKnowledgeSourceParameters,
    KnowledgeBase,
    KnowledgeBaseAzureOpenAIModel,
    KnowledgeSourceReference,
)
from azure.search.documents.knowledgebases.models import (
    KnowledgeRetrievalLowReasoningEffort,
    KnowledgeRetrievalMinimalReasoningEffort,
    KnowledgeRetrievalOutputMode,
    KnowledgeSourceAzureOpenAIVectorizer,
    KnowledgeSourceIngestionParameters,
)
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")

SEARCH_ENDPOINT = os.environ["AZURE_SEARCH_ENDPOINT"]
SEARCH_API_KEY = os.environ["AZURE_SEARCH_API_KEY"]
AOAI_BASE = os.environ["AZURE_OPENAI_ENDPOINT"].split("/openai")[0]  # resource base URL
AOAI_API_KEY = os.environ["AZURE_AI_API_KEY"]
CHAT_DEPLOYMENT = os.environ.get("AZURE_AI_MODEL_DEPLOYMENT", "gpt-oss-120b")
EMBEDDING_DEPLOYMENT = os.environ.get("AZURE_AI_EMBEDDING_DEPLOYMENT", "text-embedding-3-small")

KS_NAME = "certpilot-ks-docs"
KB_NAME = "certpilot-kb"
DOCS_DIR = ROOT / "data" / "knowledge"

client = SearchIndexClient(endpoint=SEARCH_ENDPOINT, credential=AzureKeyCredential(SEARCH_API_KEY))


def embedding_vectorizer() -> KnowledgeSourceAzureOpenAIVectorizer:
    return KnowledgeSourceAzureOpenAIVectorizer(
        azure_open_ai_parameters=AzureOpenAIVectorizerParameters(
            resource_url=AOAI_BASE,
            deployment_name=EMBEDDING_DEPLOYMENT,
            api_key=AOAI_API_KEY,
            model_name=EMBEDDING_DEPLOYMENT,
        )
    )


def create_knowledge_source() -> None:
    ks = FileKnowledgeSource(
        name=KS_NAME,
        description="SkillPilot-AI synthetic enterprise learning documents (certification guides, policies, reports).",
        file_parameters=FileKnowledgeSourceParameters(
            ingestion_parameters=KnowledgeSourceIngestionParameters(
                content_extraction_mode="minimal",
                embedding_model=embedding_vectorizer(),
            ),
        ),
    )
    client.create_or_update_knowledge_source(ks)
    print(f"[ok] knowledge source '{KS_NAME}' created")


def upload_documents() -> None:
    docs = sorted(DOCS_DIR.glob("*.md"))
    if not docs:
        sys.exit(f"No documents found in {DOCS_DIR}")
    existing = {f.file_name for f in client.list_knowledge_source_files(KS_NAME)}
    for doc in docs:
        if doc.name in existing:
            print(f"[skip] {doc.name} already uploaded")
            continue
        for attempt in range(1, 6):
            try:
                uploaded = client.upload_knowledge_source_file(KS_NAME, doc.read_bytes(), filename=doc.name)
                print(f"[ok] uploaded {doc.name} ({uploaded.file_size_bytes:,} bytes)")
                break
            except Exception as exc:
                if "429" in str(exc) and attempt < 5:
                    wait = 2**attempt
                    print(f"  429 on {doc.name}, retrying in {wait}s")
                    time.sleep(wait)
                    continue
                raise


def wait_until_active(timeout: int = 300, poll: int = 10) -> None:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        status = client.get_knowledge_source_status(KS_NAME)
        state = (getattr(status, "synchronization_status", "") or "").lower()
        print(f"  sync status: {state or '?'}")
        if state == "active":
            print(f"[ok] knowledge source '{KS_NAME}' is active")
            return
        time.sleep(poll)
    sys.exit("Timed out waiting for knowledge source ingestion")


def create_knowledge_base() -> None:
    chat_params = AzureOpenAIVectorizerParameters(
        resource_url=AOAI_BASE,
        deployment_name=CHAT_DEPLOYMENT,
        api_key=AOAI_API_KEY,
        model_name=CHAT_DEPLOYMENT,
    )
    synthesis_kb = KnowledgeBase(
        name=KB_NAME,
        description="SkillPilot-AI enterprise learning knowledge base with agentic retrieval and citations.",
        models=[KnowledgeBaseAzureOpenAIModel(azure_open_ai_parameters=chat_params)],
        knowledge_sources=[KnowledgeSourceReference(name=KS_NAME)],
        retrieval_reasoning_effort=KnowledgeRetrievalLowReasoningEffort(),
        output_mode=KnowledgeRetrievalOutputMode.ANSWER_SYNTHESIS,
        answer_instructions=(
            "Answer using only the retrieved content from the certification and policy "
            "documents. Preserve [ref_id:N] citations. If the content does not cover the "
            "question, say so explicitly."
        ),
    )
    try:
        client.create_or_update_knowledge_base(synthesis_kb)
        print(f"[ok] knowledge base '{KB_NAME}' created (answer synthesis mode, model={CHAT_DEPLOYMENT})")
        return
    except Exception as exc:
        print(f"[warn] answer-synthesis KB failed ({exc}); falling back to extractive mode")

    extractive_kb = KnowledgeBase(
        name=KB_NAME,
        description="SkillPilot-AI enterprise learning knowledge base (extractive retrieval).",
        knowledge_sources=[KnowledgeSourceReference(name=KS_NAME)],
        retrieval_reasoning_effort=KnowledgeRetrievalMinimalReasoningEffort(),
        output_mode=KnowledgeRetrievalOutputMode.EXTRACTIVE_DATA,
    )
    client.create_or_update_knowledge_base(extractive_kb)
    print(f"[ok] knowledge base '{KB_NAME}' created (extractive mode)")


if __name__ == "__main__":
    create_knowledge_source()
    upload_documents()
    wait_until_active()
    create_knowledge_base()
    mcp_url = f"{SEARCH_ENDPOINT}/knowledgebases/{KB_NAME}/mcp?api-version=2026-05-01-preview"
    print("\nKB MCP endpoint:")
    print(f"  {mcp_url}")
    print("Set FOUNDRY_IQ_KB_MCP_URL in .env to this value.")
