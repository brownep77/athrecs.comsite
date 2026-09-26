import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { SPORT_PAGES } from "@/lib/athrecs/sport-pages";

const title = "About AthRecs | Athlete Profiles, Race Results & Fixtures";
const description =
  "AthRecs brings athlete profiles, race results, personal bests, clubs and sports fixtures together. Discover our purpose, coverage and approach to sporting records.";
const questions = [
  {
    question: "What is AthRecs?",
    answer:
      "AthRecs is a sports discovery and athlete profile website. It brings public athlete records, race results, personal bests, club information and sporting fixtures together so you can explore a performance and the person behind it.",
  },
  {
    question: "Who is AthRecs for?",
    answer:
      "AthRecs is for everyday runners, club athletes, competitors across sports and the people who follow them. A first finish, a season of steady progress and a new personal best all deserve a place in your sporting story.",
  },
  {
    question: "Which sports does AthRecs cover?",
    answer:
      "You can browse road running, trail running, track and field, triathlon, swimming, road cycling, mountain biking, track cycling and BMX. The sport pages bring together fixtures, results links and published TV or streaming information where available. Coverage is growing, so the depth varies by sport and event.",
  },
  {
    question: "How do I find my race results?",
    answer:
      "Search the athlete directory for your name, or browse race results by event. Check the race, date, distance and other details before claiming a performance: two people sharing a name does not make them the same athlete.",
  },
  {
    question: "Can I create a profile or correct a result?",
    answer:
      "Yes. Create an athlete account to build your profile and submit results for review. You can also suggest an edit from an athlete profile. Useful supporting details include the official results link, race date, distance and bib number. Claims and corrections are checked before they change the public record.",
  },
  {
    question: "Can I browse AthRecs without an account?",
    answer:
      "Yes. Public athlete profiles, published race results and event guides can be read without signing in. An athlete account lets you manage your own profile and submit results for review. Private account information and unpublished records are not part of the public directory.",
  },
  {
    question: "Can I find marathon, half-marathon and ultramarathon information?",
    answer:
      "Yes. The AthRecs running section includes road marathon and half-marathon guides for the United Kingdom, Ireland, Australia, New Zealand, the United States, Canada and South Africa, plus a UK road ultramarathon guide. Race pages cover entry methods, locations, distances and official links. Dates are shown as TBC when they have not been confirmed.",
  },
  {
    question: "Does AthRecs organise races or sell race entries?",
    answer:
      "AthRecs helps you discover events and find the organiser or entry provider. Check the official event page for the latest date, entry availability, course details and race instructions. RunRecs is our linked running race directory for exploring your next start line.",
  },
];

export const Route = createFileRoute("/about-us")({
  ssr: true,
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  head: () => ({
    meta: siteGraphMeta({ title, description, url: `${SITE_URL}/about-us` }),
    links: [{ rel: "canonical", href: `${SITE_URL}/about-us` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "AboutPage",
              "@id": `${SITE_URL}/about-us#page`,
              url: `${SITE_URL}/about-us`,
              name: title,
              description,
              inLanguage: "en-GB",
              about: { "@id": `${SITE_URL}/#organization` },
              mainEntity: { "@id": `${SITE_URL}/#organization` },
              isPartOf: { "@id": `${SITE_URL}/#website` },
              breadcrumb: { "@id": `${SITE_URL}/about-us#breadcrumbs` },
              hasPart: { "@id": `${SITE_URL}/about-us#questions` },
            },
            {
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: SITE_NAME,
              url: SITE_URL,
              logo: DEFAULT_OG_IMAGE,
              description: questions[0].answer,
              mainEntityOfPage: { "@id": `${SITE_URL}/about-us#page` },
            },
            {
              "@type": "BreadcrumbList",
              "@id": `${SITE_URL}/about-us#breadcrumbs`,
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "About AthRecs",
                  item: `${SITE_URL}/about-us`,
                },
              ],
            },
            {
              "@type": "FAQPage",
              "@id": `${SITE_URL}/about-us#questions`,
              url: `${SITE_URL}/about-us#questions`,
              inLanguage: "en-GB",
              isPartOf: { "@id": `${SITE_URL}/about-us#page` },
              mainEntity: questions.map(({ question, answer }) => ({
                "@type": "Question",
                name: question,
                acceptedAnswer: { "@type": "Answer", text: answer },
              })),
            },
          ],
        }),
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-9 py-3 sm:py-6">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link to="/" className="text-accent underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">About AthRecs</li>
        </ol>
      </nav>
      <header className="space-y-4 border-b border-border pb-7">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          About AthRecs
        </h1>
        <p className="text-lg leading-8 text-muted">
          AthRecs is a sports discovery and athlete profile website bringing together race results,
          personal bests, clubs and sports fixtures. It helps everyday competitors and sports fans
          find an athlete’s sporting history and explore their next event.
        </p>
      </header>
      <section className="space-y-4 text-base leading-7">
        <h2 className="font-display text-2xl font-semibold">A home for the whole sporting story</h2>
        <p>
          Sport produces plenty of numbers. Finding the right ones can take longer than the warm-up.
          One result lives on a timing website, another sits in a club report, and that breakthrough
          performance is somewhere in a very old browser tab.
        </p>
        <p>
          AthRecs is built around a simple idea: make those records easier to explore. Start with an
          athlete, a race or a club, then follow the connections. Whether you are chasing a marathon
          personal best, checking a track result or looking back at your first finish, the details
          matter.
        </p>
        <p>
          We have a soft spot for the everyday competitor: the club runner fitting training around
          work, the swimmer returning after a break, the cyclist having a go at a first event. You
          do not need a podium to have a story worth recording.
        </p>
      </section>
      <section className="space-y-4 text-base leading-7" aria-labelledby="explore-records">
        <h2 id="explore-records" className="font-display text-2xl font-semibold">
          From your first 5K to your next marathon
        </h2>
        <p>
          A personal best is more useful when you can see the race, distance and date behind it. Our{" "}
          <Link to="/athletes" className="text-accent underline">
            athlete profiles
          </Link>{" "}
          bring published performances together, while the{" "}
          <Link to="/results" className="text-accent underline">
            race results section
          </Link>{" "}
          lets you explore individual events. Coverage is still growing: a gap in a profile is a gap
          to investigate, not a verdict on someone’s running career.
        </p>
        <p>
          Looking for the next start line? Our{" "}
          <Link to="/running" className="text-accent underline">
            marathon and half-marathon guides
          </Link>{" "}
          cover races in the UK, Ireland, Australia, New Zealand, the USA, Canada and South Africa.
          Compare locations and entry methods, then follow the official organiser links. The{" "}
          <Link to="/running/uk-road-ultramarathons" className="text-accent underline">
            UK road ultramarathon guide
          </Link>{" "}
          is there for anyone who reaches 26.2 miles and thinks there might be a little more to do.
        </p>
      </section>
      <section className="space-y-4 text-base leading-7">
        <h2 className="font-display text-2xl font-semibold">
          Useful records, with room to put things right
        </h2>
        <p>
          Race results can be messy. Names repeat, distances change and chip times are not always
          gun times. We keep those distinctions in mind when reviewing records and give athletes a
          way to flag mistakes and submit supporting information.
        </p>
        <p>
          AthRecs is a growing record, so a missing result does not mean a race never happened. Our
          aim is to build more complete sporting histories over time, with public profiles that
          respect athletes’ sharing choices.
        </p>
        <p>
          <Link to="/athletes" className="text-accent underline">
            Explore athlete profiles
          </Link>
          ,{" "}
          <Link to="/results" className="text-accent underline">
            browse race results
          </Link>{" "}
          or{" "}
          <Link to="/clubs" className="text-accent underline">
            find a club
          </Link>
          .
        </p>
      </section>
      <section id="questions" className="space-y-5" aria-labelledby="questions-heading">
        <h2 id="questions-heading" className="font-display text-2xl font-semibold">
          Questions about AthRecs
        </h2>
        {questions.map(({ question, answer }) => (
          <section key={question} className="space-y-2">
            <h3 className="font-display text-xl font-semibold">{question}</h3>
            <p className="text-base leading-7 text-muted">{answer}</p>
          </section>
        ))}
      </section>
      <nav
        aria-label="Explore sports"
        className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
      >
        <h2 className="font-display text-2xl font-semibold">Find your sport</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {SPORT_PAGES.map((sport) => (
            <li key={sport.slug}>
              <Link
                to="/sports/$sport"
                params={{ sport: sport.slug }}
                className="inline-flex min-h-11 items-center text-base text-accent underline"
              >
                {sport.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className="text-base leading-7">
        <Link to="/join" className="font-semibold text-accent underline">
          Create your athlete profile
        </Link>{" "}
        ·{" "}
        <a href="https://www.runrecs.com" className="text-accent underline">
          Find running races on RunRecs
        </a>{" "}
        ·{" "}
        <Link to="/privacy" className="text-accent underline">
          Your privacy
        </Link>
      </p>
    </article>
  );
}
