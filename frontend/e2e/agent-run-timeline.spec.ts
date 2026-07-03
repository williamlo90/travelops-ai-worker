import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("opens the full business timeline from Task Workspace", async ({ page }) => {
  await page.goto("/tasks/RF-1042");
  const timelineLink = page.getByRole("link", { name: "Open full timeline" });
  await expect(timelineLink).toHaveAttribute("href", "/tasks/RF-1042/runs/AR-8821");
  await timelineLink.click();

  await expect(page).toHaveURL(/\/tasks\/RF-1042\/runs\/AR-8821$/);
  await expect(page.getByRole("heading", { name: "Agent Run Timeline" })).toBeVisible();
  await expect(page.getByText("Verified completion")).toBeVisible();
});

test("exposes safe details without raw technical trace", async ({ page }) => {
  await page.goto("/tasks/RF-1042/runs/AR-8821");
  const event = page.getByText("Refund request submitted", { exact: true });
  await event.click();

  await expect(page.getByText("idem_demo_rf1042_v1")).toBeVisible();
  await expect(page.getByText("Raw technical spans are intentionally excluded")).toBeVisible();
});

test("distinguishes safe retry from uncertain reconciliation", async ({ page }) => {
  await page.goto("/tasks/RF-1042/runs/AR-8821?scenario=failed");
  await expect(page.getByText("Safe retry is allowed")).toBeVisible();
  await page.getByRole("button", { name: "Record safe retry" }).dispatchEvent("click");
  await expect(page.getByRole("status")).toContainText("No tool call was sent");

  await page.goto("/tasks/RF-1042/runs/AR-8821?scenario=uncertain");
  await expect(page.getByText("Do not retry: reconcile external state first")).toBeVisible();
  await expect(page.getByRole("button", { name: "Record safe retry" })).toHaveCount(0);
  await page.getByRole("button", { name: "Start reconciliation" }).dispatchEvent("click");
  await expect(page.getByRole("status")).toContainText("Retry remains blocked");
});

test("has no automatically detectable accessibility violations", async ({ page }) => {
  await page.goto("/tasks/RF-1042/runs/AR-8821?scenario=uncertain");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
