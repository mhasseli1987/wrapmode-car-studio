/**
 * Core data types for the Wrapmode Studio configurator.
 *
 * Everything visual in the studio is driven by the data files in `data/`.
 * To ship the real products, edit `data/wrapDesigns.ts` and `data/vehicles.ts` —
 * no UI changes required.
 */

export type VehicleId = "sedan" | "hatchback";

export interface Vehicle {
  id: VehicleId;
  /** Display name (Latin chrome) */
  name: string;
  /** Persian name */
  nameFa: string;
  /**
   * Future: path to a GLB/GLTF model under /public/models.
   * When present, VehicleViewer can switch to a 3D renderer (R3F) —
   * the 2D stage keeps working until then.
   */
  modelAsset?: string;
}

/**
 * Declarative description of a wrap surface.
 * Rendered by `WrapPattern` into SVG defs (pattern or gradient).
 * When real artwork arrives, use `{ kind: "image", src: "/wraps/xx.jpg" }`.
 */
export type PatternSpec =
  | { kind: "solid"; base: string }
  | { kind: "gradient"; stops: [offset: number, color: string][]; angle?: number }
  | { kind: "metal"; stops: [offset: number, color: string][] }
  | { kind: "carbon"; base: string; light: string; dark: string }
  | { kind: "camo"; base: string; colors: string[] }
  | { kind: "hex"; base: string; line: string; accentFill?: string }
  | {
      kind: "stripes";
      base: string;
      stripe: string;
      angle?: number;
      width?: number;
      gap?: number;
    }
  | { kind: "circuit"; base: string; grid: string; trace: string; node: string }
  | { kind: "brushed"; base: string; light: string; dark: string }
  | { kind: "image"; src: string; tile?: number };

export interface WrapDesign {
  id: string;
  /** e.g. "Carbon Shadow" */
  name: string;
  /** Persian display name */
  nameFa: string;
  /** Short marketing tag shown on the card */
  label?: string;
  /** Price in Toman */
  price: number;
  /** Wrap body visual */
  pattern: PatternSpec;
  /**
   * 0..1 surface glossiness — scales the highlight overlay on the car body
   * so matte vs chrome wraps read differently.
   */
  sheen: number;
  /** Vehicles this design can be installed on */
  compatibleVehicles: VehicleId[];
  /** Persian description shown in the selected-wrap panel */
  description: string;
  features: string[];
}
