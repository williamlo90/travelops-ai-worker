import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { refundWorkspaceFixture } from "@/mocks/fixtures/task-workspace-fixtures";
import { ApprovalReview } from "./approval-review";

afterEach(cleanup);

describe("ApprovalReview", () => {
  it("preserves input after validation and records a version-bound mock decision", () => {
    render(<ApprovalReview workspace={refundWorkspaceFixture} scenario="active" />);

    const approveName = /Approve USD.*284\.00 refund/;
    fireEvent.click(screen.getByRole("button", { name: approveName }));
    expect(screen.getByRole("alert")).toHaveTextContent("at least 8 characters");

    fireEvent.change(screen.getByLabelText(/Decision reason/), {
      target: { value: "Carrier cancellation qualifies under policy." },
    });
    fireEvent.click(screen.getByRole("button", { name: approveName }));

    expect(screen.getByRole("status")).toHaveTextContent("Approved");
    expect(screen.getByRole("status")).toHaveTextContent("proposal v1");
    expect(screen.getByRole("status")).toHaveTextContent("No external action was executed");
  });

  it("offers quick reasons and states the bounded business impact", () => {
    render(<ApprovalReview workspace={refundWorkspaceFixture} scenario="active" />);
    fireEvent.click(screen.getByRole("button", { name: "Policy confirmed" }));

    expect(screen.getByLabelText(/Decision reason/)).toHaveValue(
      "Applicable policy and waiver were confirmed.",
    );
    expect(screen.getByText("The version-bound approval decision is recorded.")).toBeVisible();
    expect(screen.getByText("The task remains unexecuted until a tool result is verified.")).toBeVisible();
  });

  it("blocks stale proposals and expired reservations", () => {
    const { unmount } = render(
      <ApprovalReview workspace={refundWorkspaceFixture} scenario="stale" />,
    );
    expect(screen.getByText("Proposal version is stale")).toBeVisible();
    expect(screen.getByRole("button", { name: /Approve USD.*284\.00 refund/ })).toBeDisabled();

    unmount();
    render(<ApprovalReview workspace={refundWorkspaceFixture} scenario="expired" />);
    expect(screen.getByText("Reservation expired")).toBeVisible();
    expect(screen.getByRole("button", { name: /Approve USD.*284\.00 refund/ })).toBeDisabled();
  });
});
