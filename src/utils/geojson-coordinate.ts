import type { FeatureCollection } from "../types";

export function fixGeoJsonCoordinateTypes(geojson: FeatureCollection) {
  geojson.features.forEach((feature) => {
    if (feature.geometry.type === "LineString") {
      feature.geometry.coordinates = feature.geometry.coordinates.map(
        (coordArr) => coordArr.map((coord) => Number(coord))
      );
    }

    if (feature.geometry.type === "Point") {
      feature.geometry.coordinates = feature.geometry.coordinates.map((coord) =>
        Number(coord)
      );
    }
  });
  return geojson;
}

// creating center point from geojson data
export function getGeoJsonCenter(geojson: FeatureCollection) {
  const coords: number[][] = [];
  geojson.features.forEach((feature) => {
    if (feature.geometry.type === "Point") {
      coords.push(feature.geometry.coordinates.slice(0, 2));
    }
    if (feature.geometry.type === "LineString") {
      feature.geometry.coordinates.forEach((c) =>
        coords.push(c.slice(0, 2) as [number, number])
      );
    }
  });
  if (!coords.length) return [0, 0];
  const [lngSum, latSum] = coords.reduce(
    ([lngA, latA], [lngB, latB]) => [lngA + lngB, latA + latB],
    [0, 0]
  );
  return [lngSum / coords.length, latSum / coords.length]; // Return [lng, lat]
}
