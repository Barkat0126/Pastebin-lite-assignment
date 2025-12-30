import { Redis } from "@upstash/redis";
import { customAlphabet } from "nanoid";

export type PasteRecord = {
  id: string;
  content: string;
  createdAtMs: number;
  ttlSeconds: number | null;
  maxViews: number | null;
  expiresAtMs: number | null;
};

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 12);

function isRedisConfigured() {
  return !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;
}

const redis = isRedisConfigured()
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// In-memory fallback (for local dev only). Not suitable for serverless deployment.
const memoryStore: {
  records: Map<string, PasteRecord>;
  views: Map<string, number>;
} = {
  records: new Map(),
  views: new Map(),
};

export async function healthz() {
  if (redis) {
    try {
      const pong = await redis.ping();
      return { ok: pong === "PONG", storage: "redis" as const };
    } catch {
      return { ok: false, storage: "redis" as const };
    }
  }
  // In-memory fallback is reachable but not persistent across serverless invocations
  return { ok: false, storage: "memory" as const };
}

export function newId() {
  return nanoid();
}

export async function createPaste(content: string, ttlSeconds: number | null, maxViews: number | null) {
  const id = newId();
  const createdAtMs = Date.now();
  const expiresAtMs = ttlSeconds ? createdAtMs + ttlSeconds * 1000 : null;
  const record: PasteRecord = { id, content, createdAtMs, ttlSeconds, maxViews, expiresAtMs };

  if (redis) {
    await redis.set(recordKey(id), JSON.stringify(record));
    if (maxViews !== null) {
      // initialize views counter to 0
      await redis.set(viewsKey(id), 0);
    }
  } else {
    memoryStore.records.set(id, record);
    if (maxViews !== null) memoryStore.views.set(id, 0);
  }

  return record;
}

export async function getRecord(id: string): Promise<PasteRecord | null> {
  if (redis) {
    const raw = await redis.get<string>(recordKey(id));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PasteRecord;
    } catch {
      return null;
    }
  } else {
    return memoryStore.records.get(id) ?? null;
  }
}

export async function getViews(id: string): Promise<number> {
  if (redis) {
    const v = await redis.get<number>(viewsKey(id));
    return typeof v === "number" ? v : 0;
  }
  return memoryStore.views.get(id) ?? 0;
}

export async function incrementViewsIfAllowed(id: string, maxViews: number): Promise<{ ok: boolean; newCount?: number }>{
  if (redis) {
    const newCount = await redis.incr(viewsKey(id));
    if (newCount > maxViews) {
      // revert and disallow
      await redis.decr(viewsKey(id));
      return { ok: false };
    }
    return { ok: true, newCount };
  } else {
    const curr = memoryStore.views.get(id) ?? 0;
    const next = curr + 1;
    if (next > maxViews) {
      return { ok: false };
    }
    memoryStore.views.set(id, next);
    return { ok: true, newCount: next };
  }
}

function recordKey(id: string) {
  return `paste:${id}`;
}
function viewsKey(id: string) {
  return `paste:${id}:views`;
}