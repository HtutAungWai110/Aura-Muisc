import { useEffect, useRef } from "react";

interface UseInfiniteScrollObserverOptions {
  onIntersect: () => void;
  enabled?: boolean;
  threshold?: number;
}

export function useInfiniteScrollObserver({
  onIntersect,
  enabled = true,
  threshold = 0.1,
}: UseInfiniteScrollObserverOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onIntersect();
        }
      },
      { threshold },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled, onIntersect, threshold]);

  return { sentinelRef };
}
