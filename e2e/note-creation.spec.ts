import { test, expect } from '@playwright/test';
import {
  setupSuccessfulNoteMocks,
  setupApiKey,
  clearBrowserStorage,
  waitForNoteBoardReady,
  createNote,
} from './helpers/setup';
import { testUrls } from './fixtures/mock-responses';

/**
 * E2E Tests: Note Creation Flow
 *
 * Tests the complete user journey from entering a URL to viewing
 * the generated visual note board.
 */

test.describe('Note Creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/new');

    await clearBrowserStorage(page);

    await setupApiKey(page);

    await page.goto('/new');
  });

  test('successfully creates a note from valid URL', async ({ page }) => {
    await setupSuccessfulNoteMocks(page);

    //Fill form and submit
    await createNote(page, testUrls.valid);


    const loadingButton = page.locator('button:has-text("Sketching notes...")');
    await expect(loadingButton).toBeVisible({ timeout: 2000 });

    await waitForNoteBoardReady(page);

    const noteBoard = page.locator('section[aria-label="Generated visual notes"]');
    await expect(noteBoard).toBeVisible();

    expect(page.url()).toContain('/new');

    await expect(page.locator('text=React Server Components Overview')).toBeVisible();
  });

  test('shows validation error for invalid URL', async ({ page }) => {
    await setupSuccessfulNoteMocks(page);

    const urlInput = page.locator('input[type="url"]');
    await urlInput.fill(testUrls.invalid);

    const generateBtn = page.locator('button:has-text("Generate Notes")');
    await expect(generateBtn).toBeEnabled();


    await generateBtn.click();

    expect(page.url()).toContain('/new');

  });

  test('displays note in library after creation', async ({ page }) => {
    await setupSuccessfulNoteMocks(page);

    await createNote(page, testUrls.valid);
    await waitForNoteBoardReady(page);

    await page.goto('/');


    const noteCard = page.locator('text=Understanding React Server Components');
    await expect(noteCard).toBeVisible();


    await noteCard.click();

    await expect(page).toHaveURL(/\/notes\/.+/);

    await waitForNoteBoardReady(page);
    await expect(page.locator('text=React Server Components Overview')).toBeVisible();
  });


  test('handles duplicate URL gracefully', async ({ page }) => {
    await setupSuccessfulNoteMocks(page);

    await createNote(page, testUrls.duplicate);
    await waitForNoteBoardReady(page);

    await page.goto('/new');
    await setupSuccessfulNoteMocks(page);

    const urlInput = page.locator('input[type="url"]');
    await urlInput.fill(testUrls.duplicate);

    const generateBtn = page.locator('button:has-text("Generate Notes")');
    await generateBtn.click();

    const toast = page.locator('text=A note already exists for this URL');
    await expect(toast).toBeVisible({ timeout: 5000 });

    const viewNoteBtn = page.locator('button:has-text("View Note")');
    await expect(viewNoteBtn).toBeVisible();


    await viewNoteBtn.click();
    await expect(page).toHaveURL(/\/notes\/.+/);
  });

  test('home navigation button works', async ({ page }) => {
    const homeLink = page.locator('a[href="/"]');
    await homeLink.click();

    await expect(page).toHaveURL('/');
  });
});
