import type { VehicleId, WrapDesign } from "@/lib/types";
import { getVehicle } from "@/data/vehicles";
import { formatToman } from "@/lib/format";
import { ShieldIcon, SunIcon, DropletIcon, WrenchIcon, ArrowLeftIcon } from "@/components/ui/icons";

const featureIcons = [ShieldIcon, SunIcon, DropletIcon, WrenchIcon];

export function SelectedWrapPanel({
  wrap,
  vehicle,
  index,
}: {
  wrap: WrapDesign;
  vehicle: VehicleId;
  index: number;
}) {
  const v = getVehicle(vehicle);
  return (
    <aside
      key={wrap.id}
      aria-live="polite"
      className="anim-panel w-full max-w-[430px] rounded-[20px] p-5 text-white backdrop-blur-md"
      style={{
        border: "1px solid rgba(255,255,255,0.14)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0) 40%), rgba(18,18,25,0.82)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 18px 48px rgba(0,0,0,0.32)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-glow-sm" />
          <span className="text-[10px] font-semibold tracking-[0.28em] text-fog">
            SELECTED · <span className="tracking-normal">طرح انتخاب‌شده</span>
          </span>
        </span>
        <span className="font-mono text-[10px] tracking-[0.3em] text-fog">
          №{String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-[24px] font-bold leading-tight tracking-tight text-white">
          {wrap.name}
          <span className="mr-2 text-[13px] font-normal text-fog" dir="rtl">
            {wrap.nameFa}
          </span>
        </h3>
        <p className="text-[20px] font-bold tracking-tight text-accent-2 tabular-nums" dir="rtl">
          {formatToman(wrap.price)}
        </p>
      </div>

      <p className="mt-2 line-clamp-2 text-[11.5px] leading-5 text-fog" dir="rtl">
        {wrap.description} — قابل نصب روی {v.nameFa}
      </p>

      <ul className="mt-3.5 grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-line pt-3.5">
        {wrap.features.map((f, i) => {
          const Icon = featureIcons[i % featureIcons.length];
          return (
            <li key={f} className="flex items-center gap-2 text-[11px] text-mist" dir="rtl">
              <Icon className="h-3.5 w-3.5 text-accent-2" />
              {f}
            </li>
          );
        })}
      </ul>

      <a
        href={`https://wrapmode.ir?wrap=${wrap.id}&vehicle=${vehicle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-4 flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-[13px] font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-accent-2 hover:shadow-glow"
        style={{ transitionTimingFunction: "var(--ease-expo)" }}
      >
        <span dir="rtl">درخواست اجرا</span>
        <ArrowLeftIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
      </a>
    </aside>
  );
}
