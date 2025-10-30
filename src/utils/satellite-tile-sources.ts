export interface SatelliteTileSource {
    height: number;
    width: number;
    tileSize: number;
    minLevel: number;
    maxLevel: number;
    getTileUrl: (level: number, x: number, y: number) => string;
  }
  
  /**
   * Creates Mapbox Satellite Streets Tile Source
   * Combines satellite imagery with vector street/label overlays
   *
   * @param accessToken - Mapbox access token
   * @returns Tile source configuration for satellite + streets
   */
  export const createMapboxSatelliteStreetsTileSource = (
    accessToken: string
  ): SatelliteTileSource => {
    if (!accessToken || accessToken.trim() === '') {
      throw new Error('Mapbox access token is required');
    }

    return {
      height: 256 * Math.pow(2, 22),
      width: 256 * Math.pow(2, 22),
      tileSize: 256,
      minLevel: 0,
      maxLevel: 22,
      getTileUrl: function (level: number, x: number, y: number): string {
        // Using Mapbox Static Tiles API for styled tiles
        return `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/256/${level}/${x}/${y}?access_token=${accessToken}`;
      }
    };
  };

  /**
   * Creates Mapbox Streets Tile Source for standard map view
   * Provides vector-based street map with detailed features
   *
   * Mapbox Streets includes:
   * - Road networks (highways, streets, paths)
   * - Buildings and points of interest
   * - Land use and administrative boundaries
   * - Transit information and labels
   *
   * @param accessToken - Mapbox access token from https://account.mapbox.com/
   * @returns Tile source configuration object for OpenSeadragon
   *
   * @see https://docs.mapbox.com/api/maps/styles/
   * @see https://docs.mapbox.com/mapbox-gl-js/style-spec/
   */
  export const createMapboxStreetsTileSource = (
    accessToken: string
  ): SatelliteTileSource => {
    if (!accessToken || accessToken.trim() === '') {
      throw new Error(
        'Mapbox access token is required. Get one at https://account.mapbox.com/'
      );
    }

    return {
      // Maximum dimensions at zoom level 22
      // Formula: 256 * 2^maxLevel (where 256 is the base tile size)
      height: 256 * Math.pow(2, 22),
      width: 256 * Math.pow(2, 22),

      // Mapbox tiles are 256x256 pixels
      tileSize: 256,

      // Zoom level range for Mapbox Streets
      minLevel: 0,
      maxLevel: 22, // Mapbox Streets supports up to zoom 22

      /**
       * Generate tile URL using Mapbox Styles API
       *
       * URL format:
       * https://api.mapbox.com/styles/v1/{username}/{style_id}/tiles/256/{z}/{x}/{y}?access_token={token}
       *
       * Using Mapbox Streets v12 style which provides:
       * - Comprehensive road network
       * - Building footprints
       * - Points of interest
       * - Administrative boundaries
       * - Transit information
       *
       * @param level - Zoom level (0-22)
       * @param x - Tile column (west to east)
       * @param y - Tile row (north to south)
       * @returns Complete tile URL
       */
      getTileUrl: function (level: number, x: number, y: number): string {
        return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/${level}/${x}/${y}?access_token=${accessToken}`;
      }
    };
  };
  