import { useEffect, useState, type ComponentType } from "react";

const SHORT_LINK = "https://maps.app.goo.gl/S2n8CoqkAbC58fvp6";

export function Map() {
  const [ClientMap, setClientMap] = useState<ComponentType | null>(null);

  useEffect(() => {
    import("./MapClient").then((mod) => {
      setClientMap(() => mod.MapClient);
    });
  }, []);

  return (
    <section id="visit" className="rule-top">
      <div className="mx-auto max-w-[1240px] px-5 py-16 md:px-10 md:py-24">
        <p className="eyebrow">08 — Visit</p>
        <h2 className="mt-4 text-4xl leading-[1.06] md:text-5xl">Find the lab.</h2>
        <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">
          EduBerg Learning Hub LLP is in Punnathala, Puthanathani, Kerala. Drop in on a
          weekday or call ahead to book a lab tour.
        </p>

        <div className="mt-10 overflow-hidden rounded-sm border border-border bg-paper-deep">
          {ClientMap ? (
            <ClientMap />
          ) : (
            <div className="aspect-[16/9] h-auto w-full flex items-center justify-center bg-muted/20 text-muted-foreground">
              Loading map...
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4 text-sm">
          <a
            href={SHORT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 underline underline-offset-4 hover:text-primary"
          >
            Open in Google Maps
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M7 17L17 7M17 7H7M17 7V17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <p className="text-muted-foreground">
            Post, Punnathala, Puthanathani, Kerala 676552, India
          </p>
        </div>
      </div>
    </section>
  );
}
