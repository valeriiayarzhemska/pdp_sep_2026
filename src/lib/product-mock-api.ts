export type ProductResult = {
  id: string;
  name: string;
  category: string;
  price: number;
};

const CATEGORIES = [
  'Electronics',
  'Home & Kitchen',
  'Sportswear',
  'Books',
  'Toys',
  'Office Supplies',
  'Garden',
  'Beauty',
] as const;

const CATEGORY_COLOR: Record<string, string> = {
  Electronics: '#3b82f6',
  'Home & Kitchen': '#f59e0b',
  Sportswear: '#22c55e',
  Books: '#a855f7',
  Toys: '#ef4444',
  'Office Supplies': '#06b6d4',
  Garden: '#84cc16',
  Beauty: '#ec4899',
};

const ADJECTIVES = [
  'Wireless',
  'Ceramic',
  'Portable',
  'Compact',
  'Rechargeable',
  'Foldable',
  'Adjustable',
  'Insulated',
  'Waterproof',
  'Ergonomic',
];

const NOUNS_BY_CATEGORY: Record<string, string[]> = {
  Electronics: ['Mouse', 'Keyboard', 'Speaker', 'Charger', 'Headphones'],
  'Home & Kitchen': ['Mug', 'Kettle', 'Blender', 'Cutting Board', 'Toaster'],
  Sportswear: [
    'Running Shoes',
    'Yoga Mat',
    'Water Bottle',
    'Gym Bag',
    'Jacket',
  ],
  Books: ['Notebook', 'Planner', 'Bookmark', 'Journal', 'Sketchbook'],
  Toys: [
    'Puzzle',
    'Building Blocks',
    'Board Game',
    'Action Figure',
    'Plush Toy',
  ],
  'Office Supplies': [
    'Stapler',
    'Desk Organizer',
    'Pen Set',
    'Whiteboard',
    'Binder',
  ],
  Garden: [
    'Watering Can',
    'Trowel',
    'Planter Pot',
    'Pruning Shears',
    'Garden Hose',
  ],
  Beauty: [
    'Face Cream',
    'Hair Dryer',
    'Makeup Brush Set',
    'Nail Kit',
    'Perfume',
  ],
};

const DATASET_SIZE = 600;

// Every generated name is prefixed "Catalog:" on purpose — it's how the
// large-result-set demo (searching "cat" reliably returns all 600 items,
// matching the brief's "results for 'cat' contain 500 items" scenario)
// stays deterministic instead of asking a reader to guess a magic query.
function generateProducts(): ProductResult[] {
  return Array.from({ length: DATASET_SIZE }, (_, i) => {
    const category = CATEGORIES[i % CATEGORIES.length];
    const nouns = NOUNS_BY_CATEGORY[category];
    const adjective = ADJECTIVES[i % ADJECTIVES.length];
    const noun = nouns[i % nouns.length];
    const price = 9 + ((i * 37) % 191);

    return {
      id: `product-${i + 1}`,
      name: `Catalog: ${adjective} ${noun}`,
      category,
      price,
    };
  });
}

const PRODUCTS = generateProducts();

export function searchProducts(query: string): ProductResult[] {
  const normalized = query.trim().toLowerCase();

  return PRODUCTS.filter((product) =>
    product.name.toLowerCase().includes(normalized),
  );
}

export function categoryColor(category: string): string {
  return CATEGORY_COLOR[category] ?? '#525252';
}
