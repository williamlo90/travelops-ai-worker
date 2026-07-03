import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("opens a durable workspace from the operational queue", async ({ page }) => {
  await page.goto("/tasks");
  await expect(page.locator('[data-interactive-ready="true"]')).toBeVisible();

  const taskLink = page.getByRole("link", { name: "Flight cancelled by carrier" });
  await expect(taskLink).toHaveAttribute("href", "/tasks/RF-1042");
  await taskLink.click();
  await expect(page).toHaveURL(/\/tasks\/RF-1042$/);
  await expect(page.getByRole("heading", { name: /Refund request/ })).toBeVisible();
  await expect(page.getByText("create_refund_request")).toBeVisible();
});

test("shows evidence, deterministic risk, and a bounded proposal", async ({ page }, testInfo) => {
  await page.goto("/tasks/RF-1042");

  if (testInfo.project.name === "laptop-chromium") {
    await page.getByRole("tab", { name: "Evidence (2)" }).dispatchEvent("click");
    await expect(page.getByRole("tabpanel").getByText("Refund Policy", { exact: true })).toBeVisible();
  } else {
    await expect(page.getByRole("heading", { name: "Policy evidence" })).toBeVisible();
    await expect(page.getByLabel("Task context").getByText("Refund Policy", { exact: true })).toBeVisible();
  }
  if (testInfo.project.name === "laptop-chromium") {
    await page.getByRole("tab", { name: "Risk checks (3)" }).dispatchEvent("click");
    await expect(page.getByRole("tabpanel").getByText("USD 284.00 exceeds the operator threshold of USD 100.00.")).toBeVisible();
  } else {
    await expect(page.getByRole("heading", { name: "Deterministic risk checks" })).toBeVisible();
    await expect(page.getByLabel("Task context").getByText("USD 284.00 exceeds the operator threshold of USD 100.00.")).toBeVisible();
  }
  await expect(page.getByText("Human approval required")).toBeVisible();
  await expect(page.getByText(/intentionally unavailable until Sprint 5/)).toBeVisible();
});

test("has no automatically detectable accessibility violations", async ({ page }) => {
  await page.goto("/tasks/RF-1042");

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("opens the distinct Approval Review experience", async ({ page }) => {
  await page.goto("/tasks/RF-1042");

  const reviewLink = page.getByRole("link", { name: "Review proposed action" });
  await expect(reviewLink).toHaveAttribute(
    "href",
    "/tasks/RF-1042/approval?proposal=v1&evidence=v3",
  );
  await reviewLink.click();
  await expect(page).toHaveURL(/\/tasks\/RF-1042\/approval\?proposal=v1&evidence=v3$/);
  await expect(page.getByRole("heading", { name: "Review USD 284.00 refund" })).toBeVisible();
});

test("collapses the context rail into laptop tabs", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "desktop-chromium", "Desktop uses the sticky context rail.");
  await page.goto("/tasks/RF-1042");

  const evidenceTab = page.getByRole("tab", { name: "Evidence (2)" });
  await expect(evidenceTab).toHaveAttribute("aria-selected", "false");
  await evidenceTab.dispatchEvent("click");
  await expect(evidenceTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText("Carrier cancellation");
});
