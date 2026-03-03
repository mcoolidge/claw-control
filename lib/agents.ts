// Agent registry — loaded dynamically from OpenClaw gateway via /api/agents
// Fallback list used for SSR / before API loads

export const AGENT_COLORS: Record<string, string> = {
  main:    "#f97316",
  athena:  "#a78bfa",
  ada:     "#34d399",
  suzieqa: "#60a5fa",
};

export const AGENTS = [
  { name: "Henry",   id: "main",    model: "github-copilot/claude-sonnet-4.6", color: "#f97316" },
  { name: "Athena",  id: "athena",  model: "github-copilot/claude-sonnet-4.6", color: "#a78bfa" },
  { name: "Ada",     id: "ada",     model: "github-copilot/claude-sonnet-4.6", color: "#34d399" },
  { name: "SuzieQA", id: "suzieqa", model: "github-copilot/claude-sonnet-4.6", color: "#60a5fa" },
];

export type Agent = (typeof AGENTS)[number];

export async function checkAgentHealth(agentId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/agents/health?id=${agentId}`, {
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    return data.ok === true;
  } catch {
    return false;
  }
}
