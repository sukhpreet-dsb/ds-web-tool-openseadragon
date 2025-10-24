import { create } from 'zustand';
import * as fabric from 'fabric';
import type { CTX } from '@/contexts/MapContext';

export type ToolType = 'select' | 'line' | 'arrow' | 'freehand' | 'text' | 'hand' | 'pits' | 'triangle' | 'gp' | 'junction' | '';

export interface ToolState {
  selectedTool: ToolType;
  isDrawingMode: boolean;
  isDrawingLine: boolean;
  isDrawingArrow: boolean;
  currentLine?: fabric.Line;
  currentArrow?: fabric.Path;
  lineStartPoint?: { x: number; y: number };
}

export interface ToolActions {
  setSelectedTool: (tool: ToolType) => void;
  setIsDrawingMode: (enabled: boolean) => void;
  setIsDrawingLine: (drawing: boolean) => void;
  setIsDrawingArrow: (drawing: boolean) => void;
  setCurrentLine: (line?: fabric.Line) => void;
  setCurrentArrow: (arrow?: fabric.Path) => void;
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
  isDrawingArrow: false,
  currentLine: undefined,
  currentArrow: undefined,
  lineStartPoint: undefined,

  // Actions
  setSelectedTool: (tool) => set({ selectedTool: tool }),

  setIsDrawingMode: (enabled) => set({ isDrawingMode: enabled }),

  setIsDrawingLine: (drawing) => set({ isDrawingLine: drawing }),

  setIsDrawingArrow: (drawing) => set({ isDrawingArrow: drawing }),

  setCurrentLine: (line) => set({ currentLine: line }),

  setCurrentArrow: (arrow) => set({ currentArrow: arrow }),

  setLineStartPoint: (point) => set({ lineStartPoint: point }),

  resetTool: (ctx) => {
    const { fabricCanvas, viewer } = ctx;

    if (fabricCanvas) {
      fabricCanvas.isDrawingMode = false;
      fabricCanvas.selection = false;
      // Reset cursor to default
      fabricCanvas.defaultCursor = 'default';
      fabricCanvas.hoverCursor = 'default';
    }

    if (viewer) {
      viewer.setMouseNavEnabled(true);
      // Reset viewer cursor to default
      if (viewer.container) {
        viewer.container.style.cursor = 'default';
      }
    }

    set({
      selectedTool: 'hand',
      isDrawingMode: false,
      isDrawingLine: false,
      isDrawingArrow: false,
      currentLine: undefined,
      currentArrow: undefined,
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
        fabricCanvas.defaultCursor = 'default';
        fabricCanvas.hoverCursor = 'move';
        viewer.setMouseNavEnabled(false);
        // Reset viewer cursor
        if (viewer.container) {
          viewer.container.style.cursor = 'default';
        }
        break;

      case 'freehand':
        set({ isDrawingMode: true });
        fabricCanvas.isDrawingMode = true;
        fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
        fabricCanvas.freeDrawingBrush.width = 5;
        fabricCanvas.freeDrawingBrush.color = 'black';
        fabricCanvas.defaultCursor = 'crosshair';
        fabricCanvas.hoverCursor = 'crosshair';
        viewer.setMouseNavEnabled(false);
        // Reset viewer cursor
        if (viewer.container) {
          viewer.container.style.cursor = 'default';
        }
        break;

      case 'line':
        // Line tool will be handled by mouse events
        fabricCanvas.defaultCursor = 'crosshair';
        fabricCanvas.hoverCursor = 'crosshair';
        viewer.setMouseNavEnabled(false);
        // Reset viewer cursor
        if (viewer.container) {
          viewer.container.style.cursor = 'default';
        }
        break;

      case 'arrow':
        // Arrow tool will be handled by mouse events
        fabricCanvas.defaultCursor = 'crosshair';
        fabricCanvas.hoverCursor = 'crosshair';
        viewer.setMouseNavEnabled(false);
        // Reset viewer cursor
        if (viewer.container) {
          viewer.container.style.cursor = 'default';
        }
        break;

      case 'text':
        // Text tool will be handled separately when clicking on canvas
        fabricCanvas.defaultCursor = 'text';
        fabricCanvas.hoverCursor = 'text';
        viewer.setMouseNavEnabled(false);
        // Reset viewer cursor
        if (viewer.container) {
          viewer.container.style.cursor = 'default';
        }
        break;

      case 'pits':
      case 'triangle':
      case 'gp':
      case 'junction':
        // Custom icon tools will be handled by mouse events
        fabricCanvas.defaultCursor = 'crosshair';
        fabricCanvas.hoverCursor = 'crosshair';
        viewer.setMouseNavEnabled(false);
        // Reset viewer cursor
        if (viewer.container) {
          viewer.container.style.cursor = 'default';
        }
        break;

      case 'hand':
        // Hand tool is essentially the default navigation mode
        viewer.setMouseNavEnabled(true);
        // Set hand/grab cursor for both canvas and viewer
        if (fabricCanvas) {
          fabricCanvas.defaultCursor = 'grab';
          fabricCanvas.hoverCursor = 'grab';
          fabricCanvas.selection = false;
        }
        // Set grab cursor on the viewer container as well
        if (viewer && viewer.container) {
          viewer.container.style.cursor = 'grab';

          // Add event listeners for grab/grabbing cursor during drag
          const handleMouseDown = () => {
            viewer.container.style.cursor = 'grabbing';
          };

          const handleMouseUp = () => {
            viewer.container.style.cursor = 'grab';
          };

          // Remove existing listeners to avoid duplicates
          viewer.container.removeEventListener('mousedown', handleMouseDown);
          viewer.container.removeEventListener('mouseup', handleMouseUp);

          // Add new listeners
          viewer.container.addEventListener('mousedown', handleMouseDown);
          viewer.container.addEventListener('mouseup', handleMouseUp);
        }
        break;

      default:
        break;
    }
  },
}));