"use client";

import { useState, useEffect } from "react";
import { PANELS } from "@/lib/panels";
import { AGENTS, checkAgentHealth } from "@/lib/agents";
import ActivityFeed from "@/components/panels/activity-feed";
import TaskBoard from "@/components/panels/task-board";
import CalendarView from "@/components/panels/calendar-view";
import ProjectList from "@/components/panels/project-list";
import MemoryJournal from "@/components/panels/memory-journal";
import DocLibrary from "@/components/panels/doc-library";
import TeamOrgChart from "@/components/panels/team-org-chart";
import OfficeView from "@/components/panels/office-view";

// ── Panel component registry ────────────────────────────────────────
// To add a new panel: 1) add entry to lib/panels.ts, 2) create component
// in components/panels/{id}.tsx, 3) import + register it here.
const PANEL_COMPONENTS: Record<string, React.ComponentType> = {
  "task-board":     TaskBoard,
  "calendar-view":  CalendarView,
  "project-list":   ProjectList,
  "memory-journal": MemoryJournal,
  "doc-library":    DocLibrary,
  "team-org-chart": TeamOrgChart,
  "office-view":    OfficeView,
  "activity-feed":  ActivityFeed,
};

export default function MissionControl() {
  const [activePanel, setActivePanel] = useState("task-board");
  const [agentUp, setAgentUp] = useState<Record<string, boolean>>({});
  const [feedOpen, setFeedOpen] = useState(true);

  useEffect(() => {
    async function poll() {
      const results: Record<string, boolean> = {};
      await Promise.all(
        AGENTS.map(async (a) => {
          results[a.name] = await checkAgentHealth(a.port);
        })
      );
      setAgentUp(results);
    }
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, []);

  const ActiveComponent = PANEL_COMPONENTS[activePanel];
  const activeMeta = PANELS.find((p) => p.id === activePanel);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      {/* ── Sidebar ── */}
      <aside className="w-14 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-4 gap-1 shrink-0">
        <div className="size-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300 mb-4">
          MC
        </div>
        {PANELS.map((panel) => {
          const Icon = panel.icon;
          const isActive = panel.id === activePanel;
          return (
            <button
              key={panel.id}
              onClick={() => setActivePanel(panel.id)}
              title={panel.label}
              className={`size-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                isActive
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
              }`}
            >
              <Icon className="size-5" />
            </button>
          );
        })}
      </aside>

      {/* ── Main + Feed ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-12 border-b border-zinc-800 flex items-center justify-between px-5 bg-zinc-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold tracking-tight">Mission Control</h1>
            {activeMeta && (
              <span className="text-xs text-zinc-500">/ {activeMeta.label}</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {AGENTS.map((a) => (
              <div key={a.name} className="flex items-center gap-1.5" title={a.name}>
                <div
                  className="size-2.5 rounded-full"
                  style={{
                    backgroundColor: a.color,
                    opacity: agentUp[a.name] ? 1 : 0.3,
                  }}
                />
                <span className="text-xs text-zinc-500">{a.name}</span>
              </div>
            ))}
            <button
              onClick={() => setFeedOpen((v) => !v)}
              className={`text-xs px-2 py-1 rounded cursor-pointer ${feedOpen ? "bg-zinc-800 text-zinc-300" : "text-zinc-500 hover:text-zinc-300"}`}
              title="Toggle activity feed"
            >
              Feed
            </button>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 flex min-h-0">
          <main className="flex-1 overflow-auto p-5 min-w-0">
            {ActiveComponent ? <ActiveComponent /> : null}
          </main>

          {feedOpen && (
            <aside className="w-72 border-l border-zinc-800 bg-zinc-900/30 p-3 shrink-0 overflow-hidden flex flex-col">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Activity Feed
              </div>
              <div className="flex-1 min-h-0">
                <ActivityFeed />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
