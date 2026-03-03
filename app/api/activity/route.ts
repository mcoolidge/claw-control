import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const OPENCLAW_DIR = path.join(os.homedir(), ".openclaw", "agents");
const MAX_EVENTS = 50;

interface ActivityEvent {
  id: string;
  agent: string;
  timestamp: string;
  type: "message" | "tool" | "error" | "system";
  role: string;
  summary: string;
}

function parseSessionFile(filePath: string, agentId: string): ActivityEvent[] {
  try {
    const lines = fs.readFileSync(filePath, "utf8").trim().split("\n").filter(Boolean);
    const events: ActivityEvent[] = [];

    for (const line of lines.slice(-100)) {
      try {
        const entry = JSON.parse(line);
        if (entry.type !== "message") continue;
        const msg = entry.message || {};
        const role = msg.role || "unknown";
        const content = msg.content;

        let summary = "";
        let type: ActivityEvent["type"] = "message";

        if (Array.isArray(content)) {
          for (const c of content) {
            if (c.type === "toolCall") {
              summary = `called ${c.name}`;
              type = "tool";
              break;
            } else if (c.type === "toolResult") {
              summary = `tool result`;
              type = "tool";
              break;
            } else if (c.type === "text" && c.text) {
              summary = c.text.slice(0, 80);
              type = role === "user" ? "message" : "message";
              break;
            }
          }
        } else if (typeof content === "string") {
          summary = content.slice(0, 80);
        }

        if (!summary) continue;

        events.push({
          id: entry.id || `${Date.now()}-${Math.random()}`,
          agent: agentId,
          timestamp: entry.timestamp || new Date().toISOString(),
          type,
          role,
          summary,
        });
      } catch { /* skip bad lines */ }
    }
    return events;
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");

  try {
    const allEvents: ActivityEvent[] = [];

    const agentDirs = fs.readdirSync(OPENCLAW_DIR).filter((d) => {
      return fs.statSync(path.join(OPENCLAW_DIR, d)).isDirectory();
    });

    for (const agentId of agentDirs) {
      const sessionsDir = path.join(OPENCLAW_DIR, agentId, "sessions");
      if (!fs.existsSync(sessionsDir)) continue;

      // Get most recent session files (last 3 per agent)
      const files = fs.readdirSync(sessionsDir)
        .filter((f) => f.endsWith(".jsonl"))
        .map((f) => ({ name: f, mtime: fs.statSync(path.join(sessionsDir, f)).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime)
        .slice(0, 3)
        .map((f) => path.join(sessionsDir, f.name));

      for (const file of files) {
        allEvents.push(...parseSessionFile(file, agentId));
      }
    }

    // Sort by timestamp desc, take limit
    allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ events: allEvents.slice(0, limit) });
  } catch (err) {
    return NextResponse.json({ events: [], error: String(err) });
  }
}
