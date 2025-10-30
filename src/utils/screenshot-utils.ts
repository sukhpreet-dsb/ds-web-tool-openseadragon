import OpenSeadragon from "openseadragon";
import * as fabric from "fabric";

/**
 * Capture a screenshot (map + drawing) of the visible OpenSeadragon viewport.
 * @param osdViewer - OpenSeadragon viewer instance
 * @param fabricCanvas - Fabric.js canvas instance
 * @param options
 * @returns Promise<Blob>
 */
export async function captureMapAndDrawingScreenshot(
  osdViewer: OpenSeadragon.Viewer,
  fabricCanvas: fabric.Canvas,
  options: {
    format?: 'png' | 'jpeg';
    quality?: number;
    backgroundColor?: string;
    scale?: number;
  } = {}
): Promise<Blob> {
  const {
    format = 'png',
    quality = 1.0,
    backgroundColor = '#ffffff',
    scale = 2
  } = options;

  // Get map viewport size
  const viewportSize = osdViewer.viewport.getContainerSize();
  const width = viewportSize.x;
  const height = viewportSize.y;

  // [1] Get OSD canvas - likely at `osdViewer.drawer.canvas`
  // (Adjust selector if needed for your OSD version)
  const osdCanvas =
    osdViewer.drawer?.canvas ||
    osdViewer.canvas ||
    osdViewer.element.querySelector("canvas");
  if (!osdCanvas) {
    throw new Error("OpenSeadragon canvas not found");
  }

  // [2] Get data URLs for map and drawing layers
  const osdMapUrl = (osdCanvas as HTMLCanvasElement).toDataURL("image/png", quality);
  const fabricUrl = fabricCanvas.toDataURL({
    format: "png",
    quality: 1.0,
    multiplier: scale
  });

  // [3] Draw both on a composite canvas
  const composite = document.createElement("canvas");
  composite.width = width * scale;
  composite.height = height * scale;
  const ctx = composite.getContext("2d");
  if (!ctx) throw new Error("Cannot get canvas context for compositing");

  // High quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, composite.width, composite.height);

  // Draw the OSD map image
  await new Promise<void>((resolve, reject) => {
    const baseImg = new window.Image();
    baseImg.onload = () => {
      ctx.drawImage(baseImg, 0, 0, composite.width, composite.height);
      resolve();
    };
    baseImg.onerror = reject;
    baseImg.src = osdMapUrl;
  });

  // Draw the Fabric.js overlay
  await new Promise<void>((resolve, reject) => {
    const overlayImg = new window.Image();
    overlayImg.onload = () => {
      ctx.drawImage(overlayImg, 0, 0, composite.width, composite.height);
      resolve();
    };
    overlayImg.onerror = reject;
    overlayImg.src = fabricUrl;
  });

  // Return as Blob
  return new Promise((resolve, reject) => {
    composite.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create screenshot blob"));
      },
      format === "png" ? "image/png" : "image/jpeg",
      quality
    );
  });
}

/**
 * Download blob as file
 */
export function downloadScreenshot(blob: Blob, filename = "map-screenshot.png") {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
