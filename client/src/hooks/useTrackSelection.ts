import { useState, useCallback } from "react";

export function useTrackSelection() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const selectAll = useCallback((allIds: string[]) => {
    setSelectedIds(allIds);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const enterSelecting = useCallback(() => {
    setIsSelecting(true);
  }, []);

  const exitSelecting = useCallback(() => {
    setIsSelecting(false);
    setSelectedIds([]);
  }, []);

  return {
    selectedIds,
    isSelecting,
    toggleSelect,
    selectAll,
    clearSelection,
    enterSelecting,
    exitSelecting,
  };
}
