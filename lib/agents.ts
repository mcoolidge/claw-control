// Agent registry — loaded dynamically from OpenClaw gateway via /api/agents
// Fallback list used for SSR / before API loads

export const AGENT_COLORS: Record<string, string> = {
  greg:   "#3b82f6",
  apollo: "#22c55e",
  kai:    "#a855f7",
  athena: "#f97316",
};

export const AGENTS = [
  { name: "Greg",   id: "greg",   port: 19000, model: "github-copilot/claude-sonnet-4.6", color: "#3b82f6" },
  { name: "Apollo", id: "apollo", port: 19001, model: "github-copilot/claude-sonnet-4.6", color: "#22c55e" },
  { name: "Kai",    id: "kai",    port: 19005, model: "github-copilot/claude-sonnet-4.6", color: "#a855f7" },
  { name: "Athena", id: "athena", port: 24000, model: "github-copilot/claude-sonnet-4.6", color: "#f97316" },
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
