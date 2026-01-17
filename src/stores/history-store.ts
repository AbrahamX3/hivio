import type { HistoryItem } from "@/types/history";
import { create } from "zustand";

interface HistoryStore {
  historyItems: HistoryItem[];
  addedTitleIds: Set<string>;
  setHistoryItems: (items: HistoryItem[]) => void;
  addHistoryItem: (item: HistoryItem) => void;
  removeHistoryItem: (id: string) => void;
  isTitleAdded: (tmdbId: number) => boolean;
  updateTitleIds: () => void;
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  historyItems: [],
  addedTitleIds: new Set(),

  setHistoryItems: (items) => {
    set({ historyItems: items });
    get().updateTitleIds();
  },

  addHistoryItem: (item) => {
    set((state) => ({
      historyItems: [...state.historyItems, item],
    }));
    get().updateTitleIds();
  },

  removeHistoryItem: (id) => {
    set((state) => ({
      historyItems: state.historyItems.filter((item) => item._id !== id),
    }));
    get().updateTitleIds();
  },

  isTitleAdded: (tmdbId) => {
    return get().addedTitleIds.has(tmdbId.toString());
  },

  updateTitleIds: () => {
    const items = get().historyItems;
    const titleIds = new Set<string>();

    items.forEach((item) => {
      if (item.title?.tmdbId) {
        titleIds.add(item.title.tmdbId.toString());
      }
    });

    set({ addedTitleIds: titleIds });
  },
}));
