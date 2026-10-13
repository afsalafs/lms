const PARTNERS = [
  { name: "Partner college one", logo: "/partners/Al-Ameen.jpeg" },
  { name: "Partner college two", logo: "/partners/MDIT.jpeg" },
  { name: "Partner college three", logo: "/partners/Dharmagiri.jpeg" },
  { name: "Partner college four", logo: "/partners/Safa.jpeg" },
];


export function Partners() {
    return (
      <section id="partners" className="rule-top">
        <div className="mx-auto max-w-[1240px] px-5 py-16 md:px-10 md:py-24">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="eyebrow">06 — For colleges</p>
              <h2 className="mt-4 max-w-lg text-4xl leading-[1.06] md:text-5xl">
                Add-On courses, taught on your campus.
              </h2>
              <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">
                EduBerg delivers short AI and Robotics modules for colleges that want to add
                applied skills to an existing syllabus. We bring the kit, run the sessions in
                your labs or classrooms, and work around your academic calendar. Departments
                choose the depth — an introductory module over a few weekends, or a longer
                certificate track across a semester.
              </p>
              <a
                href="#enquire"
                className="mt-8 inline-block rounded-sm border border-foreground px-6 py-3.5 text-sm transition-colors hover:bg-foreground hover:text-background"
              >
                Request a module outline
              </a>
            </div>
  
            {/* REPLACE: partner college logos or a photo from a campus session */}
            <div className="grid grid-cols-2 gap-px self-start border border-border bg-border lg:col-span-5">
              {PARTNERS.map((p) => (
                <div
                  key={p.name}
                  className="flex aspect-[3/2] items-center justify-center bg-background p-6"
                >
                  <img
                    src={p.logo}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }
  