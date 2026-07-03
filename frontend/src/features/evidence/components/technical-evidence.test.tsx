import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TechnicalEvidence } from "./technical-evidence";

describe("TechnicalEvidence", () => {
  it("keeps only the two essential evidence views", () => {
    render(<TechnicalEvidence activeView="evaluations"/>);
    const nav = screen.getByRole("navigation", { name: "Technical evidence sections" });
    expect(nav.querySelectorAll("a")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Evaluation Cases" })).toHaveAttribute("aria-current", "page");
    const summary = screen.getByLabelText("Evaluation summary");
    expect(summary).toHaveTextContent("Total6");
    expect(summary).toHaveTextContent("Passed5");
    expect(summary).toHaveTextContent("Failed1");
    expect(screen.getByText("workflow-output-v1")).toBeInTheDocument();
    expect(screen.getByText("Could authorize an ineligible refund.")).toBeInTheDocument();
    expect(screen.getByText("Evaluation gate failed; no external action executed.")).toBeInTheDocument();
    expect(screen.queryByText("Case study overview")).not.toBeInTheDocument();
    expect(screen.queryByText("STATUS = UNCERTAIN")).not.toBeInTheDocument();
  });

  it("renders architecture proof and limitations separately", () => {
    render(<TechnicalEvidence activeView="architecture"/>);
    expect(screen.getByRole("heading", { name: "Architecture Proof" })).toBeInTheDocument();
    expect(screen.getByText(/No production observability or immutable audit log/)).toBeInTheDocument();
  });
});
