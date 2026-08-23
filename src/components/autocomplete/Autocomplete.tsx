'use client';

import { useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useAutocomplete } from './useAutocomplete';
import type { AutocompleteProps } from './types';

const ROW_HEIGHT = 44;
const MAX_LISTBOX_HEIGHT = 320;

function announcement<T>(params: {
  status: string;
  isOnline: boolean;
  totalMatched: number;
  results: T[];
  highlightedIndex: number;
  getOptionLabel: (option: T) => string;
}): string {
  const {
    status,
    isOnline,
    totalMatched,
    results,
    highlightedIndex,
    getOptionLabel,
  } = params;

  if (status === 'offline' || (status === 'error' && !isOnline)) {
    return "You're offline. Showing cached results only.";
  }

  if (status === 'error') {
    return 'Something went wrong loading results.';
  }

  if (status === 'loading') {
    return 'Searching…';
  }

  if (status !== 'success') {
    return '';
  }

  const countText = `${totalMatched} result${totalMatched === 1 ? '' : 's'} available.`;

  if (highlightedIndex < 0 || !results[highlightedIndex]) {
    return countText;
  }

  return `${countText} ${getOptionLabel(results[highlightedIndex])}, ${highlightedIndex + 1} of ${results.length}, highlighted.`;
}

export function Autocomplete<T>({
  fetcher,
  getOptionId,
  getOptionLabel,
  renderOption,
  onSelect,
  placeholder,
  ariaLabel,
  debounceMs,
  minChars,
  maxResults,
  cacheTtlMs,
  cacheCapacity,
  className,
}: AutocompleteProps<T>) {
  const {
    inputValue,
    results,
    totalMatched,
    status,
    isOpen,
    isOnline,
    highlightedIndex,
    listboxId,
    handleInputChange,
    handleKeyDown,
    select,
    close,
  } = useAutocomplete({
    fetcher,
    getOptionId,
    getOptionLabel,
    onSelect,
    debounceMs,
    minChars,
    maxResults,
    cacheTtlMs,
    cacheCapacity,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollParentRef = useRef<HTMLUListElement>(null);

  const virtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 6,
  });

  useEffect(() => {
    if (highlightedIndex >= 0) {
      virtualizer.scrollToIndex(highlightedIndex, { align: 'auto' });
    }
  }, [highlightedIndex, virtualizer]);

  function handleBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      close();
    }
  }

  const showDropdown =
    isOpen &&
    (results.length > 0 ||
      status === 'loading' ||
      status === 'error' ||
      status === 'offline' ||
      status === 'success'); // success + zero results is the "no matches" empty state below
  const activeOptionId =
    highlightedIndex >= 0 && results[highlightedIndex]
      ? `${listboxId}-option-${getOptionId(results[highlightedIndex])}`
      : undefined;

  return (
    <div
      ref={containerRef}
      onBlur={handleBlur}
      className={className ?? 'relative w-full max-w-md'}
    >
      <input
        type="text"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeOptionId}
        aria-label={ariaLabel}
        value={inputValue}
        placeholder={placeholder}
        onChange={(event) => handleInputChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (results.length > 0) {
            handleInputChange(inputValue);
          }
        }}
        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-blue-500"
      />

      <div role="status" aria-live="polite" className="sr-only">
        {announcement({
          status,
          isOnline,
          totalMatched,
          results,
          highlightedIndex,
          getOptionLabel,
        })}
      </div>

      {showDropdown && (
        <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 shadow-xl">
          {status === 'loading' && results.length === 0 && (
            <p className="px-3 py-3 text-sm text-neutral-400">Searching…</p>
          )}

          {status === 'error' && (
            <p className="px-3 py-3 text-sm text-red-400">
              Something went wrong loading results.
            </p>
          )}

          {status === 'offline' && (
            <p className="px-3 py-3 text-sm text-amber-400">
              You&apos;re offline — reconnect to search for &quot;
              {inputValue.trim()}&quot;.
            </p>
          )}

          {status === 'success' && results.length === 0 && (
            <div className="flex flex-col items-center gap-1.5 px-3 py-6 text-center">
              <span className="text-2xl" aria-hidden="true">
                🔍
              </span>
              <p className="text-sm text-neutral-300">
                No results for &quot;{inputValue.trim()}&quot;
              </p>
              <p className="text-xs text-neutral-500">Try a different search term.</p>
            </div>
          )}

          {results.length > 0 && (
            <ul
              ref={scrollParentRef}
              role="listbox"
              id={listboxId}
              style={{ maxHeight: MAX_LISTBOX_HEIGHT, overflowY: 'auto' }}
            >
              <li
                style={{
                  height: virtualizer.getTotalSize(),
                  position: 'relative',
                }}
              >
                {virtualizer.getVirtualItems().map((virtualRow) => {
                  const option = results[virtualRow.index];
                  const optionId = `${listboxId}-option-${getOptionId(option)}`;
                  const highlighted = virtualRow.index === highlightedIndex;

                  return (
                    <div
                      key={optionId}
                      id={optionId}
                      role="option"
                      aria-selected={highlighted}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => select(option)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: virtualRow.size,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      className={`cursor-pointer px-3 ${highlighted ? 'bg-blue-500/20' : ''}`}
                    >
                      {renderOption(option, { highlighted })}
                    </div>
                  );
                })}
              </li>
            </ul>
          )}

          {totalMatched > results.length && (
            <p className="border-t border-neutral-800 px-3 py-2 text-xs text-neutral-500">
              Showing {results.length} of {totalMatched} results — refine your
              search.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
