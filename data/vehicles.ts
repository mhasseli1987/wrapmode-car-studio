/**
 * Vehicle catalog.
 * Add new vehicles here (and a matching artwork in components/vehicle).
 */
import type { Vehicle } from "@/lib/types";

export const vehicles: Vehicle[] = [
  {
    id: "sedan",
    name: "Sedan",
    nameFa: "سدان",
    // modelAsset: "/models/sedan.glb", // future 3D
  },
  {
    id: "hatchback",
    name: "Hatchback",
    nameFa: "هاچبک",
    // modelAsset: "/models/hatchback.glb",
  },
];

export const getVehicle = (id: string) =>
  vehicles.find((v) => v.id === id) ?? vehicles[0];
