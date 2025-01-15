import { test, expect } from "@playwright/test";

test("homepage has title and can post", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Chat Forum/);

  await page.fill("textarea", "Hello from Playwright");
  await page.click("text=Post");
  await expect(page.locator("text=Hello from Playwright")).toBeVisible();
});
