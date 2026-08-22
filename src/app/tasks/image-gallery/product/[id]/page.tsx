import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGalleryProduct } from '@/lib/gallery-data';
import GalleryImage from '../../GalleryImage';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getGalleryProduct(Number(id));

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href="/tasks/image-gallery"
        className="text-sm text-neutral-400 hover:text-neutral-200"
      >
        ← Back to gallery
      </Link>

      <div className="mt-4 overflow-hidden rounded-xl border border-neutral-800">
        <div className="relative aspect-square w-full">
          <GalleryImage
            src={String(product.id)}
            alt={product.title}
            fill
            sizes="600px"
            className="object-cover"
            priority
          />
        </div>
      </div>

      <h1 className="mt-5 text-2xl font-semibold text-neutral-100">
        {product.title}
      </h1>

      <p className="mt-1 text-lg text-neutral-300">${product.price}</p>

      <p className="mt-4 text-sm text-neutral-500">
        This is a stub product page — its only purpose here is to prove the
        gallery&apos;s images are real, crawlable, working links (not just
        lightbox triggers), so this route works with JavaScript disabled, in a
        new tab, or shared as a direct URL.
      </p>
    </main>
  );
}
