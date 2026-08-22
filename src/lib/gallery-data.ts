export type GalleryProduct = {
  id: number;
  title: string;
  price: number;
  hue: number;
};

export const GALLERY_SIZE = 200;

export const GALLERY_PRODUCTS: GalleryProduct[] = Array.from(
  { length: GALLERY_SIZE },
  (_, i) => {
    const id = i + 1;

    return {
      id,
      title: `Trail Runner ${id}`,
      price: 59 + ((id * 7) % 141),
      hue: (id * 47) % 360,
    };
  },
);

export function getGalleryProduct(id: number): GalleryProduct | undefined {
  return GALLERY_PRODUCTS.find((p) => p.id === id);
}
