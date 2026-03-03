"use client";

import { useState } from "react";
import { AGENTS } from "@/lib/agents";
import { ArrowRight, Lightbulb, Search, FileText, ListTodo, Brain, Sparkles } from "lucide-react";

function agentColor(name: string) {
  return AGENTS.find((a) => a.name === name)?.color ?? "#71717a";
}

type Project = {
  id: number;
  name: string;
  description: string;
  owner: string;
  status: "active" | "planning" | "paused" | "complete";
  priority: "high" | "medium" | "low";
  progress: number;
  agents: string[];
  outcomes: string[];
  recentActivity: string;
  nextActions: string[];
  taskCount: number;
  docCount: number;
  memoryCount: number;
};

const PROJECTS: Project[] = [
  {
    id: 1, name: "Claw Control Dashboard", description: "Central mission control UI for monitoring and managing all OpenClaw agents, tasks, and workflows.",
    owner: "Greg", status: "active", priority: "high", progress: 65, agents: ["Greg", "Athena"],
    outcomes: ["Unified agent monitoring", "Task management kanban", "Live activity feed"],
    recentActivity: "Built dark sidebar layout and kanban task board",
    nextActions: ["Add drag-and-drop to kanban columns", "Connect activity feed to real gateway events", "Deploy to LAN"],
    taskCount: 8, docCount: 3, memoryCount: 5,
  },
  {
    id: 2, name: "Memory Service v2", description: "Next-generation memory system with Qdrant vector storage, Mem0 integration, and semantic retrieval.",
    owner: "Apollo", status: "active", priority: "high", progress: 40, agents: ["Apollo", "Kai"],
    outcomes: ["Persistent agent memory", "Semantic search across memories", "Memory consolidation pipeline"],
    recentActivity: "Implemented nightly consolidation cron job",
    nextActions: ["Add memory deduplication logic", "Build semantic search API endpoint", "Set up memory retention policies"],
    taskCount: 12, docCount: 5, memoryCount: 8,
  },
  {
    id: 3, name: "Agent Orchestration Layer", description: "Coordination system for multi-agent workflows — supervisor pattern with task delegation and result aggregation.",
    owner: "Apollo", status: "planning", priority: "medium", progress: 15, agents: ["Apollo"],
    outcomes: ["Multi-agent task routing", "Dependency-aware scheduling", "Cross-agent context sharing"],
    recentActivity: "Research phase — evaluating supervisor vs peer-to-peer patterns",
    nextActions: ["Define orchestration protocol spec", "Prototype supervisor agent", "Test with 2-agent workflow"],
    taskCount: 4, docCount: 2, memoryCount: 3,
  },
  {
    id: 4, name: "Tool Registry", description: "Centralized registry for all agent tools — discovery, versioning, permissions, and usage analytics.",
    owner: "Kai", status: "active", priority: "medium", progress: 55, agents: ["Kai", "Greg"],
    outcomes: ["Tool discovery API", "Permission model", "Usage tracking dashboard"],
    recentActivity: "Added structured output validation with Zod schemas",
    nextActions: ["Implement tool versioning", "Add permission checks to gateway", "Build usage analytics view"],
    taskCount: 6, docCount: 4, memoryCount: 4,
  },
  {
    id: 5, name: "Automated QA Pipeline", description: "Continuous quality assurance — auto-test generation, regression detection, and code review assistance.",
    owner: "Athena", status: "paused", priority: "low", progress: 30, agents: ["Athena"],
    outcomes: ["Auto-generated test cases", "Regression alerts", "Review suggestions"],
    recentActivity: "Paused — waiting for orchestration layer to enable cross-agent testing",
    nextActions: ["Resume after orchestration MVP", "Define test generation prompts", "Set up CI integration"],
    taskCount: 3, docCount: 1, memoryCount: 1,
  },
  {
    id: 6, name: "Knowledge Graph Builder", description: "Build and maintain a knowledge graph from codebase, docs, and agent conversations for enhanced reasoning.",
    owner: "Kai", status: "planning", priority: "low", progress: 10, agents: ["Kai"],
    outcomes: ["Entity extraction pipeline", "Relationship mapping", "Graph query API"],
    recentActivity: "Initial research on graph DB options (Neo4j vs in-memory)",
    nextActions: ["Choose graph storage backend", "Define entity schema", "Build extraction prototype"],
    taskCount: 2, docCount: 1, memoryCount: 2,
  },
];

const STATUS_STYLE: Record<string, string> = {
  active:   "bg-emerald-500/15 text-emerald-400",
  planning: "bg-blue-500/15 text-blue-400",
  paused:   "bg-yellow-500/15 text-yellow-400",
  complete: "bg-zinc-500/15 text-zinc-400",
};

const PRIORITY_STYLE: Record<string, string> = {
  high:   "text-orange-400",
  medium: "text-yellow-400",
  low:    "text-zinc-500",
};

export default function ProjectList() {
  const [selected, setSelected] = useState<Project | null>(null);
  const [search, setSearch] = useState("");
  const [showAdvisor, setShowAdvisor] = useState(false);

  const filtered = PROJECTS.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.owner.toLowerCase().includes(q);
  });

  // "What should I work on next?" — picks top suggestion from highest priority active project
  const topProject = PROJECTS
    .filter((p) => p.status === "active")
    .sort((a, b) => {
      const pri = { high: 3, medium: 2, low: 1 };
      return (pri[b.priority] ?? 0) - (pri[a.priority] ?? 0) || a.progress - b.progress;
    })[0];

  return (
    <div className="flex h-full gap-4">
      {/* Project cards */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {/* Search + advisor */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-8 pr-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>
          <button
            onClick={() => setShowAdvisor((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              showAdvisor ? "bg-purple-500/20 text-purple-400" : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sparkles className="size-3.5" />
            What should I work on?
          </button>
        </div>

        {/* Advisor panel */}
        {showAdvisor && topProject && (
          <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">Suggested Focus</span>
            </div>
            <p className="text-xs text-zinc-300">
              <span className="font-medium text-zinc-100">{topProject.name}</span> is your highest-priority active project at {topProject.progress}% completion.
            </p>
            <div className="text-xs text-zinc-400">
              Next action: <span className="text-zinc-200">{topProject.nextActions[0]}</span>
            </div>
            <button
              onClick={() => { setSelected(topProject); setShowAdvisor(false); }}
              className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 mt-1"
            >
              View project details <ArrowRight className="size-3" />
            </button>
          </div>
        )}

        {/* Project list */}
        <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className={`w-full text-left rounded-lg border p-4 transition-colors ${
                selected?.id === p.id
                  ? "border-zinc-600 bg-zinc-800/80"
                  : "border-zinc-700/50 bg-zinc-800/50 hover:border-zinc-600/50"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-zinc-100">{p.name}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_STYLE[p.status]}`}>
                      {p.status}
                    </span>
                    <span className={`text-[10px] ${PRIORITY_STYLE[p.priority]}`}>
                      {p.priority} priority
                    </span>
                  </div>
                </div>
                <div className="flex -space-x-1">
                  {p.agents.map((name) => (
                    <div
                      key={name}
                      className="size-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-zinc-900"
                      style={{ backgroundColor: agentColor(name) }}
                      title={name}
                    >
                      {name[0]}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-2 mb-2">{p.description}</p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
                <span className="text-[10px] text-zinc-500">{p.progress}%</span>
              </div>
              {/* Linked items */}
              <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-600">
                <span className="flex items-center gap-1"><ListTodo className="size-3" />{p.taskCount} tasks</span>
                <span className="flex items-center gap-1"><FileText className="size-3" />{p.docCount} docs</span>
                <span className="flex items-center gap-1"><Brain className="size-3" />{p.memoryCount} memories</span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-xs text-zinc-600 text-center py-8">No projects match your search</div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="w-80 shrink-0 rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-4 space-y-4 overflow-y-auto">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">{selected.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_STYLE[selected.status]}`}>
                {selected.status}
              </span>
              <span className="text-[10px] text-zinc-500">
                Owner: <span style={{ color: agentColor(selected.owner) }}>{selected.owner}</span>
              </span>
            </div>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">{selected.description}</p>

          {/* Linked items */}
          <div className="flex gap-3">
            <div className="flex-1 rounded-lg bg-zinc-900/60 p-2.5 text-center">
              <div className="text-base font-semibold text-zinc-200">{selected.taskCount}</div>
              <div className="text-[9px] text-zinc-500 uppercase tracking-wider">Tasks</div>
            </div>
            <div className="flex-1 rounded-lg bg-zinc-900/60 p-2.5 text-center">
              <div className="text-base font-semibold text-zinc-200">{selected.docCount}</div>
              <div className="text-[9px] text-zinc-500 uppercase tracking-wider">Docs</div>
            </div>
            <div className="flex-1 rounded-lg bg-zinc-900/60 p-2.5 text-center">
              <div className="text-base font-semibold text-zinc-200">{selected.memoryCount}</div>
              <div className="text-[9px] text-zinc-500 uppercase tracking-wider">Memories</div>
            </div>
          </div>

          {/* Target outcomes */}
          <div>
            <h4 className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">Target Outcomes</h4>
            <ul className="space-y-1">
              {selected.outcomes.map((o, i) => (
                <li key={i} className="text-xs text-zinc-300 flex items-start gap-1.5">
                  <span className="text-zinc-600 mt-0.5">&#x2022;</span> {o}
                </li>
              ))}
            </ul>
          </div>

          {/* Recent activity */}
          <div>
            <h4 className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">Recent Activity</h4>
            <p className="text-xs text-zinc-300">{selected.recentActivity}</p>
          </div>

          {/* Suggested next actions */}
          <div>
            <h4 className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Lightbulb className="size-3" /> Suggested Next Actions
            </h4>
            <ol className="space-y-1.5">
              {selected.nextActions.map((a, i) => (
                <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                  <span className="text-blue-400 font-medium shrink-0">{i + 1}.</span>
                  <span>{a}</span>
                  <ArrowRight className="size-3 text-zinc-600 shrink-0 mt-0.5 ml-auto" />
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
