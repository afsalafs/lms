import { useEffect, useRef, useState } from "react";

/** STATS — PLACEHOLDER NUMBERS. Replace `value` with verified figures. */
const STATS = [
  { value: 999, suffix: "+", label: "Students trained since inception" },
  { value: 8, suffix: "", label: "Partner colleges across Kerala" },
  { value: 93, suffix: "%", label: "Placement or higher-study progression" },
  { value: 35, suffix: "", label: "Products and prototypes in the lab" },
];

/** ACHIEVEMENT HIGHLIGHTS — placeholder copy, edit freely. */
const HIGHLIGHTS = [
  {
    title: "State-level robotics recognition",
    body: "Placeholder: award or competition result, with year and awarding body.",
  },
  {
    title: "Media coverage in regional press",
    body: "Placeholder: publication name and a one-line note on the story.",
  },
  {
    title: "MoUs signed with colleges",
    body: "Placeholder: number of institutions and the scope of the partnership.",
  },
];

function CountUp({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      setN(to);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const dur = 1200;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          setN(Math.round(to * eased));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);

  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

export function Achievements() {
  return (
    <section id="achievements" className="band-ink bg-[var(--ink)] text-[var(--paper)]">
      <div className="mx-auto max-w-[1240px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-10 lg:grid-cols-12">
          <header className="lg:col-span-5">
            <p className="eyebrow" style={{ color: "color-mix(in oklab, var(--paper) 65%, transparent)" }}>
              04 — Achievements
            </p>
            <h2 className="mt-4 text-4xl leading-[1.06] md:text-5xl">
              What the last few years added up to.
            </h2>
          </header>

          <dl className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:col-span-7">
            {STATS.map((s) => (
              <div key={s.label} className="reveal">
                <dt className="font-display text-5xl leading-none md:text-6xl">
                  <CountUp to={s.value} suffix={s.suffix} />
                </dt>
                <dd
                  className="mt-3 text-sm leading-relaxed"
                  style={{ color: "color-mix(in oklab, var(--paper) 70%, transparent)" }}
                >
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <ul
          className="mt-16 grid gap-8 border-t pt-10 sm:grid-cols-3"
          style={{ borderColor: "color-mix(in oklab, var(--paper) 22%, transparent)" }}
        >
          {HIGHLIGHTS.map((h) => (
            <li key={h.title} className="reveal">
              <h3 className="font-display text-xl">{h.title}</h3>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: "color-mix(in oklab, var(--paper) 68%, transparent)" }}
              >
                {h.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
