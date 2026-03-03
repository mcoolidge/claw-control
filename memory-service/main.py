#!/usr/bin/env python3
"""
Claw Memory Service — HTTP API wrapping Mem0 + Qdrant + LM Studio.
Zero cost, fully local.

Endpoints:
  POST /memory/add       — store facts from a message
  GET  /memory/search    — retrieve relevant memories
  GET  /memory/list      — list all memories for a user/agent
  DELETE /memory/{id}    — remove a specific memory
  GET  /health           — liveness check
"""

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from mem0 import Memory
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
import uvicorn

# ── Config ────────────────────────────────────────────────────────────────────

QDRANT_HOST = "localhost"
QDRANT_PORT = 6333
COLLECTION  = "claw_memory"
EMBED_DIM   = 768  # nomic-embed-text-v1.5

OLLAMA_URL    = "http://localhost:11434"

MEM0_CONFIG = {
    "vector_store": {
        "provider": "qdrant",
        "config": {
            "host": QDRANT_HOST,
            "port": QDRANT_PORT,
            "collection_name": COLLECTION,
        }
    },
    "embedder": {
        "provider": "ollama",
        "config": {
            "model": "nomic-embed-text",
            "ollama_base_url": OLLAMA_URL,
        }
    },
    "llm": {
        "provider": "ollama",
        "config": {
            "model": "qwen3.5",
            "ollama_base_url": OLLAMA_URL,
        }
    }
}

# ── Bootstrap ─────────────────────────────────────────────────────────────────

def ensure_collection():
    """Make sure Qdrant collection exists with correct dimensions."""
    client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)
    existing = [c.name for c in client.get_collections().collections]
    if COLLECTION not in existing:
        client.create_collection(
            collection_name=COLLECTION,
            vectors_config=VectorParams(size=EMBED_DIM, distance=Distance.COSINE)
        )
        print(f"Created collection '{COLLECTION}' with {EMBED_DIM} dims")
    else:
        info = client.get_collection(COLLECTION)
        actual_dim = info.config.params.vectors.size
        if actual_dim != EMBED_DIM:
            print(f"⚠️  Dimension mismatch: expected {EMBED_DIM}, got {actual_dim}. Recreating...")
            client.delete_collection(COLLECTION)
            client.create_collection(
                collection_name=COLLECTION,
                vectors_config=VectorParams(size=EMBED_DIM, distance=Distance.COSINE)
            )

ensure_collection()
mem = Memory.from_config(MEM0_CONFIG)

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(title="Claw Memory Service", version="0.1.0")

class AddRequest(BaseModel):
    content: str
    user_id: str = "mat"
    agent_id: str | None = None
    metadata: dict | None = None

class AddResponse(BaseModel):
    memories: list[dict]

@app.get("/health")
def health():
    return {"status": "ok", "collection": COLLECTION}

@app.post("/memory/add", response_model=AddResponse)
def add_memory(req: AddRequest):
    try:
        kwargs = {"user_id": req.user_id}
        if req.agent_id:
            kwargs["agent_id"] = req.agent_id
        if req.metadata:
            kwargs["metadata"] = req.metadata
        result = mem.add(req.content, **kwargs)
        return {"memories": result.get("results", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/memory/search")
def search_memory(
    q: str = Query(..., description="Search query"),
    user_id: str = Query("mat"),
    agent_id: str | None = Query(None),
    limit: int = Query(5),
):
    try:
        kwargs = {"user_id": user_id, "limit": limit}
        if agent_id:
            kwargs["agent_id"] = agent_id
        result = mem.search(q, **kwargs)
        return {"results": result.get("results", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/memory/list")
def list_memories(
    user_id: str = Query("mat"),
    agent_id: str | None = Query(None),
):
    try:
        kwargs = {"user_id": user_id}
        if agent_id:
            kwargs["agent_id"] = agent_id
        result = mem.get_all(**kwargs)
        return {"memories": result.get("results", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/memory/{memory_id}")
def delete_memory(memory_id: str):
    try:
        mem.delete(memory_id)
        return {"deleted": memory_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8765, log_level="info")
