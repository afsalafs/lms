import { useCallback, useEffect, useRef, useState } from "react";

/** EVENTS — replace labels and add real photos for each slide. */
const EVENTS = [
  { title: "Orientation Day 2025", note: "New diploma batch, Puthanathani campus" },
  { title: "Workshop on Robotics", note: "Hands-on session with partner college students" },
  { title: "College Partnership MoU Signing", note: "Add-On course agreement" },
  { title: "Lab Open House", note: "Parents and students visiting the R&D lab" },
  { title: "Internship Showcase", note: "Interns presenting their builds" },
];

export function Events() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  const scrollTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[i] as HTMLElement | undefined;
    if (child) track.scrollTo({ left: child.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const items = Array.from(track.children) as HTMLElement[];
      const left = track.scrollLeft;
      let best = 0;
      let bestD = Infinity;
      items.forEach((el, i) => {
        const d = Math.abs(el.offsetLeft - track.offsetLeft - left);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      setActive(best);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  const step = (dir: number) => {
    const next = Math.min(EVENTS.length - 1, Math.max(0, active + dir));
    setActive(next);
    scrollTo(next);
  };

  return (
    <section id="events" className="rule-top">
      <div className="mx-auto max-w-[1240px] px-5 py-16 md:px-10 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <header className="max-w-xl">
            <p className="eyebrow">05 — Events</p>
            <h2 className="mt-4 text-4xl leading-[1.06] md:text-5xl">
              Days on campus.
            </h2>
          </header>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={active === 0}
              aria-label="Previous event"
              className="flex h-11 w-11 items-center justify-center rounded-sm border border-border transition-colors hover:bg-secondary disabled:opacity-35"
            >
              <span aria-hidden="true">&larr;</span>
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={active === EVENTS.length - 1}
              aria-label="Next event"
              className="flex h-11 w-11 items-center justify-center rounded-sm border border-border transition-colors hover:bg-secondary disabled:opacity-35"
            >
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </div>

        <ul
          ref={trackRef}
          tabIndex={0}
          aria-label="Event photo gallery"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              step(1);
            }
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              step(-1);
            }
          }}
          className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          {EVENTS.map((e, i) => (
            <li
              key={e.title}
              aria-current={active === i}
              className="w-[86%] shrink-0 snap-start sm:w-[58%] lg:w-[44%]"
            >
              {/* REPLACE: event photo */}
              <div className="placeholder-frame aspect-[16/10] w-full">
                <span className="p-4 text-[0.66rem] uppercase tracking-[0.16em] text-muted-foreground">
                  Photo: {e.title}
                </span>
              </div>
              <h3 className="mt-4 font-display text-xl">{e.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{e.note}</p>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex gap-2">
          {EVENTS.map((e, i) => (
            <button
              key={e.title}
              type="button"
              aria-label={`Go to ${e.title}`}
              aria-current={active === i}
              onClick={() => {
                setActive(i);
                scrollTo(i);
              }}
              className={`h-1.5 rounded-full transition-all ${
                active === i ? "w-8 bg-primary" : "w-4 bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
