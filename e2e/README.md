# E2E Testing Guide

This directory contains end-to-end tests for the Visual Note Generator application using Playwright.

## Overview

The E2E tests validate the complete user journey from entering a URL to viewing the generated visual note board. Tests run against a real browser (Chromium) with the Next.js app running locally.

## Key Concepts

### What We Test

- **User Flows**: Complete journeys (create note → view board → persist data)
- **Error Handling**: API failures, invalid inputs, missing API keys
- **Data Persistence**: IndexedDB operations, reload behavior
- **UI States**: Loading, empty, error, and success states

### What We DON'T Test

- **LLM Output Quality**: That's what evals are for (see `/evals`)
- **Component Internals**: Use unit tests for isolated component logic
- **Styling**: Visual regression is separate (not included)

## Project Structure

```
e2e/
├── fixtures/
│   └── mock-responses.ts    # Mock API responses (deterministic)
├── helpers/
│   └── setup.ts             # Test helpers (mocking, setup utilities)
├── note-creation.spec.ts    # Happy path tests
├── error-handling.spec.ts   # Error scenarios
└── README.md                # This file
```

## Running Tests

### Prerequisites

1. Install dependencies (already done):
   ```bash
   npm install
   npx playwright install chromium
   ```

2. Ensure dev server can start:
   ```bash
   npm run dev
   ```

### Run All Tests

```bash
npm run test:e2e
```

This will:
1. Start the Next.js dev server (port 3000)
2. Run all tests in headless mode
3. Generate an HTML report

### Interactive UI Mode (Recommended for Development)

```bash
npm run test:e2e:ui
```

This opens Playwright's interactive test runner where you can:
- See tests as they run
- Debug failures
- Time-travel through test steps
- Inspect DOM at each step

### Debug Mode

```bash
npm run test:e2e:debug
```

Runs tests in headed mode with Playwright Inspector for step-by-step debugging.

### Watch Specific Test File

```bash
npx playwright test note-creation.spec.ts --headed
```

## How It Works

### The Mocking Strategy

Since we're testing the **application code**, not the **LLM quality**, we mock all external API calls:

```typescript
// We intercept these:
- OpenRouter API calls (LLM)
- URL metadata fetching
- D2 diagram rendering

// We DON'T mock these (they're part of our app):
- React components
- IndexedDB (Dexie)
- Next.js API routes
- Browser APIs
```

### Example Test Flow

```typescript
test('creates note from URL', async ({ page }) => {
  // 1. Setup mocks (deterministic responses)
  await setupSuccessfulNoteMocks(page);

  // 2. User action
  await page.goto('/new');
  await page.fill('input[type="url"]', 'https://example.com');
  await page.click('[data-testid="generate-button"]');

  // 3. Assert what user sees
  await expect(page.locator('section[aria-label="Generated visual notes"]')).toBeVisible();
});
```

### What Gets Tested?

| Layer | Tested? | Why |
|-------|---------|-----|
| React Components | ✅ Yes | Run in real browser |
| API Routes | ✅ Yes | Your code, needs testing |
| IndexedDB | ✅ Yes | Part of UX, needs validation |
| OpenRouter API | ❌ No | External, mocked |
| D2 CLI | ❌ No | External, mocked |

## Test Organization

### note-creation.spec.ts

Tests for successful user flows:
- Creating a note
- Viewing in library
- Data persistence
- Duplicate detection
- Navigation

### error-handling.spec.ts

Tests for failure scenarios:
- API errors (500, network)
- Auth errors (invalid API key)
- Missing API key (BYOK)
- Retry behavior
- Navigation during loading

## Writing New Tests

### Basic Pattern

```typescript
import { test, expect } from '@playwright/test';
import { setupSuccessfulNoteMocks, clearBrowserStorage, setupApiKey } from './helpers/setup';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    // IMPORTANT: Navigate first before accessing storage APIs
    await page.goto('/');

    // Then clear storage and set up API key
    await clearBrowserStorage(page);
    await setupApiKey(page);

    // Navigate again to ensure clean state
    await page.goto('/');
  });

  test('does something', async ({ page }) => {
    // Arrange
    await setupSuccessfulNoteMocks(page);

    // Act
    await page.click('button:has-text("Click Me")');

    // Assert
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

### Selectors Priority

Use selectors in this order (most stable → least stable):

1. **data-testid** (best):
   ```typescript
   page.locator('[data-testid="generate-button"]')
   ```

2. **aria-label** (good):
   ```typescript
   page.locator('section[aria-label="Generated visual notes"]')
   ```

3. **Semantic HTML** (okay):
   ```typescript
   page.locator('input[type="url"]')
   ```

4. **Text content** (fragile, avoid if possible):
   ```typescript
   page.locator('button:has-text("Generate Notes")')
   ```

### Adding Mocks

To add new mock responses:

1. Add to `fixtures/mock-responses.ts`:
   ```typescript
   export const mockNewApiResponse = { ... };
   ```

2. Add helper to `helpers/setup.ts`:
   ```typescript
   export async function setupNewMock(page: Page) {
     await page.route('**/api/new-endpoint', async (route) => {
       await route.fulfill({
         status: 200,
         body: JSON.stringify(mockNewApiResponse),
       });
     });
   }
   ```

3. Use in test:
   ```typescript
   await setupNewMock(page);
   ```

## Debugging Failed Tests

### 1. Check the HTML Report

After running tests, open:
```bash
npx playwright show-report
```

This shows:
- Which tests failed
- Screenshots on failure
- Video recordings
- Full trace

### 2. Use UI Mode

```bash
npm run test:e2e:ui
```

Then click a test to:
- See each step
- Inspect DOM at failure point
- Replay test actions

### 3. Add Debug Logs

```typescript
test('my test', async ({ page }) => {
  console.log('Current URL:', page.url());

  const button = page.locator('[data-testid="my-button"]');
  console.log('Button count:', await button.count());

  await page.pause(); // Opens Playwright Inspector
});
```

### 4. Check for Race Conditions

If tests are flaky:
```typescript
// ❌ Bad - doesn't wait
const text = await page.locator('text=Result').innerText();

// ✅ Good - waits for element
await page.waitForSelector('text=Result');
const text = await page.locator('text=Result').innerText();

// ✅ Better - built-in waiting
await expect(page.locator('text=Result')).toBeVisible();
```

## Common Issues

### "SecurityError: Access is denied for this document"

**Cause**: Trying to access localStorage/IndexedDB before navigating to a page.

**Fix**: Always navigate to a page before calling `clearBrowserStorage()` or `setupApiKey()`:
```typescript
// ❌ Wrong - storage not accessible yet
await clearBrowserStorage(page);
await page.goto('/');

// ✅ Correct - navigate first
await page.goto('/');
await clearBrowserStorage(page);
```

### "Timeout waiting for selector"

**Cause**: Element didn't appear in time.

**Fix**:
1. Check if mock is set up correctly
2. Increase timeout if API is slow
3. Check selector is correct

```typescript
// Increase timeout for slow operations
await page.waitForSelector('text=Result', { timeout: 10000 });
```

### "Element is not visible"

**Cause**: Element exists but CSS hides it.

**Fix**: Use `toBeVisible()` instead of checking element existence:
```typescript
await expect(page.locator('text=Hello')).toBeVisible();
```

### Tests pass locally but fail in CI

**Cause**: Timing differences, different environment.

**Fix**:
1. Add explicit waits
2. Check CI has enough resources
3. Use `retries: 1` in config (already configured)

## Best Practices

### ✅ Do

- Mock all external APIs
- Use `data-testid` for dynamic content
- Wait for elements before interacting
- Test user flows, not implementation
- Keep tests independent (use `beforeEach`)

### ❌ Don't

- Mock your own app code
- Use hardcoded sleeps (`await page.waitForTimeout(5000)`)
- Test styling details
- Make tests depend on each other
- Test LLM output quality (use evals)

## CI Integration

Tests are configured to run in CI with:
- Single worker (no parallelization)
- 1 retry on failure
- HTML reporter

Add to your CI pipeline:
```yaml
# .github/workflows/test.yml
- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Resources

- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [Selectors Guide](https://playwright.dev/docs/selectors)
