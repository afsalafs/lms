import { site, telHref } from "@/lib/site";
import { SocialLinks } from "@/components/eduberg/SocialLinks";


export function Footer() {
    return (
      <footer className="band-ink bg-[var(--ink)] text-[var(--paper)]">
        <div className="mx-auto max-w-[1240px] px-5 py-14 md:px-10">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="font-display text-3xl">EduBerg</p>
              <p
                className="mt-3 max-w-xs text-sm leading-relaxed"
                style={{ color: "color-mix(in oklab, var(--paper) 68%, transparent)" }}
              >
                AI &amp; Robotics education, training and R&amp;D. Puthanathani, Malappuram,
                Kerala.
              </p>
            </div>
  
            <nav className="md:col-span-3" aria-label="Courses">
              <p className="eyebrow" style={{ color: "color-mix(in oklab, var(--paper) 60%, transparent)" }}>
                Courses
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {[
                  "Diploma in AI",
                  "Diploma in Robotics",
                  "Master Diploma in AI & Robotics",
                  "BCA with AI & Robotics",
                  "Add-On Courses for Colleges",
                ].map((c) => (
                  <li key={c}>
                    <a href="#courses" className="underline-offset-4 hover:underline">
                      {c}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
  
            <nav className="md:col-span-2" aria-label="Quick links">
              <p className="eyebrow" style={{ color: "color-mix(in oklab, var(--paper) 60%, transparent)" }}>
                Explore
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {[
                  ["R&D Lab", "#lab"],
                  ["Projects", "#projects"],
                  ["Achievements", "#achievements"],
                  ["Events", "#events"],
                  // ["Founders", "#founders"],
                ].map(([l, h]) => (
                  <li key={h}>
                    <a href={h} className="underline-offset-4 hover:underline">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
  
            <div className="md:col-span-3">
              <p className="eyebrow" style={{ color: "color-mix(in oklab, var(--paper) 60%, transparent)" }}>
                Contact
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {site.phones.map((phone) => (
                  <li key={phone}>
                    <a href={telHref(phone)} className="underline-offset-4 hover:underline">
                      {phone}
                    </a>
                  </li>
                ))}
                {site.email ? (
                  <li>
                    <a href={`mailto:${site.email}`} className="underline-offset-4 hover:underline">
                      {site.email}
                    </a>
                  </li>
                ) : null}
                <li className="pt-2">
                  <SocialLinks tone="dark" />
                </li>
              </ul>
            </div>
          </div>
  
          <p
            className="mt-14 border-t pt-6 text-xs"
            style={{
              borderColor: "color-mix(in oklab, var(--paper) 20%, transparent)",
              color: "color-mix(in oklab, var(--paper) 60%, transparent)",
            }}
          >
            © {new Date().getFullYear()} EduBerg Learning Hub, Puthanathani, Malappuram, Kerala.
            All rights reserved.
          </p>
        </div>
      </footer>
    );
  }
  