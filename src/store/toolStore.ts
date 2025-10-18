import { create } from 'zustand';
import * as fabric from 'fabric';
import type { CTX } from '@/contexts/MapContext';

export type ToolType = 'select' | 'line' | 'text' | 'hand' | '';

export interface ToolState {
  selectedTool: ToolType;
  isDrawingMode: boolean;
}

export interface ToolActions {
  setSelectedTool: (tool: ToolType) => void;
  setIsDrawingMode: (enabled: boolean) => void;
  resetTool: (ctx: CTX) => void;
  activateTool: (ctx: CTX, tool: ToolType,) => void;
}

export interface ToolStore extends ToolState, ToolActions {}

export const useToolStore = create<ToolStore>((set, get) => ({
  // State
  selectedTool: 'hand',
  isDrawingMode: false,

  // Actions
  setSelectedTool: (tool) => set({ selectedTool: tool }),

  setIsDrawingMode: (enabled) => set({ isDrawingMode: enabled }),

  resetTool: (ctx) => {
    const { fabricCanvas, viewer } = ctx;

    if (fabricCanvas) {
      fabricCanvas.isDrawingMode = false;
      fabricCanvas.selection = false;
    }

    if (viewer) {
      viewer.setMouseNavEnabled(true);
    }

    set({
      selectedTool: 'hand',
      isDrawingMode: false,
    });
  },

  activateTool: (ctx, tool) => {
    const { fabricCanvas, viewer } = ctx;

    if (!fabricCanvas || !viewer) return;

    // Reset all tool states first
    get().resetTool(ctx);

    // Set the new tool
    set({ selectedTool: tool });

    // Configure tool-specific behavior
    switch (tool) {
      case 'select':
        fabricCanvas.selection = true;
        viewer.setMouseNavEnabled(false);
        break;

      case 'line':
        set({ isDrawingMode: true });
        fabricCanvas.isDrawingMode = true;
        fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
        fabricCanvas.freeDrawingBrush.width = 5;
        fabricCanvas.freeDrawingBrush.color = 'black';
        viewer.setMouseNavEnabled(false);
        break;

      case 'text':
        // Text tool will be handled separately when clicking on canvas
        viewer.setMouseNavEnabled(false);
        break;

      case 'hand':
        // Hand tool is essentially the default navigation mode
        viewer.setMouseNavEnabled(true);
        break;

      default:
        break;
    }
  },
}));