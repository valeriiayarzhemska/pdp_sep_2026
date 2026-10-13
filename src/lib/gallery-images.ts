import type { ImageLoaderProps } from 'next/image';

// Real photos from Lorem Picsum — a free image CDN that resizes on the fly:
// `/seed/{seed}/{w}/{h}.webp` returns exactly w×h, and the same seed always
// returns the same photo, so every srcset candidate of one product is the
// same picture. The CDN does the resizing, so next/image's own optimizer is
// bypassed and the browser hits the CDN directly. (loader function for resizing)
const CDN_ORIGIN = 'https://picsum.photos';

// next/image custom loader: `src` is the product id; `width` is one of the
// configured device/image sizes, emitted once per srcset candidate.
export function galleryImageLoader({ src, width }: ImageLoaderProps): string {
  return `${CDN_ORIGIN}/seed/pdp-${src}/${width}/${width}.webp`;
}

// Reads the width back out of a URL built by `galleryImageLoader`. Used to
// show which srcset candidate the browser picked: `img.naturalWidth` can't,
// since for `w`-descriptor sources it is density-corrected to CSS pixels.
export function galleryImageWidthFromUrl(url: string): number | null {
  const match = url.match(/\/seed\/[^/]+\/(\d+)\//);

  return match ? Number(match[1]) : null;
}

// `sizes` mirror the real layout so the browser can pick a candidate before
// CSS loads. Grid: `max-w-6xl` (1152px) container, `px-6` (48px total
// padding), `gap-3` (12px) between columns.
export const GALLERY_TILE_SIZES = [
  '(min-width: 1152px) 174px', // 6 cols, container capped: (1104 - 5×12) / 6
  '(min-width: 1024px) calc((100vw - 108px) / 6)',
  '(min-width: 768px) calc((100vw - 84px) / 4)',
  '(min-width: 640px) calc((100vw - 72px) / 3)',
  'calc((100vw - 60px) / 2)', // 2 cols on mobile
].join(', ');

// Lightbox: `max-w-2xl` (672px) panel inside a `p-4` overlay, `p-4` padding.
export const LIGHTBOX_SIZES = '(min-width: 704px) 640px, calc(100vw - 64px)';

// Product page: `max-w-2xl` (672px) main with `px-6`.
export const PRODUCT_PAGE_SIZES = '(min-width: 672px) 624px, calc(100vw - 48px)';
