// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Stepper } from "./Stepper";

function Harness(props: { initial: number; min?: number; max?: number; step?: number }) {
  const [v, setV] = useState(props.initial);
  return (
    <Stepper value={v} min={props.min} max={props.max} step={props.step} onChange={setV} label="hp" />
  );
}

describe("Stepper", () => {
  it("renders the value and label", () => {
    render(<Stepper value={3} onChange={() => {}} label="ammo" />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "ammo" })).toBeInTheDocument();
  });

  it("increments and decrements through onChange", async () => {
    const user = userEvent.setup();
    render(<Harness initial={2} max={5} />);
    await user.click(screen.getByRole("button", { name: "increase hp" }));
    expect(screen.getByText("3")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "decrease hp" }));
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("disables decrement at min and increment at max", () => {
    render(<Stepper value={0} min={0} max={5} onChange={() => {}} label="hp" />);
    expect(screen.getByRole("button", { name: "decrease hp" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "increase hp" })).toBeEnabled();
  });

  it("clamps at bounds and respects step", async () => {
    const user = userEvent.setup();
    render(<Harness initial={4} min={0} max={5} step={2} />);
    const inc = screen.getByRole("button", { name: "increase hp" });
    await user.click(inc); // 4 -> min(5, 6) = 5
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(inc).toBeDisabled();
  });

  it("renders discrete pips for small ranges with showPips", () => {
    const { container } = render(
      <Stepper value={2} max={5} showPips onChange={() => {}} label="hp" />
    );
    expect(container.querySelectorAll(".pip")).toHaveLength(5);
  });
});
