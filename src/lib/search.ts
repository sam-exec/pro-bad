/**
 * Recursively checks if any value in the object matches the query.
 * Case-insensitive, partial matching.
 */
export function universalMatch(item: any, query: string): boolean {
  if (!query) return true;
  if (item === null || item === undefined) return false;

  const q = query.toLowerCase();

  if (typeof item === "string" || typeof item === "number") {
    return String(item).toLowerCase().includes(q);
  }

  if (Array.isArray(item)) {
    return item.some((val) => universalMatch(val, query));
  }

  if (typeof item === "object") {
    return Object.values(item).some((val) => universalMatch(val, query));
  }

  return false;
}
