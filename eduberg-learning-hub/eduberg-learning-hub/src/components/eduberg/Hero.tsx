import { useTypewriterLoop } from "@/hooks/use-typewriter-loop";

export function Hero() {
  const WORDS = ["Innovate.", "Integrate.", "Inspire."];
  const text = useTypewriterLoop(WORDS, {
    typingSpeedMs: 70,
    deletingSpeedMs: 40,
    pauseMs: 1000,
    loop: true,
  });

  return (
    <>
      <section id="top" className="relative h-[90vh] min-h-[560px] w-full overflow-hidden">
        {/* Background video */}
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/hero-drone.mp4"
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Faded black overlay — lighter near the top (behind the heading),
            darkest at the bottom (behind the body text + buttons) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/80" />

        {/* band-ink lives on this wrapper (not the h1 itself) so the
            ".band-ink h1" rule in styles.css correctly overrides the
            gradient text with solid white */}
        <div className="relative z-10 flex h-full flex-col justify-between">
          {/* Top block — eyebrow + heading */}
          <div className="mx-auto w-full max-w-[1240px] px-5 pt-10 md:px-10 md:pt-16">
            <p className="text-[0.72rem] uppercase tracking-[0.18em] text-paper/80">
              Puthanathani · Malappuram · Kerala
            </p>
            <h1 className="mt-5 max-w-2xl text-[2.6rem] leading-[1.15] sm:text-6xl lg:text-[4.4rem]">
              {text}
              <span className="animate-blink">|</span>
            </h1>
          </div>

          {/* Bottom block — body copy + CTAs */}
          <div className="mx-auto w-full max-w-[1240px] px-5 pb-10 md:px-10 md:pb-14">
            <div className="hero-wrap">
              <p className="hero-text text-paper/85">
                Behind these walls, tomorrow's <span className="accent">intelligence</span> takes shape.
                EduBerg Learning Hub isn't a school — it's a working <span className="accent">R&D</span> lab
                that happens to train the minds bold enough to enter it. Diploma and degree pathways in{" "}
                <span className="accent">Artificial Intelligence and Robotics</span> unfold on the very benches
                where real products are engineered. No simulations. No sidelines. Just the unfiltered edge of
                what's being <span className="accent">built</span> next — and the professionals daring enough
                to build it.
              </p>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#enquire"
                className="rounded-sm bg-cta-gradient px-6 py-3.5 text-sm font-medium tracking-wide text-primary-foreground transition-colors hover:bg-[color-mix(in_oklab,var(--clay)_88%,black)]"
              >
                Apply for a batch
              </a>
              <a
                href="#courses"
                className="text-sm text-paper underline decoration-1 underline-offset-8 transition-colors hover:text-paper/70"
              >
                See the five programmes
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="mx-auto max-w-[1240px] px-5 md:px-10">
        <dl className="mt-16 grid gap-8 border-t border-border pt-8 sm:grid-cols-3">
          {/* PLACEHOLDER FACTS: confirm before publishing */}
          {[
            ["Established in Kerala", "Training and product R&D under one roof"],
            ["5 programmes", "Diplomas, a 3-year BCA, and add-on modules for colleges"],
            ["5 internship tracks", "Robotics, AI, Python, Embedded Systems, Electronics"],
          ].map(([t, d]) => (
            <div key={t} className="reveal">
              <dt className="font-display text-xl">{t}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
