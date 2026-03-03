"use client";

import { useState } from "react";
import { FileText, Search, X } from "lucide-react";

const TAGS = ["architecture", "api", "setup", "runbook", "reference", "spec", "draft"];

type Doc = {
  id: number;
  title: string;
  type: "spec" | "plan" | "draft" | "note" | "runbook";
  project?: string;
  author: string;
  date: string;
  tags: string[];
  pages: number;
  preview: string;
};

const DOCS: Doc[] = [
  { id: 1,  title: "OpenClaw Gateway API Reference",    type: "spec",    project: "Tool Registry",            author: "Greg",   date: "Mar 1",  tags: ["api", "reference"],           pages: 24, preview: "The OpenClaw Gateway exposes a REST API on each agent's port. Endpoints include /api/events for activity streaming, /api/tools for tool registry, and /api/memory for memory operations. Authentication uses bearer tokens scoped per agent..." },
  { id: 2,  title: "Agent Registration Guide",           type: "runbook", project: undefined,                  author: "Kai",    date: "Feb 26", tags: ["setup", "runbook"],           pages: 8,  preview: "To register a new agent: 1) Create systemd unit file in /etc/systemd/system/ 2) Configure gateway port in agent.conf 3) Add entry to lib/agents.ts 4) Run health check to verify connectivity..." },
  { id: 3,  title: "Memory Service Architecture",        type: "spec",    project: "Memory Service v2",        author: "Apollo", date: "Feb 24", tags: ["architecture"],               pages: 15, preview: "The memory service uses a two-tier architecture: short-term memories are stored in SQLite with full-text search, while long-term memories are embedded and stored in Qdrant. A nightly consolidation job merges and deduplicates..." },
  { id: 4,  title: "Tool Registry Specification",        type: "spec",    project: "Tool Registry",            author: "Kai",    date: "Feb 28", tags: ["api", "architecture", "spec"], pages: 12, preview: "Tools are registered via POST /api/tools with a JSON schema describing inputs, outputs, and permissions. Each tool has a unique ID, version, and owning agent. The registry supports discovery via GET /api/tools?tag=..." },
  { id: 5,  title: "Deployment Runbook",                 type: "runbook", project: undefined,                  author: "Greg",   date: "Mar 2",  tags: ["runbook", "setup"],           pages: 6,  preview: "Deployment checklist: 1) Pull latest from main 2) Run npm ci && npm run build 3) Restart systemd units 4) Verify health checks 5) Run smoke tests 6) Monitor activity feed for errors..." },
  { id: 6,  title: "Prompt Engineering Guidelines",      type: "note",    project: undefined,                  author: "Athena", date: "Feb 17", tags: ["reference"],                  pages: 18, preview: "Core principles: Be specific about output format. Use XML tags for structure. Provide examples for complex tasks. Keep system prompts under 2000 tokens when possible. Use prompt caching for repeated instructions..." },
  { id: 7,  title: "Multi-Agent Orchestration Patterns", type: "spec",    project: "Agent Orchestration Layer", author: "Apollo", date: "Feb 27", tags: ["architecture", "reference"],  pages: 20, preview: "Three patterns evaluated: 1) Supervisor — single coordinator dispatches tasks. 2) Peer-to-peer — agents communicate directly. 3) Blackboard — shared state with reactive agents. Recommendation: Start with supervisor pattern..." },
  { id: 8,  title: "Monitoring & Alerting Setup",        type: "runbook", project: undefined,                  author: "Greg",   date: "Feb 25", tags: ["setup", "runbook"],           pages: 10, preview: "Prometheus scrapes /metrics on each agent port every 15s. Alert rules: agent_down > 3 consecutive failures, error_rate > 5% over 5min, memory_usage > 90%. Grafana dashboards at :3000/d/agents..." },
  { id: 9,  title: "Weekly Newsletter — Issue #3",       type: "draft",   project: undefined,                  author: "Athena", date: "Feb 28", tags: ["draft"],                      pages: 3,  preview: "This week: Memory Service v2 launched with Qdrant integration. Claw Control dashboard scaffold deployed. Tool registry now validates outputs with Zod schemas. Coming next week: orchestration layer prototype..." },
  { id: 10, title: "Dashboard UI/UX Plan",               type: "plan",    project: "Claw Control Dashboard",   author: "Greg",   date: "Mar 2",  tags: ["spec", "architecture"],      pages: 5,  preview: "Layout: dark theme (zinc-950), icon sidebar, top bar with agent status. Panels: TaskBoard (kanban), CalendarView, ProjectList, MemoryJournal, DocLibrary, TeamOrgChart, OfficeView, ActivityFeed. Plugin architecture..." },
];

const TYPE_STYLE: Record<string, string> = {
  spec:    "bg-blue-500/15 text-blue-400",
  plan:    "bg-purple-500/15 text-purple-400",
  draft:   "bg-orange-500/15 text-orange-400",
  note:    "bg-zinc-500/15 text-zinc-400",
  runbook: "bg-emerald-500/15 text-emerald-400",
};

const TAG_STYLE: Record<string, string> = {
  architecture: "bg-purple-500/15 text-purple-400",
  api:          "bg-blue-500/15 text-blue-400",
  setup:        "bg-emerald-500/15 text-emerald-400",
  runbook:      "bg-orange-500/15 text-orange-400",
  reference:    "bg-zinc-500/15 text-zinc-400",
  spec:         "bg-cyan-500/15 text-cyan-400",
  draft:        "bg-yellow-500/15 text-yellow-400",
};

export default function DocLibrary() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);

  const filtered = DOCS.filter((d) => {
    if (activeTag && !d.tags.includes(activeTag)) return false;
    if (search && !d.title.toLowerCase().includes(search.toLowerCase()) && !d.preview.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex h-full gap-4">
      {/* Left: doc list */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Search + tag filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search docs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-8 pr-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTag(null)}
            className={`px-2 py-0.5 rounded-lg text-[10px] ${!activeTag ? "bg-zinc-700 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            All ({DOCS.length})
          </button>
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-2 py-0.5 rounded-lg text-[10px] ${activeTag === tag ? "bg-zinc-700 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Doc list */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {filtered.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className={`w-full text-left flex items-center gap-3 rounded-lg border p-3 transition-colors group ${
                selectedDoc?.id === doc.id
                  ? "border-zinc-600 bg-zinc-800/80"
                  : "border-zinc-700/50 bg-zinc-800/50 hover:border-zinc-600/50"
              }`}
            >
              <div className="size-9 rounded-lg bg-zinc-700/50 flex items-center justify-center shrink-0">
                <FileText className="size-4 text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-100 truncate">{doc.title}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[9px] px-1.5 rounded-full ${TYPE_STYLE[doc.type]}`}>{doc.type}</span>
                  {doc.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className={`text-[9px] px-1 rounded-full ${TAG_STYLE[tag]}`}>{tag}</span>
                  ))}
                  <span className="text-[10px] text-zinc-600">{doc.pages}p</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] text-zinc-500">{doc.author}</div>
                <div className="text-[10px] text-zinc-600">{doc.date}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: document viewer */}
      {selectedDoc && (
        <div className="w-96 shrink-0 rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-4 overflow-y-auto space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">{selectedDoc.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[9px] px-1.5 rounded-full ${TYPE_STYLE[selectedDoc.type]}`}>{selectedDoc.type}</span>
                <span className="text-[10px] text-zinc-500">{selectedDoc.author} · {selectedDoc.date}</span>
              </div>
            </div>
            <button onClick={() => setSelectedDoc(null)} className="p-1 hover:bg-zinc-700 rounded text-zinc-400">
              <X className="size-4" />
            </button>
          </div>

          {selectedDoc.project && (
            <div className="text-xs text-zinc-500">
              Project: <span className="text-zinc-400">{selectedDoc.project}</span>
            </div>
          )}

          <div className="flex gap-1.5 flex-wrap">
            {selectedDoc.tags.map((tag) => (
              <span key={tag} className={`text-[9px] px-1.5 py-0.5 rounded-full ${TAG_STYLE[tag]}`}>{tag}</span>
            ))}
          </div>

          {/* Document content preview */}
          <div className="border-t border-zinc-700/50 pt-4">
            <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">{selectedDoc.preview}</p>
            <div className="mt-4 pt-3 border-t border-zinc-700/50 text-[10px] text-zinc-600">
              {selectedDoc.pages} pages · Last updated {selectedDoc.date}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
