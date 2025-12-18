import { type Page, expect } from '@playwright/test';
import {
  mockUrlMetadata,
  mockGenerateResponse,
  mockD2Svg,
  mockGenerateErrorResponse,
  mockAuthErrorResponse,
} from '../fixtures/mock-responses';


export interface MockOptions {
  mockUrlMetadata?: boolean;
  mockGenerate?: boolean;
  mockD2Render?: boolean;
  mockGenerateError?: boolean;


  mockAuthError?: boolean;


  customMetadata?: typeof mockUrlMetadata;


  customGenerate?: typeof mockGenerateResponse;
}


export async function setupSuccessfulNoteMocks(page: Page, options: MockOptions = {}) {
  const {
    mockUrlMetadata: shouldMockMetadata = true,
    mockGenerate: shouldMockGenerate = true,
    mockD2Render: shouldMockD2 = true,
    customMetadata,
    customGenerate,
  } = options;


  if (shouldMockMetadata) {
    await page.route('**/api/url-metadata', async (route) => {
      // Small delay to simulate real API
      await new Promise((resolve) => setTimeout(resolve, 100));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(customMetadata || mockUrlMetadata),
      });
    });
  }


  if (shouldMockGenerate) {
    await page.route('**/api/generate', async (route) => {
      const response = customGenerate || mockGenerateResponse;

      // Add a small delay to simulate real API behavior
      // This makes the loading state observable in tests
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Simulate AI SDK streaming format
      // The AI SDK sends data in a specific streaming format
      const streamData = `${JSON.stringify(response)}\n`;

      await route.fulfill({
        status: 200,
        contentType: 'text/plain; charset=utf-8',
        body: streamData,
      });
    });
  }

  if (shouldMockD2) {
    await page.route('**/api/render-d2', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ svg: mockD2Svg }),
      });
    });
  }
}

export async function setupErrorMocks(page: Page, errorType: 'generate' | 'auth') {
  await page.route('**/api/url-metadata', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockUrlMetadata),
    });
  });

  // Mock generate endpoint to fail
  await page.route('**/api/generate', async (route) => {
    const errorResponse =
      errorType === 'auth' ? mockAuthErrorResponse : mockGenerateErrorResponse;

    await route.fulfill({
      status: errorType === 'auth' ? 401 : 500,
      contentType: 'application/json',
      body: JSON.stringify(errorResponse),
    });
  });
}

/**
 * IMPORTANT: Must be called after navigating to a page
 */
export async function setupApiKey(page: Page, apiKey: string = 'test-api-key-12345') {
  await page.evaluate((key) => {
    localStorage.setItem('openrouter_api_key', key);
  }, apiKey);
}

/**
 * Setup model preferences in localStorage
 * IMPORTANT: Must be called after navigating to a page
 */
export async function setupModelPreferences(
  page: Page,
  models: { generate?: string; deepDive?: string; d2Fix?: string } = {}
) {
  await page.evaluate((prefs) => {
    localStorage.setItem('model_preferences', JSON.stringify(prefs));
  }, models);
}

/**
 * Clear all browser storage (localStorage, IndexedDB, cookies)
 *
 * IMPORTANT: Must be called AFTER navigating to a page
 * localStorage/IndexedDB are only accessible on same-origin pages
 */
export async function clearBrowserStorage(page: Page) {
  const currentUrl = page.url();
  if (!currentUrl.includes('localhost:3000')) {
    await page.goto('/');
  }

  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      indexedDB
        .databases()
        .then((databases) => {
          return Promise.all(
            databases.map((db) => {
              return new Promise<void>((res) => {
                if (db.name) {
                  const deleteRequest = indexedDB.deleteDatabase(db.name);
                  deleteRequest.onsuccess = () => res();
                  deleteRequest.onerror = () => res();
                } else {
                  res();
                }
              });
            })
          );
        })
        .then(() => resolve());
    });
  });
}

/**
 * Wait for note board to finish loading
 */
export async function waitForNoteBoardReady(page: Page) {
  // Wait for board to appear (not loading state)
  await page.waitForSelector('section[aria-label="Generated visual notes"]', {
    timeout: 10000,
  });
}

/**
 * Fill and submit the note generation form
 */
export async function createNote(page: Page, url: string) {
  // Wait for the input to be visible and ready
  const urlInput = page.locator('input[type="url"]');
  await urlInput.waitFor({ state: 'visible' });
  await urlInput.fill(url);

  // Wait for button to be enabled (it's disabled when URL is empty)
  const generateBtn = page.locator('button:has-text("Generate Notes")');
  await generateBtn.waitFor({ state: 'visible' });
  await expect(generateBtn).toBeEnabled();

  // Click the button
  await generateBtn.click();
}
