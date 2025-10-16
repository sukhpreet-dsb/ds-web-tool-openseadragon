import { useRef, useEffect, useState } from "react";
import OpenSeadragon from "openseadragon";
import * as fabric from "fabric";
import { FabricOverlay, initOSDFabricJS } from "openseadragon-fabric";
import { fixGeoJsonCoordinateTypes, getGeoJsonCenter } from "../utils/geojson-coordinate";
import { zoomToMapCenter } from "../utils/coordinate-conversion";
import { initializeFabricOverlay, drawGeoJsonFeatures } from "../utils/fabric-js-helpers";
import { createOpenSeadragonViewer, setupViewerResizeHandler } from "../utils/openseadragon-helpers";
import type { FeatureCollection } from "../types";
import geojson from "../assets/file2.json";

const cleanGeoJson = fixGeoJsonCoordinateTypes(
  geojson as unknown as FeatureCollection
);

const MapWithFabric = () => {
  // Refs for DOM elements
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const center = getGeoJsonCenter(cleanGeoJson);

  // State for viewer and canvas instances
  const [, setViewer] = useState<OpenSeadragon.Viewer>();
  const [, setFabricOverlay] = useState<FabricOverlay | null>(null);
  const [, setFabricCanvas] = useState<fabric.Canvas>();

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
    </div>
  );
};

export default MapWithFabric;