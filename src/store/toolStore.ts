import { create } from 'zustand';
import * as fabric from 'fabric';
import type { CTX } from '@/contexts/MapContext';

export type ToolType = 'select' | 'line' | 'freehand' | 'text' | 'hand' | 'plus' | 'temple' | 'tower' | '';

export interface ToolState {
  selectedTool: ToolType;
  isDrawingMode: boolean;
  isDrawingLine: boolean;
  currentLine?: fabric.Line;
  lineStartPoint?: { x: number; y: number };
}

export interface ToolActions {
  setSelectedTool: (tool: ToolType) => void;
  setIsDrawingMode: (enabled: boolean) => void;
  setIsDrawingLine: (drawing: boolean) => void;
  setCurrentLine: (line?: fabric.Line) => void;
  setLineStartPoint: (point?: { x: number; y: number }) => void;
  resetTool: (ctx: CTX) => void;
  activateTool: (ctx: CTX, tool: ToolType,) => void;
}

export interface ToolStore extends ToolState, ToolActions {}

export const useToolStore = create<ToolStore>((set, get) => ({
  // State
  selectedTool: 'hand',
  isDrawingMode: false,
  isDrawingLine: false,
  currentLine: undefined,
  lineStartPoint: undefined,

  // Actions
  setSelectedTool: (tool) => set({ selectedTool: tool }),

  setIsDrawingMode: (enabled) => set({ isDrawingMode: enabled }),

  setIsDrawingLine: (drawing) => set({ isDrawingLine: drawing }),

  setCurrentLine: (line) => set({ currentLine: line }),

  setLineStartPoint: (point) => set({ lineStartPoint: point }),

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
      isDrawingLine: false,
      currentLine: undefined,
      lineStartPoint: undefined,
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

      case 'freehand':
        set({ isDrawingMode: true });
        fabricCanvas.isDrawingMode = true;
        fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
        fabricCanvas.freeDrawingBrush.width = 5;
        fabricCanvas.freeDrawingBrush.color = 'black';
        viewer.setMouseNavEnabled(false);
        break;

      case 'line':
        // Line tool will be handled by mouse events
        viewer.setMouseNavEnabled(false);
        break;

      case 'text':
        // Text tool will be handled separately when clicking on canvas
        viewer.setMouseNavEnabled(false);
        break;

      case 'plus':
      case 'temple':
      case 'tower':
        // Custom icon tools will be handled by mouse events
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