import { test, expect, type Page } from '@playwright/test';

// Image requests go to a real third-party CDN (picsum.photos). Intercept them
// with a 1×1 PNG so the suite is offline-safe and deterministic, while still
// recording exactly which URLs (id + width) the browser decided to fetch.
const PICSUM_URL = /picsum\.photos\/seed\/pdp-(\d+)\/(\d+)\//;
const PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNoaGgAAAMEAYFL09IQAAAAAElFTkSuQmCC',
  'base64',
);

async function stubImageCdn(page: Page) {
  const requests: { id: number; width: number }[] = [];
  await page.route('https://picsum.photos/**', (route) => {
    const match = route.request().url().match(PICSUM_URL);
    if (match) {
      requests.push({ id: Number(match[1]), width: Number(match[2]) });
    }

    return route.fulfill({ contentType: 'image/png', body: PIXEL_PNG });
  });

  return requests;
}

test.describe('Image gallery — lazy loading', () => {
  test('an image at position 150 is not fetched on initial load, and loads once scrolled to', async ({
    page,
  }) => {
    const requests = await stubImageCdn(page);
    const requestedIds = () => new Set(requests.map((r) => r.id));

    await page.goto('/tasks/image-gallery');
    await page.waitForLoadState('networkidle');

    expect(requestedIds().has(150)).toBe(false);
    // Chromium's native lazy-load threshold prefetches a few screens ahead,
    // so this isn't just "the first row" — but it must be well short of the
    // full 200, proving the rest genuinely waits for scroll.
    expect(requestedIds().size).toBeLessThan(150);

    await page.locator('[data-gallery-index="149"]').scrollIntoViewIfNeeded();
    await expect
      .poll(() => requestedIds().has(150), { timeout: 5000 })
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

    await stubImageCdn(page);
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
  test.beforeEach(async ({ page }) => {
    await stubImageCdn(page);
  });

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

test.describe('Image gallery — responsive images', () => {
  test('server-rendered next/image <img> carries the full srcset and a grid-aware sizes', async ({
    request,
  }) => {
    const html = await (await request.get('/tasks/image-gallery')).text();

    // The widths configured in next.config.ts (imageSizes + deviceSizes), one
    // candidate per width, each a CDN URL produced by the custom loader.
    for (const w of [256, 384, 640, 828, 1080, 1200, 1920]) {
      expect(html).toContain(
        `https://picsum.photos/seed/pdp-1/${w}/${w}.webp ${w}w`,
      );
    }
    // Unused defaults are gone.
    for (const w of [32, 128, 750, 3840]) {
      expect(html).not.toContain(`/${w}/${w}.webp ${w}w`);
    }
    expect(html).toContain('sizes="(min-width: 1152px) 174px,');
    expect(html).toContain('calc((100vw - 60px) / 2)');
  });

  test('a phone requests a different width than a desktop for the same tile', async ({
    browser,
  }) => {
    async function requestedWidthFor(
      viewport: { width: number; height: number },
      deviceScaleFactor: number,
    ) {
      const context = await browser.newContext({ viewport, deviceScaleFactor });
      const page = await context.newPage();
      const requests = await stubImageCdn(page);
      await page.goto('/tasks/image-gallery');
      await expect.poll(() => requests.some((r) => r.id === 1)).toBe(true);
      const width = requests.find((r) => r.id === 1)!.width;
      await context.close();

      return width;
    }

    // Desktop @1x: 6 columns → a 174px tile → the 256w candidate.
    const desktop = await requestedWidthFor({ width: 1440, height: 900 }, 1);
    // Phone @3x: 2 columns → ~165 CSS px × 3 device px → ~384–640w.
    const phone = await requestedWidthFor({ width: 390, height: 844 }, 3);

    expect(desktop).toBe(256);
    expect(phone).toBeGreaterThan(desktop);
  });

  test('narrowing past a breakpoint enlarges tiles, fetches a bigger candidate, and the badge follows', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    const requests = await stubImageCdn(page);
    await page.goto('/tasks/image-gallery');

    const badge = page.locator('[data-gallery-index="0"] [data-loaded-size]');
    const img = page.locator('[data-gallery-index="0"] img');
    // 6 columns: 174px tile × 2 → 384w.
    await expect(badge).toHaveText('384w');
    await expect(img).toHaveAttribute('data-loaded-width', '384');

    // 2 columns at 600px: a 270px tile × 2 → 640w. Fewer columns means a
    // *bigger* tile, so a narrower window legitimately needs more pixels.
    await page.setViewportSize({ width: 600, height: 900 });
    await expect
      .poll(() => requests.some((r) => r.id === 1 && r.width === 640))
      .toBe(true);
    await expect(badge).toHaveText('640w');
    await expect(img).toHaveAttribute('data-loaded-width', '640');

    await context.close();
  });
});
