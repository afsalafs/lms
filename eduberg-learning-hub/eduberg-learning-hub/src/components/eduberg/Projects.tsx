/**
 * PROJECTS — placeholder entries. Replace name, blurb and tag with real
 * EduBerg projects; add a photo per project where the frame is marked.
 */
const PROJECTS = [
    { name: "Project name one", tag: "Robotics", blurb: "One-line description of the machine and what it does." },
    { name: "Project name two", tag: "AI", blurb: "One-line description of the model and where it is used." },
    { name: "Project name three", tag: "Embedded", blurb: "One-line description of the device and its purpose." },
    { name: "Project name four", tag: "AI", blurb: "One-line description of the tool and who it serves." },
    { name: "Project name five", tag: "Robotics", blurb: "One-line description of the prototype and its result." },
    { name: "Project name six", tag: "Electronics", blurb: "One-line description of the board and its function." },
  ];
  
  export function Projects() {
    return (
      <section id="projects" className="rule-top">
        <div className="mx-auto max-w-[1240px] px-5 py-16 md:px-10 md:py-24">
          <header className="max-w-2xl">
            <p className="eyebrow">03 — Projects</p>
            <h2 className="mt-4 text-4xl leading-[1.06] md:text-5xl">
              Work developed at EduBerg.
            </h2>
            <p className="mt-5 text-muted-foreground">
              A selection of products and prototypes built by our teams, with students
              contributing alongside lab engineers.
            </p>
          </header>
  
          <ul className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {PROJECTS.map((p, i) => (
              <li
                key={p.name}
                className={`reveal bg-background p-6 md:p-8 ${i === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : ""}`}
              >
                {/* REPLACE: project photo or render */}
                <div className="placeholder-frame mb-6 aspect-[3/2] w-full">
                  <span className="p-3 text-[0.66rem] uppercase tracking-[0.16em] text-muted-foreground">
                    Photo: {p.name}
                  </span>
                </div>
                <span className="eyebrow">{p.tag}</span>
                <h3 className="mt-2 font-display text-2xl leading-tight">{p.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.blurb}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }
  