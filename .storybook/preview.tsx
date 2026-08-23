import type { Decorator, Preview } from '@storybook/nextjs-vite';
import '../src/app/globals.css';

// This repo's real components assume the dark theme applied at the root
// layout (`bg-neutral-950 text-neutral-100`) — without it every story
// would render on Storybook's default white canvas, meaning the a11y
// addon would flag light-text-on-white contrast that never happens in the
// real app.
const withAppTheme: Decorator = (Story) => (
  <div className="min-h-screen bg-neutral-950 p-6 text-neutral-100">
    <Story />
  </div>
);

const preview: Preview = {
  decorators: [withAppTheme],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    backgrounds: {
      default: 'app-dark',
      values: [{ name: 'app-dark', value: '#0a0a0a' }],
    },
    a11y: {
      test: 'todo',
    },
  },
};

export default preview;
