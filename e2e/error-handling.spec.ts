import { test, expect } from '@playwright/test';
import {
  setupErrorMocks,
  setupApiKey,
  clearBrowserStorage,
  createNote,
  setupModelPreferences,
} from './helpers/setup';
import { testUrls } from './fixtures/mock-responses';

/**
 * E2E Tests: Error Handling
 *
 * Tests how the application handles various error scenarios:
 * - API errors (500, network issues)
 * - Authentication errors (invalid API key)
 * - Missing API key (BYOK requirement)
 */

test.describe('Error Handling', () => {
  test.beforeEach(async ({ page }) => {

    await page.goto('/new');

    await clearBrowserStorage(page);
    await setupApiKey(page);

    await page.goto('/new');
  });

  test('shows error toast when API fails', async ({ page }) => {
    await setupErrorMocks(page, 'generate');

    await createNote(page, testUrls.valid);

    const errorToast = page.locator('text=/Failed to fetch or process the URL/i');
    await expect(errorToast).toBeVisible({ timeout: 5000 });

    const retryHint = page.getByText('This may be temporary. Try again shortly.');
    await expect(retryHint).toBeVisible();


    expect(page.url()).toContain('/new');
  });

  test('shows error toast for invalid API key', async ({ page }) => {
    await setupErrorMocks(page, 'auth');

    await createNote(page, testUrls.valid);

    const errorToast = page.locator('text=/Invalid API key/i');
    await expect(errorToast).toBeVisible({ timeout: 5000 });

    expect(page.url()).toContain('/new');
  });

  test('handles missing API key gracefully', async ({ page }) => {
    await clearBrowserStorage(page);

    // Set a paid model preference (requires API key)
    await setupModelPreferences(page, { generate: 'x-ai/grok-4-fast' });
    await page.goto('/new');

    const urlInput = page.locator('input[type="url"]');
    await urlInput.fill(testUrls.valid);

    const generateBtn = page.locator('button:has-text("Generate Notes")');
    await generateBtn.click();

    const errorToast = page.locator('text=/Add your OpenRouter key in settings or choose a free model./i');
    await expect(errorToast).toBeVisible({ timeout: 5000 });

    expect(page.url()).toContain('/new');
  });

  test('allows retry after error', async ({ page }) => {
    await setupErrorMocks(page, 'generate');

    await createNote(page, testUrls.valid);


    const errorToast = page.locator('text=/Failed to fetch or process the URL/i');
    await expect(errorToast).toBeVisible({ timeout: 5000 });

    await page.route('**/api/url-metadata', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Test Article',
          ogImage: 'https://example.com/image.png',
          url: testUrls.valid,
        }),
      });
    });

    await page.route('**/api/generate', async (route) => {
      const mockResponse = {
        blocks: [
          {
            id: 'block-1',
            title: 'Test Block',
            summary: 'Test summary',
            visualType: 'icon',
          },
        ],
      };

      await route.fulfill({
        status: 200,
        contentType: 'text/plain; charset=utf-8',
        body: `${JSON.stringify(mockResponse)}\n`,
      });
    });

    const generateBtn = page.locator('button:has-text("Generate Notes")');
    await generateBtn.click();

    const noteBoard = page.locator('section[aria-label="Generated visual notes"]');
    await expect(noteBoard).toBeVisible({ timeout: 10000 });
  });

  test('does not crash when navigating during loading', async ({ page }) => {
    await page.route('**/api/url-metadata', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Test',
          ogImage: 'https://example.com/image.png',
        }),
      });
    });

    await page.route('**/api/generate', async (route) => {
      // Delay response to simulate slow API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await route.fulfill({
        status: 200,
        contentType: 'text/plain; charset=utf-8',
        body: '{"blocks":[]}',
      });
    });

    // Act: Start generation
    await createNote(page, testUrls.valid);

    // Immediately navigate away (before response arrives)
    await page.goto('/');

    // Assert: Should not crash, should show home page
    const createNewBtn = page.locator('a[href="/new"]');
    await expect(createNewBtn).toBeVisible();

    // No error toasts (exclude Next.js route announcer)
    const errorToast = page.locator('[role="alert"]:not(#__next-route-announcer__)');
    await expect(errorToast).not.toBeVisible();
  });
});
