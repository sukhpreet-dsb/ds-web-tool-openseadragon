import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import OpenSeadragon from 'openseadragon';

export type CTX = {
  fabricCanvas: fabric.Canvas | null;
  viewer: OpenSeadragon.Viewer | null;

  viewerRef: React.RefObject<HTMLDivElement | null>;
  canvasEventHandlerRef: React.RefObject<any>;
}

export interface MapContextType {
  // Refs to store instances
  viewerRef: React.RefObject<HTMLDivElement | null>;
  canvasEventHandlerRef: React.RefObject<any>;

  // State for instances (only set when ready)
  viewer: OpenSeadragon.Viewer | null;
  fabricCanvas: fabric.Canvas | null;

  // Setters for instances
  setViewer: (viewer: OpenSeadragon.Viewer | null) => void;
  setFabricCanvas: (canvas: fabric.Canvas | null) => void;
}

export const MapContext = createContext<MapContextType | null>(null);

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
};

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Refs for DOM elements and event handlers
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const canvasEventHandlerRef = useRef<any>(null);

  // State for instances
  const [viewer, setViewer] = useState<OpenSeadragon.Viewer | null>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);

  // Create stable setters to prevent infinite loops
  const stableSetViewer = useCallback((viewerInstance: OpenSeadragon.Viewer | null) => {
    setViewer(viewerInstance);
  }, []);

  const stableSetFabricCanvas = useCallback((canvasInstance: fabric.Canvas | null) => {
    setFabricCanvas(canvasInstance);
  }, []);

  const contextValue: MapContextType = {
    viewerRef,
    canvasEventHandlerRef,
    viewer,
    fabricCanvas,
    setViewer: stableSetViewer,
    setFabricCanvas: stableSetFabricCanvas,
  };

  return (
    <MapContext.Provider value={contextValue}>
      {children}
    </MapContext.Provider>
  );
};