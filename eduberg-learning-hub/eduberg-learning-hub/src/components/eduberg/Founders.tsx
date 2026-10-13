/** FOUNDERS — replace every name, title and bio with real details. */
const FOUNDERS = [
    {
      name: "Founder name",
      title: "Placeholder title — e.g. Managing Director",
      bio: "Placeholder bio: background in engineering or education, the reason EduBerg was started, and what they teach or oversee today. Two or three sentences is enough.",
    },
    {
      name: "Founder name",
      title: "Placeholder title — e.g. Head of R&D",
      bio: "Placeholder bio: experience in robotics or AI product development, what they lead in the lab, and how they work with students.",
    },
    {
      name: "Founder name",
      title: "Placeholder title — e.g. Academic Director",
      bio: "Placeholder bio: teaching background, curriculum responsibility, and involvement with partner colleges.",
    },
  ];
  
  export function Founders() {
    return (
      <section id="founders" className="bg-[var(--paper-deep)]">
        <div className="mx-auto max-w-[1240px] px-5 py-16 md:px-10 md:py-24">
          <header className="max-w-2xl">
            <p className="eyebrow">06 — Founders</p>
            <h2 className="mt-4 text-4xl leading-[1.06] md:text-5xl">
              The people who started it.
            </h2>
          </header>
  
          <div className="mt-14 space-y-16">
            {FOUNDERS.map((f, i) => (
              <article
                key={i}
                className="reveal grid items-start gap-8 border-t border-border pt-10 md:grid-cols-12"
              >
                {/* REPLACE: founder portrait */}
                <figure
                  className={`md:col-span-4 ${i % 2 === 1 ? "md:order-2 md:col-start-9" : ""}`}
                >
                  <div className="placeholder-frame aspect-[3/4] w-full max-w-[280px]">
                    <figcaption className="p-3 text-[0.66rem] uppercase tracking-[0.16em] text-muted-foreground">
                      Portrait: founder {i + 1}
                    </figcaption>
                  </div>
                </figure>
                <div
                  className={`md:col-span-7 ${i % 2 === 1 ? "md:order-1 md:col-start-1 md:row-start-1" : "md:col-start-6"}`}
                >
                  <p className="eyebrow">{f.title}</p>
                  <h3 className="mt-3 text-3xl leading-tight md:text-4xl">{f.name}</h3>
                  <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">{f.bio}</p>
                </div>
  
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }
  