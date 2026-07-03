import { describe, expect, it } from "vitest";
import { foundationTaskFixtures } from "@/mocks/fixtures/task-summary-fixtures";
import { mockTaskRepository } from "./mock-task-repository";

describe("mockTaskRepository", () => {
  it("returns deterministic copies of the foundation scenario", async () => {
    const first = await mockTaskRepository.listTaskSummaries();
    const second = await mockTaskRepository.listTaskSummaries();

    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    expect(first).toHaveLength(foundationTaskFixtures.length);
  });

  it("returns isolated workspace scenarios and rejects unknown tasks", async () => {
    const first = await mockTaskRepository.getTaskWorkspace("RF-1042");
    const second = await mockTaskRepository.getTaskWorkspace("RF-1042");

    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    expect(first?.evidence[0]).not.toBe(second?.evidence[0]);
    expect(await mockTaskRepository.getTaskWorkspace("RF-9999")).toBeNull();
  });
});
