"use client";

import { useEffect, useRef, useState } from "react";
import { AGENTS } from "@/lib/agents";
import { generateMockEvent, type ActivityEvent } from "@/lib/mock-data";

const MAX_EVENTS = 50;

function agentColor(name: string) {
  return AGENTS.find((a) => a.name === name)?.color ?? "#71717a";
}

const TYPE_BADGES: Record<string, string> = {
  task:   "bg-blue-500/15 text-blue-400",
  tool:   "bg-emerald-500/15 text-emerald-400",
  memory: "bg-purple-500/15 text-purple-400",
  system: "bg-zinc-500/15 text-zinc-400",
  error:  "bg-red-500/15 text-red-400",
};

async function fetchAgentEvents(port: number): Promise<ActivityEvent[]> {
  for (const path of ["/api/events", "/api/activity"]) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}${path}`, {
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) return await res.json();
    } catch {
      // try next path
    }
  }
  return [];
}

export default function ActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [filterType, setFilterType] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const seed = Array.from({ length: 6 }, () => generateMockEvent());
    setEvents(seed);

    const interval = setInterval(async () => {
      const allFetched = await Promise.all(
        AGENTS.map((a) => fetchAgentEvents(a.port))
      );
      const real = allFetched.flat();

      if (real.length > 0) {
        setEvents((prev) => [...prev, ...real].slice(-MAX_EVENTS));
      } else {
        setEvents((prev) => [...prev, generateMockEvent()].slice(-MAX_EVENTS));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [events]);

  const displayed = filterType
    ? events.filter((ev) => ev.type === filterType)
    : events;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2 px-1 flex-wrap">
        <span className="text-xs text-zinc-500">
          Live feed
        </span>
        <span className="text-[10px] text-zinc-600">{events.length} events</span>
        {/* Type filters */}
        <div className="flex gap-1 ml-auto">
          {filterType && (
            <button
              onClick={() => setFilterType(null)}
              className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-700 text-zinc-300"
            >
              all
            </button>
          )}
          {Object.keys(TYPE_BADGES).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(filterType === type ? null : type)}
              className={`text-[9px] px-1.5 py-0.5 rounded-full transition-colors ${
                filterType === type ? TYPE_BADGES[type] : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 pr-1 min-h-0">
        {displayed.map((ev, idx) => (
          <div
            key={ev.id}
            className={`flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-800/50 transition-all ${
              idx === displayed.length - 1 ? "animate-in fade-in duration-300" : ""
            }`}
          >
            <div
              className="size-5 shrink-0 rounded-full flex items-center justify-center text-[9px] font-bold text-white mt-0.5"
              style={{ backgroundColor: agentColor(ev.agent) }}
            >
              {ev.agent[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium" style={{ color: agentColor(ev.agent) }}>
                  {ev.agent}
                </span>
                <span className={`text-[9px] px-1 rounded-full ${TYPE_BADGES[ev.type] ?? TYPE_BADGES.system}`}>
                  {ev.type}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate">{ev.description}</p>
            </div>
            <span className="text-[9px] text-zinc-600 shrink-0 mt-0.5">
              {new Date(ev.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
