import { useState } from "react";

/** COURSES — durations are fixed; descriptions are editable copy. */
const COURSES = [
  {
    name: "Master Diploma in AI & Robotics",
    duration: "6 months",
    featured: true,
    body: "Our most complete programme: machine learning, computer vision, robotic control and embedded integration studied together, finishing with a working prototype built in the R&D lab.",
    detail: [
      "Python, data handling and applied machine learning",
      "Robot kinematics, sensors, actuators and controllers",
      "Capstone product built with lab mentors",
    ],
  },
  {
    name: "Diploma in AI",
    duration: "6 months",
    body: "A practical grounding in Python, data work, machine learning and computer vision, taught through weekly build tasks rather than slides.",
    detail: [
      "Python and data fundamentals",
      "Supervised learning, model evaluation, deployment basics",
      "Two portfolio projects",
    ],
  },
  {
    name: "Diploma in Robotics",
    duration: "6 months",
    body: "Mechanical assembly, electronics, microcontrollers and motion control — students wire, program and debug real machines from week one.",
    detail: [
      "Electronics and microcontroller programming",
      "Drive systems, sensing and feedback control",
      "Team robot build",
    ],
  },
  {
    name: "BCA with AI & Robotics",
    duration: "3 years",
    body: "A full undergraduate degree in computer applications with AI and Robotics woven through every year, including lab time and internships.",
    detail: [
      "Core computer applications curriculum",
      "AI and Robotics electives each year",
      "Internship in the EduBerg R&D lab",
    ],
  },
  {
    name: "Add-On Courses for Colleges",
    duration: "Short format · flexible",
    body: "Short AI and Robotics modules delivered on partner college campuses, scheduled around the existing academic calendar.",
    detail: [
      "20 to 60 hour module options",
      "Delivered by EduBerg trainers on campus",
      "Certificate for participating students",
    ],
  },
];

export function Courses() {
  const [open, setOpen] = useState(0);

  return (
    <section id="courses" className="rule-top">
      <div className="mx-auto max-w-[1240px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-10 lg:grid-cols-12">
          <header className="lg:col-span-4">
            <p className="eyebrow">01 — Programmes</p>
            <h2 className="mt-4 text-4xl leading-[1.06] md:text-5xl">
              Five ways to study here.
            </h2>
            <p className="mt-5 max-w-sm text-muted-foreground">
              Every programme is taught by practitioners and assessed on what students
              actually build. Batch sizes stay small so lab time is real, not scheduled.
            </p>
          </header>

          <ul className="lg:col-span-8">
            {COURSES.map((c, i) => {
              const isOpen = open === i;
              return (
                <li key={c.name} className="reveal border-t border-border last:border-b">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="group flex w-full items-start gap-6 py-6 text-left"
                  >
                    <span className="mt-2 font-mono text-xs text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <span className="font-display text-2xl leading-tight md:text-[1.7rem]">
                          {c.name}
                        </span>
                        <span className="text-xs uppercase tracking-[0.16em] text-primary">
                          {c.duration}
                        </span>
                      </span>
                      <span className="mt-2 block max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        {c.body}
                      </span>
                      {isOpen && (
                        <span className="mt-4 block border-l border-primary pl-4">
                          {c.detail.map((d) => (
                            <span key={d} className="block py-1 text-sm">
                              {d}
                            </span>
                          ))}
                        </span>
                      )}
                    </span>
                    <span
                      aria-hidden="true"
                      className="mt-2 text-lg text-muted-foreground transition-transform group-hover:text-foreground"
                      style={{ transform: isOpen ? "rotate(45deg)" : undefined }}
                    >
                      +
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
