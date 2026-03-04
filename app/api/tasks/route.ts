import { NextRequest, NextResponse } from "next/server";

const SHIM_BASE = "https://linear-agent-shim.replit.app";
const TOKEN = process.env.LINEAR_SHIM_TOKEN;

// Map Linear state names → our kanban columns
function mapState(stateName: string): string {
  const s = stateName.toLowerCase();
  if (["backlog", "triage", "todo", "on hold", "cancelled"].includes(s)) return "Backlog";
  if (s === "in progress") return "In Progress";
  if (s === "in review") return "In Review";
  if (["ready for test", "testing"].includes(s)) return "Testing";
  if (["done", "published"].includes(s)) return "Done";
  return "Backlog";
}

function mapPriority(p: number): string {
  if (p === 1) return "critical";
  if (p === 2) return "high";
  if (p === 3) return "medium";
  return "low";
}

export async function GET(req: NextRequest) {
  if (!TOKEN) return NextResponse.json({ error: "No LINEAR_SHIM_TOKEN" }, { status: 500 });

  const { searchParams } = req.nextUrl;
  const limit = searchParams.get("limit") || "50";
  const cursor = searchParams.get("cursor") || "";

  try {
    const url = new URL(`${SHIM_BASE}/issues`);
    url.searchParams.set("limit", limit);
    if (cursor) url.searchParams.set("cursor", cursor);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${TOKEN}` },
      next: { revalidate: 30 },
    });

    if (!res.ok) return NextResponse.json({ error: "Upstream error" }, { status: res.status });

    const data = await res.json();
    const tasks = (data.nodes || []).map((n: Record<string, unknown>) => ({
      id: n.identifier,
      title: n.title,
      description: n.description || "",
      status: mapState((n.state as Record<string, string>)?.name || ""),
      priority: mapPriority(n.priority as number),
      assignee: (n.assignee as Record<string, string>)?.name || null,
      linearId: n.id,
      url: `https://linear.app/issue/${n.identifier}`,
    }));

    return NextResponse.json({
      tasks,
      pageInfo: data.pageInfo,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// Linear state name → UUID (fetched once from the team)
const STATE_IDS: Record<string, string> = {
  "backlog":    "1225937d-cf9d-4ab1-b8f0-5dad29a5a1aa",
  "in-progress":"92ee46dc-a010-4384-aaab-2eec8313f050",
  "in-review":  "a60a7602-824d-45cc-8f49-4f086e8aaa7e",
  "testing":    "0202df62-583e-4144-90dc-a4212e9575fc",
  "done":       "c18156d1-67a1-4a7b-8f4a-e5eed4909e92",
};

export async function PATCH(req: NextRequest) {
  if (!TOKEN) return NextResponse.json({ error: "No LINEAR_SHIM_TOKEN" }, { status: 500 });

  const { id, linearId, state } = await req.json();
  if ((!id && !linearId) || !state) return NextResponse.json({ error: "Missing id or state" }, { status: 400 });

  const stateId = STATE_IDS[state];
  if (!stateId) return NextResponse.json({ error: `Unknown state: ${state}` }, { status: 400 });

  // Prefer linearId (UUID) for the PATCH URL; fall back to identifier
  const issueRef = linearId || id;
  const res = await fetch(`${SHIM_BASE}/issues/${issueRef}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ stateId }),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
