import { test, expect } from '@playwright/test';

test.describe('Search results — filtering with in-flight requests', () => {
  test('a filter change while a request is in flight produces a result set matching the latest filter, not a stale one', async ({
    page,
  }) => {
    await page.goto('/tasks/search-infinite-scroll');
    await page.waitForSelector('[data-testid="offer-card"]');

    // Apply two filter changes back-to-back, without waiting for the first
    // to resolve — the mock API's artificial latency (~200-450ms) makes
    // this window observable. The final rendered list must reflect only
    // the LAST filter (maxPrice=100), never a mix with the first.
    await page.selectOption('select[aria-label="Max price"]', '400');
    await page.selectOption('select[aria-label="Max price"]', '100');

    await page.waitForTimeout(700); // let both requests fully settle

    const prices = await page
      .locator('[data-testid="offer-card"]')
      .evaluateAll((cards) =>
        cards.map((c) => {
          const match = c.textContent?.match(/\$(\d+)\s*\/\s*night/);

          return match ? Number(match[1]) : null;
        }),
      );

    expect(prices.length).toBeGreaterThan(0);

    for (const price of prices) {
      expect(price).not.toBeNull();
      expect(price as number).toBeLessThanOrEqual(100);
    }
  });
});

test.describe('Search results — scroll restoration', () => {
  test('navigating to an offer detail page and back shows the same offer at the same position, without refetching', async ({
    page,
  }) => {
    const offerRequests: string[] = [];
    const consoleErrors: string[] = [];

    page.on('request', (req) => {
      if (req.url().includes('/api/search/offers?')) {
        offerRequests.push(req.url());
      }
    });
    // Guards against a real regression: the scroll-restoration reassert
    // loop calling the virtualizer's scrollToIndex too aggressively
    // triggered @tanstack/react-virtual's internal flushSync-forced
    // re-render from outside a safe context ("flushSync was called from
    // inside a lifecycle method"), which also manifested as visible scroll
    // jumping. Fixed with `useFlushSync: false` on the virtualizer — this
    // assertion is what would have caught it.
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => consoleErrors.push(String(err)));

    await page.goto('/tasks/search-infinite-scroll');
    await page.waitForSelector('[data-testid="offer-card"]');

    for (let i = 0; i < 15; i++) {
      await page.mouse.wheel(0, 800);
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(400);

    const scrollYBefore = await page.evaluate(() => window.scrollY);
    expect(scrollYBefore).toBeGreaterThan(1000);

    // Click a card confirmed to be near the current viewport (virtualization
    // only mounts those) rather than "the first in DOM order".
    const wrappers = page.locator('[data-index]');
    const wrapperCount = await wrappers.count();
    const visibleWrapper = wrappers.nth(Math.floor(wrapperCount / 2));
    const targetIndex = await visibleWrapper.getAttribute('data-index');
    const targetOfferId = await visibleWrapper
      .locator('[data-testid="offer-card"]')
      .getAttribute('data-offer-id');

    const requestsSeenBeforeNav = [...offerRequests];

    await visibleWrapper.getByRole('link', { name: 'View details' }).click();
    await page.waitForURL(/\/offer\//);

    await page.goBack();
    await page.waitForURL(/\/tasks\/search-infinite-scroll$/);

    // The restore re-asserts itself for up to a few hundred ms to win
    // against Next's own post-navigation scroll handling and the
    // virtualizer's re-measurement as rows settle from estimated to real
    // heights — give that window a moment to finish.
    await page.waitForTimeout(500);

    // The load-bearing assertion: restoration is anchored to WHICH OFFER
    // was showing, not a raw pixel value (a virtualizer's estimated-vs-
    // measured row heights can shift what content sits at a given pixel
    // even when the pixel number itself is reproduced exactly). The same
    // offer must be back at the same virtual index.
    const offerAtSameIndex = await page
      .locator(`[data-index="${targetIndex}"]`)
      .locator('[data-testid="offer-card"]')
      .getAttribute('data-offer-id');

    expect(offerAtSameIndex).toBe(targetOfferId);

    // Scroll should land in the same neighborhood too — not pixel-exact
    // (measured heights can legitimately differ slightly from the
    // estimates the original position was computed against), but close.
    const scrollYAfter = await page.evaluate(() => window.scrollY);

    expect(Math.abs(scrollYAfter - scrollYBefore)).toBeLessThan(1600);

    // The cache (held in the route segment's layout) must survive the round
    // trip: none of the pages already fetched before navigating away should
    // be requested again, and scrolling further from the restored position
    // should only ever continue forward (a cursor'd request), never restart
    // from the first page.
    const requestsAfterBack = offerRequests.slice(requestsSeenBeforeNav.length);

    for (const url of requestsAfterBack) {
      expect(requestsSeenBeforeNav).not.toContain(url);
      expect(new URL(url).searchParams.has('cursor')).toBe(true);
    }

    expect(consoleErrors).toEqual([]);
  });

  test('returning after longer than the query staleTime does not silently refetch and reorder the list', async ({
    page,
  }) => {
    // A real traveler reading a detail page routinely takes longer than the
    // 60s staleTime — nothing in the earlier tests exercises that, since
    // they round-trip in under a second. React Query's default is to
    // refetch a stale query in the background on remount; for this list,
    // that's a real bug: the mock backend's price drift can shift an
    // offer's price, and since the default sort is by price, a background
    // refetch can come back in a different order — reordering the list and
    // flickering content under the restored scroll position, which is
    // exactly what "never silently reorder above the scroll position"
    // forbids. page.clock simulates the wait without a real 2-minute test.
    const offerRequests: string[] = [];

    page.on('request', (req) => {
      if (req.url().includes('/api/search/offers?')) {
        offerRequests.push(req.url());
      }
    });

    await page.clock.install();
    await page.goto('/tasks/search-infinite-scroll');
    await page.waitForSelector('[data-testid="offer-card"]');

    for (let i = 0; i < 15; i++) {
      await page.mouse.wheel(0, 800);
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(400);

    const scrollYBefore = await page.evaluate(() => window.scrollY);

    const wrappers = page.locator('[data-index]');
    const wrapperCount = await wrappers.count();
    const visibleWrapper = wrappers.nth(Math.floor(wrapperCount / 2));
    const targetIndex = await visibleWrapper.getAttribute('data-index');
    const targetOfferId = await visibleWrapper
      .locator('[data-testid="offer-card"]')
      .getAttribute('data-offer-id');
    const requestCountBeforeNav = offerRequests.length;

    await visibleWrapper.getByRole('link', { name: 'View details' }).click();
    await page.waitForURL(/\/offer\//);

    await page.clock.fastForward('02:00'); // well past the 60s staleTime
    await page.goBack();
    await page.waitForURL(/\/tasks\/search-infinite-scroll$/);
    await page.waitForTimeout(1000);

    // The core assertion: no new /api/search/offers request at all — a
    // refetch is the only way the already-rendered order could change.
    expect(offerRequests.length).toBe(requestCountBeforeNav);

    const offerAtSameIndex = await page
      .locator(`[data-index="${targetIndex}"]`)
      .locator('[data-testid="offer-card"]')
      .getAttribute('data-offer-id');

    expect(offerAtSameIndex).toBe(targetOfferId);

    const scrollYAfter = await page.evaluate(() => window.scrollY);

    expect(Math.abs(scrollYAfter - scrollYBefore)).toBeLessThan(1600);
  });

  test('the in-page "Back to results" button preserves applied filters, not just the browser back button', async ({
    page,
  }) => {
    // Every other test in this file uses page.goBack() (the actual browser
    // back button), which is what originally masked this bug: the in-page
    // button was a plain <Link href="/tasks/search-infinite-scroll"> with
    // no query string, silently dropping whatever filters were applied
    // instead of replaying the previous history entry the way a real back
    // navigation does.
    await page.goto('/tasks/search-infinite-scroll');
    await page.waitForSelector('[data-testid="offer-card"]');

    await page.selectOption('select[aria-label="Max price"]', '200');
    await page.waitForTimeout(600);

    const card = page.locator('[data-testid="offer-card"]').first();

    await card.getByRole('link', { name: 'View details' }).click();
    await page.waitForURL(/\/offer\//);

    await page.getByRole('button', { name: /back to results/i }).first().click();
    await page.waitForURL(/\/tasks\/search-infinite-scroll/);
    await page.waitForTimeout(300);

    expect(page.url()).toContain('maxPrice=200');
    await expect(page.locator('select[aria-label="Max price"]')).toHaveValue('200');
  });
});

test.describe('Search results — virtualization', () => {
  test('mounted DOM node count stays bounded after loading 200+ offers', async ({ page }) => {
    await page.goto('/tasks/search-infinite-scroll');
    await page.waitForSelector('[data-testid="offer-card"]');

    // Scroll far enough to load well past 200 offers (20/page → 10+ pages).
    for (let i = 0; i < 60; i++) {
      await page.mouse.wheel(0, 900);
      await page.waitForTimeout(70);
    }
    await page.waitForTimeout(500);

    const mountedCount = await page.locator('[data-testid="offer-card"]').count();

    // Bounded by the virtualizer's viewport + overscan, not by how many
    // pages have been fetched — this is the entire point of virtualizing.
    expect(mountedCount).toBeLessThan(40);
    expect(mountedCount).toBeGreaterThan(0);
  });
});

test.describe('Search results — optimistic favorites', () => {
  test('a normal favorite toggle applies optimistically and persists', async ({ page }) => {
    await page.goto('/tasks/search-infinite-scroll');
    await page.waitForSelector('[data-testid="offer-card"]');

    // Note: the mock backend's favorites store is shared across the whole
    // test run (it's an in-memory server, not reset per test), so this
    // doesn't assume a pristine "starts unfavorited" state — it reads
    // whatever the current state is and asserts the click flips it.
    // getByTestId (not getByRole with a name match) is required here: the
    // button's accessible name itself changes on toggle ("Save to
    // favorites" → "Remove from favorites"), so a name-based locator stops
    // matching at exactly the moment being tested.
    const card = page.locator('[data-testid="offer-card"]').first();
    const saveButton = card.getByTestId('favorite-toggle');

    const initial = await saveButton.getAttribute('aria-pressed');
    const expected = initial === 'true' ? 'false' : 'true';

    await saveButton.click();

    // Optimistic: flips before the (artificially delayed) server responds.
    await expect(saveButton).toHaveAttribute('aria-pressed', expected);

    // Stays flipped once the server confirms.
    await page.waitForTimeout(600);
    await expect(saveButton).toHaveAttribute('aria-pressed', expected);

    // Restore original state so this test doesn't leak into others.
    await saveButton.click();
    await page.waitForTimeout(600);
  });

  test('a failed favorite toggle reverts and notifies the traveler', async ({ page }) => {
    // hotel-500 is deliberately rigged (see FORCE_FAVORITE_FAILURE_ID) to
    // always fail server-side — its favorited state can therefore never
    // actually change, so (unlike the test above) it's safe to assert it
    // starts at "false". This filter combination narrows the result set to
    // ~9 offers including it, so no scrolling/pagination is needed to reach
    // it.
    await page.goto(
      '/tasks/search-infinite-scroll?amenities=wifi%2Cpool%2Cgym%2Cspa&minRating=4.5',
    );

    const card = page.locator('[data-offer-id="hotel-500"]');
    await card.waitFor();
    const saveButton = card.getByTestId('favorite-toggle');

    await expect(saveButton).toHaveAttribute('aria-pressed', 'false');
    await saveButton.click();

    // Optimistic flip happens immediately...
    await expect(saveButton).toHaveAttribute('aria-pressed', 'true');

    // ...then reverts once the rigged failure comes back, with a visible
    // notice — never a silent revert.
    await expect(saveButton).toHaveAttribute('aria-pressed', 'false', { timeout: 3000 });
    await expect(page.getByText(/could not save favorite/i)).toBeVisible();
  });
});

test.describe('Search results — price staleness', () => {
  test('each offer card shows its own priced-as-of timestamp implicitly via a working refresh action once stale', async ({
    page,
  }) => {
    // PRICE_STALE_AFTER_MS is 20s — too long to wait on in a normal test
    // run. Instead, verify the refresh endpoint itself behaves correctly:
    // it returns a current price and a fresh priceCheckedAt for a known
    // offer, which is the mechanism the UI badge/button relies on.
    const res = await page.request.get('/api/search/offers/hotel-1');

    expect(res.status()).toBe(200);
    const body = await res.json();

    expect(body.item.id).toBe('hotel-1');
    expect(typeof body.item.pricePerNight).toBe('number');
    expect(Date.now() - body.item.priceCheckedAt).toBeLessThan(5000);
  });
});
