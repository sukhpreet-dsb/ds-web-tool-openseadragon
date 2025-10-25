import { create } from 'zustand';
import * as fabric from 'fabric';
import type { ToolType } from './toolStore';

export interface KeyState {
    previousTool: ToolType | null;
    copiedObj: fabric.FabricObject<Partial<fabric.FabricObjectProps>, fabric.SerializedObjectProps, fabric.ObjectEvents>[] | []
}

export interface KeyActions {
    setPreviousTool: (tool: ToolType | null) => void;
    resetKeyState: () => void;
    setCopiedObj: (obj: fabric.FabricObject<Partial<fabric.FabricObjectProps>, fabric.SerializedObjectProps, fabric.ObjectEvents>[] | []) => void;
}

export interface KeyStore extends KeyState, KeyActions { }

export const useKeyStore = create<KeyStore>((set) => ({
    // State
    previousTool: null,
    copiedObj: [],

    // Actions
    setPreviousTool: (tool) => set({ previousTool: tool }),

    resetKeyState: () => set({
        previousTool: null,
    }),
    setCopiedObj: (obj) => set({ copiedObj: obj })
}));