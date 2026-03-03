// Agent registry — maps agent name to their OpenClaw gateway port
export const AGENTS = [
  { name: "Greg",   port: 19000, model: "github-copilot/claude-sonnet-4.6" },
  { name: "Apollo", port: 19001, model: "openai/gpt-4o" },
  { name: "Kai",    port: 19005, model: "openai/gpt-4o" },
  { name: "Athena", port: 24000, model: "openai/gpt-4o" },
];

export type AgentStatus = {
  name: string;
  port: number;
  model: string;
  status: "up" | "down";
  lastChecked: string;
};

export async function checkAgentHealth(port: number): Promise<boolean> {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
