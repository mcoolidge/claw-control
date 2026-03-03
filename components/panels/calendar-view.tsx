"use client";

import { useState } from "react";
import { AGENTS } from "@/lib/agents";
import { Clock, Pause, Play, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

function agentColor(name: string) {
  return AGENTS.find((a) => a.name === name)?.color ?? "#71717a";
}

type Job = {
  id: number;
  name: string;
  description: string;
  cron: string;
  schedule: string;
  agent: string;
  status: "active" | "paused";
  lastRun: string;
  nextRun: string;
  history: { time: string; status: "ok" | "fail" | "skip" }[];
};

const JOBS: Job[] = [
  {
    id: 1, name: "Memory consolidation", description: "Merge short-term memories into long-term Qdrant storage, deduplicate, and update embeddings.",
    cron: "0 3 * * *", schedule: "Daily at 03:00", agent: "Apollo", status: "active",
    lastRun: "Today 03:00", nextRun: "Tomorrow 03:00",
    history: [{ time: "03:00", status: "ok" }, { time: "03:00 -1d", status: "ok" }, { time: "03:00 -2d", status: "fail" }],
  },
  {
    id: 2, name: "Health check sweep", description: "Ping all agent gateway ports and log response times. Alert on consecutive failures.",
    cron: "*/5 * * * *", schedule: "Every 5 minutes", agent: "Greg", status: "active",
    lastRun: "2 min ago", nextRun: "In 3 min",
    history: [{ time: "now-2m", status: "ok" }, { time: "now-7m", status: "ok" }, { time: "now-12m", status: "ok" }],
  },
  {
    id: 3, name: "Knowledge re-index", description: "Re-crawl codebase and docs, regenerate embeddings, update Qdrant 'codebase' collection.",
    cron: "0 */6 * * *", schedule: "Every 6 hours", agent: "Kai", status: "active",
    lastRun: "Today 12:00", nextRun: "Today 18:00",
    history: [{ time: "12:00", status: "ok" }, { time: "06:00", status: "ok" }, { time: "00:00", status: "skip" }],
  },
  {
    id: 4, name: "Daily standup summary", description: "Collect activity from all agents, summarize key achievements, blockers, and plan for the day.",
    cron: "0 9 * * 1-5", schedule: "Weekdays at 09:00", agent: "Athena", status: "active",
    lastRun: "Today 09:00", nextRun: "Tomorrow 09:00",
    history: [{ time: "09:00", status: "ok" }, { time: "09:00 -1d", status: "ok" }, { time: "09:00 -2d", status: "ok" }],
  },
  {
    id: 5, name: "Log rotation & cleanup", description: "Archive logs older than 7 days, compress, and upload to cold storage.",
    cron: "0 0 * * 0", schedule: "Sundays at midnight", agent: "Greg", status: "active",
    lastRun: "Last Sunday", nextRun: "Sunday 00:00",
    history: [{ time: "Sun", status: "ok" }, { time: "Sun -1w", status: "ok" }, { time: "Sun -2w", status: "ok" }],
  },
  {
    id: 6, name: "Model perf benchmark", description: "Run standard benchmark suite against all configured models, log latency and quality metrics.",
    cron: "0 2 * * 6", schedule: "Saturdays at 02:00", agent: "Kai", status: "paused",
    lastRun: "2 weeks ago", nextRun: "Paused",
    history: [{ time: "Sat -2w", status: "ok" }, { time: "Sat -3w", status: "fail" }, { time: "Sat -4w", status: "ok" }],
  },
  {
    id: 7, name: "Newsletter draft compilation", description: "Gather highlights from completed tasks and notable events, draft weekly newsletter.",
    cron: "0 16 * * 5", schedule: "Fridays at 16:00", agent: "Athena", status: "active",
    lastRun: "Last Friday", nextRun: "Friday 16:00",
    history: [{ time: "Fri", status: "ok" }, { time: "Fri -1w", status: "ok" }, { time: "Fri -2w", status: "skip" }],
  },
];

const STATUS_DOT: Record<string, string> = { ok: "bg-emerald-400", fail: "bg-red-400", skip: "bg-zinc-500" };

export default function CalendarView() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [view, setView] = useState<"week" | "month">("week");

  const DAYS = view === "week"
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : Array.from({ length: 31 }, (_, i) => `${i + 1}`);

  return (
    <div className="flex h-full gap-4">
      {/* Left: job list + calendar */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* View toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setView("week")} className={`text-xs px-2.5 py-1 rounded-lg ${view === "week" ? "bg-zinc-800 text-zinc-200" : "text-zinc-500"}`}>Week</button>
            <button onClick={() => setView("month")} className={`text-xs px-2.5 py-1 rounded-lg ${view === "month" ? "bg-zinc-800 text-zinc-200" : "text-zinc-500"}`}>Month</button>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <button className="p-1 hover:bg-zinc-800 rounded"><ChevronLeft className="size-4" /></button>
            <span className="text-xs font-medium">March 2026</span>
            <button className="p-1 hover:bg-zinc-800 rounded"><ChevronRight className="size-4" /></button>
          </div>
        </div>

        {/* Calendar grid */}
        <div className={`grid gap-px bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700/50 ${view === "week" ? "grid-cols-7" : "grid-cols-7"}`}>
          {(view === "week" ? DAYS : ["M", "T", "W", "T", "F", "S", "S"]).map((d, i) => (
            <div key={`h-${i}`} className="bg-zinc-900 px-2 py-1.5 text-[10px] text-zinc-400 text-center font-medium">
              {d}
            </div>
          ))}
          {(view === "week" ? Array.from({ length: 7 }) : Array.from({ length: 35 })).map((_, i) => {
            const dayNum = view === "month" ? i - 1 : undefined; // offset for March starting on Sun
            const isToday = view === "week" ? i === 1 : i === 3; // Tue = today for mock
            return (
              <div
                key={`cell-${i}`}
                className={`bg-zinc-900/50 p-1.5 min-h-[60px] ${isToday ? "ring-1 ring-blue-500/30" : ""} hover:bg-zinc-800/50 transition-colors`}
              >
                {view === "month" && (
                  <span className={`text-[10px] ${isToday ? "text-blue-400" : "text-zinc-600"}`}>
                    {dayNum !== undefined && dayNum >= 0 && dayNum < 31 ? dayNum + 1 : ""}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Job list */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Scheduled Jobs ({JOBS.filter((j) => j.status === "active").length} active)
          </h3>
          {JOBS.map((job) => (
            <button
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className={`w-full text-left rounded-lg border p-3 transition-colors ${
                selectedJob?.id === job.id
                  ? "border-zinc-600 bg-zinc-800/80"
                  : "border-zinc-700/50 bg-zinc-800/50 hover:border-zinc-600/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5 text-zinc-500" />
                  <span className="text-sm font-medium text-zinc-100">{job.name}</span>
                  {job.status === "paused" && (
                    <span className="text-[9px] px-1.5 rounded-full bg-yellow-500/15 text-yellow-400">paused</span>
                  )}
                </div>
                <div
                  className="size-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ backgroundColor: agentColor(job.agent) }}
                >
                  {job.agent[0]}
                </div>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-zinc-500">
                <code className="bg-zinc-900 px-1.5 py-0.5 rounded">{job.cron}</code>
                <span>{job.schedule}</span>
                <span className="ml-auto">Next: {job.nextRun}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: job detail */}
      {selectedJob && (
        <div className="w-80 shrink-0 rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-4 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-100">{selectedJob.name}</h3>
            <div className="flex gap-1">
              <button className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400" title={selectedJob.status === "active" ? "Pause" : "Resume"}>
                {selectedJob.status === "active" ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              </button>
              <button className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400" title="Delete">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">{selectedJob.description}</p>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">Agent</span>
              <span className="font-medium" style={{ color: agentColor(selectedJob.agent) }}>{selectedJob.agent}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Schedule</span>
              <span className="text-zinc-300">{selectedJob.schedule}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Cron</span>
              <code className="bg-zinc-900 px-1.5 py-0.5 rounded text-[10px]">{selectedJob.cron}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Last run</span>
              <span className="text-zinc-300">{selectedJob.lastRun}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Next run</span>
              <span className="text-zinc-300">{selectedJob.nextRun}</span>
            </div>
          </div>

          {/* Run history */}
          <div>
            <h4 className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Run History</h4>
            <div className="space-y-1.5">
              {selectedJob.history.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className={`size-2 rounded-full ${STATUS_DOT[h.status]}`} />
                  <span className="text-zinc-400">{h.time}</span>
                  <span className={`ml-auto ${h.status === "fail" ? "text-red-400" : h.status === "skip" ? "text-zinc-500" : "text-emerald-400"}`}>
                    {h.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
