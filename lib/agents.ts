// Agent registry — maps agent name to their OpenClaw gateway port
export const AGENTS = [
  { name: "Greg",   port: 19000, model: "github-copilot/claude-sonnet-4.6", color: "#3b82f6" },
  { name: "Apollo", port: 19001, model: "openai/gpt-4o",                    color: "#22c55e" },
  { name: "Kai",    port: 19005, model: "openai/gpt-4o",                    color: "#a855f7" },
  { name: "Athena", port: 24000, model: "openai/gpt-4o",                    color: "#f97316" },
] as const;

export type Agent = (typeof AGENTS)[number];

export type AgentStatus = {
  name: string;
  port: number;
  model: string;
  color: string;
  status: "up" | "down";
  lastChecked: string;
};

export async function checkAgentHealth(port: number): Promise<boolean> {
  try {
    const res = await fetch(`/api/health?port=${port}`, {
      signal: AbortSignal.timeout(2000),
    });
    const data = await res.json();
    return data.ok === true;
  } catch {
    return false;
  }
}
