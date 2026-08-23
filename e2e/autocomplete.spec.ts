import { test, expect } from '@playwright/test';

// The mock nav API (src/lib/autocomplete-mock-utils.ts) deliberately answers
// SHORTER queries more slowly than longer ones — 200ms base + up to ~660ms
// for very short queries + up to 150ms jitter. That's what makes the race
// and cache scenarios below reproduce reliably against the real network
// stack, not just under a controlled unit test with fake timers. All waits
// here are sized generously above that worst case (~1010ms) for the same
// reason.

test.describe('Autocomplete — race condition safety (brief situation 1)', () => {
  test('typing "fac", pausing, then completing to "facebook" shows only the facebook result — even though the server answers "fac" last', async ({
    page,
  }) => {
    await page.goto('/tasks/autocomplete-search');
    const input = page.getByRole('combobox', { name: 'Search the app' });

    await input.fill('fac');
    // Past the 250ms debounce (so the 'fac' request has genuinely started),
    // but well before 'fac's own long simulated delay resolves.
    await page.waitForTimeout(400);
    await input.fill('facebook');
    // Let both responses land, in whichever order the network delivers them.
    await page.waitForTimeout(1800);

    const options = await page.getByRole('option').allTextContents();

    expect(options).toHaveLength(1);
    expect(options[0]).toContain('Facebook Login Integration');
  });
});

test.describe('Autocomplete — client-side cache (brief situation 2)', () => {
  test('backspacing to a previously-fetched query is served from cache, with no new network request', async ({
    page,
  }) => {
    const navRequests: string[] = [];

    page.on('request', (request) => {
      if (request.url().includes('/api/autocomplete/nav')) {
        navRequests.push(request.url());
      }
    });

    await page.goto('/tasks/autocomplete-search');
    const input = page.getByRole('combobox', { name: 'Search the app' });

    await input.fill('sto');
    await page.waitForTimeout(1800); // let the 'sto' fetch fully resolve and get cached

    expect(navRequests).toHaveLength(1);

    await input.fill('stor');
    await page.waitForTimeout(1800); // a distinct query — a second, real request

    expect(navRequests).toHaveLength(2);

    const requestCountBeforeBackspace = navRequests.length;

    await input.fill('sto'); // backspace to the already-cached query
    await page.waitForTimeout(500); // comfortably longer than a real request would take to be observed

    expect(navRequests).toHaveLength(requestCountBeforeBackspace);
    await expect(page.getByRole('option')).toHaveCount(1); // "Storybook Basics" shown, instantly
  });
});

test.describe('Autocomplete — keyboard operability', () => {
  test('ArrowDown navigates and Enter selects the highlighted option', async ({ page }) => {
    await page.goto('/tasks/autocomplete-search');
    const input = page.getByRole('combobox', { name: 'Search the app' });

    await input.fill('a');
    await page.waitForTimeout(1800);

    await input.press('ArrowDown');
    await input.press('ArrowDown');

    const activeId = await input.getAttribute('aria-activedescendant');

    expect(activeId).toBeTruthy();

    const highlighted = page.locator(`[id="${activeId}"]`);

    await expect(highlighted).toHaveAttribute('aria-selected', 'true');
    const highlightedLabel = (await highlighted.textContent())?.trim() ?? '';

    await input.press('Enter');

    await expect(page.getByRole('listbox')).toHaveCount(0);
    const finalValue = await input.inputValue();

    expect(highlightedLabel).toContain(finalValue);
  });

  test('Escape dismisses the dropdown without clearing the typed text', async ({ page }) => {
    await page.goto('/tasks/autocomplete-search');
    const input = page.getByRole('combobox', { name: 'Search the app' });

    await input.fill('billing');
    await page.waitForTimeout(1800);
    await expect(page.getByRole('listbox')).toHaveCount(1);

    await input.press('Escape');

    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(input).toHaveValue('billing');
  });
});

test.describe('Autocomplete — offline handling', () => {
  test('shows an offline message for an uncached query, and retries automatically once connectivity returns', async ({
    page,
    context,
  }) => {
    await page.goto('/tasks/autocomplete-search');
    const input = page.getByRole('combobox', { name: 'Search the app' });

    await context.setOffline(true);
    await page.waitForTimeout(200); // let the browser's 'offline' event reach React state

    await input.fill('billing');
    await page.waitForTimeout(500);

    // Two channels legitimately mention "offline" at once here: the visible
    // dropdown message and the aria-live region announcing it to screen
    // readers — "reconnect" only appears in the visible one, so match on
    // that instead of the ambiguous word "offline" itself.
    await expect(page.getByText(/reconnect/i)).toBeVisible();

    await context.setOffline(false);
    await page.waitForTimeout(1800); // the 'online' listener retries the current query automatically

    await expect(page.getByRole('option')).toHaveCount(1);
  });
});

test.describe('Autocomplete — large result sets', () => {
  test('a 600-match query renders a capped, virtualized list instead of hundreds of DOM nodes', async ({ page }) => {
    await page.goto('/tasks/autocomplete-search');
    const input = page.getByRole('combobox', { name: 'Search products' });

    await input.fill('cat');
    await page.waitForTimeout(1800);

    const renderedOptions = await page.locator('[role="option"]').count();

    expect(renderedOptions).toBeLessThan(30); // virtualized: far fewer nodes than the 600 matches
    await expect(page.getByText('Showing 50 of 600 results — refine your search.')).toBeVisible();
  });
});
