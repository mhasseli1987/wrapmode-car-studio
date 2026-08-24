import { SedanGlyph, HatchbackGlyph } from "@/components/ui/icons";
import { vehicles } from "@/data/vehicles";
import type { VehicleId } from "@/lib/types";

export function VehicleSelector({
  value,
  onChange,
}: {
  value: VehicleId;
  onChange: (v: VehicleId) => void;
}) {
  const glyphs = { sedan: SedanGlyph, hatchback: HatchbackGlyph } as const;
  return (
    <div className="anim-vehicle-select flex flex-col gap-2.5">
      <span className="text-[10px] font-semibold tracking-[0.3em] text-fog">
        SELECT YOUR VEHICLE · <span className="tracking-normal">نوع خودرو</span>
      </span>
      <div
        className="inline-flex rounded-xl border border-line bg-panel p-1"
        role="group"
        aria-label="انتخاب نوع خودرو"
      >
        {vehicles.map((v) => {
          const Glyph = glyphs[v.id];
          const active = v.id === value;
          return (
            <button
              key={v.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(v.id)}
              className={`flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-[12px] font-bold tracking-[0.14em] transition-all duration-300 sm:px-5 ${
                active ? "bg-accent text-white shadow-glow" : "text-fog hover:bg-panel-2 hover:text-white"
              }`}
              style={{ transitionTimingFunction: "var(--ease-expo)" }}
            >
              <Glyph className={`h-4 w-9 ${active ? "text-white" : "text-fog"}`} />
              {v.name.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
