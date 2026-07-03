import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function enterReason(page: import("@playwright/test").Page, value: string) {
  const reason = page.getByLabel("Decision reason *");
  await reason.evaluate((element, nextValue) => {
    const textarea = element as HTMLTextAreaElement;
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
    setter?.call(textarea, nextValue);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
}

test("records an attributable safe mock approval without executing", async ({ page }) => {
  await page.goto("/tasks/RF-1042/approval");

  await expect(page.getByText("Reserved to you · 12 minutes remaining")).toBeVisible();
  await page.getByRole("button", { name: "Approve USD 284.00 refund" }).dispatchEvent("click");
  await expect(page.locator("#decision-error")).toContainText("at least 8 characters");

  await enterReason(page, "Carrier cancellation qualifies under policy.");
  await page.getByRole("button", { name: "Approve USD 284.00 refund" }).dispatchEvent("click");

  await expect(page.getByRole("status")).toContainText("Approved");
  await expect(page.getByRole("status")).toContainText("No external action was executed");
});

test("blocks stale proposals and expired reservations", async ({ page }) => {
  await page.goto("/tasks/RF-1042/approval?proposal=v2&evidence=v3");
  await expect(page.getByText("Proposal version is stale")).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve USD 284.00 refund" })).toBeDisabled();

  await page.goto("/tasks/RF-1042/approval?scenario=expired");
  await expect(page.getByText("Reservation expired")).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve USD 284.00 refund" })).toBeDisabled();
});

test("has no automatically detectable accessibility violations", async ({ page }) => {
  await page.goto("/tasks/RF-1042/approval");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
