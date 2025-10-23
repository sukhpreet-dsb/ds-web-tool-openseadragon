import { create } from 'zustand';
import type { ToolType } from './toolStore';

export interface KeyState {
    previousTool: ToolType | null;
}

export interface KeyActions {
    setPreviousTool: (tool: ToolType | null) => void;
    resetKeyState: () => void;
}

export interface KeyStore extends KeyState, KeyActions { }

export const useKeyStore = create<KeyStore>((set) => ({
    // State
    previousTool: null,

    // Actions
    setPreviousTool: (tool) => set({ previousTool: tool }),

    resetKeyState: () => set({
        previousTool: null,
    }),
}));