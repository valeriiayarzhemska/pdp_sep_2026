import { test, expect } from '@playwright/test';

test.describe('Image gallery — lazy loading', () => {
  test('an image at position 150 is not fetched on initial load, and loads once scrolled to', async ({
    page,
  }) => {
    const requestedIds = new Set<number>();
    page.on('request', (req) => {
      const match = req.url().match(/\/api\/gallery-cdn\/(\d+)/);
      if (match) {
        requestedIds.add(Number(match[1]));
      }
    });

    await page.goto('/tasks/image-gallery');
    await page.waitForLoadState('networkidle');

    expect(requestedIds.has(150)).toBe(false);
    // Chromium's native lazy-load threshold prefetches a few screens ahead,
    // so this isn't just "the first row" — but it must be well short of the
    // full 200, proving the rest genuinely waits for scroll.
    expect(requestedIds.size).toBeLessThan(150);

    await page.locator('[data-gallery-index="149"]').scrollIntoViewIfNeeded();
    await expect
      .poll(() => requestedIds.has(150), { timeout: 5000 })
      .toBe(true);
  });

  test('scrolling through the gallery causes no measurable layout shift', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & {
          hadRecentInput: boolean;
          value: number;
        })[]) {
          if (!entry.hadRecentInput) {
            (window as unknown as { __cls: number }).__cls += entry.value;
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });

    await page.goto('/tasks/image-gallery');
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, 800);
      await page.waitForTimeout(150);
    }

    const cls = await page.evaluate(
      () => (window as unknown as { __cls: number }).__cls,
    );
    expect(cls).toBeLessThan(0.05);
  });
});

test.describe('Image gallery — lightbox', () => {
  test('opens via Enter, traps focus, and returns focus to the trigger on Escape', async ({
    page,
  }) => {
    await page.goto('/tasks/image-gallery');

    const trigger = page.locator('[data-gallery-index="4"]');
    await trigger.focus();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      const stillInside = await page.evaluate(() => {
        const dlg = document.querySelector('[role="dialog"]');

        return dlg ? dlg.contains(document.activeElement) : false;
      });
      expect(stillInside).toBe(true);
    }

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    const isTriggerFocused = await trigger.evaluate(
      (el) => el === document.activeElement,
    );
    expect(isTriggerFocused).toBe(true);
  });

  test('ArrowRight navigates to the next image and updates the counter', async ({
    page,
  }) => {
    await page.goto('/tasks/image-gallery');

    await page.locator('[data-gallery-index="0"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('1 / 200')).toBeVisible();

    await page.keyboard.press('ArrowRight');
    await expect(page.getByText('2 / 200')).toBeVisible();
  });

  test('clicking a tile with cmd/ctrl held does not open the lightbox', async ({
    page,
  }) => {
    await page.goto('/tasks/image-gallery');
    await page
      .locator('[data-gallery-index="0"]')
      .click({ modifiers: ['Control'] });
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});

test.describe('Image gallery — SSR / no-JS fallback', () => {
  test('tiles are real links to product pages in the server-rendered HTML', async ({
    request,
  }) => {
    const res = await request.get('/tasks/image-gallery');
    const html = await res.text();
    expect(html).toContain('href="/tasks/image-gallery/product/1"');
    expect(html).toContain('href="/tasks/image-gallery/product/200"');
  });
});

test.describe('Mock CDN endpoint — /api/gallery-cdn/[id]', () => {
  test('returns a correctly-sized SVG for a known product and requested width', async ({
    request,
  }) => {
    const res = await request.get('/api/gallery-cdn/1?w=300');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/svg+xml');
    const body = await res.text();
    expect(body).toContain('width="300"');
    expect(body).toContain('height="300"');
  });

  test('clamps out-of-range widths instead of failing', async ({ request }) => {
    const res = await request.get('/api/gallery-cdn/1?w=99999');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('width="1600"'); // MAX_WIDTH
  });

  test('404s for an unknown product id', async ({ request }) => {
    const res = await request.get('/api/gallery-cdn/999999');
    expect(res.status()).toBe(404);
  });
});
