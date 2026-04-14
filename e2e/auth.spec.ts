import { test, expect } from '@playwright/test';

// Mock auth API responses so tests run without a real database.
function mockAuthRoutes(page: import('@playwright/test').Page) {
  page.route('/api/auth/register', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: { id: 'test-user-1', email: 'test@example.com' } }),
    }),
  );

  page.route('/api/auth/login', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: { id: 'test-user-1', email: 'test@example.com' } }),
    }),
  );

  page.route('/api/auth/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: { id: 'test-user-1', email: 'test@example.com' } }),
    }),
  );

  page.route('/api/dashboard/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ keys: [], logs: [], daily: [] }),
    }),
  );
}

test.describe('signup flow', () => {
  test('signup page renders correctly', async ({ page }) => {
    await page.goto('/signup');

    await expect(page).toHaveTitle(/Create account/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('signup with email + password redirects to dashboard', async ({ page }) => {
    await mockAuthRoutes(page);
    await page.goto('/signup');

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('signup shows error on failure', async ({ page }) => {
    await page.route('/api/auth/register', (route) =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Email already registered.' }),
      }),
    );

    await page.goto('/signup');
    await page.fill('input[type="email"]', 'existing@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page.locator('.db-error')).toContainText('Email already registered.');
  });
});

test.describe('login flow', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveTitle(/Sign in/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('login with valid credentials redirects to dashboard', async ({ page }) => {
    await mockAuthRoutes(page);
    await page.goto('/login');

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
  });

  test('login shows error on invalid credentials', async ({ page }) => {
    await page.route('/api/auth/login', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid email or password.' }),
      }),
    );

    await page.goto('/login');
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('.db-error')).toContainText('Invalid email or password.');
  });

  test('unauthenticated access to dashboard redirects to login', async ({ page }) => {
    await page.route('/api/auth/me', (route) =>
      route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }),
    );

    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });
});
