export type NavResult = {
  id: string;
  label: string;
  path: string;
};

// Deliberately includes several "fac..." entries so the header-search demo
// can reproduce the brief's exact race scenario: 'fac' matches three items,
// 'facebook' narrows to one.
const NAV_ITEMS: NavResult[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/' },
  {
    id: 'direct-upload',
    label: 'Frontend Direct Attachments Upload',
    path: '/tasks/direct-upload',
  },
  {
    id: 'image-gallery',
    label: 'Image Gallery with Lazy Loading',
    path: '/tasks/image-gallery',
  },
  {
    id: 'search',
    label: 'Flight & Hotel Search Results with Infinite Scroll',
    path: '/tasks/search-infinite-scroll',
  },
  {
    id: 'storybook',
    label: 'Storybook Basics',
    path: '/tasks/storybook-basics',
  },
  {
    id: 'ui-libraries',
    label: 'UI Component Libraries',
    path: '/tasks/ui-component-libraries',
  },
  {
    id: 'autocomplete',
    label: '[PoC] Autocomplete Search Component',
    path: '/tasks/autocomplete-search',
  },
  {
    id: 'facebook-integration',
    label: 'Facebook Login Integration',
    path: '/settings/integrations/facebook',
  },
  {
    id: 'facial-recognition',
    label: 'Facial Recognition Settings',
    path: '/settings/security/facial-recognition',
  },
  {
    id: 'factory-reset',
    label: 'Factory Reset',
    path: '/settings/danger-zone/factory-reset',
  },
  { id: 'faq', label: 'FAQ & Help Center', path: '/help/faq' },
  { id: 'billing', label: 'Billing & Invoices', path: '/settings/billing' },
  { id: 'team-settings', label: 'Team Settings', path: '/settings/team' },
  { id: 'api-keys', label: 'API Keys', path: '/settings/api-keys' },
  {
    id: 'notifications',
    label: 'Notification Preferences',
    path: '/settings/notifications',
  },
];

export function searchNavItems(query: string): NavResult[] {
  const normalized = query.trim().toLowerCase();

  return NAV_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(normalized),
  );
}
