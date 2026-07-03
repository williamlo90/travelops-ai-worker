import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  it("renders an explicit status label", () => {
    render(<StatusBadge status="needs_approval" />);
    expect(screen.getByText("Needs approval")).toBeVisible();
  });
});
