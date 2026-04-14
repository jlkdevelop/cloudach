/**
 * API Gateway authentication tests.
 *
 * These tests verify that the API gateway (services/api-gateway) correctly
 * accepts valid keys and rejects invalid ones. They run against a live gateway
 * process when GATEWAY_URL is set; otherwise they are skipped in CI unless
 * the full docker-compose stack is running.
 *
 * In CI, these tests run against the gateway started via docker-compose.
 */
import { test, expect } from '@playwright/test';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:8080';

// Helper: make a chat completions request to the gateway
async function chatRequest(
  request: import('@playwright/test').APIRequestContext,
  apiKey: string,
) {
  return request.post(`${GATEWAY_URL}/v1/chat/completions`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    data: {
      model: 'llama3-8b',
      messages: [{ role: 'user', content: 'ping' }],
    },
  });
}

test.describe('API Gateway — authentication', () => {
  test.skip(
    !process.env.GATEWAY_URL && process.env.CI !== 'true',
    'Skipped: set GATEWAY_URL or run in CI with docker-compose stack',
  );

  test('request with valid API key returns 200', async ({ request }) => {
    const validKey = process.env.E2E_VALID_API_KEY;
    test.skip(!validKey, 'Skipped: E2E_VALID_API_KEY not set');

    const response = await chatRequest(request, validKey!);
    expect(response.status()).toBe(200);
  });

  test('request with invalid API key returns 401', async ({ request }) => {
    const response = await chatRequest(request, 'sk-cloudach-invalidkeyvalue');
    expect(response.status()).toBe(401);
  });

  test('request with missing Authorization returns 401', async ({ request }) => {
    const response = await request.post(`${GATEWAY_URL}/v1/chat/completions`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        model: 'llama3-8b',
        messages: [{ role: 'user', content: 'ping' }],
      },
    });
    expect(response.status()).toBe(401);
  });

  test('gateway health endpoint returns 200', async ({ request }) => {
    const response = await request.get(`${GATEWAY_URL}/health`);
    expect(response.status()).toBe(200);
  });
});
