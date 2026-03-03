import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false });

  try {
    // Check if the agent has an active session via openclaw
    const out = execSync(`openclaw agents list 2>/dev/null`, { encoding: "utf8", timeout: 4000 });
    const ok = out.includes(`- ${id} `);
    return NextResponse.json({ ok });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
