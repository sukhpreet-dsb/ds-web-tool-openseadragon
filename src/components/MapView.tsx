// src/components/MapView.tsx

import React, { useState } from "react";
import { useMapContext } from "../contexts/MapContext";
import {
  createMapboxSatelliteTileSource,
  createMapboxSatelliteStreetsTileSource,
} from "../utils/satellite-tile-sources";
import { Layers, Map, Satellite, MapPin } from "lucide-react";

type MapViewType = "normal" | "satellite" | "satellite-streets";

interface MapViewOption {
  value: MapViewType;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
}

const MapView = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<MapViewType>("normal");
  const [isLoading, setIsLoading] = useState(false);
  const { viewer } = useMapContext();

  const viewOptions: MapViewOption[] = [
    {
      value: "normal",
      label: "Street Map",
      icon: Map,
      description: "OpenStreetMap view",
    },
    // {
    //   value: "satellite",
    //   label: "Satellite",
    //   icon: Satellite,
    //   description: "High-resolution satellite imagery",
    // },
    {
      value: "satellite-streets",
      label: "Satellite + Streets",
      icon: MapPin,
      description: "Satellite with street",
    },
  ];

  /**
   * Switches between different map view types
   * @param viewType - The type of map view to switch to
   */
  const handleViewChange = (viewType: MapViewType) => {
    if (!viewer || currentView === viewType) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    try {
      // Get Mapbox token from environment variables
      const mapboxToken =
        import.meta.env.VITE_MAPBOX_KEY ||
        import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

      // Validate token for satellite views
      if (
        (viewType === "satellite" || viewType === "satellite-streets") &&
        !mapboxToken
      ) {
        console.error("Mapbox access token is required for satellite view.");
        alert(
          "Satellite view requires a Mapbox access token.\n\n" +
            "Please add VITE_MAPBOX_KEY to your .env file.\n" +
            "Get a free token at https://account.mapbox.com/"
        );
        setIsLoading(false);
        setIsOpen(false);
        return;
      }

      // Remove all existing tiled images
      // This is safer than using replace: true with navigator enabled
      viewer.world.removeAll();

      // Prepare tile source based on view type
      let tileSource: any;

      switch (viewType) {
        case "satellite":
          tileSource = createMapboxSatelliteTileSource(mapboxToken!);
          break;

        case "satellite-streets":
          tileSource = createMapboxSatelliteStreetsTileSource(mapboxToken!);
          break;

        case "normal":
        default:
          tileSource = {
            type: "openstreetmaps",
          };
          break;
      }

      // Add new tiled image
      viewer.addTiledImage({
        tileSource: tileSource,
        index: 0,
        success: (event) => {
          console.log(`Successfully switched to ${viewType} view`);
          setCurrentView(viewType);
          setIsLoading(false);
          setIsOpen(false);

          // Update attribution if needed
          updateAttribution(viewType);
        },
        error: (event) => {
          console.error("Failed to load map tiles:", event);
          alert(
            `Failed to load ${viewType} view.\n\n` +
              "Please check:\n" +
              "1. Your internet connection\n" +
              "2. Your Mapbox access token (for satellite views)\n" +
              "3. Browser console for detailed errors"
          );
          setIsLoading(false);
          setIsOpen(false);
        },
      });
    } catch (error) {
      console.error("Error switching map view:", error);
      alert(
        "An error occurred while switching map views.\n" +
          (error instanceof Error ? error.message : "Unknown error")
      );
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  /**
   * Updates or removes attribution overlay based on map type
   * @param viewType - Current map view type
   */
  const updateAttribution = (viewType: MapViewType) => {
    if (!viewer) return;

    // Remove existing attribution if any
    const existingAttribution = viewer.element.querySelector(
      ".mapbox-attribution"
    );
    if (existingAttribution) {
      existingAttribution.remove();
    }

    // Add Mapbox attribution for satellite views
    if (viewType === "satellite" || viewType === "satellite-streets") {
      const attribution = document.createElement("div");
      attribution.className = "mapbox-attribution";
      attribution.innerHTML =
        '© <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener">Mapbox</a> ' +
        '© <a href="http://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> ' +
        '<strong><a href="https://www.mapbox.com/map-feedback/" target="_blank" rel="noopener">Improve this map</a></strong>';

      attribution.style.cssText = `
        position: absolute;
        bottom: 5px;
        right: 5px;
        background: rgba(255, 255, 255, 0.9);
        padding: 3px 8px;
        font-size: 10px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: 1000;
        border-radius: 3px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        max-width: 350px;
        line-height: 1.4;
      `;

      // Style links
      attribution.querySelectorAll("a").forEach((link) => {
        (link as HTMLAnchorElement).style.color = "#0078a8";
        (link as HTMLAnchorElement).style.textDecoration = "none";
      });

      viewer.element.appendChild(attribution);
    }
  };

  const currentOption = viewOptions.find(
    (option) => option.value === currentView
  );

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="relative">
        {/* Main Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className={`flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-lg hover:bg-gray-50 transition-colors ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
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
          <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-xl min-w-[200px] z-20 overflow-hidden">
            <div className="py-1">
              {viewOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = currentView === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => handleViewChange(option.value)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      isSelected ? "bg-blue-50" : ""
                    }`}
                    aria-selected={isSelected}
                    role="option"
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        isSelected ? "text-blue-600" : "text-gray-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium ${
                          isSelected ? "text-blue-700" : "text-gray-900"
                        }`}
                      >
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {option.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
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
