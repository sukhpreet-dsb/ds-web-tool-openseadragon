import { useRef, useEffect, useState } from "react";
import OpenSeadragon from "openseadragon";
import * as fabric from "fabric";
import { initOSDFabricJS } from "openseadragon-fabric";

// Constants for better maintainability
const COLORS = {
  BORDER: "#22a2f8",
  CORNER: "white",
  RED: "#ff0000",
  GREEN: "#00ff00",
  BLACK: "#000000",
};

const TOOL_TYPES = {
  SELECT: "select",
  DRAW: "draw",
  RECTANGLE: "rectangle",
  CIRCLE: "circle",
  TEXT: "text",
};

const CANVAS_OPTIONS = {
  selection: true,
  preserveObjectStacking: true,
};

const OBJECT_DEFAULTS = {
  borderColor: COLORS.BORDER,
  borderScaleFactor: 2,
  cornerColor: COLORS.CORNER,
  cornerSize: 10,
  transparentCorners: false,
};

const BRUSH_CONFIG = {
  width: 10,
  color: COLORS.RED,
};

const MapDrawingViewer = () => {
  // Refs for DOM elements
  const viewerRef = useRef<HTMLDivElement | null>(null);

  // State for viewer and canvas instances
  const [viewer, setViewer] = useState<OpenSeadragon.Viewer>();
  const [fabricOverlay, setFabricOverlay] = useState(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas>();

  // State for UI
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [selectedTool, setSelectedTool] = useState(TOOL_TYPES.SELECT);

  // Initialize the viewer and canvas
  useEffect(() => {
    if (!viewerRef.current) return;

    // Initialize the fabric plugin before creating viewers
    initOSDFabricJS();

    // Create OpenSeadragon viewer with map tiles
    const osdViewer = createViewer();

    // Set up event handlers
    osdViewer.addHandler("open", () => {
      const { overlay, canvas } = initializeFabricOverlay(osdViewer);
      configureCanvasAppearance();
      setupCanvasEventHandlers(canvas, osdViewer);

      // Update state
      setViewer(osdViewer);
      setFabricOverlay(overlay);
      setFabricCanvas(canvas);
    });

    // Handle window resize
    const handleResize = () => {
      if (fabricOverlay) {
        fabricOverlay.resize();
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
      if (osdViewer) {
        osdViewer.destroy();
      }
    };
  }, []);

  // Helper function to create the OpenSeadragon viewer
  const createViewer = () => {
    return OpenSeadragon({
      element: viewerRef.current,
      tileSources: {
        type: "openstreetmaps"
      },
      showNavigator: true,
      navigatorPosition: "TOP_RIGHT",
      showRotationControl: true,
      gestureSettingsMouse: {
        flickEnabled: true,
        clickToZoom: true,
      },
      zoomInButton: "zoom-in-btn",
      zoomOutButton: "zoom-out-btn",
      homeButton: "home-btn",
      fullPageButton: "fullscreen-btn",
    });
  };

  // Helper function to initialize the Fabric overlay
  const initializeFabricOverlay = (osdViewer) => {
    const overlay = osdViewer.fabricOverlay({
      fabricCanvasOptions: CANVAS_OPTIONS,
      scale: 1000, // Arbitrary scale for fabric canvas coordinates
    });

    const canvas = overlay.fabricCanvas();
    return { overlay, canvas };
  };

  // Helper function to configure canvas appearance
  const configureCanvasAppearance = () => {
    fabric.Object.prototype.set(OBJECT_DEFAULTS);
  };

  // Helper function to set up canvas event handlers
  const setupCanvasEventHandlers = (canvas, osdViewer) => {
    // Mouse down event
    canvas.on("mouse:down", (e) => {
      if (selectedTool === TOOL_TYPES.SELECT || e.target) {
        osdViewer.setMouseNavEnabled(false);
      }
    });

    // Mouse move event
    canvas.on("mouse:move", (e) => {
      if (selectedTool === TOOL_TYPES.SELECT && e.target) {
        osdViewer.setMouseNavEnabled(false);
      }
    });

    // Mouse up event
    canvas.on("mouse:up", (e) => {
      if (selectedTool !== TOOL_TYPES.DRAW) {
        setTimeout(() => {
          osdViewer.setMouseNavEnabled(true);
        }, 100);
      }
    });

    // Selection events
    canvas.on("selection:created", () => {
      osdViewer.setMouseNavEnabled(false);
    });

    canvas.on("selection:updated", () => {
      osdViewer.setMouseNavEnabled(false);
    });

    canvas.on("selection:cleared", () => {
      if (selectedTool !== TOOL_TYPES.DRAW) {
        osdViewer.setMouseNavEnabled(true);
      }
    });

    // Object modification events
    canvas.on("object:moving", () => {
      osdViewer.setMouseNavEnabled(false);
    });

    canvas.on("object:scaling", () => {
      osdViewer.setMouseNavEnabled(false);
    });

    canvas.on("object:rotating", () => {
      osdViewer.setMouseNavEnabled(false);
    });

    canvas.on("object:modified", () => {
      setTimeout(() => {
        if (selectedTool !== TOOL_TYPES.DRAW) {
          osdViewer.setMouseNavEnabled(true);
        }
      }, 100);
    });
  };

  // Tool handlers
  const handleToolChange = (tool) => {
    if (!fabricCanvas || !viewer) return;

    setSelectedTool(tool);

    // Reset drawing mode and enable map navigation by default
    fabricCanvas.isDrawingMode = false;
    fabricCanvas.selection = false;
    viewer.setMouseNavEnabled(true);

    switch (tool) {
      case TOOL_TYPES.SELECT:
        fabricCanvas.selection = true;
        viewer.setMouseNavEnabled(false);
        break;

      case TOOL_TYPES.DRAW:
        setIsDrawingMode(true);
        fabricCanvas.isDrawingMode = true;
        fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
        fabricCanvas.freeDrawingBrush.width = BRUSH_CONFIG.width;
        fabricCanvas.freeDrawingBrush.color = BRUSH_CONFIG.color;
        viewer.setMouseNavEnabled(false);
        break;

      case TOOL_TYPES.RECTANGLE:
        addRectangle();
        break;

      case TOOL_TYPES.CIRCLE:
        addCircle();
        break;

      case TOOL_TYPES.TEXT:
        addText();
        break;

      default:
        break;
    }
  };

  const addRectangle = () => {
    if (!fabricCanvas) return;

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 150,
      fill: "rgba(255, 0, 0, 0.3)",
      stroke: COLORS.RED,
      strokeWidth: 2,
    });

    fabricCanvas.add(rect);
    fabricCanvas.setActiveObject(rect);
  };

  const addCircle = () => {
    if (!fabricCanvas) return;

    const circle = new fabric.Circle({
      left: 150,
      top: 150,
      radius: 75,
      fill: "rgba(0, 255, 0, 0.3)",
      stroke: COLORS.GREEN,
      strokeWidth: 2,
    });

    fabricCanvas.add(circle);
    fabricCanvas.setActiveObject(circle);
  };

  const addText = () => {
    if (!fabricCanvas) return;

    const text = new fabric.Textbox("Click to edit text", {
      left: 100,
      top: 200,
      width: 200,
      fontSize: 20,
      fontFamily: "Arial",
      fill: COLORS.BLACK,
      textAlign: "center",
    });

    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
  };

  const deleteSelected = () => {
    if (!fabricCanvas) return;

    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      fabricCanvas.remove(...activeObjects);
      fabricCanvas.discardActiveObject();
    }
  };

  const clearAll = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
  };

  const exportData = () => {
    if (!fabricCanvas) return;

    const data = {
      objects: fabricCanvas.toJSON(),
      viewerState: viewer
        ? {
            zoom: viewer.viewport.getZoom(),
            center: viewer.viewport.getCenter(),
            rotation: viewer.viewport.getRotation(),
          }
        : null,
    };

    console.log("Exported data:", data);
    return data;
  };

  return (
    <div
      className="map-drawing-container"
      style={{ width: "100%", height: "100vh", position: "relative" }}
    >
      {/* Toolbar */}
      <Toolbar
        selectedTool={selectedTool}
        onToolChange={handleToolChange}
        onDeleteSelected={deleteSelected}
        onClearAll={clearAll}
        onExport={exportData}
      />

      {/* OpenSeadragon Navigation Controls */}
      <NavigationControls />

      {/* Viewer Container */}
      <div
        ref={viewerRef}
        style={{ width: "100%", height: "100%", background: "#000" }}
      />

      {/* Status Info */}
      {fabricCanvas && (
        <StatusInfo
          objectCount={fabricCanvas.getObjects().length}
          isDrawingMode={isDrawingMode}
          selectedTool={selectedTool}
        />
      )}
    </div>
  );
};

// Extracted Toolbar component
const Toolbar = ({
  selectedTool,
  onToolChange,
  onDeleteSelected,
  onClearAll,
  onExport,
}) => (
  <div
    className="toolbar"
    style={{
      position: "absolute",
      top: "10px",
      left: "10px",
      zIndex: 1000,
      background: "rgba(255, 255, 255, 0.9)",
      padding: "10px",
      borderRadius: "5px",
      display: "flex",
      flexWrap: "wrap",
      gap: "5px",
    }}
  >
    <button
      onClick={() => onToolChange(TOOL_TYPES.SELECT)}
      className={selectedTool === TOOL_TYPES.SELECT ? "active" : ""}
    >
      Select
    </button>
    <button
      onClick={() => onToolChange(TOOL_TYPES.DRAW)}
      className={selectedTool === TOOL_TYPES.DRAW ? "active" : ""}
    >
      Draw
    </button>
    <button onClick={() => onToolChange(TOOL_TYPES.RECTANGLE)}>
      Rectangle
    </button>
    <button onClick={() => onToolChange(TOOL_TYPES.CIRCLE)}>Circle</button>
    <button onClick={() => onToolChange(TOOL_TYPES.TEXT)}>Text</button>
    <button
      onClick={onDeleteSelected}
      style={{ backgroundColor: "#ff4444", color: "white" }}
    >
      Delete Selected
    </button>
    <button
      onClick={onClearAll}
      style={{ backgroundColor: "#ff6666", color: "white" }}
    >
      Clear All
    </button>
    <button
      onClick={onExport}
      style={{ backgroundColor: "#4CAF50", color: "white" }}
    >
      Export
    </button>
  </div>
);

// Extracted NavigationControls component
const NavigationControls = () => (
  <div
    className="osd-controls"
    style={{
      position: "absolute",
      top: "10px",
      right: "10px",
      zIndex: 1000,
      display: "flex",
      flexDirection: "column",
      gap: "5px",
    }}
  >
    <button id="zoom-in-btn">+</button>
    <button id="zoom-out-btn">-</button>
    <button id="home-btn">🏠</button>
    <button id="fullscreen-btn">⛶</button>
  </div>
);

// Extracted StatusInfo component
const StatusInfo = ({ objectCount, isDrawingMode, selectedTool }) => (
  <div
    style={{
      position: "absolute",
      bottom: "10px",
      left: "10px",
      background: "rgba(255, 255, 255, 0.8)",
      padding: "5px 10px",
      borderRadius: "3px",
      fontSize: "12px",
    }}
  >
    Objects: {objectCount} | Mode: {isDrawingMode ? "Drawing" : "Selection"} |
    Tool: {selectedTool}
  </div>
);

export default MapDrawingViewer;
