import { Layers, Map, Satellite } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useMapContext } from "../contexts/MapContext";
import {
  createMapboxSatelliteStreetsTileSource,
  createMapboxStreetsTileSource,
  type SatelliteTileSource,
} from "../utils/satellite-tile-sources";

type MapViewType = "normal" | "satellite-streets"

interface MapViewOption {
  value: MapViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MapView = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<MapViewType>("normal");
  const [isLoading, setIsLoading] = useState(false);
  const [tileSources, setTileSources] = useState<Record<MapViewType, SatelliteTileSource> | null>(null);
  const { viewer } = useMapContext();

  const viewOptions: MapViewOption[] = [
    {
      value: "normal",
      label: "Street",
      icon: Map,
    },
    {
      value: "satellite-streets",
      label: "Satellite",
      icon: Satellite,
    },
  ];

  useEffect(() => {
    if (!viewer) return
    const mapboxToken = import.meta.env.VITE_MAPBOX_KEY;

    const sources: Record<MapViewType, SatelliteTileSource> = {
      "satellite-streets": createMapboxSatelliteStreetsTileSource(mapboxToken!),
      "normal": createMapboxStreetsTileSource(mapboxToken!)
    }
    setTileSources(sources)

    // Open only the current view's tile source initially
    // viewer.open(sources[currentView])
  }, [viewer])

  /**
   * Switches between different map view types
   * @param viewType - The type of map view to switch to
   */
  const handleViewChange = (viewType: MapViewType) => {
    if (!viewer || currentView === viewType || !tileSources) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(false);

    try {
      const savedZoom = viewer.viewport.getZoom();
      const savedCenter = viewer.viewport.getCenter();
      viewer.addOnceHandler('open', () => {
        viewer.viewport.zoomTo(savedZoom, savedCenter, true);
        viewer.viewport.panTo(savedCenter, true);
        setCurrentView(viewType);
        setIsLoading(false);
      });

      viewer.open(tileSources[viewType]);

    } catch (error) {
      console.error("Error switching map view:", error);
    } finally{
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="relative">
        {/* Main Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className={`flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-lg hover:bg-gray-50 transition-colors cursor-pointer ${isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          aria-label="Map view options"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Layers className="w-4 h-4 text-gray-600" />
          )}
          {isLoading && (
            <span className="text-xs text-gray-600">Loading...</span>
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && !isLoading && (
          <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-xl min-w-[140px] z-20 overflow-hidden">
            <div>
              {viewOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = currentView === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => handleViewChange(option.value)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors cursor-pointer ${isSelected ? "bg-blue-50" : ""
                      }`}
                    aria-selected={isSelected}
                    role="option"
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isSelected ? "text-blue-600" : "text-gray-500"
                        }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium ${isSelected ? "text-blue-700" : "text-gray-900"
                          }`}
                      >
                        {option.label}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="relative">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5 relative z-10" />
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 absolute top-1.5 z-0 animate-ping" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && !isLoading && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}
          aria-label="Close map view options"
        />
      )}
    </div>
  );
};

export default MapView;
