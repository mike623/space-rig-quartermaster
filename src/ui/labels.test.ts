import {
  MODE_LABEL,
  MODE_SHORT,
  ROLE_LABEL,
  ROLE_ORDER,
  TERMS,
  slotLabel
} from "./labels";

describe("ui/labels", () => {
  describe("ROLE_LABEL", () => {
    it("maps each dwarf class to its IP-safe display label", () => {
      expect(ROLE_LABEL).toEqual({
        scout: "Surveyor",
        engineer: "Engineer",
        gunner: "Gunner",
        driller: "Driller",
        custom: "Custom"
      });
    });
  });

  describe("ROLE_ORDER", () => {
    it("lists roles in the expected display order", () => {
      expect(ROLE_ORDER).toEqual([
        "scout",
        "engineer",
        "gunner",
        "driller",
        "custom"
      ]);
    });

    it("covers every key in ROLE_LABEL exactly once", () => {
      expect([...ROLE_ORDER].sort()).toEqual(Object.keys(ROLE_LABEL).sort());
    });
  });

  describe("MODE_LABEL", () => {
    it("maps each campaign mode to its full label", () => {
      expect(MODE_LABEL).toEqual({
        official: "Official",
        economy: "Economy",
        hardcore: "Deeper Dive"
      });
    });
  });

  describe("MODE_SHORT", () => {
    it("maps each campaign mode to its short label", () => {
      expect(MODE_SHORT).toEqual({
        official: "Official",
        economy: "Economy",
        hardcore: "Deeper"
      });
    });
  });

  describe("slotLabel", () => {
    it("renders 'other' as 'Support'", () => {
      expect(slotLabel("other")).toBe("Support");
    });

    it("passes through primary and secondary unchanged", () => {
      expect(slotLabel("primary")).toBe("primary");
      expect(slotLabel("secondary")).toBe("secondary");
    });
  });

  describe("TERMS", () => {
    it("exposes the expected stat/section terms", () => {
      expect(TERMS).toEqual({
        hp: "Integrity",
        cards: "Rally Cards",
        tokens: "Upgrade Tokens",
        grenades: "Grenades",
        personalGold: "Personal Gold",
        overdrive: "Overdrive",
        brew: "Brew",
        effects: "Effects"
      });
    });

    it("maps cards to 'Rally Cards'", () => {
      expect(TERMS.cards).toBe("Rally Cards");
    });
  });
});
