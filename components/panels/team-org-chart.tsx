"use client";

import { useEffect, useState } from "react";
import { AGENTS, checkAgentHealth } from "@/lib/agents";
import { Badge } from "@/components/ui/badge";
import { Wrench, Brain, Search, FileText } from "lucide-react";

type AgentMeta = {
  role: string;
  description: string;
  capabilities: string[];
  currentTask: string;
  icon: typeof Wrench;
};

const AGENT_META: Record<string, AgentMeta> = {
  Greg: {
    role: "Lead Engineer",
    description: "Full-stack builder and system architect. Handles UI, infrastructure, and deployment.",
    capabilities: ["Frontend development", "System architecture", "DevOps & deployment", "Health monitoring"],
    currentTask: "Building Mission Control dashboard",
    icon: Wrench,
  },
  Apollo: {
    role: "Memory & Data Specialist",
    description: "Manages agent memory systems, embeddings, and data pipelines. Runs consolidation and indexing.",
    capabilities: ["Memory consolidation", "Vector embeddings", "Data pipeline ops", "Semantic search"],
    currentTask: "Running memory consolidation pipeline",
    icon: Brain,
  },
  Kai: {
    role: "QA & Tool Engineer",
    description: "Builds and validates agent tools, schemas, and integrations. Focuses on quality and correctness.",
    capabilities: ["Schema validation", "Tool registry", "Code review", "Integration testing"],
    currentTask: "Reviewing structured output schemas",
    icon: Search,
  },
  Athena: {
    role: "Ops & Communications",
    description: "Handles reporting, scheduling, documentation, and cross-team coordination.",
    capabilities: ["Standup summaries", "Newsletter drafts", "Calendar management", "Documentation"],
    currentTask: "Drafting daily standup summary",
    icon: FileText,
  },
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
      {/* Summary bar */}
      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span>{AGENTS.length} agents</span>
        <span className="text-emerald-400">
          {Object.values(statuses).filter(Boolean).length} online
        </span>
        <span className="text-zinc-600">
          {Object.values(statuses).filter((v) => !v).length} offline
        </span>
      </div>

      {AGENTS.map((agent) => {
        const meta = AGENT_META[agent.name];
        const AgentIcon = meta.icon;

        return (
          <div
            key={agent.name}
            className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-4"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative">
                <div
                  className="size-14 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
                  style={{ backgroundColor: agent.color }}
                >
                  {agent?.name?.[0] ?? "?"}
                </div>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 size-4 rounded-full border-2 border-zinc-800 ${
                    statuses[agent.name] ? "bg-emerald-400" : "bg-zinc-600"
                  }`}
                />
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
                    {statuses[agent.name] ? "Online" : "Offline"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <AgentIcon className="size-3 text-zinc-500" />
                  <span className="text-xs font-medium text-zinc-400">{meta.role}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{meta.description}</p>

                {/* Capabilities */}
                <div className="flex gap-1.5 flex-wrap mt-2">
                  {meta.capabilities.map((cap) => (
                    <span key={cap} className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-700/50 text-zinc-400">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right column */}
              <div className="text-right shrink-0 space-y-1.5">
                <div className="text-[10px] text-zinc-600">Port {agent.port}</div>
                <div className="text-[10px] text-zinc-600 max-w-[140px] truncate">{agent.model}</div>
                <div className="mt-2">
                  <div className="text-[9px] text-zinc-500 uppercase tracking-wider">Working on</div>
                  <div className="text-xs text-zinc-300 mt-0.5 max-w-[160px]">{meta.currentTask}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
