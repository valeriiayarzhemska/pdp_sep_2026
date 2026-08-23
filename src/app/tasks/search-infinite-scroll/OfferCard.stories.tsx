import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import OfferCard from './OfferCard';
import type { OfferWithMeta } from '@/lib/travel-types';

function buildOffer(overrides: Partial<OfferWithMeta> = {}): OfferWithMeta {
  return {
    id: 'hotel-1',
    name: 'Grand Hotel',
    city: 'Lisbon',
    rating: 4.5,
    reviewCount: 812,
    pricePerNight: 128,
    nights: 3,
    refundable: true,
    amenities: ['wifi', 'pool', 'breakfast'],
    checkIn: '2026-09-10',
    checkOut: '2026-09-13',
    priceCheckedAt: Date.now(),
    ...overrides,
  };
}

const meta = {
  title: 'Search/OfferCard',
  component: OfferCard,
  // No `tags: ['autodocs']` here on purpose — OfferCard.mdx is a
  // hand-written docs page for this component instead, to demonstrate
  // that path too (the other two components in this task use autodocs).
  args: {
    offer: buildOffer(),
    isFavorited: false,
    now: Date.now(),
    isRefreshing: false,
    onToggleFavorite: fn(),
    onRefreshPrice: fn(),
  },
  argTypes: {
    isFavorited: { control: 'boolean' },
    isRefreshing: { control: 'boolean' },
    now: { control: false }, // a timestamp isn't meaningful to hand-edit
    offer: { control: 'object' },
  },
} satisfies Meta<typeof OfferCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Favorited: Story = {
  args: { isFavorited: true },
};

export const NoAmenitiesNotRefundable: Story = {
  args: {
    offer: buildOffer({ refundable: false, amenities: ['wifi'] }),
  },
};

// PRICE_STALE_AFTER_MS is 20s in the real app (scaled down from a
// realistic ~10-15 minutes for demo purposes — see travel-types.ts).
// Simulating "now" as far past priceCheckedAt exercises the same
// stale-price badge/refresh affordance without waiting.
export const PriceStale: Story = {
  args: {
    now: Date.now() + 30 * 60 * 1000,
  },
};

export const RefreshingPrice: Story = {
  args: {
    now: Date.now() + 30 * 60 * 1000,
    isRefreshing: true,
  },
};

export const ClickingSaveTogglesFavorite: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const saveButton = canvas.getByTestId('favorite-toggle');

    await expect(saveButton).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(saveButton);

    await expect(args.onToggleFavorite).toHaveBeenCalledWith('hotel-1', true);
  },
};

export const ClickingRefreshReportsTheOfferId: Story = {
  args: {
    now: Date.now() + 30 * 60 * 1000,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const refreshButton = canvas.getByRole('button', { name: 'Refresh price' });

    await userEvent.click(refreshButton);

    await expect(args.onRefreshPrice).toHaveBeenCalledWith('hotel-1');
  },
};
