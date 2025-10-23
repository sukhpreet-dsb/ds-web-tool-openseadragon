import * as fabric from "fabric";
import OpenSeadragon from "openseadragon";
import type { FeatureCollection, FeatureProperties, Position } from "../types";
import { convertLngLatToOsdCoordinates } from "./coordinate-conversion";

export const CANVAS_OPTIONS: fabric.TOptions<fabric.CanvasOptions> = {
  selection: true,
  preserveObjectStacking: true,
  targetFindTolerance: 5,
  allowTouchScrolling: false,
  imageSmoothingEnabled: true,
};

/**
 * Initializes the Fabric overlay for OpenSeadragon viewer
 * @param osdViewer - OpenSeadragon viewer instance
 * @returns Object containing overlay and canvas instances
 */
export function initializeFabricOverlay(osdViewer: OpenSeadragon.Viewer) {
  const overlay = osdViewer.fabricOverlay({
    fabricCanvasOptions: CANVAS_OPTIONS,
  });

  const canvas = overlay.fabricCanvas();
   canvas.defaultCursor = 'grab';
          canvas.hoverCursor = 'grab';  

          if (osdViewer && osdViewer.container) {
          osdViewer.container.style.cursor = 'grab';

          // Add event listeners for grab/grabbing cursor during drag
          const handleMouseDown = () => {
            osdViewer.container.style.cursor = 'grabbing';
          };

          const handleMouseUp = () => {
            osdViewer.container.style.cursor = 'grab';
          };

          // Remove existing listeners to avoid duplicates
          osdViewer.container.removeEventListener('mousedown', handleMouseDown);
          osdViewer.container.removeEventListener('mouseup', handleMouseUp);

          // Add new listeners
          osdViewer.container.addEventListener('mousedown', handleMouseDown);
          osdViewer.container.addEventListener('mouseup', handleMouseUp);
        }
  return { overlay, canvas };
}

/**
 * Creates a fabric Circle object from GeoJSON Point coordinates
 * @param coordinates - Position [lng, lat]
 * @param properties - Feature properties
 * @param osdViewer - OpenSeadragon viewer instance
 * @returns Fabric Circle object
 */
export function createPointFabricObject(
  coordinates: Position,
  properties: FeatureProperties,
  osdViewer: OpenSeadragon.Viewer
) {
  const [lng, lat] = coordinates;
  const fabricCoords = convertLngLatToOsdCoordinates(lng, lat, osdViewer);

  return new fabric.Circle({
    left: fabricCoords.image.x - 5,
    top: fabricCoords.image.y - 5,
    radius: 5,
    fill: "rgba(0, 123, 255, 0.8)",
    stroke: "#0056b3",
    strokeWidth: 1,
    selectable: false,
    evented: false,
    perPixelTargetFind: false,
    data: { properties, type: "Point" },
  });
}

/**
 * Creates a fabric Polyline object from GeoJSON LineString coordinates
 * @param coordinates - Array of positions [[lng, lat], ...]
 * @param properties - Feature properties
 * @param osdViewer - OpenSeadragon viewer instance
 * @returns Fabric Polyline object
 */
export function createLineStringFabricObject(
  coordinates: Position[],
  properties: FeatureProperties,
  osdViewer: OpenSeadragon.Viewer
) {
  const points = coordinates.map(([lng, lat]) => {
    const fabricCoords = convertLngLatToOsdCoordinates(lng, lat, osdViewer);
    return { x: fabricCoords.image.x, y: fabricCoords.image.y };
  });

  return new fabric.Polyline(points, {
    fill: "transparent",
    stroke: "blue",
    strokeWidth: 10,
    selectable: false,
    evented: false,
    perPixelTargetFind: false,
    excludeFromExport: false,
    data: { properties, type: "LineString" },
  });
}

/**
 * Draws GeoJSON features on the fabric canvas
 * @param canvas - Fabric canvas instance
 * @param osdViewer - OpenSeadragon viewer instance
 * @param geoJson - GeoJSON feature collection
 */
export function drawGeoJsonFeatures(
  canvas: fabric.Canvas,
  osdViewer: OpenSeadragon.Viewer,
  geoJson: FeatureCollection
) {
  geoJson.features.forEach((feature, index) => {
    try {
      let fabricObject: fabric.Object;

      if (feature.geometry.type === "Point") {
        fabricObject = createPointFabricObject(
          feature.geometry.coordinates,
          feature.properties,
          osdViewer
        );
      } else if (feature.geometry.type === "LineString") {
        fabricObject = createLineStringFabricObject(
          feature.geometry.coordinates,
          feature.properties,
          osdViewer
        );
      } else {
        console.warn(`Unsupported geometry type: ${feature?.geometry}`);
        return;
      }

      canvas.add(fabricObject);
      // console.log(
      //   `Added ${feature.geometry.type} feature ${index + 1}:`,
      //   feature.properties
      // );
    } catch (error) {
      console.error(`Error drawing feature ${index + 1}:`, error);
    }
  });

  canvas.renderAll();
}
