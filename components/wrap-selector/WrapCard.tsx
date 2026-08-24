import type { WrapDesign } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { CheckIcon } from "@/components/ui/icons";
import { WrapPattern } from "@/components/vehicle/wrap-patterns";

export function WrapCard({
  wrap,
  index,
  vehicleId,
  active,
  onSelect,
}: {
  wrap: WrapDesign;
  index: number;
  vehicleId: string;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const compatible = wrap.compatibleVehicles.includes(vehicleId as WrapDesign["compatibleVehicles"][number]);
  const thumbId = `thumb-${wrap.id}`;

  return (
    <button
      type="button"
      disabled={!compatible}
      aria-pressed={active}
      onClick={() => compatible && onSelect(wrap.id)}
      className={`wrap-card group relative w-[210px] shrink-0 overflow-hidden rounded-2xl px-4 pb-4 pt-3.5 text-left transition-[transform,border-color,box-shadow] duration-300 lg:w-full ${
        active
          ? "card-fine border-accent/60 shadow-glow-sm"
          : compatible
            ? "card-fine hover:-translate-y-[3px] hover:border-line-2 hover:shadow-[0_18px_44px_rgba(0,0,0,0.42)]"
            : "card-fine cursor-not-allowed opacity-40 saturate-0"
      }`}
      style={{ transitionTimingFunction: "var(--ease-expo)" }}
    >
      {/* meta row — design index + tag */}
      <span className="flex items-center justify-between">
        <span
          className={`font-mono text-[10px] tracking-[0.3em] transition-colors duration-300 ${
            active ? "text-accent-2" : "text-fog"
          }`}
        >
          DESIGN {String(index + 1).padStart(2, "0")}
        </span>
        {active ? (
          <span className="grid h-4 w-4 place-items-center rounded-full bg-accent text-white">
            <CheckIcon className="h-2.5 w-2.5" />
          </span>
        ) : !compatible ? (
          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-1.5 py-px text-[9px] font-medium text-amber-300/90">
            فقط سدان
          </span>
        ) : (
          wrap.label && (
            <span className="rounded-full border border-line-2 px-1.5 py-px text-[9px] text-fog/80">
              {wrap.label}
            </span>
          )
        )}
      </span>

      {/* thumbnail — the artwork band */}
      <span
        className={`mt-3 block h-[76px] overflow-hidden rounded-xl border transition-colors duration-300 ${
          active ? "border-accent/40" : "border-white/10"
        }`}
      >
        <svg
          viewBox="0 0 210 76"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full transition-transform duration-500 group-hover:scale-[1.05]"
          style={{ transitionTimingFunction: "var(--ease-expo)" }}
          aria-hidden
        >
          <defs>
            <WrapPattern id={thumbId} spec={wrap.pattern} scale={2.4} />
          </defs>
          <rect width="210" height="76" fill={`url(#${thumbId})`} />
        </svg>
      </span>

      {/* name + price */}
      <span className="mt-3 flex items-baseline justify-between gap-3">
        <span className="min-w-0">
          <span
            className={`block truncate text-[14.5px] font-semibold ${
              active ? "text-white" : "text-mist"
            } transition-colors duration-300 group-hover:text-white`}
          >
            {wrap.name}
          </span>
          <span className="mt-0.5 block truncate text-[11.5px] text-fog">{wrap.nameFa}</span>
        </span>
        <span
          className={`shrink-0 text-[13px] font-semibold tabular-nums transition-colors duration-300 ${
            active ? "text-accent-2" : "text-mist"
          }`}
        >
          {formatPrice(wrap.price)}
        </span>
      </span>

      {/* selected edge */}
      <span
        aria-hidden
        className={`absolute inset-x-0 bottom-0 h-[2.5px] origin-left bg-accent transition-transform duration-500 ${
          active ? "scale-x-100" : "scale-x-0"
        }`}
        style={{ transitionTimingFunction: "var(--ease-expo)" }}
      />
    </button>
  );
}
