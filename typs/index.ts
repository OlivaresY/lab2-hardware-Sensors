export interface GeoLog {
  id: string;
  photoUri: string;
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  timestamp: number;
}