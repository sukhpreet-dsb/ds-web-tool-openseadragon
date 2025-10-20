import * as fabric from 'fabric';
import type { TEvent } from 'fabric';
import { useToolStore } from '../store/toolStore';
import { useCanvasStore } from '../store/canvasStore';
import type { CTX } from '../contexts/MapContext';

export class CanvasEventHandler {
  private getCtx: () => CTX;
  private unsubscribeStore?: () => void;
  private isInitialized: boolean = false;

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

    // Canvas history setup
    const setupCanvasHistory = () => {
      const ctx = this.getCtx();
      if (!ctx.fabricCanvas) return;

      // Load persisted state if available
      const { getCurrentState, saveState } = useCanvasStore.getState();
      const initialState = getCurrentState();

      if (initialState) {
        ctx.fabricCanvas.loadFromJSON(initialState, () => {
          ctx.fabricCanvas!.renderAll();
        }).then(() => {
          // Re-apply GeoJSON properties to ensure they remain non-interactive
          const objects = ctx.fabricCanvas!.getObjects();
          objects.forEach(obj => {
            if (obj.type === 'polyline') {
              // Re-apply GeoJSON properties
              obj.set({
                selectable: false,
                evented: false,
                perPixelTargetFind: false,
              });
            }
          });
        })
      }

      // Event listeners for canvas changes (to trigger save)
      const handleCanvasChange = () => {
        if (this.isInitialized) {
          const canvasJSON = ctx.fabricCanvas!.toJSON();
          saveState(canvasJSON);
        }
      };

      // Add event listeners for object modifications
      ctx.fabricCanvas.on('object:added', handleCanvasChange);
      ctx.fabricCanvas.on('object:modified', handleCanvasChange);
      ctx.fabricCanvas.on('object:removed', handleCanvasChange);
      // ctx.fabricCanvas.on('path:created', handleCanvasChange);

      // Initialize after a delay to allow initial GeoJSON loading
      setTimeout(() => {
        this.isInitialized = true;
        // // Save initial state if no persisted state exists
        // if (!initialState) {
        //   saveState(ctx.fabricCanvas!.toJSON());
        // }
      }, 3000);
    };

    // Set up all event handlers when canvas is available
    const ctx = this.getCtx();
    if (ctx.fabricCanvas) {
      setupMouseDown();
      setupMouseMove();
      setupMouseUp();
      setupSelectionEvents();
      setupObjectEvents();
      setupCanvasHistory();
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
          setupCanvasHistory();
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
      const toolStore = useToolStore.getState();

      // Escape key to cancel line drawing
      if (e.key === 'Escape' && toolStore.isDrawingLine) {
        this.cancelLineDrawing();
      }

      // Undo/Redo keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          this.performUndo();
        } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          this.performRedo();
        }
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
        if (this.isInitialized) {
          const canvasJSON = ctx.fabricCanvas!.toJSON();
          const saveState = useCanvasStore.getState().saveState;
          saveState(canvasJSON);
        }
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

  public async loadCanvasState(state: string) {
    try {

      const ctx = this.getCtx();
      if (!ctx.fabricCanvas || !ctx.viewer) return;

      // Temporarily disable history tracking to prevent loops
      this.isInitialized = false;

      // Handle both string and object states
      let stateString = state;
      if (typeof state === 'object') {
        // If state is already an object, convert it back to JSON string
        stateString = JSON.stringify(state);
      } else if (typeof state !== 'string') {
        return;
      }

      // Clear current canvas objects first
      ctx.fabricCanvas.clear();

      // Load the state using the fabric overlay
      await new Promise<void>((resolve, reject) => {
        ctx.fabricCanvas!.loadFromJSON(stateString).then(() => {
          try {
            // Re-apply GeoJSON properties to ensure they remain non-interactive
            const objects = ctx.fabricCanvas!.getObjects();
            objects.forEach(obj => {
              if (obj.type === 'polyline') {
                // Re-apply GeoJSON properties
                obj.set({
                  selectable: false,
                  evented: false,
                  perPixelTargetFind: false,
                });
              }
            });

            // Render again after viewport update
            setTimeout(() => {
              ctx.fabricCanvas!.renderAll();
              resolve();
            }, 50);
          } catch (error) {
            reject(error);
          }
        })
      });

      // Re-enable history tracking after loading
      setTimeout(() => {
        this.isInitialized = true;
      }, 100);
    } catch (error) {
      console.error('Failed to load canvas state:', error);
    }
  }

  public performUndo() {
    const canvasStore = useCanvasStore.getState();
    if (canvasStore.canUndo()) {
      canvasStore.undo();
      const state = canvasStore.getCurrentState();
      if (state) {
        this.loadCanvasState(state);
      }
    }
  }

  public performRedo() {
    const canvasStore = useCanvasStore.getState();
    if (canvasStore.canRedo()) {
      canvasStore.redo();
      const state = canvasStore.getCurrentState();
      if (state) {
        this.loadCanvasState(state);
      }
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
      ctx.fabricCanvas.off('object:added');
      ctx.fabricCanvas.off('object:removed');
      ctx.fabricCanvas.off('path:created');
    }

    // Unsubscribe from store
    if (this.unsubscribeStore) {
      this.unsubscribeStore();
    }
  }
}