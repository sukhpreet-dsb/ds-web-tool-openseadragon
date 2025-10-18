import * as fabric from 'fabric';
import type { TEvent } from 'fabric';
import { useToolStore } from '../store/toolStore';
import type { CTX } from '../contexts/MapContext';

export class CanvasEventHandler {
  private getCtx: () => CTX;
  private unsubscribeStore?: () => void;

  constructor(getCtx: () => CTX) {
    this.getCtx = getCtx;
    this.setupEventHandlers();
    this.subscribeToStoreChanges();
  }

  private setupEventHandlers() {
    // Mouse down event
    const setupMouseDown = () => {
      const ctx = this.getCtx();
      if (!ctx.fabricCanvas) return;

      ctx.fabricCanvas.on('mouse:down', (e) => {
        const { selectedTool } = useToolStore.getState();
        if (selectedTool === 'select' || e.target) {
          ctx.viewer?.setMouseNavEnabled(false);
        }

        // Handle text tool clicks
        if (selectedTool === 'text' && !e.target) {
          this.handleTextToolClick(e);
        }

        // Handle line tool clicks
        if (selectedTool === 'line' && !e.target) {
          this.handleLineClick(e);
        }
      });
    };

    // Mouse move event
    const setupMouseMove = () => {
      const ctx = this.getCtx();
      if (!ctx.fabricCanvas) return;

      ctx.fabricCanvas.on('mouse:move', (e) => {
        const { selectedTool } = useToolStore.getState();
        if (selectedTool === 'select' && e.target) {
          ctx.viewer?.setMouseNavEnabled(false);
        }

        // Handle line mouse move for preview
        if (selectedTool === 'line') {
          this.handleLineMove(e);
        }
      });
    };

    // Mouse up event
    const setupMouseUp = () => {
      const ctx = this.getCtx();
      if (!ctx.fabricCanvas) return;

      ctx.fabricCanvas.on('mouse:up', () => {
        const { selectedTool } = useToolStore.getState();
        if (selectedTool !== 'line' && selectedTool !== 'freehand') {
          setTimeout(() => {
            ctx.viewer?.setMouseNavEnabled(true);
          }, 100);
        }
      });
    };

    // Selection events
    const setupSelectionEvents = () => {
      const ctx = this.getCtx();
      if (!ctx.fabricCanvas) return;

      ctx.fabricCanvas.on('selection:created', () => {
        ctx.viewer?.setMouseNavEnabled(false);
      });

      ctx.fabricCanvas.on('selection:updated', () => {
        ctx.viewer?.setMouseNavEnabled(false);
      });

      ctx.fabricCanvas.on('selection:cleared', () => {
        const { selectedTool } = useToolStore.getState();
        if (selectedTool !== 'line' && selectedTool !== 'freehand') {
          ctx.viewer?.setMouseNavEnabled(true);
        }
      });
    };

    // Object modification events
    const setupObjectEvents = () => {
      const ctx = this.getCtx();
      if (!ctx.fabricCanvas) return;

      ctx.fabricCanvas.on('object:moving', () => {
        ctx.viewer?.setMouseNavEnabled(false);
      });

      ctx.fabricCanvas.on('object:scaling', () => {
        ctx.viewer?.setMouseNavEnabled(false);
      });

      ctx.fabricCanvas.on('object:rotating', () => {
        ctx.viewer?.setMouseNavEnabled(false);
      });

      ctx.fabricCanvas.on('object:modified', () => {
        const { selectedTool } = useToolStore.getState();
        setTimeout(() => {
          if (selectedTool !== 'line' && selectedTool !== 'freehand') {
            ctx.viewer?.setMouseNavEnabled(true);
          }
        }, 100);
      });
    };

    // Set up all event handlers when canvas is available
    const ctx = this.getCtx();
    if (ctx.fabricCanvas) {
      setupMouseDown();
      setupMouseMove();
      setupMouseUp();
      setupSelectionEvents();
      setupObjectEvents();
    } else {
      // If canvas is not ready, wait a bit and try again
      setTimeout(() => {
        const retryCtx = this.getCtx();
        if (retryCtx.fabricCanvas) {
          setupMouseDown();
          setupMouseMove();
          setupMouseUp();
          setupSelectionEvents();
          setupObjectEvents();
        }
      }, 100);
    }
  }

  private subscribeToStoreChanges() {
    // Subscribe to tool changes if needed for future enhancements
    // const storeUnsubscribe = useToolStore.subscribe((state) => {
    //   console.log(`Tool changed to ${state.selectedTool}`);
    // });

    // Setup keyboard events
    this.setupKeyboardEvents();

    // Store cleanup function
    // this.unsubscribeStore = storeUnsubscribe;
  }

  private setupKeyboardEvents() {
    const handleKeyDown = (e: KeyboardEvent) => {
      const store = useToolStore.getState();

      // Escape key to cancel line drawing
      if (e.key === 'Escape' && store.isDrawingLine) {
        this.cancelLineDrawing();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Store reference to remove later - combine with existing unsubscribe
    const originalUnsubscribe = this.unsubscribeStore;
    this.unsubscribeStore = () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (originalUnsubscribe) {
        originalUnsubscribe();
      }
    };
  }

  private handleTextToolClick(e: TEvent) {
    const ctx = this.getCtx();
    if (!ctx.fabricCanvas) return;

    const pointer = ctx.fabricCanvas.getPointer(e.e);
    const text = new fabric.IText('Click to edit', {
      left: pointer.x,
      top: pointer.y,
      fontSize: 20,
      fill: 'black',
      selectable: true,
      editable: true,
    });

    ctx.fabricCanvas.add(text);
    ctx.fabricCanvas.setActiveObject(text);
    text.enterEditing();

    // Reset to select tool after adding text
    setTimeout(() => {
      useToolStore.getState().activateTool(ctx, 'select');
    }, 100);
  }

  private handleLineClick(e: TEvent) {
    const ctx = this.getCtx();
    if (!ctx.fabricCanvas) return;

    const pointer = ctx.fabricCanvas.getPointer(e.e);
    const store = useToolStore.getState();

    if (!store.isDrawingLine) {
      // Start drawing a new line - set the start point
      store.setLineStartPoint({ x: pointer.x, y: pointer.y });
      store.setIsDrawingLine(true);

      // Create a temporary line for preview
      const line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
        stroke: 'black',
        strokeWidth: 3,
        selectable: false,
        evented: false,
      });

      ctx.fabricCanvas.add(line);
      store.setCurrentLine(line);
    } else {
      // Finish the line at the clicked point
      if (store.currentLine && store.lineStartPoint) {
        store.currentLine.set({
          x1: store.lineStartPoint.x,
          y1: store.lineStartPoint.y,
          x2: pointer.x,
          y2: pointer.y,
          selectable: true,
          evented: true,
        });

        // Reset drawing state
        store.setIsDrawingLine(false);
        store.setCurrentLine(undefined);
        store.setLineStartPoint(undefined);

        ctx.fabricCanvas.renderAll();
      }
    }
  }

  private handleLineMove(e: TEvent) {
    const ctx = this.getCtx();
    if (!ctx.fabricCanvas) return;

    const store = useToolStore.getState();

    if (store.isDrawingLine && store.currentLine && store.lineStartPoint) {
      const pointer = ctx.fabricCanvas.getPointer(e.e);

      // Update the temporary line to show preview
      store.currentLine.set({
        x2: pointer.x,
        y2: pointer.y,
      });

      ctx.fabricCanvas.renderAll();
    }
  }

  private cancelLineDrawing() {
    const ctx = this.getCtx();
    const store = useToolStore.getState();

    if (store.isDrawingLine && store.currentLine) {
      // Remove the temporary line
      ctx.fabricCanvas?.remove(store.currentLine);

      // Reset drawing state
      store.setIsDrawingLine(false);
      store.setCurrentLine(undefined);
      store.setLineStartPoint(undefined);

      ctx.fabricCanvas?.renderAll();
    }
  }

  public destroy() {
    const ctx = this.getCtx();

    // Remove all event listeners if canvas exists
    if (ctx.fabricCanvas) {
      ctx.fabricCanvas.off('mouse:down');
      ctx.fabricCanvas.off('mouse:move');
      ctx.fabricCanvas.off('mouse:up');
      ctx.fabricCanvas.off('selection:created');
      ctx.fabricCanvas.off('selection:updated');
      ctx.fabricCanvas.off('selection:cleared');
      ctx.fabricCanvas.off('object:moving');
      ctx.fabricCanvas.off('object:scaling');
      ctx.fabricCanvas.off('object:rotating');
      ctx.fabricCanvas.off('object:modified');
    }

    // Unsubscribe from store
    if (this.unsubscribeStore) {
      this.unsubscribeStore();
    }
  }
}