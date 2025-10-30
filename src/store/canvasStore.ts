import { pgliteStorage } from "@/services/pgliteKV";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const MAX_HISTORY = 50; // Limit history to prevent memory issues

export interface CanvasHistoryState {
  history: string[]; // Array of serialized canvas states (JSON strings)
  currentIndex: number; // Current position in history (-1 means no history yet)
}

export interface CanvasHistoryActions {
  // Action to save a new canvas state
  saveState: (canvasJSON: string) => void;

  // Action for undo
  undo: () => void;

  // Action for redo
  redo: () => void;

  // Getter for current state
  getCurrentState: () => string | null;

  // Clear all history
  clearHistory: () => void;

  // Check if undo is possible
  canUndo: () => boolean;

  // Check if redo is possible
  canRedo: () => boolean;

  // Wait for persistence data to be loaded
  waitForHydration: () => Promise<void>;
}

export interface CanvasHistoryStore
  extends CanvasHistoryState,
    CanvasHistoryActions {}

// Global promise to track hydration completion
let hydrationPromise: Promise<void> | null = null;
let hydrationResolver: (() => void) | null = null;

const canvasStoreCreator = persist<CanvasHistoryStore>(
  (set, get) => ({
    // State
    history: [],
    currentIndex: -1,

    // Action to save a new canvas state
    saveState: (canvasJSON: string) => {
      const { history, currentIndex } = get();

      // Truncate future states if we're not at the end (after undo)
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push(canvasJSON);

      // Limit history size
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }
      set({ history: newHistory, currentIndex: newHistory.length - 1 });
    },

    // Action for undo
    undo: () => {
      const { currentIndex } = get();
      if (currentIndex > 0) {
        set({ currentIndex: currentIndex - 1 });
      }
    },

    // Action for redo
    redo: () => {
      const { history, currentIndex } = get();
      if (currentIndex < history.length - 1) {
        set({ currentIndex: currentIndex + 1 });
      }
    },

    // Getter for current state
    getCurrentState: () => {
      const { history, currentIndex } = get();
      return currentIndex >= 0 ? history[currentIndex] : null;
    },

    // Clear all history
    clearHistory: () => {
      set({ history: [], currentIndex: -1 });
    },

    // Check if undo is possible
    canUndo: () => {
      const { currentIndex } = get();
      return currentIndex > 0;
    },

    // Check if redo is possible
    canRedo: () => {
      const { history, currentIndex } = get();
      return currentIndex < history.length - 1;
    },

    // Wait for persistence data to be loaded
    waitForHydration: async () => {
      if (hydrationPromise) {
        return hydrationPromise;
      }

      // Create a new hydration promise
      hydrationPromise = new Promise((resolve) => {
        hydrationResolver = () => resolve();
      });

      // Set a timeout fallback in case hydration doesn't complete
      setTimeout(() => {
        if (hydrationResolver) {
          hydrationResolver();
          hydrationResolver = null;
          hydrationPromise = null;
        }
      }, 5000);

      return hydrationPromise;
    },
  }),
  {
    name: "canvas-history", // Key for local storage
    // storage: createJSONStorage(() => localStorage), // Use localStorage
    storage: createJSONStorage(() => {
      if (import.meta.env.VITE_ENV === "dev") {
        return localStorage;
      } else {
        return pgliteStorage;
      }
    }),
    // Only persist these parts of the state
    partialize: (state: any) =>
      ({
        history: state.history,
        currentIndex: state.currentIndex,
      } as any),
    // Handle rehydration completion
    onRehydrateStorage: () => () => {
      // Resolve the hydration promise
      if (hydrationResolver) {
        hydrationResolver();
        hydrationResolver = null;
        hydrationPromise = null;
      }
    },
  }
);

export const useCanvasStore = create<CanvasHistoryStore>()(
  canvasStoreCreator as any
);
