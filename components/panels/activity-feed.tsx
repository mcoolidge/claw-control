"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";

interface ActivityEvent {
  id: string;
  agent: string;
  timestamp: string;
  type: "message" | "tool" | "error" | "system";
  role: string;
  summary: string;
}

const AGENT_COLORS: Record<string, string> = {
  main:    "#f97316",
  athena:  "#a78bfa",
  ada:     "#34d399",
  suzieqa: "#60a5fa",
};

const TYPE_BADGES: Record<string, string> = {
  tool:    "bg-emerald-500/15 text-emerald-400",
  message: "bg-blue-500/15 text-blue-400",
  error:   "bg-red-500/15 text-red-400",
  system:  "bg-zinc-500/15 text-zinc-400",
};

function relativeTime(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

export default function ActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/activity?limit=50");
      const data = await res.json();
      setEvents(data.events || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    const id = setInterval(() => {
      fetchEvents();
      setTick((t) => t + 1);
    }, 5000);
    return () => clearInterval(id);
  }, [fetchEvents]);

  // Tick forces relative time to update
  void tick;

  const filtered = filterType ? events.filter((e) => e.type === filterType) : events;

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Filter bar */}
      <div className="flex gap-1 flex-wrap">
        {["tool", "message"].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(filterType === t ? null : t)}
            className={`text-[10px] px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
              filterType === t ? TYPE_BADGES[t] : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t}
          </button>
        ))}
        <button
          onClick={fetchEvents}
          className="ml-auto text-zinc-500 hover:text-zinc-300 cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className="size-3" />
        </button>
      </div>

      {/* Events */}
      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
        {loading && (
          <p className="text-xs text-zinc-500 text-center pt-4">Loading…</p>
        )}
        {!loading && filtered.length === 0 && (
          <p className="text-xs text-zinc-500 text-center pt-4">No activity yet</p>
        )}
        {filtered.map((ev) => (
          <div
            key={ev.id}
            className="rounded-md bg-zinc-800/50 px-2.5 py-2 text-xs border border-zinc-700/30"
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <div className="flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: AGENT_COLORS[ev.agent] ?? "#71717a" }}
                />
                <span className="font-medium text-zinc-300">{ev.agent}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${TYPE_BADGES[ev.type] ?? TYPE_BADGES.system}`}>
                  {ev.role === "toolResult" ? "result" : ev.type}
                </span>
              </div>
              <span className="text-zinc-600 text-[10px] shrink-0">{relativeTime(ev.timestamp)}</span>
            </div>
            <p className="text-zinc-400 leading-snug truncate">{ev.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
