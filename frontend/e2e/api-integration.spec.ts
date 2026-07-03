import { expect, test } from "@playwright/test";

test.skip(process.env.TRAVELOPS_DATA_MODE !== "api", "Requires the API-backed Compose profile.");

test("opens a persisted task from Inbox through the real backend", async ({ page }, testInfo) => {
  await page.goto("/tasks");

  await expect(page.getByText("API-backed demo data")).toBeVisible();
  const taskLink = page.getByRole("link", { name: "Flight cancelled by carrier" });
  await expect(taskLink).toHaveAttribute("href", "/tasks/RF-1042");
  await taskLink.click();

  await expect(page).toHaveURL(/\/tasks\/RF-1042$/);
  await expect(page.getByRole("heading", { name: /Flight cancelled by carrier/ })).toBeVisible();
  if (testInfo.project.name === "laptop-chromium") {
    const persistedContext = page.getByRole("tabpanel");
    await expect(persistedContext.getByText("BA218", { exact: true })).toBeVisible();
    await expect(persistedContext.getByText("Maria Santos", { exact: true })).toBeVisible();
    await page.getByRole("tab", { name: "Evidence (1)" }).click();
    await expect(page.getByRole("tabpanel").getByText("Refund Policy", { exact: true })).toBeVisible();
  } else {
    await expect(page.getByLabel("Booking", { exact: true }).getByText("BA218", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Customer", { exact: true }).getByText("Maria Santos", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Task context").getByText("Refund Policy", { exact: true })).toBeVisible();
  }
});

test("renders a durable not-found state for a missing API task", async ({ page }) => {
  await page.goto("/tasks/RF-9999");

  await expect(page.getByRole("heading", { name: "This task is not available" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Return to Task Inbox" })).toHaveAttribute(
    "href",
    "/tasks",
  );
});
