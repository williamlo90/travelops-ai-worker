import { expect, test } from "@playwright/test";

async function openInteractiveInbox(page: import("@playwright/test").Page, path: string) {
  await page.goto(path);
  await expect(page.locator('[data-interactive-ready="true"]')).toBeVisible();
}

async function enterText(locator: import("@playwright/test").Locator, value: string) {
  await locator.evaluate((element, nextValue) => {
    const input = element as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setter?.call(input, nextValue);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
}

async function chooseOption(locator: import("@playwright/test").Locator, value: string) {
  await locator.evaluate((element, nextValue) => {
    const select = element as HTMLSelectElement;
    select.value = nextValue;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

test("owns search and filter state in the URL", async ({ page }) => {
  await openInteractiveInbox(page, "/tasks");

  const search = page.getByRole("textbox", { name: "Search tasks" });
  await enterText(search, "Maria");
  await expect(page).toHaveURL(/q=Maria/);
  await expect(page.getByText("Maria Santos")).toBeVisible();
  await expect(page.getByText("David Lee")).toHaveCount(0);

  await chooseOption(page.getByLabel("Filter by task status"), "needs_information");
  await expect(page).toHaveURL(/status=needs_information/);
  await expect(page.getByText("No tasks match this view")).toBeVisible();

  await page.getByRole("button", { name: "Clear filters" }).dispatchEvent("click");
  await expect(page).toHaveURL(/\/tasks$/);
  await expect(page.getByText("David Lee")).toBeVisible();
});

test("loads saved views and deterministic sorting from a deep link", async ({ page }) => {
  await openInteractiveInbox(page, "/tasks?view=vip&sort=exposure_desc");

  await expect(page.getByLabel("Apply an operational view")).toHaveValue("vip");
  await expect(page.getByLabel("Sort tasks")).toHaveValue("exposure_desc");
  await expect(page.getByText("3 of 10 preview records")).toBeVisible();

  const rows = page.getByRole("row");
  await expect(rows).toHaveCount(4);
  await expect(rows.nth(1)).toContainText("USD 420.00");
});

test("supports keyboard row selection and URL restoration", async ({ page }) => {
  await openInteractiveInbox(page, "/tasks");

  const firstTask = page.getByRole("row", { name: /RF-1042/ });
  await firstTask.evaluate((element) => (element as HTMLElement).focus());
  await firstTask.dispatchEvent("keydown", { key: "ArrowDown" });
  await expect(page).toHaveURL(/task=RF-1034/);
  await expect(page.getByRole("row", { name: /RF-1034/ })).toBeFocused();

  await page.evaluate(() => {
    window.history.pushState(null, "", "/tasks?task=RF-1042");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  await expect(page).toHaveURL(/task=RF-1042/);
  await expect(page.getByRole("row", { name: /RF-1042/ })).toHaveAttribute("aria-selected", "true");
});

test("sidebar saved views expose the matching queue deep link", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "laptop-chromium", "Desktop sidebar is intentionally collapsed at this width.");
  await openInteractiveInbox(page, "/tasks");
  const highExposureLink = page.getByRole("link", { name: "High exposure" });
  await expect(highExposureLink).toHaveAttribute("href", "/tasks?view=high_exposure");
  await openInteractiveInbox(page, "/tasks?view=high_exposure");
  await expect(page.getByLabel("Apply an operational view")).toHaveValue("high_exposure");
  await expect(page.getByText("3 of 10 preview records")).toBeVisible();
});
