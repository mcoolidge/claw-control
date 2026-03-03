"use client";

import { useState, useEffect, useRef } from "react";
import { AGENTS } from "@/lib/agents";
import { RefreshCw, CheckCircle, XCircle, Clock, Zap } from "lucide-react";

interface ActivityEvent {
  id: string;
  ts: number;
  agent: string;
  type: "cron" | "session" | "tool" | "message";
  label: string;
  status: "ok" | "error" | "running";
  detail?: string;
  durationMs?: number;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  cron:    <Clock className="size-3 shrink-0" />,
  session: <Zap className="size-3 shrink-0" />,
  tool:    <Zap className="size-3 shrink-0" />,
  message: <Zap className="size-3 shrink-0" />,
};

const STATUS_COLORS: Record<string, string> = {
  ok:      "text-emerald-400",
  error:   "text-red-400",
  running: "text-yellow-400",
};

function agentColor(id: string) {
  return AGENTS.find((a) => a.id === id)?.color ?? "#71717a";
}

function agentName(id: string) {
  return AGENTS.find((a) => a.id === id)?.name ?? id;
}

function relativeTime(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(ts).toLocaleDateString();
}

export default function ActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [filter, setFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/activity?limit=50");
      if (!res.ok) return;
      const data = await res.json();
      setEvents(data.events || []);
      // Auto-scroll if new events arrived
      if (data.events.length > prevCountRef.current && scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
      prevCountRef.current = data.events.length;
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter ? events.filter((e) => e.type === filter) : events;
  const types = Array.from(new Set(events.map((e) => e.type)));

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Controls */}
      <div className="flex gap-1 flex-wrap items-center">
        <button
          onClick={() => setFilter(null)}
          className={`text-[10px] px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
            !filter ? "bg-zinc-600 text-zinc-200" : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
          }`}
        >
          all
        </button>
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(filter === t ? null : t)}
            className={`text-[10px] px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
              filter === t ? "bg-zinc-600 text-zinc-200" : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t}
          </button>
        ))}
        <button
          onClick={() => load()}
          className="ml-auto text-zinc-500 hover:text-zinc-300 cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
        {loading && events.length === 0 && (
          <p className="text-xs text-zinc-500 text-center pt-4">Loading…</p>
        )}
        {!loading && filtered.length === 0 && (
          <p className="text-xs text-zinc-600 text-center pt-4">No events</p>
        )}
        {filtered.map((ev) => (
          <div
            key={ev.id}
            className="rounded-md bg-zinc-800/40 border border-zinc-700/30 px-2.5 py-2 space-y-1"
          >
            <div className="flex items-center gap-1.5">
              {/* Agent dot */}
              <div
                className="size-1.5 rounded-full shrink-0"
                style={{ backgroundColor: agentColor(ev.agent) }}
              />
              <span className="text-[10px] font-medium" style={{ color: agentColor(ev.agent) }}>
                {agentName(ev.agent)}
              </span>
              <span className={`ml-auto ${STATUS_COLORS[ev.status]}`}>
                {ev.status === "ok" && <CheckCircle className="size-3" />}
                {ev.status === "error" && <XCircle className="size-3" />}
                {ev.status === "running" && <Clock className="size-3" />}
              </span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-zinc-500 mt-0.5">{TYPE_ICONS[ev.type]}</span>
              <span className="text-xs text-zinc-300 leading-tight flex-1">{ev.label}</span>
            </div>
            {ev.detail && (
              <p className="text-[10px] text-zinc-600 truncate pl-4">{ev.detail}</p>
            )}
            <div className="flex items-center gap-2 pl-4">
              <span className="text-[10px] text-zinc-600">{relativeTime(ev.ts)}</span>
              {ev.durationMs != null && (
                <span className="text-[10px] text-zinc-700">{ev.durationMs}ms</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
