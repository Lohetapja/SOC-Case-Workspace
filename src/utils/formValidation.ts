/** Small, dependency-free form validation helpers. */

export function isAllowedValue<T extends string>(
  value: string,
  allowedValues: readonly T[],
): value is T {
  return allowedValues.includes(value as T)
}

/** Validate the browser datetime-local shape used by the app forms. */
export function isValidDateTimeLocal(value: string): boolean {
  const trimmed = value.trim()
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) return false
  const normalized = trimmed.length === 16 ? `${trimmed}:00` : trimmed
  return !Number.isNaN(new Date(normalized).getTime())
}

export function isValidOptionalDateTimeLocal(value: string): boolean {
  return !value.trim() || isValidDateTimeLocal(value)
}
