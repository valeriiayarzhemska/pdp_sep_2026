import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import FiltersBar from './FiltersBar';
import { DEFAULT_FILTERS } from '@/lib/travel-types';

const meta = {
  title: 'Search/FiltersBar',
  component: FiltersBar,
  tags: ['autodocs'],
  args: {
    filters: DEFAULT_FILTERS,
    onFiltersChange: fn(),
  },
} satisfies Meta<typeof FiltersBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActiveFilters: Story = {
  args: {
    filters: {
      maxPrice: 200,
      minRating: 4,
      refundableOnly: true,
      amenities: ['wifi', 'pool'],
    },
  },
};

export const TogglingAnAmenityReportsTheChange: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const wifiCheckbox = canvas.getByLabelText('wifi');

    await userEvent.click(wifiCheckbox);

    await expect(args.onFiltersChange).toHaveBeenCalledWith({
      ...DEFAULT_FILTERS,
      amenities: ['wifi'],
    });
  },
};

export const CheckingRefundableOnlyReportsTheChange: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByLabelText('Refundable only');

    await userEvent.click(checkbox);

    await expect(args.onFiltersChange).toHaveBeenCalledWith({
      ...DEFAULT_FILTERS,
      refundableOnly: true,
    });
  },
};
