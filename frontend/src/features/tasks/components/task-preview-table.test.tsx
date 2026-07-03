import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { foundationTaskFixtures } from "@/mocks/fixtures/task-summary-fixtures";
import { TaskPreviewTable } from "./task-preview-table";

describe("TaskPreviewTable", () => {
  it("renders typed task records and accessible table structure", () => {
    render(<TaskPreviewTable tasks={foundationTaskFixtures} />);

    expect(screen.getByRole("table", { name: "Static preview of TravelOps tasks" })).toBeVisible();
    expect(screen.getByText("RF-1042")).toBeVisible();
    expect(screen.getByText("USD 284.00")).toBeVisible();
    expect(screen.getAllByText("Needs approval")).toHaveLength(4);
  });
});
