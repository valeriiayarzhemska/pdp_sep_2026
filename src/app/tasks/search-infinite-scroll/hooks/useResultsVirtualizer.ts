'use client';

import { useEffect, useRef, useState } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';

export function useResultsVirtualizer(count: number) {
  const listRef = useRef<HTMLDivElement>(null);

  const [scrollMargin, setScrollMargin] = useState(0);

  useEffect(() => {
    if (listRef.current) {
      setScrollMargin(listRef.current.offsetTop);
    }
  }, []);

  const virtualizer = useWindowVirtualizer({
    count,
    estimateSize: () => 176,
    overscan: 6,
    scrollMargin,
    // The scroll-restoration reassert loop calls scrollToIndex up to 60
    // times/second for a few seconds. Left on the library's default, every
    // one of those triggers a synchronous flushSync-forced re-render
    // internally — which collides with React's own render cycle
    // ("flushSync was called from inside a lifecycle method") and visibly
    // manifests as the scroll jumping instead of settling smoothly. A
    // normal batched re-render is exactly as correct here and doesn't
    // fight React.
    useFlushSync: false,
  });

  const virtualizerRef = useRef(virtualizer);

  useEffect(() => {
    virtualizerRef.current = virtualizer;
  });

  return {
    listRef,
    virtualizer,
    virtualizerRef,
    virtualItems: virtualizer.getVirtualItems(),
  };
}
