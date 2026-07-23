import { create } from "zustand";
import type { Track } from "@/types/TrackType";

export enum SortMode {
  DateAscending = "Date ascending",
  DateDescending = "Date descending",

}

interface SortStore {
  sortBy: SortMode;
  sort: (tracks: Track[]) => Track[];
  setSortMode: (mode: SortMode) => void;
}

export const useSortStore = create<SortStore>((set, get) => ({
  sortBy: JSON.parse(localStorage.getItem("sortBy")) as SortMode || SortMode.DateAscending,
  sort: (tracks: Track[]) => {
    const { sortBy } = get();
    const sortedTracks = [...tracks].sort((a: Track, b: Track) => {
      if (sortBy === SortMode.DateAscending) {
        return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
      } else {
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      }
    })
    return sortedTracks;
  },
  setSortMode: (mode: SortMode) => {
    localStorage.setItem("sortBy", JSON.stringify(mode))
    console.log(localStorage.getItem("sortBy"))
    set({ sortBy: mode });
  },
}));
