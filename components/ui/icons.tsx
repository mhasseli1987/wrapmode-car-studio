/** Minimal inline icon set (no icon library — keeps the bundle lean) */
type P = { className?: string };

const base = "shrink-0";

export const CheckIcon = ({ className }: P) => (
  <svg viewBox="0 0 16 16" fill="none" className={`${base} ${className ?? ""}`} aria-hidden>
    <path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArrowLeftIcon = ({ className }: P) => (
  <svg viewBox="0 0 16 16" fill="none" className={`${base} ${className ?? ""}`} aria-hidden>
    <path d="M13 8H3m0 0 4-4M3 8l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ShieldIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className ?? ""}`} aria-hidden>
    <path d="M12 3 5 6v5c0 4.4 3 8.4 7 10 4-1.6 7-5.6 7-10V6l-7-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="m9 11.5 2.2 2.2L15.5 9.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SunIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className ?? ""}`} aria-hidden>
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
    <path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10 1.4 1.4m0-12.8-1.4 1.4m-10 10L5.6 18.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

export const DropletIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className ?? ""}`} aria-hidden>
    <path d="M12 3.5s6 6.2 6 10.5a6 6 0 1 1-12 0c0-4.3 6-10.5 6-10.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  </svg>
);

export const WrenchIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${base} ${className ?? ""}`} aria-hidden>
    <path d="M14.7 6.3a3.8 3.8 0 0 1 5.1 5.1l-8.6 8.6a2.2 2.2 0 0 1-3.1-3.1l8.6-8.6a3.8 3.8 0 0 1-2-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" transform="rotate(-45 12 12)" />
  </svg>
);

export const SedanGlyph = ({ className }: P) => (
  <svg viewBox="0 0 40 18" fill="none" className={`${base} ${className ?? ""}`} aria-hidden>
    <path d="M3 13.5v-3l3.5-1 5-4.5C13 4 15 3.5 17.5 3.5h7c2.8 0 5.3.9 7.4 2.6l4.6 3.6 1.5 1v2.8h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 13.5h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="10.5" cy="13.5" r="2.6" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="29.5" cy="13.5" r="2.6" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

export const HatchbackGlyph = ({ className }: P) => (
  <svg viewBox="0 0 40 18" fill="none" className={`${base} ${className ?? ""}`} aria-hidden>
    <path d="M5 13.5v-9c0-.8.7-1.5 1.5-1.5H18c2.6 0 5 .9 7 2.5l5 4 3.5 1.2c.9.3 1.5 1.1 1.5 2v.8h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 13.5h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="10.5" cy="13.5" r="2.6" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="29.5" cy="13.5" r="2.6" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

export const InstagramIcon = ({ className }: P) => (
  <svg viewBox="0 0 20 20" fill="none" className={`${base} ${className ?? ""}`} aria-hidden>
    <rect x="3" y="3" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="10" cy="10" r="3.4" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="14.4" cy="5.6" r="1" fill="currentColor" />
  </svg>
);

export const TelegramIcon = ({ className }: P) => (
  <svg viewBox="0 0 20 20" fill="none" className={`${base} ${className ?? ""}`} aria-hidden>
    <path d="m17 4-2.7 12.2c-.2.9-.8 1.1-1.5.7l-4.3-3.2-2 2c-.3.3-.5.4-.9.4l.3-4.4L14.4 6c.3-.3 0-.4-.5-.2L4.4 10.1l-3.1-1c-.7-.2-.7-.7.2-1L15.8 3c.6-.2 1.4.2 1.2 1Z" fill="currentColor" transform="translate(1.5 1) scale(0.83)" />
  </svg>
);

export const WhatsappIcon = ({ className }: P) => (
  <svg viewBox="0 0 20 20" fill="none" className={`${base} ${className ?? ""}`} aria-hidden>
    <path d="M10 2.5a7.4 7.4 0 0 0-6.3 11.3L2.5 17.5l3.8-1.1A7.4 7.4 0 1 0 10 2.5Zm4.2 10.4c-.2.5-1.1 1-1.5 1-.4.1-1 .1-2.5-.5a9 9 0 0 1-3.7-3.2c-.5-.8-.8-1.6-.8-2.3 0-.7.3-1.3.7-1.6.2-.2.4-.3.6-.3h.4c.2 0 .4 0 .5.4l.7 1.6c.1.2 0 .4-.1.5l-.3.4c-.1.2-.2.3 0 .5.4.7 1.4 1.7 2.5 2.1.2.1.4.1.5-.1l.5-.6c.2-.2.3-.2.5-.1l1.6.8c.2.1.3.2.3.3s0 .7-.2 1.1Z" fill="currentColor" />
  </svg>
);
