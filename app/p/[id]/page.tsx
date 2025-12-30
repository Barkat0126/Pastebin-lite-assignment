import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getRecord, getViews } from "../../../lib/storage";
import { getNowMsFromHeader } from "../../../lib/time";

export const dynamic = "force-dynamic";

export default async function PastePage({ params, searchParams }: { params: { id: string }, searchParams: Record<string, string | string[] | undefined> }) {
  const id = params.id;
  const nowMs = getNowMsFromHeader(Boolean(searchParams.preview), headers().get("x-test-now-ms"));

  const record = await getRecord(id);
  const views = await getViews(id);

  return (
    <main className="card">
      <div className="card-header">
        <h1 className="card-title">Paste</h1>
        <div className="card-subtitle">ID: {id} · Views: {views}</div>
      </div>
      <pre className="pre">{record?.content ?? "Not found or expired."}</pre>
    </main>
  );
}