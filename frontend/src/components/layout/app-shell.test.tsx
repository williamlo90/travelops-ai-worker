import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "./app-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/tasks",
}));

describe("AppShell", () => {
  it("exposes the primary landmark and preview boundary", () => {
    render(
      <AppShell>
        <h1>Task Inbox</h1>
      </AppShell>,
    );

    const primaryNavigation = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(primaryNavigation).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Task Inbox");
    expect(primaryNavigation.querySelector('a[href="/evidence"]')).toBeInTheDocument();
    expect(screen.getByText("Deterministic demonstration data. No external action can be executed.")).toBeInTheDocument();
  });
});
