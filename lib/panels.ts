import {
  LayoutGrid,
  Calendar,
  FolderOpen,
  Brain,
  BookOpen,
  Users,
  Building2,
  Activity,
  type LucideIcon,
} from "lucide-react";

export interface PanelConfig {
  id: string;
  label: string;
  icon: LucideIcon;
}

// ── Panel registry ──────────────────────────────────────────────────
// Add new panels here — sidebar + routing picks them up automatically.
// The matching component must exist at components/panels/{id}.tsx
// and be default-exported.
export const PANELS: PanelConfig[] = [
  { id: "task-board",    label: "Tasks",       icon: LayoutGrid },
  { id: "calendar-view", label: "Calendar",    icon: Calendar },
  { id: "project-list",  label: "Projects",    icon: FolderOpen },
  { id: "memory-journal",label: "Memory",      icon: Brain },
  { id: "doc-library",   label: "Docs",        icon: BookOpen },
  { id: "team-org-chart",label: "Team",        icon: Users },
  { id: "office-view",   label: "Office",      icon: Building2 },
  { id: "activity-feed", label: "Activity",    icon: Activity },
];
