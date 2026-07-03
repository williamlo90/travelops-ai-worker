import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("renders the task-first foundation shell", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/tasks$/);
  await expect(page.getByRole("heading", { name: "Task Inbox" })).toBeVisible();
  await expect(page.getByText("Static demo data")).toBeVisible();
  await expect(page.getByText("Chat", { exact: true })).toHaveCount(0);
});

test("has no automatically detectable accessibility violations", async ({ page }) => {
  await page.goto("/tasks");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("exposes a keyboard skip link", async ({ page }) => {
  await page.goto("/tasks");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
});
