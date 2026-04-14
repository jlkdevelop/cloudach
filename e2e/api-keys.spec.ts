import { test, expect } from '@playwright/test';

const MOCK_USER = { id: 'test-user-1', email: 'test@example.com' };

interface ApiKey {
  id: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
  allowed_models: string[] | null;
  rate_limit_rpm: number | null;
}

const MOCK_KEY: ApiKey = {
  id: 'key-uuid-1',
  name: 'CI Test Key',
  created_at: new Date().toISOString(),
  last_used_at: null,
  revoked_at: null,
  allowed_models: null,
  rate_limit_rpm: null,
};

const RAW_KEY = 'sk-cloudach-abc123def456';

// Returns a route handler that serves the current keys list.
function setupApiKeyMocks(
  page: import('@playwright/test').Page,
  initialKeys: ApiKey[] = [],
) {
  let keys: ApiKey[] = [...initialKeys];

  page.route('/api/auth/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: MOCK_USER }),
    }),
  );

  page.route('/api/dashboard/api-keys', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ keys }),
      });
    }
    // POST — create key
    keys = [...keys, MOCK_KEY];
    return route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ key: MOCK_KEY, rawKey: RAW_KEY }),
    });
  });

  page.route(`/api/dashboard/api-keys/${MOCK_KEY.id}/revoke`, (route) => {
    keys = keys.map((k) =>
      k.id === MOCK_KEY.id ? { ...k, revoked_at: new Date().toISOString() } : k,
    );
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ key: { ...MOCK_KEY, revoked_at: new Date().toISOString() } }),
    });
  });

  return { getKeys: () => keys };
}

test.describe('API key management', () => {
  test('empty state shows create prompt', async ({ page }) => {
    setupApiKeyMocks(page, []);
    await page.goto('/dashboard/api-keys');

    await expect(page.locator('.db-empty-title')).toContainText('No API keys');
    await expect(page.locator('button', { hasText: '+ New key' })).toBeVisible();
  });

  test('create API key → raw key revealed → appears in list', async ({ page }) => {
    setupApiKeyMocks(page, []);
    await page.goto('/dashboard/api-keys');

    // Open modal
    await page.click('button:has-text("+ New key")');
    await expect(page.locator('.db-modal')).toBeVisible();

    // Fill name and submit
    await page.fill('.db-modal input[placeholder*="Production"]', 'CI Test Key');
    await page.click('.db-modal button[type="submit"]');

    // Raw key should be revealed
    await expect(page.locator('.db-key-reveal')).toBeVisible();
    await expect(page.locator('.db-key-value')).toContainText(RAW_KEY);

    // Copy button present
    await expect(page.locator('.db-copy-btn')).toBeVisible();

    // Key appears in table
    await expect(page.locator('td', { hasText: 'CI Test Key' })).toBeVisible();
    await expect(page.locator('.db-badge--active')).toBeVisible();
  });

  test('copy key button copies to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    setupApiKeyMocks(page, []);
    await page.goto('/dashboard/api-keys');

    await page.click('button:has-text("+ New key")');
    await page.fill('.db-modal input[placeholder*="Production"]', 'CI Test Key');
    await page.click('.db-modal button[type="submit"]');

    await expect(page.locator('.db-key-reveal')).toBeVisible();
    await page.click('.db-copy-btn');

    await expect(page.locator('.db-copy-btn')).toContainText('Copied!');
  });

  test('revoke API key → disappears from active list', async ({ page }) => {
    setupApiKeyMocks(page, [MOCK_KEY]);
    await page.goto('/dashboard/api-keys');

    // Active key visible
    await expect(page.locator('.db-badge--active')).toBeVisible();

    // Click revoke
    await page.click('button:has-text("Revoke")');

    // Confirmation row appears
    await expect(page.locator('.db-inline-confirm')).toBeVisible();
    await page.click('.db-inline-confirm button:has-text("Yes, revoke")');

    // After revoke: key reloaded and shows revoked status
    await expect(page.locator('.db-badge--revoked')).toBeVisible();
  });

  test('existing key appears in the table', async ({ page }) => {
    setupApiKeyMocks(page, [MOCK_KEY]);
    await page.goto('/dashboard/api-keys');

    await expect(page.locator('td', { hasText: 'CI Test Key' })).toBeVisible();
    await expect(page.locator('.db-badge--active')).toBeVisible();
  });
});
