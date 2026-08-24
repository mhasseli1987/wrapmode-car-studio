/**
 * Vector vehicle artwork (prototype 2D stage).
 *
 * Honest note: this is a stylized 2D side-profile stage, not a fake 3D view.
 * Each vehicle is a layered SVG whose body panels reference the active wrap
 * pattern, so every design visually "installs" onto the car.
 *
 * When a real GLB arrives, drop it into /public/models and render an R3F
 * viewer inside VehicleViewer instead — nothing else needs to change.
 */

export const SEDAN_BODY =
  "M 96 236 C 90 231 87 223 87 214 C 87 202 92 194 104 190 C 118 185 136 183 152 181 L 196 176 C 216 173 232 171 244 170 C 276 138 306 118 344 108 C 384 98 452 96 508 100 C 548 104 588 118 628 146 C 640 154 650 158 662 160 L 700 166 C 736 171 772 177 800 184 C 818 189 832 195 840 204 C 848 213 850 224 846 230 C 843 235 836 238 827 238 L 762 238 A 55 55 0 0 0 652 238 L 317 238 A 55 55 0 0 0 207 238 L 96 236 Z";

export const SEDAN_GLASS =
  "M 250 163 L 636 151 C 622 138 600 122 574 112 C 512 104 428 104 372 109 C 332 120 288 140 250 163 Z";

export const HATCH_BODY =
  "M 118 236 C 110 231 106 222 106 211 C 106 197 112 187 124 183 L 148 179 C 160 177 170 175 178 171 C 188 157 198 139 214 125 C 234 107 264 101 302 99 C 362 95 470 95 528 101 C 566 105 602 119 640 145 C 652 154 662 158 674 160 L 706 166 C 740 171 772 177 798 184 C 816 189 830 196 838 205 C 846 214 848 224 844 230 C 841 235 834 238 825 238 L 762 238 A 55 55 0 0 0 652 238 L 312 238 A 55 55 0 0 0 202 238 L 118 236 Z";

export const HATCH_GLASS =
  "M 240 158 L 638 150 C 624 137 602 121 576 111 C 516 104 432 104 376 108 C 330 117 282 136 240 158 Z";

function Wheel({ cx }: { cx: number }) {
  return (
    <g>
      <circle cx={cx} cy={256} r={47} fill="#08090b" stroke="#17181d" strokeWidth="2" />
      <circle cx={cx} cy={256} r={31} fill="url(#rimGrad)" />
      {[0, 72, 144, 216, 288].map((a) => (
        <rect
          key={a}
          x={cx - 3.2}
          y={256 - 27}
          width="6.4"
          height="54"
          rx="3"
          fill="#22242b"
          stroke="#0d0e12"
          strokeWidth="0.8"
          transform={`rotate(${a} ${cx} 256)`}
        />
      ))}
      <circle cx={cx} cy={256} r={8} fill="#191b20" stroke="#2c2f37" strokeWidth="1.5" />
      <circle cx={cx} cy={256} r="2.4" fill="#7c5cfc" />
    </g>
  );
}

/** Body layers shared by both cars (order matters) */
function BodyLayers({
  body,
  glass,
  wrapFill,
  sheen,
}: {
  body: string;
  glass: string;
  wrapFill: string;
  sheen: number;
}) {
  return (
    <>
      {/* main shell — the wrap lives here */}
      <path d={body} fill={wrapFill} />
      {/* rocker / lower skirt, wrap darkened */}
      <path d={body} fill="rgba(6,7,10,0.34)" clipPath="url(#skirtClip)" />
      {/* ambient volume shading */}
      <path d={body} fill="url(#shadeGrad)" />
      {/* top gloss — scaled by the design's sheen (matte → chrome) */}
      <path d={body} fill="url(#glossGrad)" opacity={sheen} />
      {/* greenhouse */}
      <path d={glass} fill="url(#glassGrad)" />
      <path d={glass} fill="url(#glassShine)" />
      <path d={body} fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="2.5" />
    </>
  );
}

export function SedanArtwork({ wrapFill, sheen }: { wrapFill: string; sheen: number }) {
  return (
    <g>
      <BodyLayers body={SEDAN_BODY} glass={SEDAN_GLASS} wrapFill={wrapFill} sheen={sheen} />
      {/* B-pillar */}
      <line x1="446" y1="161" x2="458" y2="113" stroke="#0a0b0e" strokeWidth="8" />
      {/* belt line chrome hint */}
      <path d="M252 162 L634 150" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3" fill="none" />
      {/* door seams */}
      <path d="M424 163 C 421 188 421 213 419 238 M588 158 C 586 184 586 212 584 238" stroke="rgba(0,0,0,0.28)" strokeWidth="2" fill="none" />
      {/* handles */}
      <rect x="392" y="176" width="26" height="6" rx="3" fill="rgba(0,0,0,0.4)" />
      <rect x="548" y="171" width="26" height="6" rx="3" fill="rgba(0,0,0,0.4)" />
      {/* mirror */}
      <rect x="644" y="143" width="19" height="9" rx="4.5" transform="rotate(9 653 148)" fill={wrapFill} stroke="#0b0c10" strokeWidth="1.2" />
      {/* headlight */}
      <path d="M 800 185 L 843 197 L 839 209 L 797 195 Z" fill="url(#lightGrad)" />
      <path d="M 804 189 L 838 199" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" />
      {/* taillight */}
      <path d="M 103 193 L 147 187 L 148 197 L 106 204 Z" fill="#ff2338" opacity="0.85" />
      {/* arch lips */}
      <path d="M 207 238 A 55 55 0 0 0 317 238 M 652 238 A 55 55 0 0 0 762 238" fill="none" stroke="rgba(4,5,8,0.55)" strokeWidth="3" />
      <Wheel cx={262} />
      <Wheel cx={707} />
    </g>
  );
}

export function HatchbackArtwork({ wrapFill, sheen }: { wrapFill: string; sheen: number }) {
  return (
    <g>
      <BodyLayers body={HATCH_BODY} glass={HATCH_GLASS} wrapFill={wrapFill} sheen={sheen} />
      {/* B-pillar */}
      <line x1="438" y1="157" x2="452" y2="110" stroke="#0a0b0e" strokeWidth="8" />
      {/* roof rail hint */}
      <path d="M304 101 C 366 97 468 97 526 103" stroke="rgba(255,255,255,0.18)" strokeWidth="2" fill="none" />
      {/* belt line */}
      <path d="M244 157 L636 149" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3" fill="none" />
      {/* door seams */}
      <path d="M420 158 C 417 184 417 212 415 238 M588 158 C 586 184 586 212 584 238" stroke="rgba(0,0,0,0.28)" strokeWidth="2" fill="none" />
      {/* handles */}
      <rect x="388" y="174" width="26" height="6" rx="3" fill="rgba(0,0,0,0.4)" />
      <rect x="544" y="170" width="26" height="6" rx="3" fill="rgba(0,0,0,0.4)" />
      {/* mirror */}
      <rect x="652" y="142" width="19" height="9" rx="4.5" transform="rotate(9 661 147)" fill={wrapFill} stroke="#0b0c10" strokeWidth="1.2" />
      {/* headlight */}
      <path d="M 798 185 L 841 197 L 837 209 L 795 195 Z" fill="url(#lightGrad)" />
      <path d="M 802 189 L 836 199" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" />
      {/* taillight — tall hatch tail */}
      <path d="M 116 186 L 156 178 L 158 190 L 119 199 Z" fill="#ff2338" opacity="0.85" />
      {/* arch lips */}
      <path d="M 202 238 A 55 55 0 0 0 312 238 M 652 238 A 55 55 0 0 0 762 238" fill="none" stroke="rgba(4,5,8,0.55)" strokeWidth="3" />
      <Wheel cx={257} />
      <Wheel cx={707} />
    </g>
  );
}
