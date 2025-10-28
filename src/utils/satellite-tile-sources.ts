// src/utils/satellite-tile-sources.ts

export interface SatelliteTileSource {
    height: number;
    width: number;
    tileSize: number;
    minLevel: number;
    maxLevel: number;
    getTileUrl: (level: number, x: number, y: number) => string;
  }
  
  /**
   * Creates Mapbox Satellite Tile Source for OpenSeadragon
   * 
   * Mapbox Satellite provides high-quality satellite imagery:
   * - Zoom 0-8: NASA MODIS satellite imagery
   * - Zoom 9-12: Maxar + NASA/USGS Landsat imagery
   * - Zoom 13-16: Maxar Vivid product (global coverage at ~50cm resolution)
   * - Zoom 17-22: Vexcel aerial imagery (select regions at 7.5cm+ resolution)
   * 
   * @param accessToken - Mapbox access token from https://account.mapbox.com/
   * @returns Tile source configuration object for OpenSeadragon
   * 
   * @see https://docs.mapbox.com/api/maps/raster-tiles/
   * @see https://docs.mapbox.com/data/tilesets/reference/mapbox-satellite/
   */
  export const createMapboxSatelliteTileSource = (
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
      
      // Mapbox satellite tiles are 256x256 pixels
      tileSize: 256,
      
      // Zoom level range
      minLevel: 0,
      maxLevel: 22, // Mapbox satellite supports up to zoom 22
      
      /**
       * Generate tile URL using Mapbox Raster Tiles API v4
       * 
       * URL format:
       * https://api.mapbox.com/v4/{tileset_id}/{z}/{x}/{y}{@2x}.{format}?access_token={token}
       * 
       * @param level - Zoom level (0-22)
       * @param x - Tile column (west to east)
       * @param y - Tile row (north to south)
       * @returns Complete tile URL
       */
      getTileUrl: function (level: number, x: number, y: number): string {
        // Using jpg90 for best quality
        // Options: jpg90 (highest quality), jpg80, jpg70 (better performance)
        // Note: Satellite tiles are always JPEG regardless of format specified
        return `https://api.mapbox.com/v4/mapbox.satellite/${level}/${x}/${y}.jpg90?access_token=${accessToken}`;
      }
    };
  };
  
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
  