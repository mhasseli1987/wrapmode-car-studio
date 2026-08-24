/**
 * Wrap design catalog — PLACEHOLDER DATA.
 *
 * ⚠️ Everything here is a stand-in for the real products.
 * To go live: replace `name`, `nameFa`, `price`, `compatibleVehicles`,
 * and swap `pattern` for `{ kind: "image", src: "/wraps/<id>.jpg" }`
 * once real artwork exists in /public/wraps.
 */
import type { WrapDesign } from "@/lib/types";

const BOTH = ["sedan", "hatchback"] as const;

const commonFeatures = [
  "وینیل درجه یک",
  "مقاوم در برابر UV",
  "نگهداری آسان",
  "نصب تخصصی",
];

export const wrapDesigns: WrapDesign[] = [
  {
    id: "carbon-shadow",
    name: "Carbon Shadow",
    nameFa: "کربن شادو",
    label: "Signature",
    price: 1850000,
    pattern: { kind: "carbon", base: "#0e1013", light: "#1c2027", dark: "#0a0c0f" },
    sheen: 0.5,
    compatibleVehicles: [...BOTH],
    description: "طرح بافت کربن با نقش تیره و عمق‌دار؛ مینیمال، اسپرت و همیشه شیک.",
    features: commonFeatures,
  },
  {
    id: "midnight-matte",
    name: "Midnight Matte",
    nameFa: "میدنایت مت",
    price: 1750000,
    pattern: { kind: "solid", base: "#15161b" },
    sheen: 0.12,
    compatibleVehicles: [...BOTH],
    description: "مشکی مات خالص برای یک حضور بی‌صدا و قدرتمند در خیابان.",
    features: commonFeatures,
  },
  {
    id: "stealth-camo",
    name: "Stealth Camo",
    nameFa: "استلث کامو",
    label: "New",
    price: 2100000,
    pattern: { kind: "camo", base: "#171a1f", colors: ["#242932", "#2f3540", "#101318"] },
    sheen: 0.35,
    compatibleVehicles: [...BOTH],
    description: "کاموفلاژ هندسی خاکستری؛ طراحی تهاجمی با شخصیت نظامی.",
    features: commonFeatures,
  },
  {
    id: "crimson-strike",
    name: "Crimson Strike",
    nameFa: "کریمزن استرایک",
    price: 2150000,
    pattern: { kind: "stripes", base: "#d5112b", stripe: "#0c0c10", angle: -16, width: 34, gap: 92 },
    sheen: 0.55,
    compatibleVehicles: [...BOTH],
    description: "قرمز مسابقه‌ای با نوارهای مورب مشکی؛ طراحی الهام‌گرفته از پیست.",
    features: commonFeatures,
  },
  {
    id: "aurora-flip",
    name: "Aurora Flip",
    nameFa: "آرورا فلیپ",
    label: "Limited",
    price: 2900000,
    pattern: {
      kind: "gradient",
      angle: 32,
      stops: [
        [0, "#7c5cfc"],
        [0.34, "#22d3ee"],
        [0.62, "#34d399"],
        [1, "#7c5cfc"],
      ],
    },
    sheen: 0.8,
    compatibleVehicles: ["sedan"], // placeholder: sedan-only for now
    description: "کاور تعویض‌رنگ با گذار بنفش، فیروزه‌ای و سبز؛ در هر زاویه یک رنگ.",
    features: commonFeatures,
  },
  {
    id: "titan-brushed",
    name: "Titan Brushed",
    nameFa: "تایتان براشد",
    price: 2400000,
    pattern: { kind: "brushed", base: "#8d939d", light: "rgba(255,255,255,0.10)", dark: "rgba(0,0,0,0.12)" },
    sheen: 0.45,
    compatibleVehicles: [...BOTH],
    description: "فلز ساب‌خورده تیتانیوم؛ حس صنعتی، دقیق و پریمیوم.",
    features: commonFeatures,
  },
  {
    id: "neon-circuit",
    name: "Neon Circuit",
    nameFa: "نیون سرکیت",
    price: 2600000,
    pattern: { kind: "circuit", base: "#0b0f16", grid: "#141d2e", trace: "#3d6bff", node: "#7d9cff" },
    sheen: 0.5,
    compatibleVehicles: [...BOTH],
    description: "مسیرهای نئونی روی بدنه تیره؛ برای ماشین‌های دنیای شب.",
    features: commonFeatures,
  },
  {
    id: "ghost-hex",
    name: "Ghost Hex",
    nameFa: "گوست هکس",
    price: 2200000,
    pattern: { kind: "hex", base: "#14161c", line: "#2a303c", accentFill: "#1c222d" },
    sheen: 0.4,
    compatibleVehicles: [...BOTH],
    description: "شبکه‌ی شش‌ضلعی‌های محو؛ جزئیات ظریف که از نزدیک کشف می‌شود.",
    features: commonFeatures,
  },
  {
    id: "solar-chrome",
    name: "Solar Chrome",
    nameFa: "سولار کروم",
    label: "Pro",
    price: 3200000,
    pattern: {
      kind: "metal",
      stops: [
        [0, "#f2f5f8"],
        [0.16, "#ffffff"],
        [0.35, "#6f7885"],
        [0.5, "#3c434d"],
        [0.64, "#6f7885"],
        [0.84, "#c9d1da"],
        [1, "#7d8693"],
      ],
    },
    sheen: 1,
    compatibleVehicles: ["sedan"], // placeholder: sedan-only for now
    description: "کروم آینه‌ای با بازتاب کامل؛ جسورانه‌ترین انتخاب استودیو.",
    features: commonFeatures,
  },
  {
    id: "deep-ocean",
    name: "Deep Ocean",
    nameFa: "دیپ اوشن",
    price: 2350000,
    pattern: {
      kind: "gradient",
      angle: 90,
      stops: [
        [0, "#0d2c4e"],
        [0.5, "#14406f"],
        [1, "#0a1e38"],
      ],
    },
    sheen: 0.6,
    compatibleVehicles: [...BOTH],
    description: "آبی عمیق اقیانوسی با درخشش ملایم؛ آرام و لوکس.",
    features: commonFeatures,
  },
];

export const getWrap = (id: string) =>
  wrapDesigns.find((w) => w.id === id) ?? wrapDesigns[0];

export const isCompatible = (wrap: WrapDesign, vehicle: string) =>
  wrap.compatibleVehicles.includes(vehicle as WrapDesign["compatibleVehicles"][number]);
