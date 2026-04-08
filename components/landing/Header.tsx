type HeaderProps = {
  ctaLabel: string;
};

export function Header({ ctaLabel }: HeaderProps) {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400" />
        <span className="text-lg font-semibold tracking-tight">
          GrowthPulse <span className="text-violet-400">AI</span>
        </span>
      </div>
      <nav className="hidden gap-8 text-sm text-slate-300 md:flex">
        <a href="#features" className="hover:text-white">Features</a>
        <a href="#pricing" className="hover:text-white">Pricing</a>
        <a href="#cta" className="hover:text-white">Get started</a>
      </nav>
      <a
        href="#cta"
        className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white/15"
      >
        {ctaLabel}
      </a>
    </header>
  );
}
