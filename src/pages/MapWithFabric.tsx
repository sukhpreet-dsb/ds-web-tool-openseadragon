import { useEffect } from "react";
import { initOSDFabricJS } from "openseadragon-fabric";
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
import { useMapContext, MapProvider } from "../contexts/MapContext";
import { CanvasEventHandler } from "../tools/canvasEventHandler";
import Toolbar from "../components/Toolbar";

const cleanGeoJson = fixGeoJsonCoordinateTypes(
  geojson as unknown as FeatureCollection
);
const center = getGeoJsonCenter(cleanGeoJson);

const MapContent = () => {
  const { viewerRef, canvasEventHandlerRef, setViewer, setFabricCanvas } = useMapContext();

  // Initialize the viewer and canvas
  useEffect(() => {
    if (!viewerRef.current) return;

    // Initialize the fabric plugin before creating viewers
    initOSDFabricJS();

    // Create OpenSeadragon viewer with map tiles
    const osdViewer = createOpenSeadragonViewer(viewerRef.current);
    
    osdViewer.addHandler('canvas-key', function(event) {
      event.preventDefaultAction = true;  // Prevent OSD from handling the key
    });

    // Set up event handlers
    osdViewer.addHandler("open", () => {
      const { canvas } = initializeFabricOverlay(osdViewer);

      // Update context with instances
      setViewer(osdViewer);
      setFabricCanvas(canvas);

      // Set up canvas event handling
      canvasEventHandlerRef.current = new CanvasEventHandler(() => ({
        fabricCanvas: canvas,
        viewer: osdViewer,
        viewerRef: viewerRef,
        canvasEventHandlerRef: canvasEventHandlerRef,
      }));

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
      if (canvasEventHandlerRef.current) {
        canvasEventHandlerRef.current.destroy();
      }
      if (osdViewer) {
        osdViewer.destroy();
      }
    };
  }, [setViewer, setFabricCanvas]);

  return (
    <div className="w-full h-screen relative">
      {/* Viewer Container */}
      <div ref={viewerRef} className="w-full h-full bg-[#000]" />

      {/* Toolbar */}
      <Toolbar />
    </div>
  );
};

const MapWithFabric = () => {
  return (
    <MapProvider>
      <MapContent />
    </MapProvider>
  );
};

export default MapWithFabric;
