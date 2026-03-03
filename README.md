# Claw Control

A minimal dashboard for managing OpenClaw agents. Built for personal ops use.

## Features (v1)
- Agent status panel — live health check across all agents
- Task queue (coming soon)
- Session browser (coming soon)
- Send message to agent (coming soon)

## Stack
- Next.js 15 (App Router)
- shadcn/ui + Tailwind
- SQLite (better-sqlite3) for task persistence

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Agents

Edit `lib/agents.ts` to add/remove agents and their gateway ports.

## License
MIT
