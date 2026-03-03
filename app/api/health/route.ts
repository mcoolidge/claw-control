import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const port = req.nextUrl.searchParams.get("port");
  if (!port) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    const res = await fetch(`http://127.0.0.1:${port}/`, {
      signal: AbortSignal.timeout(2000),
    });
    return NextResponse.json({ ok: res.ok });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
