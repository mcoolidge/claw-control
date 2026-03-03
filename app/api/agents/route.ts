import { NextResponse } from "next/server";
import { execSync } from "child_process";

export async function GET() {
  try {
    const raw = execSync("openclaw agents list 2>/dev/null", {
      encoding: "utf8",
      timeout: 5000,
    });

    const agents: { id: string; name: string; model: string; identity: string }[] = [];
    let current: Record<string, string> | null = null;

    for (const line of raw.split("\n")) {
      const agentMatch = line.match(/^- (\S+)\s.*?\((.+?)\)\s*$/);
      const agentSimple = line.match(/^- (\S+)\s*\((.+?)\)\s*$/);
      const m = agentMatch || agentSimple;
      if (m) {
        if (current) agents.push(current as any);
        current = { id: m[1], name: m[2], model: "", identity: "" };
      } else if (current) {
        const model = line.match(/Model:\s*(.+)/);
        const identity = line.match(/Identity:\s*(.+)/);
        if (model) current.model = model[1].trim();
        if (identity) current.identity = identity[1].trim();
      }
    }
    if (current) agents.push(current as any);

    return NextResponse.json({ agents });
  } catch {
    return NextResponse.json({ agents: [] });
  }
}
