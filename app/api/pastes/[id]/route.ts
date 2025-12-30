import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRecord, incrementViewsIfAllowed } from "../../../../lib/storage";
import { getNowMsFromHeader, toISO } from "../../../../lib/time";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const record = await getRecord(id);
  if (!record) return NextResponse.json({ error: "not found" }, { status: 404 });

  const testMode = process.env.TEST_MODE === "1";
  const nowMs = getNowMsFromHeader(testMode, req.headers.get("x-test-now-ms"));

  if (record.expiresAtMs !== null && nowMs >= record.expiresAtMs) {
    return NextResponse.json({ error: "expired" }, { status: 404 });
  }

  let remaining: number | null = null;
  if (record.maxViews !== null) {
    const inc = await incrementViewsIfAllowed(id, record.maxViews);
    if (!inc.ok || inc.newCount === undefined) {
      return NextResponse.json({ error: "view limit exceeded" }, { status: 404 });
    }
    remaining = Math.max(0, record.maxViews - inc.newCount);
  } else {
    remaining = null;
  }

  return NextResponse.json({
    content: record.content,
    remaining_views: remaining,
    expires_at: toISO(record.expiresAtMs),
  });
}