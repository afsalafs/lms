import { Facebook, Instagram, Linkedin } from "lucide-react";

import { site } from "@/lib/site";

const ICONS = {
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
} as const;

export function SocialLinks({ tone = "light" }: { tone?: "light" | "dark" }) {
  const items = site.socials.filter((s) => s.href);
  if (!items.length) return null;

  const box =
    tone === "dark"
      ? "border-[color-mix(in_oklab,var(--paper)_28%,transparent)] text-[var(--paper)] hover:bg-[color-mix(in_oklab,var(--paper)_12%,transparent)]"
      : "border-border text-foreground hover:border-foreground hover:bg-foreground hover:text-background";

  return (
    <ul className="flex gap-3">
      {items.map((s) => {
        const Icon = ICONS[s.id];
        return (
          <li key={s.id}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`EduBerg on ${s.label}`}
              className={`flex h-9 w-9 items-center justify-center rounded-sm border transition-colors ${box}`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}