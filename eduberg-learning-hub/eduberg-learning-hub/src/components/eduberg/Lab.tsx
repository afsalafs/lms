const INTERNSHIPS = ["Robotics", "Artificial Intelligence", "Python", "Embedded Systems", "Electronics"];

export function Lab() {
  return (
    <section id="lab" className="bg-[var(--paper-deep)]">
      <div className="mx-auto max-w-[1240px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* REPLACE: wide photo of the R&D lab benches and equipment */}
          <figure className="lg:col-span-5">
            <div className="placeholder-frame aspect-[4/3] w-full">
              <figcaption className="p-4 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Photo: R&amp;D lab interior
              </figcaption>
            </div>
          </figure>

          <div className="lg:col-span-7">
            <p className="eyebrow">02 — R&amp;D Lab</p>
            <h2 className="mt-4 max-w-xl text-4xl leading-[1.06] md:text-5xl">
              The lab is not a demo room. Products get finished here.
            </h2>
            <div className="mt-6 max-w-2xl space-y-4 text-muted-foreground">
              <p>
                EduBerg&rsquo;s R&amp;D lab is equipped for the full cycle of a hardware and
                software product: prototyping, electronics fabrication, firmware, model
                training and field testing. The work is original — our own AI and robotics
                products, developed in Malappuram.
              </p>
              <p>
                Students and interns join those teams. They sit in on design reviews, own
                small parts of a real build, and leave with something they can explain
                line by line.
              </p>
            </div>

            <h3 className="mt-10 font-display text-xl">Internships</h3>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {INTERNSHIPS.map((d) => (
                <li
                  key={d}
                  className="rounded-sm border border-border bg-background px-3.5 py-2 text-sm"
                >
                  {d}
                </li>
              ))}
            </ul>
            <a
              href="#enquire"
              className="mt-8 inline-block text-sm underline decoration-1 underline-offset-8 hover:text-primary"
            >
              Ask about internship openings
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
