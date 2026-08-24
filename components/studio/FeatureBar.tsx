import { InstagramIcon, TelegramIcon, WhatsappIcon, ShieldIcon, WrenchIcon, SunIcon } from "@/components/ui/icons";

const items = [
  {
    title: "Premium Quality",
    sub: "وینیل درجه یک با ضمانت اصالت",
    Icon: ShieldIcon,
  },
  {
    title: "Professional Install",
    sub: "نصب تخصصی توسط تیم Wrapmode",
    Icon: WrenchIcon,
  },
  {
    title: "Long Lasting",
    sub: "مقاوم در برابر UV و شرایط آب‌وهوا",
    Icon: SunIcon,
  },
  {
    title: "5-Year Warranty",
    sub: "تا ۵ سال گارانتی کاور و نصب",
    Icon: ShieldIcon,
  },
];

export function FeatureBar() {
  return (
    <footer id="about" className="border-t border-line bg-panel/40">
      <div className="anim-features mx-auto grid max-w-[1680px] grid-cols-1 gap-x-6 gap-y-5 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:py-10">
        {items.map(({ title, sub, Icon }) => (
          <div key={title} className="flex items-center gap-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent-2">
              <Icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-[12.5px] font-bold tracking-wide text-white">{title}</span>
              <span className="mt-0.5 block text-[11px] leading-5 text-fog" dir="rtl">
                {sub}
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-line/60">
        <div className="mx-auto flex max-w-[1680px] flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
          <p className="text-[11px] text-fog">
            © {new Date().getFullYear()} Wrapmode — Car Wrap Studio · wrapmode.ir
          </p>
          <div className="flex items-center gap-2">
            {[
              { Icon: InstagramIcon, label: "Instagram" },
              { Icon: TelegramIcon, label: "Telegram" },
              { Icon: WhatsappIcon, label: "WhatsApp" },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="https://wrapmode.ir"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-8 w-8 place-items-center rounded-lg border border-line text-fog transition-colors hover:border-accent/50 hover:text-accent-2"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
