import { NextRequest, NextResponse } from "next/server";

const MEM_BASE = "http://127.0.0.1:8765";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const path = searchParams.get("path") || "/memory/list";
  const params = new URLSearchParams();
  searchParams.forEach((v, k) => { if (k !== "path") params.set(k, v); });
  const url = `${MEM_BASE}${path}${params.size ? "?" + params : ""}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "memory service unavailable" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const res = await fetch(`${MEM_BASE}/memory/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "memory service unavailable" }, { status: 503 });
  }
}
