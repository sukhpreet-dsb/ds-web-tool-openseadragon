import OpenSeadragon from "openseadragon";

/**
 * Creates and configures an OpenSeadragon viewer with OpenStreetMaps tile source
 * @param containerElement - HTML element to contain the viewer
 * @returns Configured OpenSeadragon viewer instance
 */
export function createOpenSeadragonViewer(containerElement: HTMLElement) {
  return OpenSeadragon({
    element: containerElement,
    wrapHorizontal: true,
    zoomPerScroll: 1.2,
    minZoomImageRatio: 0.5,
     crossOriginPolicy:"Anonymous",
    showRotationControl: true,
    tileSources: [
      {
        type: "openstreetmaps",
      },
    ],
    gestureSettingsMouse: {
      flickEnabled: true,
      clickToZoom: false,
    },
    zoomInButton: "zoom-in-btn",
    zoomOutButton: "zoom-out-btn",
  });
}