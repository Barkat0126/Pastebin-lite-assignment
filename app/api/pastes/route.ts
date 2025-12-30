import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createPaste } from "../../../lib/storage";

function parseBody(body: any) {
  const errors: string[] = [];
  const content = body?.content;
  const ttl_seconds = body?.ttl_seconds;
  const max_views = body?.max_views;

  if (typeof content !== "string" || content.trim().length === 0) {
    errors.push("content must be a non-empty string");
  }

  let ttl: number | null = null;
  if (ttl_seconds !== undefined) {
    if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
      errors.push("ttl_seconds must be an integer ≥ 1");
    } else ttl = ttl_seconds;
  }

  let max: number | null = null;
  if (max_views !== undefined) {
    if (!Number.isInteger(max_views) || max_views < 1) {
      errors.push("max_views must be an integer ≥ 1");
    } else max = max_views;
  }

  return { errors, content, ttl, max };
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null);
    const { errors, content, ttl, max } = parseBody(json);
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
    }

    const rec = await createPaste(content, ttl, max);

    const host = req.headers.get("host") ?? "";
    const proto = req.headers.get("x-forwarded-proto") ?? (host.includes("vercel.app") ? "https" : "http");
    const url = `${proto}://${host}/p/${rec.id}`;

    return NextResponse.json({ id: rec.id, url });
  } catch (e) {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
}