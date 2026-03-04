"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Search, RefreshCw, ExternalLink } from "lucide-react";

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

const STATE_STYLE: Record<string, string> = {
  started:    "bg-emerald-500/15 text-emerald-400",
  planned:    "bg-blue-500/15 text-blue-400",
  paused:     "bg-yellow-500/15 text-yellow-400",
  completed:  "bg-zinc-500/15 text-zinc-400",
  cancelled:  "bg-red-500/15 text-red-400",
};

function stateLabel(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = projects.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  });

  return (
    <div className="flex h-full gap-4">
      {/* Project list */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div className="flex items-center gap-2">
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
            onClick={() => load()}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {error && <div className="text-xs text-red-400 px-1">Failed to load: {error}</div>}

        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {loading && (
            <div className="text-xs text-zinc-600 text-center py-8">Loading from Linear…</div>
          )}
          {!loading && filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className={`w-full text-left rounded-lg border p-3 transition-colors ${
                selected?.id === p.id
                  ? "border-zinc-600 bg-zinc-800/80"
                  : "border-zinc-700/50 bg-zinc-800/40 hover:border-zinc-600/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-sm font-medium text-zinc-100 leading-tight">{p.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${STATE_STYLE[p.state] ?? STATE_STYLE.started}`}>
                  {stateLabel(p.state)}
                </span>
              </div>
              {p.description && (
                <p className="text-xs text-zinc-500 line-clamp-1 mb-2">{p.description}</p>
              )}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
                <span className="text-[10px] text-zinc-500 shrink-0">{p.progress}%</span>
                <span className="text-[10px] text-zinc-600 shrink-0">{p.doneCount}/{p.issueCount} done</span>
              </div>
            </button>
          ))}
          {!loading && filtered.length === 0 && !error && (
            <div className="text-xs text-zinc-600 text-center py-8">No projects found</div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="w-72 shrink-0 rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-4 space-y-4 overflow-y-auto">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-zinc-100 leading-tight">{selected.name}</h3>
            {selected.url && (
              <a
                href={selected.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 hover:text-zinc-400 shrink-0 mt-0.5"
                title="Open in Linear"
              >
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>

          {selected.description && (
            <p className="text-xs text-zinc-400 leading-relaxed">{selected.description}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Total", value: selected.issueCount },
              { label: "Done", value: selected.doneCount },
              { label: "Active", value: selected.inProgressCount },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg bg-zinc-900/60 p-2 text-center">
                <div className="text-base font-semibold text-zinc-200">{value}</div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
              <span>Progress</span>
              <span>{selected.progress}%</span>
            </div>
            <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${selected.progress}%` }} />
            </div>
          </div>

          {/* Assignees */}
          {selected.assignees.length > 0 && (
            <div>
              <h4 className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">Team</h4>
              <div className="flex flex-wrap gap-1.5">
                {selected.assignees.map((a) => (
                  <span key={a} className="text-[10px] bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Recent issues */}
          {selected.recentTitles.length > 0 && (
            <div>
              <h4 className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">Recent Issues</h4>
              <ul className="space-y-1">
                {selected.recentTitles.map((t, i) => (
                  <li key={i} className="text-xs text-zinc-400 flex items-start gap-1.5">
                    <ArrowRight className="size-3 text-zinc-600 shrink-0 mt-0.5" />
                    <span className="leading-tight">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
