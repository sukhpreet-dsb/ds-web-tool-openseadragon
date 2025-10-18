import OpenSeadragon from "openseadragon";
import type { Position } from "../types";

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
  const highZoomLevel = 18;
  const highWorldSize = Math.pow(2, highZoomLevel) * 256;

  // Convert lat/lng to pixel coordinates at high zoom level
  const pixelX = ((lng + 180) / 360) * highWorldSize;
  const pixelY =
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
    highWorldSize;

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
