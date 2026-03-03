"use client";

import { useEffect, useState } from "react";
import { AGENTS, checkAgentHealth } from "@/lib/agents";
import { Badge } from "@/components/ui/badge";

const CURRENT_TASKS: Record<string, string> = {
  Greg:   "Building Mission Control dashboard",
  Apollo: "Running memory consolidation pipeline",
  Kai:    "Reviewing structured output schemas",
  Athena: "Drafting daily standup summary",
};

export default function TeamOrgChart() {
  const [statuses, setStatuses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function poll() {
      const results: Record<string, boolean> = {};
      await Promise.all(
        AGENTS.map(async (a) => {
          results[a.name] = await checkAgentHealth(a.port);
        })
      );
      setStatuses(results);
    }
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-4">
      {AGENTS.map((agent) => (
        <div
          key={agent.name}
          className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-4"
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="size-12 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
              style={{ backgroundColor: agent.color }}
            >
              {agent.name[0]}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-zinc-100">{agent.name}</span>
                <Badge
                  className={
                    statuses[agent.name]
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-red-500/20 text-red-400 border-red-500/30"
                  }
                >
                  {statuses[agent.name] ? "● Online" : "● Offline"}
                </Badge>
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                Port {agent.port} · {agent.model}
              </div>
            </div>

            {/* Current task */}
            <div className="text-right shrink-0">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Current task</div>
              <div className="text-xs text-zinc-300 mt-0.5">{CURRENT_TASKS[agent.name]}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
