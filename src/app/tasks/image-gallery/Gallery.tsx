'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import type { GalleryProduct } from '@/lib/gallery-data';
import { GALLERY_TILE_SIZES } from '@/lib/gallery-images';
import GalleryImage from './GalleryImage';
import Lightbox from './Lightbox';

const EAGER_COUNT = 6;

function getColumnCount(): number {
  if (typeof window === 'undefined') {
    return 2;
  }

  if (window.matchMedia('(min-width: 1024px)').matches) {
    return 6;
  }

  if (window.matchMedia('(min-width: 768px)').matches) {
    return 4;
  }

  if (window.matchMedia('(min-width: 640px)').matches) {
    return 3;
  }

  return 2;
}

export default function Gallery({ products }: { products: GalleryProduct[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openAt = useCallback((i: number, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setOpenIndex(i);
  }, []);

  const close = useCallback(() => {
    setOpenIndex(null);
    triggerRef.current?.focus();
  }, []);

  const focusItem = useCallback((i: number) => {
    const el = gridRef.current?.querySelector<HTMLElement>(
      `[data-gallery-index="${i}"]`,
    );

    el?.focus();
  }, []);

  const onImageClick = (e: React.MouseEvent<HTMLAnchorElement>, i: number) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }

    e.preventDefault();
    openAt(i, e.currentTarget);
  };

  const onImageKeyDown = (
    e: React.KeyboardEvent<HTMLAnchorElement>,
    i: number,
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openAt(i, e.currentTarget);

      return;
    }

    const cols = getColumnCount();

    let next: number | null = null;

    if (e.key === 'ArrowRight') {
      next = Math.min(products.length - 1, i + 1);
    } else if (e.key === 'ArrowLeft') {
      next = Math.max(0, i - 1);
    } else if (e.key === 'ArrowDown') {
      next = Math.min(products.length - 1, i + cols);
    } else if (e.key === 'ArrowUp') {
      next = Math.max(0, i - cols);
    }

    if (next !== null && next !== i) {
      e.preventDefault();
      focusItem(next);
    }
  };

  return (
    <>
      <ul
        ref={gridRef}
        role="list"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
      >
        {products.map((product, i) => (
          <li key={product.id} role="listitem">
            <Link
              href={`/tasks/image-gallery/product/${product.id}`}
              data-gallery-index={i}
              className="group relative block aspect-square overflow-hidden rounded-lg bg-neutral-800 outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              onClick={(e) => onImageClick(e, i)}
              onKeyDown={(e) => onImageKeyDown(e, i)}
            >
              <GalleryImage
                productId={product.id}
                alt={product.title}
                sizes={GALLERY_TILE_SIZES}
                eager={i < EAGER_COUNT}
              />

              <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {product.title} · ${product.price}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {openIndex !== null && (
        <Lightbox
          products={products}
          index={openIndex}
          onClose={close}
          onNavigate={setOpenIndex}
        />
      )}
    </>
  );
}
