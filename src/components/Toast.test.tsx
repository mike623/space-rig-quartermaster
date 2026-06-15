// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { useStore } from "../state/store";
import { resetStore } from "../test/helpers";
import { Toast } from "./Toast";

describe("Toast", () => {
  beforeEach(() => {
    resetStore();
  });

  it("renders nothing when there is no toast", () => {
    const { container } = render(<Toast />);
    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("renders the message when a toast is shown", () => {
    useStore.getState().showToast("Resources banked", "ok");
    render(<Toast />);
    const el = screen.getByRole("status");
    expect(el).toHaveTextContent("Resources banked");
    expect(el).toHaveClass("toast", "ok");
    expect(el).toHaveAttribute("aria-live", "polite");
  });

  it("reflects the toast kind in the class name", () => {
    useStore.getState().showToast("Heads up", "warn");
    render(<Toast />);
    expect(screen.getByRole("status")).toHaveClass("warn");
  });
});
