export function coerceArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : []
}
