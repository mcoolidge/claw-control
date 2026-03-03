# Mnemosyne Memory Skill

Shared long-term memory for all OpenClaw agents.
Stack: Mem0 → Ollama (nomic-embed-text embeddings + qwen3.5 extraction) → Qdrant
Memory service runs at `http://localhost:8765`.

## On Every Session Start

Search for relevant context before doing anything else:

```bash
curl -s "http://localhost:8765/memory/search?q=<topic or user request>&user_id=mat&limit=5"
```

Inject any relevant results into your working context.

## Store Important Facts

When you learn something worth remembering — decisions, preferences, project context, corrections — store it immediately. Don't rely on mental notes.

```bash
curl -s -X POST http://localhost:8765/memory/add \
  -H "Content-Type: application/json" \
  -d '{
    "content": "<what to remember>",
    "user_id": "mat",
    "agent_id": "<your agent name>"
  }'
```

## Agent ID Convention

Use your agent name: `henry`, `greg`, `apollo`, `kai`, `athena`

## Other Endpoints

```bash
# List all memories for a user
curl -s "http://localhost:8765/memory/list?user_id=mat"

# Delete a specific memory
curl -s -X DELETE "http://localhost:8765/memory/<memory_id>"

# Health check
curl -s http://localhost:8765/health
```

## What to Store

**Good candidates:**
- Decisions Mat has made ("Mat chose Next.js for claw-control")
- Preferences ("Mat prefers concise answers, no preamble")
- Project context ("ClawPack agents: Greg (19000), Athena (24000), Apollo (19001), Kai (19005)")
- Corrections ("The ClawPack API runs on port 3001, not 3000")
- Lessons learned ("Qdrant collection must be pre-created at 768 dims for nomic-embed")

**Don't store:**
- Transient task status (use task queue instead)
- Raw conversation dumps
- Secrets or credentials

## If the Service Is Down

Start it manually:
```bash
cd ~/Projects/claw-control/memory-service && python3 main.py &
```

Dependencies: Ollama running locally (port 11434), Qdrant Docker container (`mnemosyne-qdrant`, port 6333).

Start Qdrant if needed:
```bash
docker start mnemosyne-qdrant
```
