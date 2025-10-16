import { useRef, useEffect, useState } from "react";
import OpenSeadragon from "openseadragon";
import * as fabric from "fabric";
import { FabricOverlay, initOSDFabricJS } from "openseadragon-fabric";
import {
  fixGeoJsonCoordinateTypes,
  getGeoJsonCenter,
} from "../utils/geojson-coordinate";
import { zoomToMapCenter } from "../utils/coordinate-conversion";
import {
  initializeFabricOverlay,
  drawGeoJsonFeatures,
} from "../utils/fabric-js-helpers";
import {
  createOpenSeadragonViewer,
  setupViewerResizeHandler,
} from "../utils/openseadragon-helpers";
import type { FeatureCollection } from "../types";
import geojson from "../assets/file2.json";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Minus, MousePointer2 } from "lucide-react";

const cleanGeoJson = fixGeoJsonCoordinateTypes(
  geojson as unknown as FeatureCollection
);

const MapWithFabric = () => {
  // Refs for DOM elements
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const center = getGeoJsonCenter(cleanGeoJson);

  // State for viewer and canvas instances
  const [viewer, setViewer] = useState<OpenSeadragon.Viewer>();
  const [, setFabricOverlay] = useState<FabricOverlay | null>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas>();
  const [open, setOpen] = useState(true);
  const [selectedTool, setSelectedTool] = useState("");
  const [, setIsDrawingMode] = useState(false);

  // Initialize the viewer and canvas
  useEffect(() => {
    if (!viewerRef.current) return;

    // Initialize the fabric plugin before creating viewers
    initOSDFabricJS();

    // Create OpenSeadragon viewer with map tiles
    const osdViewer = createOpenSeadragonViewer(viewerRef.current);

    // Set up event handlers
    osdViewer.addHandler("open", () => {
      const { overlay, canvas } = initializeFabricOverlay(osdViewer);
      // Update state
      setViewer(osdViewer);
      setupCanvasEventHandlers(canvas, osdViewer);
      setFabricOverlay(overlay);
      setFabricCanvas(canvas);

      // Zoom to center after viewer is ready
      zoomToMapCenter(center, osdViewer);

      // Draw GeoJSON features after zooming
      setTimeout(() => {
        drawGeoJsonFeatures(canvas, osdViewer, cleanGeoJson);
      }, 1500);
    });

    // Handle window resize
    const cleanupResize = setupViewerResizeHandler(osdViewer);

    // Cleanup function
    return () => {
      cleanupResize();
      if (osdViewer) {
        osdViewer.destroy();
      }
    };
  }, []);

  // Helper function to set up canvas event handlers
  const setupCanvasEventHandlers = (canvas:fabric.Canvas, osdViewer:OpenSeadragon.Viewer) => {
    // Mouse down event
    canvas.on("mouse:down", (e) => {
      if (selectedTool === "select" || e.target) {
        osdViewer.setMouseNavEnabled(false);
      }
    });

    // Mouse move event
    canvas.on("mouse:move", (e) => {
      if (selectedTool === "select" && e.target) {
        osdViewer.setMouseNavEnabled(false);
      }
    });

    // Mouse up event
    canvas.on("mouse:up", () => {
      if (selectedTool !== "line") {
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
      if (selectedTool !== "line") {
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
        if (selectedTool !== "line") {
          osdViewer.setMouseNavEnabled(true);
        }
      }, 100);
    });
  };

  // Tool handlers
  const handleToolChange = (tool: string) => {
    if (!fabricCanvas || !viewer) return;

    setSelectedTool(tool);

    // Reset drawing mode and enable map navigation by default
    fabricCanvas.isDrawingMode = false;
    fabricCanvas.selection = false;
    viewer.setMouseNavEnabled(true);

    switch (tool) {
      case "select":
        fabricCanvas.selection = true;
        viewer.setMouseNavEnabled(false);
        break;

      case "line":
        setIsDrawingMode(true);
        fabricCanvas.isDrawingMode = true;
        fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
        fabricCanvas.freeDrawingBrush.width = 5;
        fabricCanvas.freeDrawingBrush.color = "black";
        viewer.setMouseNavEnabled(false);
        break;

      default:
        break;
    }
  };

  return (
    <div
      className="map-drawing-container"
      style={{ width: "100%", height: "100vh", position: "relative" }}
    >
      {/* Viewer Container */}
      <div
        ref={viewerRef}
        style={{ width: "100%", height: "100%", background: "#000" }}
      />
      <div className="absolute left-2 top-2">
        <DropdownMenu
          modal={false}
          open={open}
          onOpenChange={(value) => setOpen(value)}
        >
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="cursor-pointer">
              <Menu />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="mt-3"
            align="start"
            onInteractOutside={(e) => e.preventDefault()}
            onPointerDown={(e) => e.preventDefault()}
          >
            <DropdownMenuLabel>Tools</DropdownMenuLabel>
            <DropdownMenuGroup>
              <div className="grid grid-cols-2 gap-4">
                <DropdownMenuItem
                  onSelect={(e) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                    e.preventDefault(), setSelectedTool("line");
                  }}
                  className={`w-full cursor-pointer ${
                    selectedTool === "line" ? "bg-[#e0dfff]" : ""
                  } hover:bg-[#e0dfff] delay-75 transition-all flex justify-center border border-[#8d89fa]`}
                  onClick={() => handleToolChange("line")}
                >
                  <Minus />
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className={`w-full cursor-pointer ${
                    selectedTool === "select" ? "bg-[#e0dfff]" : ""
                  } hover:bg-[#e0dfff] delay-75 transition-all flex justify-center border border-[#8d89fa]`}
                  onClick={() => handleToolChange("select")}
                >
                  <MousePointer2 />
                </DropdownMenuItem>
              </div>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default MapWithFabric;
