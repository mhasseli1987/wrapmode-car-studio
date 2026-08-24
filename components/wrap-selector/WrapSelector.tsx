import { wrapDesigns } from "@/data/wrapDesigns";
import { formatPrice } from "@/lib/format";
import type { VehicleId } from "@/lib/types";
import { WrapCard } from "./WrapCard";

export function WrapSelector({
  vehicleId,
  selectedId,
  onSelect,
}: {
  vehicleId: VehicleId;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const faCount = new Intl.NumberFormat("fa-IR").format(wrapDesigns.length);
  return (
    <section id="designs" aria-label="طرح‌های کاور" className="flex flex-col">
      <div className="flex items-center justify-between px-1 pb-4">
        <h2 className="text-[13px] font-bold tracking-[0.3em] text-white">
          THE COLLECTION
          <span className="mt-1 block text-[11px] font-normal tracking-normal text-fog">
            مجموعه طرح‌های کاور
          </span>
        </h2>
        <span className="rounded-full border border-line-2 bg-panel px-2.5 py-1 text-[10.5px] text-fog">
          {faCount} طرح
        </span>
      </div>

      <div className="wrap-list flex gap-3.5 overflow-x-auto pb-3 no-scrollbar lg:flex-col lg:gap-3.5 lg:overflow-x-visible lg:overflow-y-auto lg:pr-1 lg:wrap-scroll lg:pb-2">
        {wrapDesigns.map((wrap, i) => (
          <WrapCard
            key={wrap.id}
            wrap={wrap}
            index={i}
            vehicleId={vehicleId}
            active={wrap.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>

      <p className="hidden px-1 pt-3 text-[10.5px] leading-5 text-fog/70 lg:block">
        قیمت‌ها برای نصب تخصصی است. طرح‌های «فقط سدان» برای هاچبک موجود نیستند.
      </p>
    </section>
  );
}
