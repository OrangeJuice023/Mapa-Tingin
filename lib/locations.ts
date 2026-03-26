export interface LocationConfig {
  name: string;
  lat: number;
  lon: number;
}

export const locations: LocationConfig[] = [
  { name: "Quezon City", lat: 14.65, lon: 121.07 },
  { name: "Cebu City", lat: 10.32, lon: 123.89 },
  { name: "Davao City", lat: 7.19, lon: 125.45 },
];
