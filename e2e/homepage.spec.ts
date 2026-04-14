import { test, expect } from '@playwright/test';

test('homepage loads with key content', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Cloudach/);
  await expect(page.locator('text=Run any open-source LLM').first()).toBeVisible();
  await expect(page.locator('a[href="/signup"], a[href="/login"]').first()).toBeVisible();
});

test('homepage nav links are present', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('nav')).toBeVisible();
  await expect(page.locator('a[href="/pricing"]')).toBeVisible();
});

test('homepage loads without JS errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  expect(errors).toHaveLength(0);
});
