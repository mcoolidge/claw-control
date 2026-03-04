import { NextResponse } from "next/server";

const SHIM_BASE = "https://linear-agent-shim.replit.app";
const TOKEN = process.env.LINEAR_SHIM_TOKEN;

interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  priority: number;
  state: { name: string };
  assignee: { name: string } | null;
  project: { id: string; name: string; description?: string; progress?: number; state?: string } | null;
  labels: { nodes: { name: string; color: string }[] };
}

interface Project {
  id: string;
  name: string;
  description: string;
  state: string;
  progress: number;
  issueCount: number;
  doneCount: number;
  inProgressCount: number;
  assignees: string[];
  recentTitles: string[];
  url: string;
}

export async function GET() {
  if (!TOKEN) return NextResponse.json({ error: "No LINEAR_SHIM_TOKEN" }, { status: 500 });

  try {
    // Fetch enough issues to cover all projects
    const res = await fetch(`${SHIM_BASE}/issues?limit=250`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      next: { revalidate: 60 },
    });

    if (!res.ok) return NextResponse.json({ error: "Upstream error" }, { status: res.status });

    const data = await res.json();
    const issues: LinearIssue[] = data.nodes || [];

    // Group by project
    const projectMap = new Map<string, Project>();

    // Issues with no project → a synthetic "Inbox" group
    const INBOX_ID = "__inbox__";

    for (const issue of issues) {
      const proj = issue.project;
      const key = proj?.id ?? INBOX_ID;
      const stateName = issue.state?.name?.toLowerCase() ?? "";
      const isDone = ["done", "cancelled", "published"].includes(stateName);
      const isInProgress = ["in progress", "in review", "ready for test", "testing"].includes(stateName);

      if (!projectMap.has(key)) {
        projectMap.set(key, {
          id: key,
          name: proj?.name ?? "Inbox",
          description: proj?.description ?? "Issues not assigned to a project",
          state: proj?.state ?? "started",
          progress: 0,
          issueCount: 0,
          doneCount: 0,
          inProgressCount: 0,
          assignees: [],
          recentTitles: [],
          url: proj ? `https://linear.app/carelaunch/project/${key}` : "",
        });
      }

      const p = projectMap.get(key)!;
      p.issueCount++;
      if (isDone) p.doneCount++;
      if (isInProgress) p.inProgressCount++;
      if (issue.assignee?.name && !p.assignees.includes(issue.assignee.name)) {
        p.assignees.push(issue.assignee.name);
      }
      if (p.recentTitles.length < 3) p.recentTitles.push(issue.title);
    }

    // Compute progress as % done
    for (const p of projectMap.values()) {
      p.progress = p.issueCount > 0 ? Math.round((p.doneCount / p.issueCount) * 100) : 0;
    }

    // Sort: named projects first, inbox last; then by issue count desc
    const projects = Array.from(projectMap.values()).sort((a, b) => {
      if (a.id === INBOX_ID) return 1;
      if (b.id === INBOX_ID) return -1;
      return b.issueCount - a.issueCount;
    });

    return NextResponse.json({ projects });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
