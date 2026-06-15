import { describe, expect, it } from "vitest";
import { newId } from "./ids";

describe("newId", () => {
  it("prefixes the id with the given prefix", () => {
    expect(newId("campaign").startsWith("campaign_")).toBe(true);
    expect(newId("char").startsWith("char_")).toBe(true);
  });

  it("defaults the prefix to 'id'", () => {
    expect(newId().startsWith("id_")).toBe(true);
  });

  it("produces unique ids across many calls", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      ids.add(newId("x"));
    }
    expect(ids.size).toBe(1000);
  });

  it("never contains an empty body after the prefix", () => {
    const id = newId("p");
    const body = id.slice("p_".length);
    expect(body.length).toBeGreaterThan(0);
  });

  it("uses crypto.randomUUID when available", () => {
    // The crypto-backed branch yields the standard UUID shape after the prefix.
    const hasRandomUUID =
      typeof (globalThis as { crypto?: { randomUUID?: unknown } }).crypto
        ?.randomUUID === "function";
    const id = newId("u");
    if (hasRandomUUID) {
      expect(id).toMatch(
        /^u_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    } else {
      // Fallback form: prefix_<base36 counter>_<base36 timestamp>
      expect(id).toMatch(/^u_[0-9a-z]+_[0-9a-z]+$/);
    }
  });

  it("uses the counter fallback when crypto.randomUUID is unavailable", () => {
    const cryptoObj = (globalThis as { crypto?: { randomUUID?: () => string } })
      .crypto;
    const original = cryptoObj?.randomUUID;
    // Remove randomUUID to force the fallback branch. `crypto` itself may be a
    // getter-only property, but its `randomUUID` method is writable.
    if (cryptoObj) cryptoObj.randomUUID = undefined;
    try {
      const a = newId("fb");
      const b = newId("fb");
      expect(a).toMatch(/^fb_[0-9a-z]+_[0-9a-z]+$/);
      expect(b).toMatch(/^fb_[0-9a-z]+_[0-9a-z]+$/);
      expect(a).not.toBe(b);
    } finally {
      if (cryptoObj) cryptoObj.randomUUID = original;
    }
  });
});
