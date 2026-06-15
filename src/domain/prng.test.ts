import { describe, expect, it } from "vitest";
import { hashSeed, mulberry32, randomSeed, Rng } from "./prng";

describe("hashSeed", () => {
  it("is deterministic for the same string", () => {
    expect(hashSeed("ROCK-STONE")).toBe(hashSeed("ROCK-STONE"));
  });

  it("differs for different strings", () => {
    expect(hashSeed("ROCK")).not.toBe(hashSeed("STONE"));
  });

  it("returns a 32-bit unsigned integer", () => {
    const h = hashSeed("anything");
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
  });

  it("returns the FNV offset basis for the empty string", () => {
    expect(hashSeed("")).toBe(2166136261);
  });
});

describe("mulberry32", () => {
  it("same seed yields the same sequence", () => {
    const a = mulberry32(12345);
    const b = mulberry32(12345);
    const seqA = [a(), a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it("different seeds yield different sequences", () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toBe(b());
  });

  it("produces floats in [0, 1)", () => {
    const next = mulberry32(99);
    for (let i = 0; i < 1000; i++) {
      const v = next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("Rng", () => {
  it("is deterministic: same seed string gives same sequence", () => {
    const a = new Rng("SEED-1");
    const b = new Rng("SEED-1");
    expect([a.float(), a.float(), a.float()]).toEqual([
      b.float(),
      b.float(),
      b.float()
    ]);
  });

  it("different seeds diverge", () => {
    const a = new Rng("SEED-1");
    const b = new Rng("SEED-2");
    // Extremely unlikely to coincide across several draws.
    const seqA = [a.float(), a.float(), a.float()];
    const seqB = [b.float(), b.float(), b.float()];
    expect(seqA).not.toEqual(seqB);
  });

  it("float() stays in [0, 1)", () => {
    const r = new Rng("floats");
    for (let i = 0; i < 500; i++) {
      const v = r.float();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("int(min, max) is inclusive of both bounds and stays in range", () => {
    const r = new Rng("ints");
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const v = r.int(1, 6);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
      expect(Number.isInteger(v)).toBe(true);
      seen.add(v);
    }
    // Over many draws, both endpoints should appear.
    expect(seen.has(1)).toBe(true);
    expect(seen.has(6)).toBe(true);
  });

  it("int returns the single value when min === max", () => {
    const r = new Rng("fixed");
    expect(r.int(5, 5)).toBe(5);
  });

  it("pick returns an element from the array", () => {
    const r = new Rng("pick");
    const items = ["a", "b", "c"] as const;
    for (let i = 0; i < 100; i++) {
      expect(items).toContain(r.pick(items));
    }
  });

  it("pick throws on an empty array", () => {
    const r = new Rng("empty");
    expect(() => r.pick([])).toThrow(/empty array/);
  });

  it("pick is deterministic for a given seed", () => {
    const items = ["a", "b", "c", "d", "e"];
    const a = new Rng("deterministic-pick");
    const b = new Rng("deterministic-pick");
    expect([a.pick(items), a.pick(items)]).toEqual([
      b.pick(items),
      b.pick(items)
    ]);
  });

  it("sample returns unique elements without repetition", () => {
    const r = new Rng("sample");
    const items = [1, 2, 3, 4, 5];
    const out = r.sample(items, 3);
    expect(out).toHaveLength(3);
    expect(new Set(out).size).toBe(3);
    for (const v of out) expect(items).toContain(v);
  });

  it("sample caps at the pool size when count exceeds it", () => {
    const r = new Rng("sample-cap");
    const items = [1, 2, 3];
    const out = r.sample(items, 10);
    expect(out).toHaveLength(3);
    expect(new Set(out).size).toBe(3);
  });

  it("sample returns an empty array for count 0 or empty pool", () => {
    const r = new Rng("sample-empty");
    expect(r.sample([1, 2, 3], 0)).toEqual([]);
    expect(r.sample([], 5)).toEqual([]);
  });

  it("sample is deterministic for a given seed", () => {
    const items = ["a", "b", "c", "d", "e", "f"];
    const a = new Rng("sample-det");
    const b = new Rng("sample-det");
    expect(a.sample(items, 4)).toEqual(b.sample(items, 4));
  });

  it("does not mutate the input array", () => {
    const r = new Rng("nomutate");
    const items = [1, 2, 3, 4];
    const copy = [...items];
    r.sample(items, 2);
    expect(items).toEqual(copy);
  });
});

describe("randomSeed", () => {
  it("matches the WORD-WORD-NUMBER format", () => {
    for (let i = 0; i < 50; i++) {
      expect(randomSeed()).toMatch(/^[A-Z]+-[A-Z]+-\d{1,3}$/);
    }
  });

  it("uses a numeric suffix in [0, 999]", () => {
    for (let i = 0; i < 50; i++) {
      const n = Number(randomSeed().split("-")[2]);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThanOrEqual(999);
    }
  });
});
