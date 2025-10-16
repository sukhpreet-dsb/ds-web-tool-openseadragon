import OpenSeadragon from "openseadragon";

/**
 * Creates and configures an OpenSeadragon viewer with OpenStreetMaps tile source
 * @param containerElement - HTML element to contain the viewer
 * @returns Configured OpenSeadragon viewer instance
 */
export function createOpenSeadragonViewer(containerElement: HTMLElement) {
  return OpenSeadragon({
    element: containerElement,
    showNavigator: false,
    wrapHorizontal: true,
    zoomPerScroll: 1.2,
    minZoomImageRatio: 0.5,
    tileSources: [{
      type: 'openstreetmaps'
    }]
  });
}

/**
 * Handles window resize events for the OpenSeadragon viewer
 * @param osdViewer - OpenSeadragon viewer instance
 * @returns Cleanup function to remove event listener
 */
export function setupViewerResizeHandler(osdViewer: OpenSeadragon.Viewer) {
  const handleResize = () => {
    if (osdViewer && osdViewer.viewport) {
      osdViewer.viewport.goHome(true);
    }
  };

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}