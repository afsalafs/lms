import { useState } from "react";

/**
 * HOT TOPICS — data-driven. Edit / add / remove items here.
 * Each item: { tag, message, link }
 */
export type HotTopic = { tag: string; message: string; link: string };

export const HOT_TOPICS: HotTopic[] = [
  {
    tag: "Admissions",
    message: "Admissions open for Diploma in AI — next batch starting soon.",
    link: "#enquire",
  },
  {
    tag: "Internships",
    message: "R&D Lab internships in Robotics and Embedded Systems now accepting applications.",
    link: "#lab",
  },
  {
    tag: "Colleges",
    message: "Add-On AI & Robotics modules available for partner colleges this semester.",
    link: "#partners",
  },
];

export function AnnouncementBar() {
  const [items, setItems] = useState(HOT_TOPICS);
  const [index, setIndex] = useState(0);

  const item = items[Math.min(index, items.length - 1)];
  if (!item) return null;

  const dismiss = () => {
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    setIndex(0);
  };

  return (
    <aside
      aria-label="Announcements"
      className="border-b border-border bg-[var(--paper-deep)]"
    >
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-4 gap-y-2 px-5 py-2.5 md:px-10">
        <span className="rounded-sm bg-cta-gradient px-2 py-0.5 text-[0.66rem] uppercase tracking-[0.16em] text-primary-foreground">
          {item.tag}
        </span>
        <a
          href={item.link}
          className="text-sm underline-offset-4 hover:underline"
        >
          {item.message}
        </a>
        <div className="ml-auto flex items-center gap-3">
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % items.length)}
              className="text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
            >
              Next
            </button>
          )}
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss this announcement"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
