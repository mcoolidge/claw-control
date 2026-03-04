"use client";

import { useEffect, useState } from "react";
import { AGENTS, checkAgentHealth } from "@/lib/agents";

interface ActivityEvent {
  id: string;
  ts: number;
  agent: string;
  type: string;
  label: string;
  status: string;
  detail?: string;
}

const DESKS: Record<string, { x: number; y: number; room: string }> = {
  Greg:   { x: 18, y: 22, room: "Engineering Lab" },
  Apollo: { x: 62, y: 22, room: "Data Room" },
  Kai:    { x: 18, y: 62, room: "Review Corner" },
  Athena: { x: 62, y: 62, room: "Ops Center" },
};

function relativeTime(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(ts).toLocaleDateString();
}

export default function OfficeView() {
  const [online, setOnline] = useState<Record<string, boolean>>({});
  const [hovered, setHovered] = useState<string | null>(null);
  // Map agentId → recent events
  const [agentActivity, setAgentActivity] = useState<Record<string, ActivityEvent[]>>({});

  useEffect(() => {
    async function poll() {
      // Health check
      const health: Record<string, boolean> = {};
      await Promise.all(
        AGENTS.map(async (a) => {
          health[a.name] = await checkAgentHealth(a.id);
        })
      );
      setOnline(health);

      // Activity — pull recent events and group by agent id
      try {
        const res = await fetch("/api/activity?limit=100");
        if (res.ok) {
          const data = await res.json();
          const grouped: Record<string, ActivityEvent[]> = {};
          for (const ev of data.events || []) {
            if (!grouped[ev.agent]) grouped[ev.agent] = [];
            grouped[ev.agent].push(ev);
          }
          // Keep only 3 most recent per agent
          for (const k in grouped) {
            grouped[k] = grouped[k].slice(0, 3);
          }
          setAgentActivity(grouped);
        }
      } catch {}
    }
    poll();
    const id = setInterval(poll, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-zinc-500">
          OpenClaw HQ — hover over agents to see what they&apos;re working on
        </div>
        <div className="flex items-center gap-3">
          {AGENTS.map((a) => (
            <div key={a.name} className="flex items-center gap-1.5 text-[10px]">
              <div className={`size-2 rounded-full ${online[a.name] ? "bg-emerald-400" : "bg-zinc-600"}`} />
              <span className="text-zinc-500">{a.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floor plan */}
      <div className="flex-1 relative rounded-xl border border-zinc-700/50 bg-zinc-900/80 overflow-hidden min-h-[420px]">
        {/* Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]">
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Center corridor */}
        <div className="absolute top-[45%] left-[10%] w-[80%] h-[10%] border-b border-t border-dashed border-zinc-700/30" />

        {/* Room boundaries + labels */}
        {Object.entries(DESKS).map(([name, desk]) => (
          <div key={`room-${name}`}>
            <div
              className="absolute border border-dashed border-zinc-700/40 rounded-lg"
              style={{ left: `${desk.x - 12}%`, top: `${desk.y - 10}%`, width: "30%", height: "32%" }}
            />
            <div
              className="absolute text-[9px] text-zinc-600 uppercase tracking-[0.15em] font-medium"
              style={{ left: `${desk.x - 10}%`, top: `${desk.y - 8}%` }}
            >
              {desk.room}
            </div>
          </div>
        ))}

        {/* Desks */}
        {Object.entries(DESKS).map(([name, desk]) => (
          <div
            key={`desk-${name}`}
            className="absolute w-12 h-6 rounded bg-zinc-800 border border-zinc-700/50"
            style={{ left: `${desk.x + 4}%`, top: `${desk.y + 4}%` }}
          />
        ))}

        {/* Agent avatars */}
        {AGENTS.map((agent) => {
          const desk = DESKS[agent.name];
          const isOnline = online[agent.name];
          const isHovered = hovered === agent.name;
          const events = agentActivity[agent.id] || agentActivity["main"] || [];
          const latest = events[0];

          return (
            <div
              key={agent.name}
              className="absolute flex flex-col items-center transition-all duration-500 cursor-pointer"
              style={{ left: `${desk.x}%`, top: `${desk.y}%` }}
              onMouseEnter={() => setHovered(agent.name)}
              onMouseLeave={() => setHovered(null)}
            >
              {isOnline && (
                <div
                  className="absolute size-14 rounded-full animate-ping opacity-15"
                  style={{ backgroundColor: agent.color }}
                />
              )}

              <div
                className="relative size-11 rounded-full flex items-center justify-center text-base font-bold text-white shadow-lg z-10 transition-transform"
                style={{
                  backgroundColor: agent.color,
                  opacity: isOnline ? 1 : 0.35,
                  transform: isHovered ? "scale(1.15)" : "scale(1)",
                }}
              >
                {agent.name[0]}
                <div
                  className={`absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-zinc-900 ${
                    isOnline ? "bg-emerald-400" : "bg-zinc-600"
                  }`}
                />
              </div>

              <div className="text-center mt-1.5 z-10">
                <div className="text-xs font-medium text-zinc-200">{agent.name}</div>
                <div className="text-[10px] text-zinc-500 max-w-[100px] truncate">
                  {latest ? latest.label : isOnline ? "Active" : "Offline"}
                </div>
              </div>

              {/* Hover tooltip */}
              {isHovered && (
                <div className="absolute top-full mt-3 z-20 w-56 rounded-lg border border-zinc-700 bg-zinc-800 p-3 shadow-xl space-y-2">
                  <div className="text-xs font-medium text-zinc-100 flex items-center gap-1.5">
                    <div className="size-3 rounded-full" style={{ backgroundColor: agent.color }} />
                    {agent.name}
                    <span className="text-[10px] text-zinc-500 ml-auto">{isOnline ? "Online" : "Offline"}</span>
                  </div>
                  {events.length > 0 ? (
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Recent Activity</span>
                      {events.map((ev) => (
                        <div key={ev.id} className="text-[10px] text-zinc-400 flex items-start gap-1">
                          <span className="text-zinc-600 shrink-0">•</span>
                          <span className="flex-1 leading-tight">{ev.label}</span>
                          <span className="text-zinc-600 shrink-0 ml-1">{relativeTime(ev.ts)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[10px] text-zinc-600">No recent activity</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
