import type { ReactNode } from 'react';

export type AutocompleteFetcher<T> = (
  query: string,
  signal: AbortSignal,
) => Promise<T[]>;

export type AutocompleteStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error'
  | 'offline';

export type AutocompleteProps<T> = {
  fetcher: AutocompleteFetcher<T>;
  getOptionId: (option: T) => string;
  getOptionLabel: (option: T) => string;
  renderOption: (option: T, state: { highlighted: boolean }) => ReactNode;
  onSelect?: (option: T) => void;
  placeholder?: string;
  ariaLabel: string;
  debounceMs?: number;
  minChars?: number;
  maxResults?: number;
  cacheTtlMs?: number;
  cacheCapacity?: number;
  className?: string;
};
