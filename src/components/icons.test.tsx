// @vitest-environment jsdom
import { render } from "@testing-library/react";
import * as icons from "./icons";

const iconEntries = Object.entries(icons).filter(
  ([, value]) => typeof value === "function"
) as [string, (props: { s?: number; c?: string }) => JSX.Element][];

describe("icons", () => {
  it("exports a set of icon components", () => {
    expect(iconEntries.length).toBeGreaterThan(0);
  });

  it.each(iconEntries)("%s renders an <svg>", (_name, Icon) => {
    const { container } = render(<Icon />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("respects the size prop", () => {
    const { container } = render(<icons.GoldIcon s={42} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "42");
    expect(svg).toHaveAttribute("height", "42");
  });

  it("respects the color prop", () => {
    const { container } = render(<icons.CheckIcon c="#abcdef" />);
    expect(container.querySelector("svg")).toHaveAttribute("fill", "#abcdef");
  });
});
