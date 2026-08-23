export type TaskDefinition = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  status: 'available' | 'planned';
};

export const TASKS: TaskDefinition[] = [
  {
    slug: 'direct-upload',
    title: 'Frontend Direct Attachments Upload',
    category: 'Develop',
    summary:
      'Upload files straight from the browser to storage using presigned URLs, then link the result to a backend record.',
    status: 'available',
  },
  {
    slug: 'image-gallery',
    title: '[PoC] Image Gallery with Lazy Loading',
    category: 'Develop',
    summary:
      'Responsive, lazy-loaded product gallery with a focus-trapped lightbox, zero CLS and SEO-friendly markup.',
    status: 'available',
  },
  {
    slug: 'search-infinite-scroll',
    title: '[PoC] Flight & Hotel Search Results with Infinite Scroll',
    category: 'Develop',
    summary:
      'Cursor-paginated, filterable, virtualized results list with optimistic favorites and scroll restoration.',
    status: 'available',
  },
  {
    slug: 'storybook-basics',
    title: 'Storybook Basics',
    category: 'Develop',
    summary:
      'Component-driven development with Storybook: CSF stories, controls, play functions, a11y and docs addons.',
    status: 'available',
  },
  {
    slug: 'ui-component-libraries',
    title: 'UI Component Libraries',
    category: 'Develop',
    summary:
      'The same component patterns — select, table, modal, date picker, form — built in two different libraries to see what actually transfers.',
    status: 'available',
  },
  {
    slug: 'autocomplete-search',
    title: '[PoC] Autocomplete Search Component',
    category: 'Develop',
    summary:
      'Debounced, race-condition-safe autocomplete with a client-side query cache, full keyboard support, and pluggable result rendering.',
    status: 'available',
  },
];
