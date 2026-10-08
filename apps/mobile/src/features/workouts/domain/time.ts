// Match the canonical UTC representation created by Date.toISOString().
// Date.parse alone silently normalizes impossible dates such as February 30.
export function isUtcTimestamp(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value))
    && new Date(value).toISOString() === value;
}
