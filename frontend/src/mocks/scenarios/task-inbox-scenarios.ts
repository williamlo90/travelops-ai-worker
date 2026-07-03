import { foundationTaskFixtures } from "@/mocks/fixtures/task-summary-fixtures";

export const taskInboxFoundationScenario = {
  id: "foundation-preview",
  label: "Static demo data",
  openTaskCount: 18,
  tasks: foundationTaskFixtures,
} as const;
