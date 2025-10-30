import OpenSeadragon from "openseadragon";
import type { Position } from "../types";
import type { FeatureCollection } from "../types";
import * as fabric from "fabric";

/**
 * Converts longitude/latitude coordinates to OpenSeadragon coordinate systems
 * @param lng - Longitude coordinate
 * @param lat - Latitude coordinate
 * @param osdViewer - OpenSeadragon viewer instance
 * @returns Object containing pixel, viewport, and image coordinates
 */
export function convertLngLatToOsdCoordinates(
  lng: number,
  lat: number,
  osdViewer: OpenSeadragon.Viewer
) {
  // Use zoom level 22 to match Mapbox tile source dimensions
  const maxZoomLevel = 22;
  const worldSize = Math.pow(2, maxZoomLevel) * 256;

  // Convert lat/lng to pixel coordinates using Web Mercator projection
  const pixelX = ((lng + 180) / 360) * worldSize;
  const pixelY =
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
    worldSize;

  // Convert pixel coordinates to viewport coordinates
  const pixelPoint = new OpenSeadragon.Point(pixelX, pixelY);
  const viewportPoint =
    osdViewer.viewport.imageToViewportCoordinates(pixelPoint);

  // Convert viewport coordinates to image coordinates (for fabric positioning)
  const imagePoint =
    osdViewer.viewport.viewportToImageCoordinates(viewportPoint);

  return {
    pixel: pixelPoint,
    viewport: viewportPoint,
    image: imagePoint,
  };
}

/**
 * Zooms to the specified center coordinates on the map
 * @param center - Center coordinates [lng, lat]
 * @param osdViewer - OpenSeadragon viewer instance
 */
export function zoomToMapCenter(
  center: Position,
  osdViewer: OpenSeadragon.Viewer
) {
  if (!center || center.length !== 2) return;

  const [lng, lat] = center;
  // console.log("Original center lng/lat:", { lng, lat });

  try {
    // Use the reusable coordinate conversion function
    const coordinates = convertLngLatToOsdCoordinates(lng, lat, osdViewer);
    // console.log("Converted coordinates:", coordinates);

    // Pan to the calculated location and zoom to appropriate level
    osdViewer.viewport.panTo(coordinates.viewport);
    osdViewer.viewport.zoomTo(3500); // Good zoom level for fiber optic network viewing

    // Verify the result
    // setTimeout(() => {
    //   const newCenter = osdViewer.viewport.getCenter();
    //   const newZoom = osdViewer.viewport.getZoom();
    //   console.log("Final position:", {
    //     center: newCenter,
    //     zoom: newZoom,
    //     target: coordinates.viewport,
    //     originalLngLat: { lng, lat },
    //   });

    //   // Check if we're in the right area
    //   const deltaX = Math.abs(newCenter.x - coordinates.viewport.x);
    //   const deltaY = Math.abs(newCenter.y - coordinates.viewport.y);

    //   if (deltaX < 0.01 && deltaY < 0.01) {
    //     console.log("✅ Successfully positioned to coordinates!");
    //   } else {
    //     console.warn("⚠️ Position may not be accurate. Delta:", {
    //       deltaX,
    //       deltaY,
    //     });
    //   }
    // }, 1000);
  } catch (error) {
    console.error("Error zooming to center:", error);
    // Fallback: just zoom to a reasonable level
    osdViewer.viewport.zoomTo(8);
  }
}

/**
 * Converts OpenSeadragon viewport coordinates back to geographic coordinates
 * @param viewportPoint - OpenSeadragon viewport point
 * @param osdViewer - OpenSeadragon viewer instance
 * @returns Geographic coordinates [lng, lat]
 */
export function convertOsdCoordinatesToLngLat(
  viewportPoint: OpenSeadragon.Point,
  osdViewer: OpenSeadragon.Viewer
): Position {
  // Convert viewport to image coordinates
  const imagePoint = osdViewer.viewport.viewportToImageCoordinates(viewportPoint);

  // Convert image coordinates to geographic coordinates
  const maxZoomLevel = 22;
  const worldSize = Math.pow(2, maxZoomLevel) * 256;

  // Convert pixel coordinates to lat/lng using Web Mercator inverse projection
  const x = (imagePoint.x / worldSize) * 360 - 180;

  // Fix the Web Mercator Y conversion
  const y = 0.5 - (imagePoint.y / worldSize);
  const latRad = Math.atan(Math.exp(y * 2 * Math.PI)) * 2 - Math.PI / 2;
  const latDeg = latRad * 180 / Math.PI;

  return [x, latDeg];
}

/**
 * Calculates bounds from selected Fabric objects
 * @param objects - Array of Fabric objects
 * @param osdViewer - OpenSeadragon viewer instance
 * @returns Geographic bounds {minLng, maxLng, minLat, maxLat}
 */
export function getBoundsFromFabricObjects(
  objects: fabric.Object[],
  osdViewer: OpenSeadragon.Viewer
): { minLng: number; maxLng: number; minLat: number; maxLat: number } | null {
  if (!objects || objects.length === 0) return null;

  let minLng = Infinity, maxLng = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;

  objects.forEach((obj) => {
    // Get object bounds in viewport coordinates
    const bounds = obj.getBoundingRect();
    const topLeft = osdViewer.viewport.imageToViewportCoordinates(
      new OpenSeadragon.Point(bounds.left, bounds.top)
    );
    const bottomRight = osdViewer.viewport.imageToViewportCoordinates(
      new OpenSeadragon.Point(bounds.left + bounds.width, bounds.top + bounds.height)
    );

    // Convert to geographic coordinates
    const topLeftGeo = convertOsdCoordinatesToLngLat(topLeft, osdViewer);
    const bottomRightGeo = convertOsdCoordinatesToLngLat(bottomRight, osdViewer);

    minLng = Math.min(minLng, topLeftGeo[0], bottomRightGeo[0]);
    maxLng = Math.max(maxLng, topLeftGeo[0], bottomRightGeo[0]);
    minLat = Math.min(minLat, topLeftGeo[1], bottomRightGeo[1]);
    maxLat = Math.max(maxLat, topLeftGeo[1], bottomRightGeo[1]);
  });

  return { minLng, maxLng, minLat, maxLat };
}

/**
 * Calculates bounds from GeoJSON data
 * @param geojson - Feature collection
 * @returns Geographic bounds {minLng, maxLng, minLat, maxLat}
 */
export function getGeographicBounds(
  geojson: FeatureCollection
): { minLng: number; maxLng: number; minLat: number; maxLat: number } | null {
  if (!geojson || !geojson.features || geojson.features.length === 0) return null;

  let minLng = Infinity, maxLng = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;

  geojson.features.forEach((feature) => {
    if (feature.geometry.type === "LineString") {
      feature.geometry.coordinates.forEach(([lng, lat]) => {
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      });
    } else if (feature.geometry.type === "Point") {
      const [lng, lat] = feature.geometry.coordinates;
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    }
  });

  return { minLng, maxLng, minLat, maxLat };
}

/**
 * Zooms to specific geographic bounds with the desired zoom level
 * @param bounds - Geographic bounds {minLng, maxLng, minLat, maxLat}
 * @param osdViewer - OpenSeadragon viewer instance
 */
export function zoomToBounds(
  bounds: { minLng: number; maxLng: number; minLat: number; maxLat: number },
  osdViewer: OpenSeadragon.Viewer
) {
  if (!bounds) return;

  // Calculate center of bounds
  const centerLng = (bounds.minLng + bounds.maxLng) / 2;
  const centerLat = (bounds.minLat + bounds.maxLat) / 2;

  // Convert center to OpenSeadragon coordinates
  const coordinates = convertLngLatToOsdCoordinates(centerLng, centerLat, osdViewer);

  // Pan to center and zoom to level 3500 as requested
  osdViewer.viewport.panTo(coordinates.viewport);
  osdViewer.viewport.zoomTo(3500);
}

/**
 * Intelligent zoom function for map view switching
 * @param fabricCanvas - Fabric.js canvas instance
 * @param osdViewer - OpenSeadragon viewer instance
 * @param geojson - GeoJSON feature collection for fallback
 */
export function intelligentZoomForMapSwitch(
  fabricCanvas: fabric.Canvas,
  osdViewer: OpenSeadragon.Viewer,
  geojson: FeatureCollection
) {
  // Get currently selected objects
  const selectedObjects = fabricCanvas.getActiveObjects();

  if (selectedObjects && selectedObjects.length > 0) {
    // Zoom to selected objects
    const bounds = getBoundsFromFabricObjects(selectedObjects, osdViewer);
    if (bounds) {
      console.log("Zooming to selected objects:", bounds);
      zoomToBounds(bounds, osdViewer);
    }
  } else {
    // No selection, zoom to entire GeoJSON dataset
    const bounds = getGeographicBounds(geojson);
    if (bounds) {
      console.log("Zooming to GeoJSON bounds:", bounds);
      zoomToBounds(bounds, osdViewer);
    }
  }
}
