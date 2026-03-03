import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const FILE = join(process.cwd(), "data", "assignments.json");

function load(): Record<string, string> {
  try {
    if (!existsSync(FILE)) return {};
    return JSON.parse(readFileSync(FILE, "utf8"));
  } catch { return {}; }
}

function save(data: Record<string, string>) {
  const { mkdirSync } = require("fs");
  mkdirSync(join(process.cwd(), "data"), { recursive: true });
  writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  return NextResponse.json(load());
}

export async function PATCH(req: NextRequest) {
  const { taskId, agentId } = await req.json();
  if (!taskId) return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
  const data = load();
  if (agentId) {
    data[taskId] = agentId;
  } else {
    delete data[taskId]; // null agentId = unassign
  }
  save(data);
  return NextResponse.json({ ok: true });
}
