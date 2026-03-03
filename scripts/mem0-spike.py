#!/usr/bin/env python3
"""
Mem0 spike: self-hosted memory using Qdrant + LM Studio embeddings (nomic-embed).
Zero cost — everything runs locally.
"""

from mem0 import Memory

config = {
    "vector_store": {
        "provider": "qdrant",
        "config": {
            "host": "localhost",
            "port": 6333,
            "collection_name": "claw_memory",
        }
    },
    "embedder": {
        "provider": "openai",  # mem0 uses openai-compatible API
        "config": {
            "model": "text-embedding-nomic-embed-text-v1.5",
            "api_key": "lm-studio-local",
            "openai_base_url": "http://192.168.8.238:1234/v1",
        }
    },
    "llm": {
        "provider": "openai",
        "config": {
            "model": "qwen/qwen3.5-35b-a3b",
            "api_key": "lm-studio-local",
            "openai_base_url": "http://192.168.8.238:1234/v1",
        }
    }
}

m = Memory.from_config(config)

# Test: store a memory for "mat" user
print("Adding memory...")
result = m.add("Mat is building ClawPack, a multi-agent orchestration system on top of OpenClaw. He cares about simplicity and avoiding over-engineering.", user_id="mat")
print("Added:", result)

# Test: recall
print("\nSearching memory...")
results = m.search("What is Mat working on?", user_id="mat")
for r in results:
    print(f"  [{r['score']:.2f}] {r['memory']}")

print("\nDone.")
