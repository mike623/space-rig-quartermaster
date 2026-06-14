// ID generation. Uses crypto.randomUUID when available (browser + Node 22),
// falls back to a counter-based id for non-crypto environments.

let counter = 0;

export function newId(prefix = "id"): string {
  const g = globalThis as { crypto?: { randomUUID?: () => string } };
  if (g.crypto?.randomUUID) {
    return `${prefix}_${g.crypto.randomUUID()}`;
  }
  counter += 1;
  return `${prefix}_${counter.toString(36)}_${Date.now().toString(36)}`;
}
