'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactVirtualizer, VirtualItem } from '@tanstack/react-virtual';

const SCROLL_STORAGE_KEY = 'search-infinite-scroll:scrollPosition';

type SavedScrollPosition = { index: number; offset: number };

function readSavedScrollPosition(): SavedScrollPosition | null {
  const raw = sessionStorage.getItem(SCROLL_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSavedScrollPosition(): void {
  sessionStorage.removeItem(SCROLL_STORAGE_KEY);
}

export function useScrollRestoration({
  virtualItems,
  virtualizerRef,
  resultOrderLength,
}: {
  virtualItems: VirtualItem[];
  virtualizerRef: React.RefObject<ReactVirtualizer<Window, Element>>;
  resultOrderLength: number;
}) {
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  const hasTriggeredScrollRestore = useRef(false);
  const [readyToRestoreScroll, setReadyToRestoreScroll] = useState(false);

  useEffect(() => {
    if (hasTriggeredScrollRestore.current || resultOrderLength === 0) {
      return;
    }

    hasTriggeredScrollRestore.current = true;
    setReadyToRestoreScroll(true);
  }, [resultOrderLength]);

  useEffect(() => {
    if (!readyToRestoreScroll) {
      return;
    }

    const saved = readSavedScrollPosition();

    if (!saved) {
      return;
    }

    const { index: targetIndex, offset: targetOffset } = saved;

    let cancelled = false;
    let rafId: number;
    let lastScrollY = -1;
    let stableFrames = 0;
    const REQUIRED_STABLE_FRAMES = 15;
    const HARD_CAP_MS = 4000;
    const startedAt = performance.now();

    function cancel() {
      cancelled = true;
    }

    window.addEventListener('wheel', cancel, { passive: true });
    window.addEventListener('touchmove', cancel, { passive: true });

    function reassert() {
      if (cancelled) {
        return;
      }

      virtualizerRef.current.scrollToIndex(targetIndex, { align: 'start' });
      window.scrollTo(0, window.scrollY + targetOffset);

      const currentScrollY = window.scrollY;

      if (currentScrollY !== lastScrollY) {
        lastScrollY = currentScrollY;
        stableFrames = 0;
      } else {
        stableFrames += 1;
      }

      const timedOut = performance.now() - startedAt > HARD_CAP_MS;

      if (stableFrames < REQUIRED_STABLE_FRAMES && !timedOut) {
        rafId = requestAnimationFrame(reassert);
      }
    }

    rafId = requestAnimationFrame(reassert);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('touchmove', cancel);
    };
  }, [readyToRestoreScroll, virtualizerRef]);

  function saveScrollBeforeNavigating(event: React.MouseEvent) {
    if (!(event.target as HTMLElement).closest('a')) {
      return;
    }

    const current =
      virtualItems.find(
        (item) =>
          item.start <= window.scrollY &&
          window.scrollY < item.start + item.size,
      ) ?? virtualItems[0];

    if (!current) {
      return;
    }

    const payload: SavedScrollPosition = {
      index: current.index,
      offset: window.scrollY - current.start,
    };

    sessionStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(payload));
  }

  return { saveScrollBeforeNavigating };
}
