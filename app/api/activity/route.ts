import { NextResponse } from "next/server";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const OPENCLAW_DIR = join(homedir(), ".openclaw");

interface ActivityEvent {
  id: string;
  ts: number;
  agent: string;
  type: "cron" | "session" | "tool" | "message";
  label: string;
  status: "ok" | "error" | "running";
  detail?: string;
  durationMs?: number;
}

function readCronEvents(limit: number): ActivityEvent[] {
  const runsDir = join(OPENCLAW_DIR, "cron", "runs");
  const events: ActivityEvent[] = [];

  try {
    const files = readdirSync(runsDir)
      .map((f) => ({ f, mtime: statSync(join(runsDir, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 20) // recent files only
      .map(({ f }) => f);

    for (const file of files) {
      try {
        const lines = readFileSync(join(runsDir, file), "utf8")
          .trim()
          .split("\n")
          .filter(Boolean);
        for (const line of lines.reverse()) {
          try {
            const ev = JSON.parse(line);
            if (ev.action === "finished" || ev.action === "started") {
              // Extract agent from sessionKey: agent:<id>:cron:...
              const agentMatch = ev.sessionKey?.match(/^agent:([^:]+):/);
              const agent = agentMatch ? agentMatch[1] : "main";
              events.push({
                id: `cron-${ev.ts}-${ev.jobId?.slice(0, 8)}`,
                ts: ev.ts,
                agent,
                type: "cron",
                label: ev.action === "started" ? "Cron job started" : "Cron job finished",
                status: ev.status === "error" ? "error" : ev.action === "started" ? "running" : "ok",
                detail: ev.error || ev.sessionKey?.split(":").slice(0, 4).join(":"),
                durationMs: ev.durationMs,
              });
            }
          } catch {}
        }
      } catch {}
      if (events.length >= limit) break;
    }
  } catch {}

  return events;
}

function readSessionEvents(limit: number): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  const agentsDir = join(OPENCLAW_DIR, "agents");

  try {
    const agentDirs = readdirSync(agentsDir);
    for (const agentId of agentDirs) {
      const sessPath = join(agentsDir, agentId, "sessions", "sessions.json");
      try {
        const raw = readFileSync(sessPath, "utf8");
        const data = JSON.parse(raw);
        const sessions: Record<string, unknown>[] = Array.isArray(data) ? data : Object.values(data);
        for (const s of sessions.slice(-20)) {
          const session = s as Record<string, unknown>;
          if (!session.updatedAt) continue;
          events.push({
            id: `session-${session.sessionId}`,
            ts: session.updatedAt as number,
            agent: agentId,
            type: "session",
            label: (session.label as string) || "Session updated",
            status: "ok",
            detail: session.model as string | undefined,
          });
        }
      } catch {}
    }
  } catch {}

  return events.sort((a, b) => b.ts - a.ts).slice(0, limit);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const cron = readCronEvents(30);
  const sessions = readSessionEvents(30);

  const all = [...cron, ...sessions]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, limit);

  return NextResponse.json({ events: all });
}
