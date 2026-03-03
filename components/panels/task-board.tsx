"use client";

import { AGENTS } from "@/lib/agents";
import { MOCK_TASKS, type Task, type TaskStatus } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "backlog",     label: "Backlog" },
  { id: "in-progress", label: "In Progress" },
  { id: "in-review",   label: "In Review" },
  { id: "done",        label: "Done" },
];

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high:     "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium:   "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low:      "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

function agentColor(name: string) {
  return AGENTS.find((a) => a.name === name)?.color ?? "#71717a";
}

function TaskCard({ task }: { task: Task }) {
  return (
    <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-zinc-100 leading-tight">
          {task.title}
        </span>
        <Badge
          className={`shrink-0 text-[10px] px-1.5 py-0 border ${PRIORITY_COLORS[task.priority]}`}
        >
          {task.priority}
        </Badge>
      </div>
      <p className="text-xs text-zinc-400 line-clamp-2">{task.description}</p>
      <div className="flex items-center gap-2">
        <div
          className="size-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
          style={{ backgroundColor: agentColor(task.assignee) }}
        >
          {task.assignee[0]}
        </div>
        <span className="text-xs text-zinc-500">{task.assignee}</span>
      </div>
    </div>
  );
}

export default function TaskBoard() {
  const grouped = COLUMNS.map((col) => ({
    ...col,
    tasks: MOCK_TASKS.filter((t) => t.status === col.id),
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Stats bar */}
      <div className="flex gap-4 mb-4 px-1">
        {grouped.map((col) => (
          <div key={col.id} className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="font-medium text-zinc-300">{col.label}</span>
            <span className="bg-zinc-800 rounded-full px-2 py-0.5 text-zinc-500">
              {col.tasks.length}
            </span>
          </div>
        ))}
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-4 gap-4 flex-1 min-h-0">
        {grouped.map((col) => (
          <div key={col.id} className="flex flex-col min-h-0">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 px-1">
              {col.label}
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              {col.tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {col.tasks.length === 0 && (
                <div className="text-xs text-zinc-600 text-center py-8">No tasks</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
