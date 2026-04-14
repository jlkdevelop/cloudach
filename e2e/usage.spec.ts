import { test, expect } from '@playwright/test';

const MOCK_USER = { id: 'test-user-1', email: 'test@example.com' };

const MOCK_USAGE = {
  logs: [
    {
      id: 'log-1',
      created_at: new Date().toISOString(),
      model: 'llama3-8b',
      prompt_tokens: 50,
      completion_tokens: 100,
      total_tokens: 150,
      cost_usd: 0.0003,
    },
  ],
  daily: [
    {
      date: new Date().toISOString().split('T')[0],
      requests: 1,
      tokens: 150,
      cost: 0.0003,
    },
  ],
};

function setupUsageMocks(page: import('@playwright/test').Page, usageData = MOCK_USAGE) {
  page.route('/api/auth/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: MOCK_USER }),
    }),
  );

  page.route('/api/dashboard/usage*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(usageData),
    }),
  );
}

test.describe('usage page', () => {
  test('usage page shows stats when data is present', async ({ page }) => {
    setupUsageMocks(page);
    await page.goto('/dashboard/usage');

    // Summary stats should be visible
    await expect(page.locator('.db-stat-card').first()).toBeVisible();

    // At least one stat value rendered
    await expect(page.locator('.db-stat-value').first()).toBeVisible();
  });

  test('usage page shows request log entry after API call', async ({ page }) => {
    setupUsageMocks(page);
    await page.goto('/dashboard/usage');

    // The log entry for our mock API call should appear
    await expect(page.locator('text=llama3-8b').first()).toBeVisible();
  });

  test('usage page shows empty state when no usage', async ({ page }) => {
    setupUsageMocks(page, { logs: [], daily: [] });
    await page.goto('/dashboard/usage');

    // Stats should all show 0
    await expect(page.locator('.db-stat-value').first()).toContainText('0');
  });

  test('usage page redirects to login when unauthenticated', async ({ page }) => {
    page.route('/api/auth/me', (route) =>
      route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }),
    );

    await page.goto('/dashboard/usage');
    await expect(page).toHaveURL('/login');
  });
});
