/** Small display formatters. Timestamps are treated as UTC (synthetic data). */

/** "2026-06-18T09:14:00Z" -> "18 Jun 2026, 09:14 UTC" */
export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const formatted = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(date)
  return `${formatted} UTC`
}

/** "authentication" -> "Authentication"; "file_hash" -> "File Hash" */
export function titleCase(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}
