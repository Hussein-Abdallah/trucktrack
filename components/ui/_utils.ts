import type { ReactNode } from 'react';

/**
 * Join className fragments, dropping falsy values. Lets component callers
 * compose NativeWind classes conditionally without importing `clsx`.
 */
export function classNames(...parts: (string | false | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Children like `{foo} {bar}` arrive as an array of strings/numbers, not a
 * single string. React Native throws "Text strings must be rendered within a
 * <Text> component" if raw strings end up outside a <Text>, so any primitive
 * whose children might be text-like (Button, Badge, etc.) must wrap them.
 *
 * `null` / `undefined` / `boolean` are treated as text-like because React
 * renders them as nothing — keeps arrays like `['Save', condition && ' now']`
 * safe when condition is false.
 */
export function isTextLike(node: ReactNode): boolean {
  if (node === null || node === undefined || typeof node === 'boolean') return true;
  if (typeof node === 'string' || typeof node === 'number') return true;
  if (Array.isArray(node)) return node.every(isTextLike);
  return false;
}

/**
 * Flatten a text-like `ReactNode` to a plain string — useful for deriving an
 * `accessibilityLabel` when the caller didn't supply one. Returns `''` for
 * anything non-text-like so the caller can treat empty-string as "no label".
 */
export function stringifyTextLike(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(stringifyTextLike).join('');
  return '';
}
