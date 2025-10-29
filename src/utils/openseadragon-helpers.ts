import OpenSeadragon from "openseadragon";
import { createMapboxStreetsTileSource } from "./satellite-tile-sources";

/**
 * Creates and configures an OpenSeadragon viewer with Mapbox Streets tile source
 * @param containerElement - HTML element to contain the viewer
 * @returns Configured OpenSeadragon viewer instance
 */
export function createOpenSeadragonViewer(containerElement: HTMLElement) {
  // Get Mapbox access token from environment variables
  const mapboxAccessToken = import.meta.env.VITE_MAPBOX_KEY;

  if (!mapboxAccessToken) {
    throw new Error(
      "Mapbox access token is required. Please set VITE_MAPBOX_KEY in your environment variables."
    );
  }

  return OpenSeadragon({
    element: containerElement,
    wrapHorizontal: true,
    zoomPerScroll: 1.2,
    minZoomImageRatio: 0.5,
    showRotationControl: true,
    crossOriginPolicy: "Anonymous", // Fix CORS issues with Mapbox tiles
    tileSources: [
      // Commented out OpenStreetMap configuration
      // {
      //   type: "openstreetmaps",
      // },

      // Using Mapbox Streets tiles for better coordinate consistency with satellite views
      createMapboxStreetsTileSource(mapboxAccessToken),
    ],
    gestureSettingsMouse: {
      flickEnabled: true,
      clickToZoom: false,
    },
    zoomInButton: "zoom-in-btn",
    zoomOutButton: "zoom-out-btn",
  });
}