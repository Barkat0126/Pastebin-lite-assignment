import { NextResponse } from "next/server";
import { healthz } from "../../../lib/storage";

export const dynamic = "force-dynamic"; // ensure fast response

export async function GET() {
  const status = await healthz();
  return NextResponse.json({ ok: status.ok });
}