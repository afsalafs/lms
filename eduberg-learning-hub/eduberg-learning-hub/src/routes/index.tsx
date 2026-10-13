import { createFileRoute } from "@tanstack/react-router";

import { Nav } from "@/components/eduberg/Nav";
import { AnnouncementBar } from "@/components/eduberg/AnnouncementBar";
import { Hero } from "@/components/eduberg/Hero";
import { Courses } from "@/components/eduberg/Courses";
import { Lab } from "@/components/eduberg/Lab";
import { Projects } from "@/components/eduberg/Projects";
import { Achievements } from "@/components/eduberg/Achievements";
import { Events } from "@/components/eduberg/Events";
// import { Founders } from "@/components/eduberg/Founders";
import { Partners } from "@/components/eduberg/Partners";
import { Contact } from "@/components/eduberg/Contact";
import { Map } from "@/components/eduberg/Map";
import { Footer } from "@/components/eduberg/Footer";
import { useReveal } from "@/hooks/use-reveal";

const TITLE = "EduBerg Learning Hub — AI & Robotics education in Malappuram";
const DESCRIPTION =
  "Diploma, Master Diploma and BCA programmes in AI and Robotics, plus a working R&D lab and internships in Puthanathani, Malappuram, Kerala.";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: "EduBerg Learning Hub",
          description: DESCRIPTION,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Puthanathani",
            addressRegion: "Kerala",
            addressCountry: "IN",
          },
        }),
      },
    ],
  }),
});

function Index() {
  useReveal();

  return (
    <div>
      <AnnouncementBar />
      <Nav />
      <main>
        <Hero />
        <Courses />
        <Lab />
        <Projects />
        <Achievements />
        <Events />
        {/* <Founders /> */}
        <Partners />
        <Contact />
        <Map />
      </main>
      <Footer />
    </div>
  );
}
