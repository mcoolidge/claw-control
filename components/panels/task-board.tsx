"use client";

import { useState, useEffect, useRef } from "react";
import { AGENTS } from "@/lib/agents";
import { type Task, type TaskStatus } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, RefreshCw, UserPlus } from "lucide-react";

const COLUMNS: { id: TaskStatus; label: string; assignmentRole: string }[] = [
  { id: "backlog",     label: "Backlog",     assignmentRole: "owner" },
  { id: "in-progress", label: "In Progress", assignmentRole: "implementing" },
  { id: "in-review",   label: "In Review",   assignmentRole: "reviewer" },
  { id: "testing",     label: "Testing",     assignmentRole: "testing" },
  { id: "done",        label: "Done",        assignmentRole: "completed by" },
];

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high:     "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium:   "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low:      "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

function AgentPicker({ taskId, assignedAgentId, onAssign }: {
  taskId: string;
  assignedAgentId: string | null;
  onAssign: (taskId: string, agentId: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const assigned = AGENTS.find((a) => a.id === assignedAgentId);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 group/btn"
        title={assigned ? `Assigned to ${assigned.name} — click to change` : "Assign agent"}
      >
        {assigned ? (
          <>
            <div
              className="size-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-1 ring-transparent group-hover/btn:ring-white/30 transition-all"
              style={{ backgroundColor: assigned.color }}
            >
              {assigned.name[0]}
            </div>
            <span className="text-xs text-zinc-500">{assigned.name}</span>
          </>
        ) : (
          <>
            <div className="size-5 rounded-full flex items-center justify-center bg-zinc-700 text-zinc-500 group-hover/btn:bg-zinc-600 transition-colors">
              <UserPlus className="size-3" />
            </div>
            <span className="text-xs text-zinc-600 group-hover/btn:text-zinc-400 transition-colors">Assign</span>
          </>
        )}
      </button>

      {open && (
        <div className="absolute bottom-7 left-0 z-50 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl p-1 min-w-[130px]">
          {AGENTS.map((agent) => (
            <button
              key={agent.id}
              onClick={() => { onAssign(taskId, agent.id); setOpen(false); }}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-zinc-700 text-left transition-colors"
            >
              <div
                className="size-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                style={{ backgroundColor: agent.color }}
              >
                {agent.name[0]}
              </div>
              <span className="text-xs text-zinc-300">{agent.name}</span>
              {agent.id === assignedAgentId && (
                <span className="ml-auto text-[10px] text-zinc-500">✓</span>
              )}
            </button>
          ))}
          {assignedAgentId && (
            <>
              <div className="border-t border-zinc-700 my-1" />
              <button
                onClick={() => { onAssign(taskId, null); setOpen(false); }}
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-zinc-700 text-left transition-colors"
              >
                <span className="text-xs text-zinc-500">Unassign</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function TaskCard({
  task,
  assignmentRole,
  assignments,
  onMove,
  onAssign,
}: {
  task: Task;
  assignmentRole: string;
  assignments: Record<string, string>;
  onMove: (id: string, direction: "left" | "right") => void;
  onAssign: (taskId: string, agentId: string | null) => void;
}) {
  const colIdx = COLUMNS.findIndex((c) => c.id === task.status);
  const canLeft = colIdx > 0;
  const canRight = colIdx < COLUMNS.length - 1;
  const agentId = assignments[task.id] ?? null;

  return (
    <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-3 space-y-2 group">
      <div className="flex items-start justify-between gap-2">
        <a
          href={`https://linear.app/issue/${task.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-500 font-mono shrink-0 hover:text-blue-400 transition-colors"
        >
          {task.id}
        </a>
        <Badge
          className={`shrink-0 text-[10px] px-1.5 py-0 border ${PRIORITY_COLORS[task.priority]}`}
        >
          {task.priority}
        </Badge>
      </div>
      <p className="text-sm font-medium text-zinc-100 leading-tight">{task.title}</p>
      <div className="flex items-center gap-2">
        <AgentPicker taskId={task.id} assignedAgentId={agentId} onAssign={onAssign} />
        {agentId && (
          <span className="text-[10px] text-zinc-600 italic">{assignmentRole}</span>
        )}
        <div className="ml-auto flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {canLeft && (
            <button
              onClick={() => onMove(task.id, "left")}
              className="p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300"
              title={`Move to ${COLUMNS[colIdx - 1].label}`}
            >
              <ChevronLeft className="size-3.5" />
            </button>
          )}
          {canRight && (
            <button
              onClick={() => onMove(task.id, "right")}
              className="p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300"
              title={`Move to ${COLUMNS[colIdx + 1].label}`}
            >
              <ChevronRight className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTasks() {
    setLoading(true);
    setError(null);
    try {
      const [tasksRes, assignRes] = await Promise.all([
        fetch("/api/tasks?limit=100"),
        fetch("/api/assignments"),
      ]);
      if (!tasksRes.ok) throw new Error(`HTTP ${tasksRes.status}`);
      const data = await tasksRes.json();
      const assignData = assignRes.ok ? await assignRes.json() : {};

      const statusMap: Record<string, TaskStatus> = {
        "Backlog": "backlog",
        "In Progress": "in-progress",
        "In Review": "in-review",
        "Testing": "testing",
        "Done": "done",
      };
      setTasks(data.tasks.map((t: { id: string; title: string; description: string; status: string; priority: string; assignee: string | null; url?: string }) => ({
        ...t,
        status: statusMap[t.status] ?? "backlog",
      })));
      setAssignments(assignData);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTasks(); }, []);

  async function assignTask(taskId: string, agentId: string | null) {
    // Optimistic update
    setAssignments((prev) => {
      const next = { ...prev };
      if (agentId) next[taskId] = agentId;
      else delete next[taskId];
      return next;
    });
    await fetch("/api/assignments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, agentId }),
    }).catch(() => {});
  }

  async function moveTask(id: string, direction: "left" | "right") {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const colIdx = COLUMNS.findIndex((c) => c.id === t.status);
        const nextIdx = direction === "right" ? colIdx + 1 : colIdx - 1;
        if (nextIdx < 0 || nextIdx >= COLUMNS.length) return t;
        return { ...t, status: COLUMNS[nextIdx].id };
      })
    );
    const task = tasks.find((t) => t.id === id);
    if (task) {
      const colIdx = COLUMNS.findIndex((c) => c.id === task.status);
      const nextIdx = direction === "right" ? colIdx + 1 : colIdx - 1;
      if (nextIdx >= 0 && nextIdx < COLUMNS.length) {
        const linearStateMap: Record<string, string> = {
          "backlog": "backlog",
          "in-progress": "in_progress",
          "in-review": "in_review",
          "testing": "testing",
          "done": "done",
        };
        await fetch("/api/tasks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, state: linearStateMap[COLUMNS[nextIdx].id] }),
        }).catch(() => {});
      }
    }
  }

  const grouped = COLUMNS.map((col) => ({
    ...col,
    tasks: tasks.filter((t) => t.status === col.id),
  }));

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-4 mb-4 px-1 items-center">
        {grouped.map((col) => (
          <div key={col.id} className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="font-medium text-zinc-300">{col.label}</span>
            <span className="bg-zinc-800 rounded-full px-2 py-0.5 text-zinc-500">
              {col.tasks.length}
            </span>
          </div>
        ))}
        <button onClick={loadTasks} className="ml-auto text-zinc-500 hover:text-zinc-300 cursor-pointer" title="Refresh from Linear">
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && (
        <div className="text-xs text-red-400 mb-3 px-1">Failed to load: {error}</div>
      )}

      <div className="grid grid-cols-5 gap-4 flex-1 min-h-0">
        {grouped.map((col) => (
          <div key={col.id} className="flex flex-col min-h-0">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 px-1">
              {col.label}
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              {loading && col.id === "backlog" && (
                <div className="text-xs text-zinc-600 text-center py-8">Loading from Linear…</div>
              )}
              {!loading && col.tasks.map((task) => (
                <TaskCard key={task.id} task={task} assignmentRole={col.assignmentRole} assignments={assignments} onMove={moveTask} onAssign={assignTask} />
              ))}
              {!loading && col.tasks.length === 0 && (
                <div className="text-xs text-zinc-600 text-center py-8">No tasks</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
