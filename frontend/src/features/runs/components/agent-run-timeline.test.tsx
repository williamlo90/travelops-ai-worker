import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  completedRunFixture,
  failedRunFixture,
  uncertainRunFixture,
} from "@/mocks/fixtures/agent-run-fixtures";
import { AgentRunTimeline } from "./agent-run-timeline";

afterEach(cleanup);

describe("AgentRunTimeline", () => {
  it("shows verified completion only after external postcondition evidence", () => {
    render(<AgentRunTimeline run={completedRunFixture} />);
    expect(screen.getByText("Verified completion")).toBeVisible();
    expect(screen.getByText("External result verified")).toBeVisible();
    expect(screen.getByText(/No real provider action was executed/)).toBeVisible();
  });

  it("allows a safe retry record only when no side effect occurred", () => {
    render(<AgentRunTimeline run={failedRunFixture} />);
    fireEvent.click(screen.getByRole("button", { name: "Record safe retry" }));
    expect(screen.getByRole("status")).toHaveTextContent("No tool call was sent");
  });

  it("blocks retry and routes uncertain execution to reconciliation", () => {
    render(<AgentRunTimeline run={uncertainRunFixture} />);
    expect(screen.getByText("Do not retry: reconcile external state first")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Start reconciliation" }));
    expect(screen.getByRole("status")).toHaveTextContent("Retry remains blocked");
  });
});
