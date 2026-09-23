import { NextRequest, NextResponse } from 'next/server';
import { getGalleryProduct } from '@/lib/gallery-data';

// Stands in for an image CDN (Cloudinary/imgix/S3+CloudFront) that resizes
// on request via a `w` query parameter — exactly what the gallery's
// srcset/sizes markup targets. Generating an SVG on the fly keeps the PoC
// runnable offline and makes the "distinct request per breakpoint" behavior
// easy to see in the network tab without depending on a real image host.

const MIN_WIDTH = 32;
const MAX_WIDTH = 1600;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const productId = Number(id);
  const product = getGalleryProduct(productId);
 
  if (!product) {
    return NextResponse.json({ error: 'Unknown image id.' }, { status: 404 });
  }

  const requestedWidth = Number(request.nextUrl.searchParams.get('w') ?? '400');
  const width = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, requestedWidth || 400));
  const height = width; // gallery uses square tiles

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="hsl(${product.hue} 55% 42%)" />
    <text x="50%" y="46%" text-anchor="middle" fill="white" font-family="sans-serif" font-size="${Math.max(12, width / 10)}" font-weight="600">#${product.id}</text>
    <text x="50%" y="60%" text-anchor="middle" fill="white" fill-opacity="0.8" font-family="sans-serif" font-size="${Math.max(10, width / 16)}">${width}×${height}</text>
  </svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
