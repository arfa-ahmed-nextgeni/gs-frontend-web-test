import type { PickupPoint } from "@/lib/types/checkout/pickup-point-map";

export const MOCK_PICKUP_POINTS: PickupPoint[] = [
  {
    id: 1,
    lat: 25.1234,
    lng: 55.2345,
    name: "Dubai Silicon Oasis, Palacio Tower",
  },
  {
    id: 2,
    lat: 25.124,
    lng: 55.235,
    name: "Dubai Silicon Oasis, Cental Mall",
  },
  {
    id: 3,
    lat: 25.123,
    lng: 55.234,
    name: "Dubai Silicon Oasis, Souq Extra",
  },
  { id: 4, lat: 25.125, lng: 55.236, name: "Location 4" },
  { id: 5, lat: 25.122, lng: 55.233, name: "Location 5" },
  { id: 6, lat: 25.126, lng: 55.237, name: "Location 6" },
];
