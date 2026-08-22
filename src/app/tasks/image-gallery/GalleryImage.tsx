'use client';

import Image, { type ImageProps } from 'next/image';
import { galleryImageLoader } from '@/lib/gallery-loader';

export default function GalleryImage({
  alt,
  ...props
}: Omit<ImageProps, 'loader'>) {
  return <Image loader={galleryImageLoader} alt={alt} {...props} />;
}
