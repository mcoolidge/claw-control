"use client";

import { useState } from "react";
import { AGENTS } from "@/lib/agents";
import { Search, Clock, Database } from "lucide-react";

function agentColor(name: string) {
  return AGENTS.find((a) => a.name === name)?.color ?? "#71717a";
}

type Memory = {
  id: number;
  agent: string;
  type: "context" | "fact" | "procedure" | "episode";
  source: "chat" | "tool" | "document" | "event";
  text: string;
  ts: string;
  day: string;
  store: "short-term" | "long-term";
  project?: string;
};

const MEMORIES: Memory[] = [
  { id: 1,  agent: "Greg",   type: "context",   source: "chat",     text: "User prefers Tailwind v4 with no config file — use @theme inline directives.",                    ts: "14:32", day: "Today",      store: "short-term", project: "Claw Control Dashboard" },
  { id: 2,  agent: "Apollo", type: "fact",       source: "tool",     text: "Qdrant collection 'codebase' uses 1536-dim embeddings from text-embedding-3-small.",                ts: "14:18", day: "Today",      store: "long-term",  project: "Memory Service v2" },
  { id: 3,  agent: "Kai",    type: "procedure",  source: "document", text: "To restart an agent: stop systemd unit, clear /tmp/locks, then start again.",                      ts: "13:45", day: "Today",      store: "long-term" },
  { id: 4,  agent: "Athena", type: "context",    source: "chat",     text: "Meeting notes are in Google Drive folder 'OpenClaw/Meetings' — use calendar API.",                 ts: "12:10", day: "Today",      store: "short-term" },
  { id: 5,  agent: "Greg",   type: "fact",       source: "tool",     text: "Next.js 16 uses Turbopack by default. No webpack config needed.",                                   ts: "11:30", day: "Today",      store: "long-term",  project: "Claw Control Dashboard" },
  { id: 6,  agent: "Apollo", type: "episode",    source: "event",    text: "Memory consolidation failed at 03:00 due to Qdrant timeout — increased to 30s.",                   ts: "09:15", day: "Today",      store: "short-term", project: "Memory Service v2" },
  { id: 7,  agent: "Kai",    type: "procedure",  source: "chat",     text: "Prompt caching: hash system prompt, check Redis, reuse if TTL < 1hr.",                              ts: "08:50", day: "Today",      store: "long-term",  project: "Tool Registry" },
  { id: 8,  agent: "Athena", type: "fact",       source: "document", text: "Team standup happens at 09:00 weekdays. Summary goes to #general.",                                 ts: "17:30", day: "Yesterday",  store: "long-term" },
  { id: 9,  agent: "Greg",   type: "episode",    source: "event",    text: "Built Mission Control scaffold — dark theme, agent status cards, basic layout.",                    ts: "16:45", day: "Yesterday",  store: "long-term",  project: "Claw Control Dashboard" },
  { id: 10, agent: "Kai",    type: "context",    source: "chat",     text: "Agent orchestration uses supervisor pattern with Greg as coordinator.",                              ts: "15:20", day: "Yesterday",  store: "long-term",  project: "Agent Orchestration Layer" },
  { id: 11, agent: "Apollo", type: "fact",       source: "tool",     text: "LM Studio embedding endpoint averages 45ms latency for batch-32 requests.",                         ts: "14:00", day: "Yesterday",  store: "long-term",  project: "Memory Service v2" },
  { id: 12, agent: "Greg",   type: "episode",    source: "event",    text: "Deployed memory service with Qdrant + Mem0 integration. Mnemosyne skill operational.",              ts: "11:30", day: "2 days ago", store: "long-term",  project: "Memory Service v2" },
  { id: 13, agent: "Athena", type: "procedure",  source: "document", text: "Newsletter format: 3 sections — highlights, deep dive, upcoming. Max 800 words.",                  ts: "10:00", day: "2 days ago", store: "long-term" },
  { id: 14, agent: "Kai",    type: "fact",       source: "tool",     text: "Zod v3.23 supports .pipe() for chained transformations — use for tool output schemas.",              ts: "09:15", day: "2 days ago", store: "long-term",  project: "Tool Registry" },
];

const TYPE_STYLE: Record<string, string> = {
  context:   "bg-blue-500/15 text-blue-400",
  fact:      "bg-emerald-500/15 text-emerald-400",
  procedure: "bg-purple-500/15 text-purple-400",
  episode:   "bg-orange-500/15 text-orange-400",
};

const SOURCE_STYLE: Record<string, string> = {
  chat:     "text-blue-400",
  tool:     "text-emerald-400",
  document: "text-purple-400",
  event:    "text-orange-400",
};

export default function MemoryJournal() {
  const [query, setQuery] = useState("");
  const [filterAgent, setFilterAgent] = useState<string | null>(null);
  const [filterStore, setFilterStore] = useState<"all" | "short-term" | "long-term">("all");

  const filtered = MEMORIES.filter((m) => {
    if (filterAgent && m.agent !== filterAgent) return false;
    if (filterStore !== "all" && m.store !== filterStore) return false;
    if (query && !m.text.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  // Group by day
  const days = [...new Set(filtered.map((m) => m.day))];
  const grouped = days.map((day) => ({
    day,
    memories: filtered.filter((m) => m.day === day),
  }));

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search memories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-8 pr-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
          />
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setFilterAgent(null)}
            className={`px-2 py-1 rounded text-xs ${!filterAgent ? "bg-zinc-700 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            All
          </button>
          {AGENTS.map((a) => (
            <button
              key={a.name}
              onClick={() => setFilterAgent(a.name)}
              className={`px-2 py-1 rounded text-xs ${filterAgent === a.name ? "bg-zinc-700 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              {a.name}
            </button>
          ))}
        </div>
        <div className="flex gap-1 border-l border-zinc-700 pl-3">
          <button
            onClick={() => setFilterStore("all")}
            className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${filterStore === "all" ? "bg-zinc-700 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStore("short-term")}
            className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${filterStore === "short-term" ? "bg-zinc-700 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            <Clock className="size-3" /> Recent
          </button>
          <button
            onClick={() => setFilterStore("long-term")}
            className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${filterStore === "long-term" ? "bg-zinc-700 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            <Database className="size-3" /> Long-term
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto space-y-5 min-h-0">
        {grouped.map(({ day, memories }) => (
          <div key={day}>
            <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-sm py-1 mb-2">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">{day}</span>
              <span className="text-[10px] text-zinc-600 ml-2">{memories.length} memories</span>
            </div>
            <div className="space-y-2 pl-3 border-l border-zinc-800">
              {memories.map((m) => (
                <div key={m.id} className="relative rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-3 space-y-1.5">
                  {/* Timeline dot */}
                  <div className="absolute -left-[19px] top-4 size-2.5 rounded-full bg-zinc-700 ring-2 ring-zinc-950" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <div
                      className="size-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ backgroundColor: agentColor(m.agent) }}
                    >
                      {m.agent[0]}
                    </div>
                    <span className="text-xs font-medium" style={{ color: agentColor(m.agent) }}>
                      {m.agent}
                    </span>
                    <span className={`text-[9px] px-1.5 rounded-full ${TYPE_STYLE[m.type]}`}>{m.type}</span>
                    <span className={`text-[9px] ${SOURCE_STYLE[m.source]}`}>via {m.source}</span>
                    {m.store === "short-term" && (
                      <span className="text-[9px] px-1.5 rounded-full bg-yellow-500/10 text-yellow-400/70">short-term</span>
                    )}
                    <span className="text-[10px] text-zinc-600 ml-auto">{m.ts}</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{m.text}</p>
                  {m.project && (
                    <span className="text-[10px] text-zinc-500">
                      Project: <span className="text-zinc-400">{m.project}</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {grouped.length === 0 && (
          <div className="text-xs text-zinc-600 text-center py-8">No matching memories</div>
        )}
      </div>
    </div>
  );
}
