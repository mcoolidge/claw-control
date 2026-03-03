import { AGENTS } from "./agents";

export type TaskPriority = "low" | "medium" | "high" | "critical";
export type TaskStatus = "backlog" | "in-progress" | "in-review" | "done";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string; // agent name
}

export const MOCK_TASKS: Task[] = [
  {
    id: "t-1",
    title: "Set up vector DB indexing pipeline",
    description: "Configure Qdrant collections and embeddings for codebase search",
    status: "done",
    priority: "high",
    assignee: "Greg",
  },
  {
    id: "t-2",
    title: "Implement memory consolidation cron",
    description: "Nightly job to merge short-term memories into long-term storage",
    status: "in-progress",
    priority: "critical",
    assignee: "Apollo",
  },
  {
    id: "t-3",
    title: "Add tool-use retry logic",
    description: "Retry failed tool calls with exponential backoff",
    status: "in-review",
    priority: "medium",
    assignee: "Kai",
  },
  {
    id: "t-4",
    title: "Build agent health dashboard",
    description: "Real-time status page for all running agents",
    status: "done",
    priority: "high",
    assignee: "Greg",
  },
  {
    id: "t-5",
    title: "Integrate calendar API for scheduling",
    description: "Connect Google Calendar for automated meeting prep",
    status: "backlog",
    priority: "low",
    assignee: "Athena",
  },
  {
    id: "t-6",
    title: "Optimize prompt caching strategy",
    description: "Reduce token usage by caching system prompts across sessions",
    status: "in-progress",
    priority: "high",
    assignee: "Greg",
  },
  {
    id: "t-7",
    title: "Add structured output validation",
    description: "Zod schemas for all agent tool outputs",
    status: "backlog",
    priority: "medium",
    assignee: "Kai",
  },
  {
    id: "t-8",
    title: "Research multi-agent orchestration patterns",
    description: "Evaluate supervisor vs. peer-to-peer topologies",
    status: "in-review",
    priority: "high",
    assignee: "Apollo",
  },
  {
    id: "t-9",
    title: "Deploy monitoring alerting rules",
    description: "Set up Prometheus alerts for agent downtime and error spikes",
    status: "backlog",
    priority: "medium",
    assignee: "Athena",
  },
  {
    id: "t-10",
    title: "Write agent onboarding docs",
    description: "Document how to register a new agent with the gateway",
    status: "in-progress",
    priority: "low",
    assignee: "Athena",
  },
];

export type ActivityEvent = {
  id: string;
  agent: string;
  type: string;
  description: string;
  timestamp: string;
};

const EVENT_TYPES = ["task", "tool", "memory", "system", "error"];
const EVENT_DESCRIPTIONS: Record<string, string[]> = {
  task: [
    "Completed code review for PR #42",
    "Started working on memory pipeline",
    "Moved task to In Review",
    "Created subtask for API integration",
  ],
  tool: [
    "Executed file search across codebase",
    "Ran test suite — 47 passed, 0 failed",
    "Called LM Studio embedding endpoint",
    "Wrote 3 files to workspace",
  ],
  memory: [
    "Stored new long-term memory entry",
    "Consolidated 12 short-term memories",
    "Retrieved context for current task",
    "Updated project knowledge graph",
  ],
  system: [
    "Agent restarted successfully",
    "Connected to OpenClaw gateway",
    "Health check passed",
    "Configuration reloaded",
  ],
  error: [
    "Timeout calling external API",
    "Rate limit hit — backing off 30s",
    "Failed to parse tool output",
    "Connection refused on port 8080",
  ],
};

export function generateMockEvent(): ActivityEvent {
  const agent = AGENTS[Math.floor(Math.random() * AGENTS.length)];
  const type = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
  const descriptions = EVENT_DESCRIPTIONS[type];
  const description = descriptions[Math.floor(Math.random() * descriptions.length)];

  return {
    id: crypto.randomUUID(),
    agent: agent.name,
    type,
    description,
    timestamp: new Date().toISOString(),
  };
}
