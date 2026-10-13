import { useEffect, useState } from "react";

/** Section links — edit labels/targets here if sections are renamed. */
const LINKS = [
  { label: "Courses", href: "#courses" },
  { label: "R&D Lab", href: "#lab" },
  { label: "Projects", href: "#projects" },
  { label: "Achievements", href: "#achievements" },
  { label: "Events", href: "#events" },
  // { label: "Founders", href: "#founders" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-background/90 backdrop-blur-sm transition-shadow ${
        lifted ? "border-b border-border" : ""
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 md:px-10"
      >
        {/* PLACEHOLDER: swap wordmark for the real EduBerg logo when available */}
        <a href="#top" className="flex items-center gap-2">
          <img src="/favicon.ico" alt="EduBerg Learning Hub logo" className="h-8 w-8" />
          <span className="font-display text-2xl tracking-tight">EduBerg</span>
        </a>

        <ul className="nav-links hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm text-muted-foreground focus-visible:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href="#enquire"
            className="rounded-sm bg-cta-gradient px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-[color-mix(in_oklab,var(--clay)_88%,black)]"
          >
            Enquire
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-border lg:hidden"
          >
            <span className="sr-only">Menu</span>
            <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
              <path
                d={open ? "M1 1L17 11M17 1L1 11" : "M0 1h18M0 6h18M0 11h18"}
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
              />
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <ul
          id="mobile-menu"
          className="border-t border-border px-5 pb-5 pt-2 lg:hidden"
        >
          {LINKS.concat({ label: "Contact", href: "#enquire" }).map((l) => (
            <li key={l.href} className="border-b border-border/70 last:border-0">
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="block py-3 font-display text-lg"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
