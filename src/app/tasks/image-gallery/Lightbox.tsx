'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { getImageProps } from 'next/image';
import type { GalleryProduct } from '@/lib/gallery-data';
import { galleryImageLoader, LIGHTBOX_SIZES } from '@/lib/gallery-images';
import GalleryImage from './GalleryImage';

function focusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

export default function Lightbox({
  products,
  index,
  onClose,
  onNavigate,
}: {
  products: GalleryProduct[];
  index: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const product = products[index];

  // Focus trap + keyboard navigation. Runs on every open/index change so the
  // "Tab wraps at the edges" check always reflects the current content.
  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    const [first] = focusableElements(dialog);
    first?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();

        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNavigate((index + 1) % products.length);

        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onNavigate((index - 1 + products.length) % products.length);

        return;
      }

      if (e.key === 'Tab' && dialog) {
        const items = focusableElements(dialog);

        if (items.length === 0) {
          return;
        }

        const firstEl = items[0];
        const lastEl = items[items.length - 1];

        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [index, products.length, onClose, onNavigate]);

  // Preload the neighbors a keyboard user is likely to arrow to next, using
  // a real <link rel="preload">, not just rendering a hidden <img> (which
  // browsers may skip fetching if it never gets a layout box). The preload
  // carries the srcset/sizes next/image generates for the lightbox <Image>
  // (via getImageProps), so the browser picks the identical candidate and
  // the preloaded bytes are actually reused.
  useEffect(() => {
    const neighborIds = [
      products[(index - 1 + products.length) % products.length]?.id,
      products[(index + 1) % products.length]?.id,
    ].filter((id): id is number => id !== undefined);

    const links = neighborIds.map((id) => {
      const { props } = getImageProps({
        loader: galleryImageLoader,
        src: String(id),
        alt: '',
        fill: true,
        sizes: LIGHTBOX_SIZES,
      });
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.imageSrcset = props.srcSet ?? '';
      link.imageSizes = props.sizes ?? '';
      link.href = props.src;
      document.head.appendChild(link);

      return link;
    });

    return () => links.forEach((link) => link.remove());
  }, [index, products]);

  if (!product) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={product.title}
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-2xl flex-col gap-4 rounded-xl bg-neutral-900 p-4"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-lg">
          <GalleryImage
            key={product.id}
            productId={product.id}
            alt={product.title}
            sizes={LIGHTBOX_SIZES}
            eager
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-medium text-neutral-100">{product.title}</p>
            <p className="text-sm text-neutral-400">${product.price}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/tasks/image-gallery/product/${product.id}`}
              className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:border-neutral-500"
            >
              View full details
            </Link>

            <button
              onClick={onClose}
              aria-label="Close preview"
              className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:border-neutral-500"
            >
              Close
            </button>
          </div>
        </div>

        <p className="text-xs text-neutral-500">
          {index + 1} / {products.length} · ← / → to browse · Esc to close
        </p>
      </div>
    </div>
  );
}
