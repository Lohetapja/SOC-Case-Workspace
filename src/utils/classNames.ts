/**
 * Tiny helper to join conditional class names without pulling in a dependency.
 * cn('a', false && 'b', cond && 'c') -> 'a c'
 */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}
