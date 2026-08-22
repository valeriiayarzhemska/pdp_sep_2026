export function galleryImageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
}): string {
  return `/api/gallery-cdn/${src}?w=${width}`;
}
