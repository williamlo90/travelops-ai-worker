import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("shows only Evaluation Cases and Architecture Proof menus", async ({ page }) => {
  await page.goto("/evidence");
  const nav = page.getByRole("navigation", { name: "Technical evidence sections" });
  await expect(nav.getByRole("link")).toHaveCount(2);
  await expect(nav.getByRole("link", { name: "Evaluation Cases" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Evaluation Cases" })).toBeVisible();
  const summary = page.getByLabel("Evaluation summary");
  await expect(summary).toContainText("Total6");
  await expect(summary).toContainText("Passed5");
  await expect(summary).toContainText("Failed1");
  await expect(page.getByText("workflow-output-v1")).toBeVisible();
  await expect(page.getByText("Could authorize an ineligible refund.")).toBeVisible();
  await expect(page.getByText("Evaluation gate failed; no external action executed.")).toBeVisible();
  await expect(page.getByText("Case study overview")).toHaveCount(0);
  await expect(page.getByText("STATUS = UNCERTAIN")).toHaveCount(0);
});

test("opens the focused architecture view", async ({ page }) => {
  await page.goto("/evidence?view=architecture");
  await expect(page.getByRole("heading", { name: "Architecture Proof" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Architecture Proof" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByText("No production observability or immutable audit log.")).toBeVisible();
});

test("has no automatically detectable accessibility violations", async ({ page }) => {
  await page.goto("/evidence");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
