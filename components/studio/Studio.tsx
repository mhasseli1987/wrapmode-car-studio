"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { VehicleId } from "@/lib/types";
import { getVehicle } from "@/data/vehicles";
import { getWrap, isCompatible, wrapDesigns } from "@/data/wrapDesigns";
import { Header } from "./Header";
import { FeatureBar } from "./FeatureBar";
import { SelectedWrapPanel } from "./SelectedWrapPanel";
import { VehicleViewer } from "@/components/vehicle/VehicleViewer";
import { VehicleSelector } from "@/components/vehicle/VehicleSelector";
import { WrapSelector } from "@/components/wrap-selector/WrapSelector";

function GhostWord({ vehicle }: { vehicle: VehicleId }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      ref.current,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }
    );
  }, [vehicle]);
  return (
    <div
      ref={ref}
      aria-hidden
      className="ghost-word pointer-events-none absolute inset-x-0 top-[15%] select-none text-center text-[20vw] font-black leading-none lg:top-[12%] lg:text-[13vw]"
    >
      {getVehicle(vehicle).name.toUpperCase()}
    </div>
  );
}

/** Editorial design index — the selected design as an artwork numeral */
function DesignNumeral({ index, total }: { index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      ref.current,
      { autoAlpha: 0, y: 26 },
      { autoAlpha: 1, y: 0, duration: 0.55, ease: "power2.out" }
    );
  }, [index]);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute right-6 top-[88px] hidden select-none text-right lg:block xl:right-10"
    >
      <div className="ed-numeral text-[10rem] font-black leading-none tracking-tight">
        {String(index + 1).padStart(2, "0")}
      </div>
      <div className="mt-3 font-mono text-[10px] tracking-[0.34em] text-fog/60">
        / {String(total).padStart(2, "0")} DESIGNS
      </div>
    </div>
  );
}

const TICKER = [
  "WRAPMODE",
  "CAR WRAP STUDIO",
  "SEDAN · HATCHBACK",
  "CARBON — MATTE — CHROME — CAMO",
  "TEHRAN",
  "WRAPMODE.IR",
];

function Marquee() {
  const row = [...TICKER, ...TICKER];
  return (
    <div
      aria-hidden
      className="overflow-hidden border-y border-line bg-ink py-3.5"
    >
      <div className="marquee flex w-max items-center gap-10 whitespace-nowrap pr-10">
        {[0, 1].map((half) => (
          <div key={half} className="flex items-center gap-10">
            {row.map((t, i) => (
              <span
                key={`${half}-${i}`}
                className="flex items-center gap-10 text-[10px] font-semibold tracking-[0.3em] text-fog/55"
              >
                {t}
                <span className="h-1 w-1 rounded-full bg-accent/50" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Studio() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [vehicle, setVehicle] = useState<VehicleId>("sedan");
  const [wrapId, setWrapId] = useState(wrapDesigns[0].id);
  const wrap = getWrap(wrapId);
  const wrapIndex = Math.max(
    0,
    wrapDesigns.findIndex((w) => w.id === wrapId)
  );

  // page entrance choreography
  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.from(".anim-header", { y: -16, autoAlpha: 0, duration: 0.55 })
        .from(
          ".anim-hero-copy > *",
          { y: 20, autoAlpha: 0, stagger: 0.09, duration: 0.6 },
          "-=0.25"
        )
        .from(".anim-stage-car", { autoAlpha: 0, scale: 0.96, duration: 0.8 }, "-=0.35")
        .from(
          ".wrap-card",
          { y: 16, autoAlpha: 0, stagger: 0.07, duration: 0.5 },
          "-=0.45"
        )
        .from(".anim-vehicle-select", { y: 14, autoAlpha: 0, duration: 0.45 }, "-=0.35")
        .from(".anim-features > *", { y: 14, autoAlpha: 0, stagger: 0.07, duration: 0.45 }, "-=0.3");

      // atmospheric drift — the nebula breathes behind the car
      gsap.to(".nebula-el", {
        x: 46,
        y: -18,
        duration: 10,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  // switching vehicles auto-falls-back to a compatible design
  function handleVehicleChange(next: VehicleId) {
    setVehicle(next);
    if (!isCompatible(getWrap(wrapId), next)) {
      const alt = wrapDesigns.find((w) => isCompatible(w, next));
      if (alt) setWrapId(alt.id);
    }
  }

  return (
    <div ref={rootRef} className="flex min-h-screen flex-col bg-ink font-display text-white">
      <Header />

      <main className="grid flex-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]">
        {/* ── Stage — cinematic hero ────────────────────────── */}
        <section
          id="stage"
          aria-label="استودیوی انتخاب کاور"
          className="relative flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden border-b border-line bg-stage lg:border-b-0 lg:border-r"
        >
          {/* layered atmosphere: light → nebula → vignette → grain */}
          <div aria-hidden className="studio-light pointer-events-none absolute inset-0" />
          <div
            aria-hidden
            className="nebula nebula-el pointer-events-none absolute left-[12%] top-[30%] h-[320px] w-[560px] lg:left-[22%] lg:top-[34%] lg:h-[380px] lg:w-[680px]"
          />
          <div aria-hidden className="stage-vignette pointer-events-none absolute inset-0" />
          <div aria-hidden className="grain pointer-events-none absolute inset-0" />

          <GhostWord vehicle={vehicle} />
          <DesignNumeral index={wrapIndex} total={wrapDesigns.length} />

          <div className="relative z-10 mx-auto flex w-full max-w-[1060px] flex-1 flex-col px-4 pt-7 sm:px-8 lg:pt-9">
            <div className="anim-hero-copy flex max-w-[560px] flex-col gap-3">
              <p className="text-[10px] font-semibold tracking-[0.44em] text-accent-2">
                WRAPMODE — WRAP STUDIO
              </p>
              <h1 className="text-[clamp(2.2rem,5.4vw,4rem)] font-bold leading-[1.0] tracking-tight">
                CAR WRAP
                <span className="block font-light text-mist">
                  STUDIO<span className="text-accent">.</span>
                </span>
              </h1>
              <p className="max-w-md text-[12.5px] leading-6 text-fog">
                Choose your car. Pick your wrap. Make it yours.
                <span className="mt-0.5 block text-[11.5px]" dir="rtl">
                  ماشین‌تان را انتخاب کنید، طرح کاور را ببینید و متحولش کنید.
                </span>
              </p>
            </div>

            <div className="anim-stage-car grid min-h-[300px] flex-1 place-items-center py-2 lg:-mx-14 lg:min-h-[500px]">
              <VehicleViewer vehicle={vehicle} wrap={wrap} />
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4 pb-6 lg:pb-8">
              <VehicleSelector value={vehicle} onChange={handleVehicleChange} />
              <SelectedWrapPanel wrap={wrap} vehicle={vehicle} index={wrapIndex} />
            </div>
          </div>
        </section>

        {/* ── The Collection ────────────────────────────────── */}
        <aside className="bg-panel/30 px-4 py-7 sm:px-6 lg:sticky lg:top-16 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto lg:wrap-scroll">
          <WrapSelector vehicleId={vehicle} selectedId={wrapId} onSelect={setWrapId} />
        </aside>
      </main>

      <Marquee />
      <FeatureBar />
    </div>
  );
}
