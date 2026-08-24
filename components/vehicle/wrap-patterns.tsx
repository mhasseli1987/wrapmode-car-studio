/**
 * Wrap pattern engine.
 *
 * Renders a PatternSpec as an SVG <pattern> / <gradient> def that car body
 * surfaces can reference via fill="url(#id)".
 *
 * When real wrap artwork arrives, use { kind: "image" } in the data file —
 * the renderer already supports painting a bitmap onto the car.
 */
import type { PatternSpec } from "@/lib/types";

export function WrapPattern({
  id,
  spec,
  scale = 1,
}: {
  id: string;
  spec: PatternSpec;
  scale?: number;
}) {
  switch (spec.kind) {
    case "solid":
      return (
        <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill={spec.base} />
        </pattern>
      );

    case "gradient": {
      const a = ((spec.angle ?? 90) * Math.PI) / 180;
      const x = Math.cos(a).toFixed(3);
      const y = Math.sin(a).toFixed(3);
      return (
        <linearGradient id={id} x1="0" y1="0" x2={x} y2={y}>
          {spec.stops.map(([o, c]) => (
            <stop key={o} offset={o} stopColor={c} />
          ))}
        </linearGradient>
      );
    }

    case "metal":
      return (
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          {spec.stops.map(([o, c]) => (
            <stop key={o} offset={o} stopColor={c} />
          ))}
        </linearGradient>
      );

    case "carbon":
      return (
        <pattern
          id={id}
          width={16 * scale}
          height={16 * scale}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="16" height="16" fill={spec.base} />
          <rect x="0" y="0" width="8" height="8" fill={spec.light} />
          <rect x="8" y="8" width="8" height="8" fill={spec.dark} />
          <path d="M0 8H16M8 0V16" stroke={spec.light} strokeWidth="1" opacity="0.55" />
        </pattern>
      );

    case "camo":
      return (
        <pattern
          id={id}
          width={128 * scale}
          height={104 * scale}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(8)"
        >
          <rect width="128" height="104" fill={spec.base} />
          <polygon points="6,10 34,2 52,16 40,34 12,32" fill={spec.colors[0]} />
          <polygon points="66,0 96,8 108,26 84,38 58,24" fill={spec.colors[1]} />
          <polygon points="0,52 26,44 44,58 30,80 4,74" fill={spec.colors[2]} />
          <polygon points="48,64 82,52 110,66 100,92 58,96" fill={spec.colors[0]} />
          <polygon points="24,84 44,88 38,104 14,100" fill={spec.colors[1]} />
          <polygon points="90,84 116,78 126,94 104,104 88,98" fill={spec.colors[2]} />
        </pattern>
      );

    case "hex": {
      // Flat-top hexagon honeycomb, side 20 → tile 60 × 34.64
      const hex = (cx: number, cy: number) =>
        `M${cx + 20} ${cy}L${cx + 10} ${cy + 17.32}L${cx - 10} ${cy + 17.32}L${cx - 20} ${cy}L${cx - 10} ${cy - 17.32}L${cx + 10} ${cy - 17.32}Z`;
      return (
        <pattern
          id={id}
          width={60 * scale}
          height={34.64 * scale}
          patternUnits="userSpaceOnUse"
        >
          <rect width="60" height="34.64" fill={spec.base} />
          <g fill="none" stroke={spec.line} strokeWidth="1.6">
            <path d={hex(30, 17.32)} />
            <path d={hex(0, 0)} />
            <path d={hex(60, 0)} />
            <path d={hex(0, 34.64)} />
            <path d={hex(60, 34.64)} />
          </g>
          <path d={hex(30, 17.32)} fill={spec.accentFill ?? "none"} opacity="0.6" />
        </pattern>
      );
    }

    case "stripes": {
      const w = (spec.width ?? 34) * scale;
      const gap = (spec.gap ?? 92) * scale;
      const tile = w + gap;
      return (
        <pattern
          id={id}
          width={tile}
          height="40"
          patternUnits="userSpaceOnUse"
          patternTransform={`rotate(${spec.angle ?? -16})`}
        >
          <rect width={tile} height="40" fill={spec.base} />
          <rect width={w} height="40" fill={spec.stripe} />
        </pattern>
      );
    }

    case "circuit":
      return (
        <pattern id={id} width={64 * scale} height={64 * scale} patternUnits="userSpaceOnUse">
          <rect width="64" height="64" fill={spec.base} />
          <g stroke={spec.grid} strokeWidth="1">
            <path d="M0 16H64M0 48H64M16 0V64M48 0V64" />
          </g>
          <g fill="none" stroke={spec.trace} strokeWidth="2.4" strokeLinecap="round">
            <path d="M4 16H30L38 24V44" />
            <path d="M60 48H44L36 40" />
          </g>
          <g fill={spec.node}>
            <circle cx="30" cy="16" r="3" />
            <circle cx="38" cy="44" r="3" />
            <circle cx="44" cy="48" r="3" />
            <circle cx="36" cy="40" r="2.2" />
          </g>
        </pattern>
      );

    case "brushed":
      return (
        <pattern id={id} width={8 * scale} height={4 * scale} patternUnits="userSpaceOnUse">
          <rect width="8" height="4" fill={spec.base} />
          <rect y="0" width="8" height="1.6" fill={spec.light} />
          <rect y="2.4" width="8" height="1" fill={spec.dark} />
        </pattern>
      );

    case "image":
      return (
        <pattern
          id={id}
          width={spec.tile ?? 400}
          height={spec.tile ?? 300}
          patternUnits="userSpaceOnUse"
          preserveAspectRatio="xMidYMid slice"
        >
          <rect width={spec.tile ?? 400} height={spec.tile ?? 300} fill="#14151a" />
          <image
            href={spec.src}
            width={spec.tile ?? 400}
            height={spec.tile ?? 300}
            preserveAspectRatio="xMidYMid slice"
          />
        </pattern>
      );
  }
}
