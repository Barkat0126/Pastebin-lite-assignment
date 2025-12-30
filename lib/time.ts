export function getNowMsFromHeader(testMode: boolean, headerVal: string | null | undefined): number {
  if (testMode && headerVal) {
    const parsed = Number(headerVal);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }
  return Date.now();
}

export function toISO(ms: number | null): string | null {
  return ms != null ? new Date(ms).toISOString() : null;
}