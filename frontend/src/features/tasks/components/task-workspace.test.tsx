import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { refundWorkspaceFixture } from "@/mocks/fixtures/task-workspace-fixtures";
import { TaskWorkspace } from "./task-workspace";

describe("TaskWorkspace", () => {
  it("separates request, recommendation, evidence, risk, and exact action", () => {
    render(<TaskWorkspace workspace={refundWorkspaceFixture} />);

    expect(screen.getByRole("heading", { name: /Refund request/ })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Recommended resolution" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Policy evidence" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Deterministic risk checks" })).toBeVisible();
    expect(screen.getByText("create_refund_request")).toBeVisible();
    expect(screen.getByText("Human approval required")).toBeVisible();
    expect(screen.getByRole("link", { name: "Review proposed action" })).toHaveAttribute(
      "href",
      "/tasks/RF-1042/approval?proposal=v1&evidence=v3",
    );
    expect(screen.getByText(/intentionally unavailable until Sprint 5/)).toBeVisible();
  });
});
