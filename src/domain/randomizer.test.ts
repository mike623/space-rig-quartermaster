import { describe, expect, it } from "vitest";
import { generateRecipe } from "./randomizer";

describe("generateRecipe determinism", () => {
  it("same seed + settings yields identical missions", () => {
    const a = generateRecipe({
      seed: "ROCK-STONE-42",
      difficulty: "hazard4",
      assignmentLength: 5
    });
    const b = generateRecipe({
      seed: "ROCK-STONE-42",
      difficulty: "hazard4",
      assignmentLength: 5
    });
    const strip = (r: typeof a) =>
      r.missions.map(({ id: _id, ...rest }) => rest);
    expect(strip(a)).toEqual(strip(b));
  });

  it("different seed yields different missions", () => {
    const a = generateRecipe({
      seed: "SEED-A",
      difficulty: "hazard4",
      assignmentLength: 5
    });
    const b = generateRecipe({
      seed: "SEED-B",
      difficulty: "hazard4",
      assignmentLength: 5
    });
    const types = (r: typeof a) => r.missions.map((m) => m.missionType).join();
    expect(types(a)).not.toBe(types(b));
  });

  it("produces the requested number of missions", () => {
    expect(
      generateRecipe({ seed: "x", difficulty: "regular", assignmentLength: 3 })
        .missions.length
    ).toBe(3);
    expect(
      generateRecipe({ seed: "x", difficulty: "regular", assignmentLength: 7 })
        .missions.length
    ).toBe(7);
  });

  it("keeps the first mission light on low difficulty", () => {
    const r = generateRecipe({
      seed: "easy",
      difficulty: "greenbeard",
      assignmentLength: 5
    });
    expect(r.missions[0].warnings.length).toBe(0);
  });
});
