// GeoJSON Geometry definitions
export type Position = number[];

type LineStringGeometry = {
  type: "LineString";
  coordinates: Position[];
};

type PointGeometry = {
  type: "Point";
  coordinates: Position;
};

type Geometry = LineStringGeometry | PointGeometry;

// Example properties interface inferred from your data
export interface FeatureProperties {
  name?: string;
  styleUrl?: string;
  styleHash?: string;
  styleMapHash?: {
    normal?: string;
    highlight?: string;
  };
  icon?: string;
  "Sr__No_"?: string;
  Circle_Name?: string;
  Site_ID?: string;
  UID?: string;
  Lat?: string;
  Long?: string;
  Address?: string;
  "INFRA_OWNER__Indus___Infratel___Viom__etc__"?: string;
  Site_Connectivity_Type?: string;
  Route_Name?: string;
  "Type__LM_Route_"?: string;
  unnamed?: string;
  Tapping_Location_ID?: string;
  Tapping_Location_Type?: string;

  // For any extra unexpected property
  [k: string]: unknown;
}

export interface Feature {
  type: "Feature";
  geometry: Geometry;
  properties: FeatureProperties;
}

export interface Features {
  properties: FeatureProperties;
}

export interface FeatureCollection {
  type: "FeatureCollection";
  features: Feature[];
}