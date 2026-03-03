import { NextRequest, NextResponse } from "next/server";

const AGENT_PORTS: Record<string, number> = {
  greg:   19000,
  apollo: 19001,
  kai:    19005,
  athena: 24000,
};

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id || !AGENT_PORTS[id]) return NextResponse.json({ ok: false });

  try {
    const port = AGENT_PORTS[id];
    const res = await fetch(`http://127.0.0.1:${port}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    return NextResponse.json({ ok: res.ok });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
