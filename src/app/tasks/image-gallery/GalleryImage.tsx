'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import {
  galleryImageLoader,
  galleryImageWidthFromUrl,
} from '@/lib/gallery-images';

export default function GalleryImage({
  productId,
  alt,
  sizes,
  eager = false,
}: {
  productId: number;
  alt: string;
  sizes: string;
  eager?: boolean;
}) {
  const [loadedWidth, setLoadedWidth] = useState<number | null>(null);

  const trackWidth = useCallback((img: HTMLImageElement | null) => {
    if (!img) {
      return;
    }

    const record = () => {
      const width = galleryImageWidthFromUrl(img.currentSrc);

      if (width !== null) {
        img.dataset.loadedWidth = String(width);
        setLoadedWidth(width);
      }
    };

    if (img.complete && img.currentSrc) {
      record();
    }

    img.addEventListener('load', record);

    return () => img.removeEventListener('load', record);
  }, []);

  return (
    <>
      <Image
        loader={galleryImageLoader}
        src={String(productId)}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover"
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        ref={trackWidth}
      />

      {loadedWidth !== null && (
        <span
          aria-hidden="true"
          data-loaded-size={`${loadedWidth}w`}
          className="pointer-events-none absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-white"
        >
          {loadedWidth}w
        </span>
      )}
    </>
  );
}
