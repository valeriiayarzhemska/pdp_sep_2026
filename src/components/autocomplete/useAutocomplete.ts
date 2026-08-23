import { useEffect, useId, useRef, useState } from 'react';
import type { AutocompleteFetcher, AutocompleteStatus } from './types';

const DEFAULT_DEBOUNCE_MS = 250;
const DEFAULT_MIN_CHARS = 1;
const DEFAULT_MAX_RESULTS = 50;
const DEFAULT_CACHE_TTL_MS = 60_000;
const DEFAULT_CACHE_CAPACITY = 50;

type CacheEntry<T> = {
  results: T[];
  fetchedAt: number;
};

type UseAutocompleteOptions<T> = {
  fetcher: AutocompleteFetcher<T>;
  getOptionId: (option: T) => string;
  getOptionLabel: (option: T) => string;
  onSelect?: (option: T) => void;
  debounceMs?: number;
  minChars?: number;
  maxResults?: number;
  cacheTtlMs?: number;
  cacheCapacity?: number;
};

export function useAutocomplete<T>({
  fetcher,
  getOptionId,
  getOptionLabel,
  onSelect,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  minChars = DEFAULT_MIN_CHARS,
  maxResults = DEFAULT_MAX_RESULTS,
  cacheTtlMs = DEFAULT_CACHE_TTL_MS,
  cacheCapacity = DEFAULT_CACHE_CAPACITY,
}: UseAutocompleteOptions<T>) {
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [totalMatched, setTotalMatched] = useState(0);
  const [status, setStatus] = useState<AutocompleteStatus>('idle');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  const cacheRef = useRef(new Map<string, CacheEntry<T>>());
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputValueRef = useRef('');
  const listboxId = `autocomplete-listbox-${useId()}`;

  function readCache(query: string): T[] | null {
    const entry = cacheRef.current.get(query);

    if (!entry) {
      return null;
    }

    if (Date.now() - entry.fetchedAt > cacheTtlMs) {
      cacheRef.current.delete(query);

      return null;
    }

    cacheRef.current.delete(query);
    cacheRef.current.set(query, entry);

    return entry.results;
  }

  function writeCache(query: string, data: T[]) {
    cacheRef.current.set(query, { results: data, fetchedAt: Date.now() });

    if (cacheRef.current.size > cacheCapacity) {
      const oldestKey = cacheRef.current.keys().next().value;

      if (oldestKey !== undefined) {
        cacheRef.current.delete(oldestKey);
      }
    }
  }

  function applyResults(data: T[]) {
    setResults(data.slice(0, maxResults));
    setTotalMatched(data.length);
    setStatus('success');
    setIsOpen(true);
    setHighlightedIndex(-1);
  }

  async function runFetch(query: string) {
    abortRef.current?.abort();
    const controller = new AbortController();

    abortRef.current = controller;
    const myRequestId = ++requestIdRef.current;

    setStatus('loading');

    try {
      const data = await fetcher(query, controller.signal);

      if (myRequestId !== requestIdRef.current) {
        return;
      }

      writeCache(query, data);
      applyResults(data);
    } catch (error) {
      if (myRequestId !== requestIdRef.current) {
        return;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      setStatus('error');
    }
  }

  function cancelInFlight() {
    abortRef.current?.abort();
    requestIdRef.current++;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }

  function handleInputChange(nextValue: string) {
    setInputValue(nextValue);
    inputValueRef.current = nextValue;
    setHighlightedIndex(-1);
    cancelInFlight();

    const trimmed = nextValue.trim();

    if (trimmed.length < minChars) {
      setStatus('idle');
      setResults([]);
      setTotalMatched(0);
      setIsOpen(false);

      return;
    }

    const cached = readCache(trimmed);

    if (cached) {
      applyResults(cached);

      return;
    }

    setIsOpen(true);

    if (!isOnline) {
      setStatus('offline');
      setResults([]);
      setTotalMatched(0);

      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      void runFetch(trimmed);
    }, debounceMs);
  }

  function select(option: T) {
    onSelect?.(option);
    setInputValue(getOptionLabel(option));
    inputValueRef.current = getOptionLabel(option);
    setIsOpen(false);
    setHighlightedIndex(-1);
    cancelInFlight();
  }

  function close() {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown' && !isOpen && results.length > 0) {
      setIsOpen(true);

      return;
    }

    if (!isOpen) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((current) =>
        Math.min(current + 1, results.length - 1),
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === 'Enter') {
      if (highlightedIndex >= 0 && results[highlightedIndex]) {
        event.preventDefault();
        select(results[highlightedIndex]);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  }

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
     
      const trimmed = inputValueRef.current.trim();

      if (trimmed.length >= minChars && !readCache(trimmed)) {
        void runFetch(trimmed);
      }
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    inputValue,
    results,
    totalMatched,
    status,
    isOpen,
    isOnline,
    highlightedIndex,
    listboxId,
    getOptionId,
    handleInputChange,
    handleKeyDown,
    select,
    close,
  };
}
