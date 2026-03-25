/**
 * Detects PostgREST errors when `trips.completed_at` is not in the DB yet
 * (migration not applied). Used to fall back so the app keeps loading.
 */
export function isCompletedAtSchemaError(
  error: { message?: string; code?: string } | null | undefined
): boolean {
  if (!error?.message) return false;
  const m = error.message.toLowerCase();
  if (!m.includes("completed_at")) return false;
  return (
    m.includes("does not exist") ||
    m.includes("could not find") ||
    m.includes("unknown column") ||
    m.includes("schema cache")
  );
}
