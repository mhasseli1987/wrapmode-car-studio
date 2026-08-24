export function Header() {
  return (
    <header className="anim-header sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1680px] items-center gap-5 px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2.5" aria-label="Wrapmode Studio — صفحه اصلی">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-[15px] font-black text-white shadow-glow">
            W
          </span>
          <span className="text-[14.5px] font-bold tracking-[0.18em] text-white">WRAPMODE</span>
          <span className="hidden rounded-md border border-line-2 px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.22em] text-fog sm:block">
            STUDIO
          </span>
        </a>

        <nav className="ml-auto hidden items-center gap-8 text-[12px] font-medium tracking-[0.16em] text-fog md:flex">
          <a className="nav-link transition-colors hover:text-white" href="#stage">STUDIO</a>
          <a className="nav-link transition-colors hover:text-white" href="#designs">COLLECTION</a>
          <a className="nav-link transition-colors hover:text-white" href="#about">ABOUT</a>
          <a
            className="nav-link transition-colors hover:text-white"
            href="https://wrapmode.ir"
            target="_blank"
            rel="noopener noreferrer"
          >
            WRAPMODE.IR
          </a>
        </nav>

        <a
          href="#designs"
          className="ml-auto rounded-lg bg-accent px-4 py-2 text-[12px] font-bold text-white transition-colors hover:bg-accent-2 md:ml-0"
          dir="rtl"
        >
          درخواست اجرا
        </a>
      </div>
    </header>
  );
}
