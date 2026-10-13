import { useState, type FormEvent } from "react";

import { COURSE_OPTIONS } from "@/lib/enquiry";
import { submitEnquiry } from "@/lib/enquiry.functions";

import { site, telHref } from "@/lib/site";
import { SocialLinks } from "@/components/eduberg/SocialLinks";

export function Contact() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      await submitEnquiry({
        data: {
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          course: String(fd.get("course") ?? "") as (typeof COURSE_OPTIONS)[number],
          message: String(fd.get("message") ?? ""),
        },
      });
      form.reset();
      setSent(true);
    } catch {
      setError("We could not send your enquiry just now. Please try again, or call us.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="enquire" className="rule-top">
      <div className="mx-auto max-w-[1240px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow">07 — Enquire</p>
            <h2 className="mt-4 text-4xl leading-[1.06] md:text-5xl">Come and see the lab.</h2>
            <p className="mt-6 leading-relaxed text-muted-foreground">
              Visits are welcome on weekdays. Send us a note and we&rsquo;ll call back with batch
              dates, fee details and directions.
            </p>

            <dl className="mt-10 space-y-6 text-sm">
              <div>
                <dt className="eyebrow">Campus</dt>
                {/* PLACEHOLDER: full street address */}
                <dd className="mt-2 leading-relaxed">
                  BloomBerg Reasearch Institute
                  <br />
                  Punnathala P.O, Puthanathani, Malappuram
                  <br />
                  Kerala, India, 676552
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Phone / Email</dt>
                <dd className="mt-2 leading-relaxed">
                  {site.phones.map((phone) => (
                    <span key={phone} className="block">
                      <a href={telHref(phone)} className="hover:text-primary">
                        {phone}
                      </a>
                    </span>
                  ))}
                  {site.email ? (
                    <a href={`mailto:${site.email}`} className="hover:text-primary">
                      {site.email}
                    </a>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Social</dt>
                <dd className="mt-3">
                  <SocialLinks />
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-7">
            {sent ? (
              <div className="border border-primary bg-[var(--paper-deep)] p-10">
                <h3 className="text-3xl">Thank you — we have your enquiry.</h3>
                <p className="mt-4 text-muted-foreground">
                  Someone from the admissions desk will get back to you within one working day.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-8 text-sm underline underline-offset-8 hover:text-primary"
                >
                  Send another enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="eyebrow">Name</span>
                  <input
                    required
                    name="name"
                    autoComplete="name"
                    className="mt-2 w-full border-b border-input bg-transparent py-3 text-base outline-none focus:border-primary"
                  />
                </label>
                <label className="block">
                  <span className="eyebrow">Email</span>
                  <input
                    required
                    type="email"
                    name="email"
                    autoComplete="email"
                    className="mt-2 w-full border-b border-input bg-transparent py-3 text-base outline-none focus:border-primary"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="eyebrow">Phone (optional)</span>
                  <input
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    className="mt-2 w-full border-b border-input bg-transparent py-3 text-base outline-none focus:border-primary"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="eyebrow">Course of interest</span>
                  <select
                    name="course"
                    defaultValue={COURSE_OPTIONS[0]}
                    className="mt-2 w-full border-b border-input bg-transparent py-3 text-base outline-none focus:border-primary"
                  >
                    {COURSE_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="eyebrow">Message</span>
                  <textarea
                    name="message"
                    rows={4}
                    className="mt-2 w-full resize-none border-b border-input bg-transparent py-3 text-base outline-none focus:border-primary"
                  />
                </label>
                {error ? (
                  <p className="text-sm text-destructive sm:col-span-2" role="alert">
                    {error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={submitting}
                  className="justify-self-start rounded-sm bg-cta-gradient px-7 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-[color-mix(in_oklab,var(--clay)_88%,black)] disabled:opacity-60 sm:col-span-2"
                >
                  {submitting ? "Sending…" : "Send enquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
