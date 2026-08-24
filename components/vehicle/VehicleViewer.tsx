"use client";

/**
 * VehicleViewer — the renderer abstraction point.
 *
 * Currently renders the 2D vector stage (both vehicles crossfade here).
 * When a GLB model lands in /public/models, branch on `vehicle.modelAsset`
 * and mount a lazy React Three Fiber scene instead.
 */
import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import type { VehicleId, WrapDesign } from "@/lib/types";
import { getVehicle } from "@/data/vehicles";
import {
  HatchbackArtwork,
  SEDAN_BODY,
  SedanArtwork,
  HATCH_BODY,
} from "./car-artwork";
import { WrapPattern } from "./wrap-patterns";

export function VehicleViewer({ vehicle, wrap }: { vehicle: VehicleId; wrap: WrapDesign }) {
  const rootRef = useRef<SVGSVGElement>(null);
  const carsRef = useRef<SVGGElement>(null);
  const sedanRef = useRef<SVGGElement>(null);
  const hatchRef = useRef<SVGGElement>(null);
  const sweepRef = useRef<SVGRectElement>(null);
  const prevVehicle = useRef<VehicleId>(vehicle);
  const prevWrap = useRef<string>(wrap.id);

  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      // entrance
      gsap.from(carsRef.current, {
        autoAlpha: 0,
        y: 26,
        duration: reduced ? 0 : 0.9,
        ease: "power3.out",
        delay: 0.15,
      });
      // gentle idle float
      if (!reduced) {
        gsap.to(carsRef.current, {
          y: -5,
          duration: 2.6,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 1.1,
        });
      }
    }, rootRef);
    return () => ctx.revert();
  }, []);

  // vehicle switch crossfade
  useEffect(() => {
    if (prevVehicle.current === vehicle) return;
    prevVehicle.current = vehicle;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sedanActive = vehicle === "sedan";
    const outG = sedanActive ? hatchRef.current : sedanRef.current;
    const inG = sedanActive ? sedanRef.current : hatchRef.current;
    const dir = sedanActive ? 1 : -1;
    gsap
      .timeline()
      .to(outG, {
        autoAlpha: 0,
        x: 70 * dir,
        duration: reduced ? 0 : 0.34,
        ease: "power2.in",
      })
      .fromTo(
        inG,
        { autoAlpha: 0, x: -70 * dir },
        { autoAlpha: 1, x: 0, duration: reduced ? 0 : 0.5, ease: "power2.out" },
        reduced ? 0 : "-=0.08"
      );
  }, [vehicle]);

  // wrap switch — light sweep across the body
  useEffect(() => {
    if (prevWrap.current === wrap.id) return;
    prevWrap.current = wrap.id;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !sweepRef.current) return;
    gsap.fromTo(
      sweepRef.current,
      { attr: { x: -620 } },
      {
        attr: { x: 1500 },
        duration: 1.05,
        ease: "power2.inOut",
      }
    );
  }, [wrap.id]);

  // subtle pointer parallax
  useEffect(() => {
    const el = rootRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      gsap.to(carsRef.current, {
        x: nx * 16,
        rotation: nx * 0.7,
        duration: 0.9,
        ease: "power2.out",
        overwrite: "auto",
      });
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  const v = getVehicle(vehicle);

  return (
    <svg
      ref={rootRef}
      viewBox="80 22 780 292"
      className="w-full select-none"
      role="img"
      aria-label={`پیش‌نمایش طرح ${wrap.nameFa} روی ${v.nameFa}`}
    >
      <defs>
        {/* active wrap surface — larger tiles read better at hero scale */}
        <WrapPattern id="wrap-fill" spec={wrap.pattern} scale={1.9} />

        <linearGradient id="glassGrad" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#2a3648" />
          <stop offset="0.5" stopColor="#141c29" />
          <stop offset="1" stopColor="#0b101a" />
        </linearGradient>
        <linearGradient id="glassShine" x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.02" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="rimGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4a4f5a" />
          <stop offset="0.5" stopColor="#262a31" />
          <stop offset="1" stopColor="#3d424c" />
        </linearGradient>
        <linearGradient id="lightGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f8ff" />
          <stop offset="1" stopColor="#9fb2cc" />
        </linearGradient>
        <linearGradient id="shadeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="0.24" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.52" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.27" />
        </linearGradient>
        <linearGradient id="glossGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.58" />
          <stop offset="0.2" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sweepGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="floorGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#7c5cfc" stopOpacity="0.2" />
          <stop offset="1" stopColor="#7c5cfc" stopOpacity="0" />
        </radialGradient>

        {/* lower skirt region (keeps wrap visible, adds ground shadow mass) */}
        <clipPath id="skirtClip">
          <rect x="80" y="226" width="790" height="14" />
        </clipPath>
        {/* union of both bodies — the sweep light rides on this */}
        <clipPath id="bodyClip">
          <path d={SEDAN_BODY} />
          <path d={HATCH_BODY} />
        </clipPath>
      </defs>

      {/* floor */}
      <ellipse cx="470" cy="298" rx="340" ry="20" fill="url(#floorGlow)" />
      <ellipse cx="470" cy="301" rx="330" ry="13" fill="rgba(0,0,0,0.62)" />
      <line x1="82" y1="303" x2="858" y2="303" stroke="rgba(242,239,232,0.14)" strokeWidth="1" />

      <g ref={carsRef}>
        <g ref={sedanRef}>
          <SedanArtwork wrapFill="url(#wrap-fill)" sheen={wrap.sheen} />
        </g>
        <g ref={hatchRef} style={{ opacity: 0, visibility: "hidden" }}>
          <HatchbackArtwork wrapFill="url(#wrap-fill)" sheen={wrap.sheen} />
        </g>
      </g>

      {/* wrap-switch light sweep */}
      <g clipPath="url(#bodyClip)" pointerEvents="none">
        <rect
          ref={sweepRef}
          x="-620"
          y="60"
          width="240"
          height="200"
          fill="url(#sweepGrad)"
          transform="skewX(-16)"
          opacity="0.85"
        />
      </g>
    </svg>
  );
}
