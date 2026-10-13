import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Every `next/image` with `sizes` gets one srcset candidate per width in
    // imageSizes + deviceSizes. Trimmed to what the layouts can use at 1–3×
    // DPR: gallery tiles (~130–290 CSS px) and the lightbox / product page
    // (up to 640 CSS px). The default 15 widths only bloat the HTML.
    imageSizes: [256, 384],
    deviceSizes: [640, 828, 1080, 1200, 1920],
  },
};

export default nextConfig;
