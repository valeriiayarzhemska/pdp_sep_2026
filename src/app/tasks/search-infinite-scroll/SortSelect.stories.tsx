import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import SortSelect from './SortSelect';

const meta = {
  title: 'Search/SortSelect',
  component: SortSelect,
  tags: ['autodocs'],
  args: {
    sortKey: 'price',
    onSortChange: fn(),
  },
} satisfies Meta<typeof SortSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Price: Story = {};

export const Rating: Story = {
  args: { sortKey: 'rating' },
};

export const Duration: Story = {
  args: { sortKey: 'duration' },
};

// Play functions run as real interactions in a headless browser (via the
// Vitest addon), not just a snapshot of markup — this is the modern
// replacement for the old "storyshots" addon, which only ever diffed
// rendered output and couldn't exercise behavior like this.
export const ChangingTheSortReportsTheNewKey: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox', { name: 'Sort by' });

    await userEvent.selectOptions(select, 'Rating (high to low)');

    await expect(args.onSortChange).toHaveBeenCalledWith('rating');
  },
};
