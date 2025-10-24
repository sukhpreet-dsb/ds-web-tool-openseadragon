import * as fabric from 'fabric';
import type { TEvent } from 'fabric';
import { useToolStore } from '../store/toolStore';
import { useCanvasStore } from '../store/canvasStore';
import { useKeyStore } from '../store/keyStore';
import type { CTX } from '../contexts/MapContext';
import { createCustomIcon } from '../utils/customIcons';
import { createArrow } from '../utils/arrowHelper';

export interface ICanvasEventHandler {
  deleteSelectedObjects(): void;
  performUndo(): void;
  performRedo(): void;
  destroy(): void;
  setInitialization(enabled: boolean): void;
  clearClipboard(): void;
}

export class CanvasEventHandler implements ICanvasEventHandler {
  private getCtx: () => CTX;
  private unsubscribeStore?: () => void;
  private isInitialized: boolean = false;
  private isBatchDelete: boolean = false;
  private clipboard: fabric.Object[] = [];
  private clipboardBounds?: { left: number; top: number; width: number; height: number }; // Store original bounds for relative positioning
  private lastPointer: fabric.Point | null = null;
  private pasteOffset = 10; // Optional visual offset for multiple pastes
  private isCopying = false; // Flag to prevent copy/paste conflicts


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

        // Handle arrow tool clicks
        if (selectedTool === 'arrow' && !e.target) {
          this.handleArrowClick(e);
        }

        // Handle custom icon tool clicks
        if ((selectedTool === 'pits' || selectedTool === 'triangle' || selectedTool === 'gp' || selectedTool === 'junction') && !e.target) {
          this.handleCustomIconClick(e);
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

        if (e && e.e) {
          if (!ctx.fabricCanvas) return;
          const pointer = ctx.fabricCanvas.getScenePoint(e.e);
          this.lastPointer = new fabric.Point(pointer.x, pointer.y);
        }

        // Handle arrow mouse move for preview
        if (selectedTool === 'arrow') {
          this.handleArrowMove(e);
        }
      });
    };

    // Mouse up event
    const setupMouseUp = () => {
      const ctx = this.getCtx();
      if (!ctx.fabricCanvas) return;

      ctx.fabricCanvas.on('mouse:up', () => {
        const { selectedTool } = useToolStore.getState();
        if (selectedTool !== 'line' && selectedTool !== 'arrow' && selectedTool !== 'freehand') {
          setTimeout(() => {
            if (selectedTool === 'select') {
              ctx.viewer?.setMouseNavEnabled(false);
            } else {
              ctx.viewer?.setMouseNavEnabled(true);
            }
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
        if (selectedTool !== 'line' && selectedTool !== 'arrow' && selectedTool !== 'freehand') {
          if (selectedTool === 'select') {
            ctx.viewer?.setMouseNavEnabled(false);
          } else {
            ctx.viewer?.setMouseNavEnabled(true);
          }
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
          if (selectedTool !== 'line' && selectedTool !== 'arrow' && selectedTool !== 'freehand') {
            if (selectedTool === 'select') {
              ctx.viewer?.setMouseNavEnabled(false);
            } else {
              ctx.viewer?.setMouseNavEnabled(true);
            }
          }
        }, 100);
      });
    };

    // Canvas history setup
    const setupCanvasHistory = async () => {
      const ctx = this.getCtx();
      if (!ctx.fabricCanvas) return;

      // Wait for persistence data to be loaded from PGlite
      const canvasStore = useCanvasStore.getState();
      await canvasStore.waitForHydration();

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
        if (this.isInitialized && !this.isBatchDelete) {
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
      setupCanvasHistory(); // This is now async but we don't need to await it here
    } else {
      // If canvas is not ready, wait a bit and try again
      setTimeout(async () => {
        const retryCtx = this.getCtx();
        if (retryCtx.fabricCanvas) {
          setupMouseDown();
          setupMouseMove();
          setupMouseUp();
          setupSelectionEvents();
          setupObjectEvents();
          await setupCanvasHistory(); // Await when called from retry
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
      const ctx = this.getCtx();

      // Don't handle delete keys if user is actively editing text
      const activeObject = ctx.fabricCanvas?.getActiveObject();
      const isEditingText = activeObject && activeObject.type === 'i-text' && (activeObject as fabric.IText).isEditing;

      // Escape key to cancel line drawing
      if (e.key === 'Escape' && (toolStore.isDrawingLine || toolStore.isDrawingArrow)) {
        if (toolStore.isDrawingLine) {
          this.cancelLineDrawing();
        } else if (toolStore.isDrawingArrow) {
          this.cancelArrowDrawing();
        }
      }

      // Delete keys - only if not editing text
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isEditingText) {
        e.preventDefault();
        this.deleteSelectedObjects();
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

      // Temporary tool switching
      const keyStore = useKeyStore.getState();

      // Space key -> Hand tool
      if ((e.key === " " || e.code === "Space" || e.keyCode === 32) && !keyStore.previousTool) {
        e.preventDefault();
        keyStore.setPreviousTool(toolStore.selectedTool);
        if (toolStore.selectedTool !== 'hand') {
          toolStore.activateTool(ctx, 'hand');
        }
      }

      // Ctrl key -> Select tool (but not when combined with other shortcuts)
      if ((e.ctrlKey || e.metaKey) && !keyStore.previousTool &&
        e.key !== 'z' && e.key !== 'y' && e.key !== 'Delete' && e.key !== 'Backspace') {
        e.preventDefault();
        keyStore.setPreviousTool(toolStore.selectedTool);
        if (toolStore.selectedTool !== 'select') {
          toolStore.activateTool(ctx, 'select');
        }
      }

      // --- Copy (Ctrl + C) ---
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && !this.isCopying) {
        e.preventDefault();
        const ctx = this.getCtx();
        const activeObjects = ctx.fabricCanvas?.getActiveObjects() || [];

        if (activeObjects.length === 0) return;

        this.isCopying = true;
        this.clipboard = []; // Clear previous clipboard

        // Clone all objects asynchronously
        const clonePromises = activeObjects.map((obj) => {
          return new Promise<fabric.Object>((resolve, reject) => {
            try {
              obj.clone().then((cloned: fabric.Object) => {
                // Remove the id to avoid conflicts
                if ((cloned as any).id) {
                  delete (cloned as any).id;
                }
                // Ensure object is selectable and evented
                cloned.set({
                  selectable: true,
                  evented: true,
                });
                resolve(cloned);
              }).catch((error) => {
                reject(error);
              });
            } catch (error) {
              reject(error);
            }
          });
        });

        // Wait for all clones to complete
        Promise.all(clonePromises).then((clonedObjects) => {
          this.clipboard = clonedObjects;

          // Store original bounds for relative positioning
          if (activeObjects.length > 1) {
            const bounds = this.calculateBounds(activeObjects);
            if (bounds) {
              this.clipboardBounds = bounds;
            }
          } else {
            this.clipboardBounds = undefined;
          }

          this.isCopying = false;
          // Reset paste offset when copying new objects
          this.pasteOffset = 10;
        }).catch((error) => {
          console.error('Error copying objects:', error);
          this.isCopying = false;
          this.clipboard = [];
          this.clipboardBounds = undefined;
        });
      }

      // --- Paste (Ctrl + V) ---
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v' && !this.isCopying) {
        e.preventDefault();
        const ctx = this.getCtx();
        if (!ctx.fabricCanvas || this.clipboard.length === 0) return;

        // Clear current selection before pasting
        ctx.fabricCanvas.discardActiveObject();

        // Determine paste point - use canvas center if no mouse pointer available
        let pastePoint: fabric.Point;
        if (this.lastPointer) {
          pastePoint = new fabric.Point(this.lastPointer.x, this.lastPointer.y);
        } else {
          // Fallback to canvas center
          const canvasCenter = ctx.fabricCanvas.getCenter();
          pastePoint = new fabric.Point(canvasCenter.left, canvasCenter.top);
        }

        console.log('Pasting at:', pastePoint, 'Clipboard size:', this.clipboard.length);
        console.log('Canvas center:', ctx.fabricCanvas.getCenter());
        console.log('Canvas viewport:', ctx.fabricCanvas.viewportTransform);
        if (this.clipboardBounds) {
          console.log('Clipboard bounds:', this.clipboardBounds);
        }

        // Clone and add all objects from clipboard
        let pastePromises: Promise<fabric.Object>[];

        if (this.clipboard.length === 1) {
          // Single object: center on mouse position
          pastePromises = this.clipboard.map((obj) => {
            return new Promise<fabric.Object>((resolve, reject) => {
              try {
                obj.clone().then((clone: fabric.Object) => {
                  // Get object dimensions to center it on cursor
                  const objWidth = clone.width || 0;
                  const objHeight = clone.height || 0;
                  const scaleX = clone.scaleX || 1;
                  const scaleY = clone.scaleY || 1;
                  const actualWidth = objWidth * scaleX;
                  const actualHeight = objHeight * scaleY;

                  clone.set({
                    left: pastePoint.x - actualWidth / 4 + this.pasteOffset,
                    top: pastePoint.y - actualHeight / 4 + this.pasteOffset,
                    evented: true,
                    selectable: true,
                  });

                  // Remove any existing id to avoid conflicts
                  if ((clone as any).id) {
                    delete (clone as any).id;
                  }

                  clone.setCoords();
                  ctx.fabricCanvas!.add(clone);
                  resolve(clone);
                }).catch((error) => {
                  reject(error);
                });
              } catch (error) {
                reject(error);
              }
            });
          });
        } else {
          // Multiple objects: center the group on cursor, preserve relative positions
          const offset = this.pasteOffset;

          // Calculate the center of the original selection bounds
          const boundsLeft = this.clipboardBounds?.left || 0;
          const boundsTop = this.clipboardBounds?.top || 0;
          const boundsWidth = this.clipboardBounds?.width || 0;
          const boundsHeight = this.clipboardBounds?.height || 0;
          const originalCenterX = boundsLeft + boundsWidth / 2;
          const originalCenterY = boundsTop + boundsHeight / 2;

          pastePromises = this.clipboard.map((obj, index) => {
            return new Promise<fabric.Object>((resolve, reject) => {
              try {
                obj.clone().then((clone: fabric.Object) => {
                  // Calculate object's offset from the original center
                  const originalLeft = clone.left || 0;
                  const originalTop = clone.top || 0;
                  const offsetX = originalLeft - originalCenterX;
                  const offsetY = originalTop - originalCenterY;

                  // Position object relative to cursor position
                  const newLeft = pastePoint.x + offsetX + offset;
                  const newTop = pastePoint.y + offsetY + offset;

                  console.log(`Object ${index}: Original (${originalLeft}, ${originalTop}) -> Offset (${offsetX}, ${offsetY}) -> New (${newLeft}, ${newTop})`);

                  clone.set({
                    left: newLeft,
                    top: newTop,
                    evented: true,
                    selectable: true,
                  });

                  // Remove any existing id to avoid conflicts
                  if ((clone as any).id) {
                    delete (clone as any).id;
                  }

                  clone.setCoords();
                  ctx.fabricCanvas!.add(clone);
                  resolve(clone);
                }).catch((error) => {
                  reject(error);
                });
              } catch (error) {
                reject(error);
              }
            });
          });
        }

        // Wait for all objects to be pasted, then select them
        Promise.all(pastePromises).then((pastedObjects) => {
          if (pastedObjects.length > 0) {
            // Select all pasted objects
            if (pastedObjects.length === 1) {
              ctx.fabricCanvas!.setActiveObject(pastedObjects[0]);
            } else {
              // Create a selection group for multiple objects
              const selection = new fabric.ActiveSelection(pastedObjects, {
                canvas: ctx.fabricCanvas!,
              });
              ctx.fabricCanvas!.setActiveObject(selection);
            }

            ctx.fabricCanvas!.renderAll();

            // Save canvas state (for undo/redo)
            if (this.isInitialized) {
              const canvasJSON = ctx.fabricCanvas!.toJSON();
              const saveState = useCanvasStore.getState().saveState;
              saveState(canvasJSON);
            }

            // Increment offset for next paste
            this.pasteOffset += 20;
          }
        }).catch((error) => {
          console.error('Error pasting objects:', error);
          ctx.fabricCanvas!.renderAll();
        });
      }

    };

    document.addEventListener('keydown', handleKeyDown);

    const handleKeyUp = (e: KeyboardEvent) => {
      const toolStore = useToolStore.getState();
      const keyStore = useKeyStore.getState();
      const ctx = this.getCtx();

      // Restore previous tool when space is released
      if ((e.key === " " || e.code === "Space" || e.keyCode === 32) && keyStore.previousTool) {
        e.preventDefault();
        if (keyStore.previousTool && keyStore.previousTool !== 'hand') {
          toolStore.activateTool(ctx, keyStore.previousTool);
          keyStore.setPreviousTool(null);
          keyStore.resetKeyState();
        }
      }

      // Restore previous tool when ctrl is released (and no other modifiers are active)
      if (!e.ctrlKey && !e.metaKey && keyStore.previousTool) {
        e.preventDefault();
        if (keyStore.previousTool && keyStore.previousTool !== 'select') {
          toolStore.activateTool(ctx, keyStore.previousTool);
          keyStore.setPreviousTool(null);
          keyStore.resetKeyState();
        }
      }
    };

    document.addEventListener('keyup', handleKeyUp);

    // Store reference to remove later - combine with existing unsubscribe
    const originalUnsubscribe = this.unsubscribeStore;
    this.unsubscribeStore = () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      if (originalUnsubscribe) {
        originalUnsubscribe();
      }
    };
  }

  private handleTextToolClick(e: TEvent) {
    const ctx = this.getCtx();
    if (!ctx.fabricCanvas) return;

    const pointer = ctx.fabricCanvas.getScenePoint(e.e);
    const text = new fabric.IText('Click to edit', {
      left: pointer.x,
      top: pointer.y,
      fontSize: 40,
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

    const pointer = ctx.fabricCanvas.getScenePoint(e.e);
    const store = useToolStore.getState();
    const isShiftPressed = (e.e as MouseEvent).shiftKey;

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
      // Continue drawing or finish the line
      if (store.currentLine && store.lineStartPoint) {
        if (isShiftPressed) {
          // Shift + Click: Continue the line from the current endpoint
          // Finalize the current segment
          store.currentLine.set({
            x1: store.lineStartPoint.x,
            y1: store.lineStartPoint.y,
            x2: pointer.x,
            y2: pointer.y,
            selectable: true,
            evented: true,
          });

          // Save canvas state for this segment
          if (this.isInitialized) {
            const canvasJSON = ctx.fabricCanvas!.toJSON();
            const saveState = useCanvasStore.getState().saveState;
            saveState(canvasJSON);
          }

          // Start a new line segment from the current endpoint
          store.setLineStartPoint({ x: pointer.x, y: pointer.y });
          store.setIsDrawingLine(true);

          // Create a new temporary line for the next segment
          const newLine = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            stroke: 'black',
            strokeWidth: 3,
            selectable: false,
            evented: false,
          });

          ctx.fabricCanvas.add(newLine);
          store.setCurrentLine(newLine);

          ctx.fabricCanvas.renderAll();
        } else {
          // Regular Click: End the line at the clicked point
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
  }

  private handleLineMove(e: TEvent) {
    const ctx = this.getCtx();
    if (!ctx.fabricCanvas) return;

    const store = useToolStore.getState();

    if (store.isDrawingLine && store.currentLine && store.lineStartPoint) {
      const pointer = ctx.fabricCanvas.getScenePoint(e.e);

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

  private handleArrowClick(e: TEvent) {
    const ctx = this.getCtx();
    if (!ctx.fabricCanvas) return;

    const pointer = ctx.fabricCanvas.getScenePoint(e.e);
    const store = useToolStore.getState();
    const isShiftPressed = (e.e as MouseEvent).shiftKey;

    if (!store.isDrawingArrow) {
      // Start drawing a new arrow - set the start point
      store.setLineStartPoint({ x: pointer.x, y: pointer.y });
      store.setIsDrawingArrow(true);

      // Create a temporary arrow for preview
      const arrow = createArrow(pointer.x, pointer.y, pointer.x, pointer.y, {
        stroke: 'black',
        strokeWidth: 8,
        arrowSize: 20,
        fill: 'black'
      });

      // Make the arrow non-interactive during preview
      arrow.set({
        selectable: false,
        evented: false,
      });

      ctx.fabricCanvas.add(arrow);
      store.setCurrentArrow(arrow);
    } else {
      // Continue drawing or finish the arrow
      if (store.currentArrow && store.lineStartPoint) {
        if (isShiftPressed) {
          // Shift + Click: Continue the arrow from the current endpoint
          // Finalize the current arrow
          const finalArrow = createArrow(
            store.lineStartPoint.x,
            store.lineStartPoint.y,
            pointer.x,
            pointer.y,
            {
              stroke: 'black',
              strokeWidth: 8,
              arrowSize: 20,
              fill: 'black'
            }
          );

          // Remove the temporary arrow and add the final one
          ctx.fabricCanvas.remove(store.currentArrow);
          ctx.fabricCanvas.add(finalArrow);

          // Save canvas state for this segment
          if (this.isInitialized) {
            const canvasJSON = ctx.fabricCanvas!.toJSON();
            const saveState = useCanvasStore.getState().saveState;
            saveState(canvasJSON);
          }

          // Start a new arrow segment from the current endpoint
          store.setLineStartPoint({ x: pointer.x, y: pointer.y });
          store.setIsDrawingArrow(true);

          // Create a new temporary arrow for the next segment
          const newArrow = createArrow(pointer.x, pointer.y, pointer.x, pointer.y, {
            stroke: 'black',
            strokeWidth: 8,
            arrowSize: 20,
            fill: 'black'
          });

          // Make the new arrow non-interactive during preview
          newArrow.set({
            selectable: false,
            evented: false,
          });

          ctx.fabricCanvas.add(newArrow);
          store.setCurrentArrow(newArrow);

          ctx.fabricCanvas.renderAll();
        } else {
          // Regular Click: End the arrow at the clicked point
          const finalArrow = createArrow(
            store.lineStartPoint.x,
            store.lineStartPoint.y,
            pointer.x,
            pointer.y,
            {
              stroke: 'black',
              strokeWidth: 8,
              arrowSize: 20,
              fill: 'black'
            }
          );

          // Remove the temporary arrow and add the final one
          ctx.fabricCanvas.remove(store.currentArrow);
          ctx.fabricCanvas.add(finalArrow);

          // Reset drawing state
          store.setIsDrawingArrow(false);
          store.setCurrentArrow(undefined);
          store.setLineStartPoint(undefined);

          ctx.fabricCanvas.renderAll();
          if (this.isInitialized) {
            const canvasJSON = ctx.fabricCanvas!.toJSON();
            const saveState = useCanvasStore.getState().saveState;
            saveState(canvasJSON);
          }

          // Switch to select tool after adding arrow
          setTimeout(() => {
            useToolStore.getState().activateTool(ctx, 'select');
          }, 100);
        }
      }
    }
  }

  private handleArrowMove(e: TEvent) {
    const ctx = this.getCtx();
    if (!ctx.fabricCanvas) return;

    const store = useToolStore.getState();

    if (store.isDrawingArrow && store.currentArrow && store.lineStartPoint) {
      const pointer = ctx.fabricCanvas.getScenePoint(e.e);

      // Create updated arrow
      const updatedArrow = createArrow(
        store.lineStartPoint.x,
        store.lineStartPoint.y,
        pointer.x,
        pointer.y,
        {
          stroke: 'black',
          strokeWidth: 8,
          arrowSize: 20,
          fill: 'black'
        }
      );

      // Keep the non-interactive properties
      updatedArrow.set({
        selectable: false,
        evented: false,
      });

      // Remove old arrow and add updated one
      ctx.fabricCanvas.remove(store.currentArrow);
      ctx.fabricCanvas.add(updatedArrow);
      store.setCurrentArrow(updatedArrow);

      ctx.fabricCanvas.renderAll();
    }
  }

  private cancelArrowDrawing() {
    const ctx = this.getCtx();
    const store = useToolStore.getState();

    if (store.isDrawingArrow && store.currentArrow) {
      // Remove the temporary arrow
      ctx.fabricCanvas?.remove(store.currentArrow);

      // Reset drawing state
      store.setIsDrawingArrow(false);
      store.setCurrentArrow(undefined);
      store.setLineStartPoint(undefined);

      ctx.fabricCanvas?.renderAll();
    }
  }

  private handleCustomIconClick(e: TEvent) {
    const ctx = this.getCtx();
    if (!ctx.fabricCanvas) return;

    const pointer = ctx.fabricCanvas.getScenePoint(e.e);
    const store = useToolStore.getState();

    // Get the selected tool type
    const iconType = store.selectedTool as 'pits' | 'triangle' | 'gp' | 'junction';

    if (iconType !== 'pits' && iconType !== 'triangle' && iconType !== 'gp' && iconType !== 'junction') {
      return;
    }

    try {
      // Create the custom icon at the clicked position
      const customIcon = createCustomIcon(iconType, {
        left: pointer.x,
        top: pointer.y,
        size: 40, // Increased size for better visibility
        strokeWidth: 3
      });

      // Add the icon to the canvas
      ctx.fabricCanvas.add(customIcon);
      ctx.fabricCanvas.setActiveObject(customIcon);

      // Reset to select tool after adding icon
      setTimeout(() => {
        useToolStore.getState().activateTool(ctx, 'select');
      }, 100);
    } catch (error) {
      console.error('Error creating custom icon:', error);
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

  public deleteSelectedObjects() {
    const ctx = this.getCtx();
    if (!ctx.fabricCanvas) return;

    const activeObjects = ctx.fabricCanvas.getActiveObjects();
    if (activeObjects && activeObjects.length > 0) {
      const isBatchDelete = activeObjects.length > 1;

      // Set batch delete flag for multi-selection deletes
      if (isBatchDelete) {
        this.isBatchDelete = true;
      }

      // Delete all selected objects
      activeObjects.forEach((obj) => {
        // Don't delete GeoJSON objects (polylines from the map)
        if (obj.type !== 'polyline') {
          ctx.fabricCanvas!.remove(obj);
        }
      });

      // Clear selection after deletion
      ctx.fabricCanvas.discardActiveObject();
      ctx.fabricCanvas.renderAll();

      // For batch deletes, save state once after all deletions
      // For single deletes, the normal event handling will save
      if (isBatchDelete) {
        setTimeout(() => {
          if (this.isInitialized) {
            const canvasJSON = ctx.fabricCanvas!.toJSON();
            const saveState = useCanvasStore.getState().saveState;
            saveState(canvasJSON);
          }
          // Reset batch delete flag
          this.isBatchDelete = false;
        }, 10); // Small delay to ensure all removal events are processed
      }
    }
  }

  private calculateBounds(objects: fabric.Object[]): { left: number; top: number; width: number; height: number } | undefined {
    if (objects.length === 0) return undefined;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    objects.forEach((obj) => {
      const bounds = obj.getBoundingRect();
      minX = Math.min(minX, bounds.left);
      minY = Math.min(minY, bounds.top);
      maxX = Math.max(maxX, bounds.left + bounds.width);
      maxY = Math.max(maxY, bounds.top + bounds.height);
    });

    return {
      left: minX,
      top: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  public clearClipboard() {
    this.clipboard = [];
    this.clipboardBounds = undefined;
    this.pasteOffset = 10;
  }

  public setInitialization(enabled: boolean) {
    this.isInitialized = enabled;
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

    // Clear clipboard
    this.clearClipboard();

    // Unsubscribe from store
    if (this.unsubscribeStore) {
      this.unsubscribeStore();
    }
  }
}