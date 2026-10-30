import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { IntercomAskButton } from "@/components/assistant/IntercomWelcome";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { SPORT_PAGES } from "@/lib/athrecs/sport-pages";

const title = "About AthRecs | Our Story, Your Results, Every Athlete";
const description =
  "Discover why AthRecs was created: to bring sporting results together and celebrate every athlete. Running is our focus; all sports and abilities are welcome.";
const questions = [
  {
    question: "What is AthRecs?",
    answer:
      "AthRecs is a sports platform bringing athlete profiles, race results, personal bests, clubs and event fixtures together. Its purpose is to help athletes preserve their sporting history, celebrate achievements and discover their next event.",
  },
  {
    question: "Why was AthRecs created?",
    answer:
      "AthRecs was founded by a runner who wanted to bring athletes’ race records together, check the details and preserve a lasting record of their achievements. It is built around the belief that every athlete’s story matters, whatever their ability or level.",
  },
  {
    question: "Is AthRecs only for runners?",
    answer:
      "No. Running is our current focus, including road, trail, cross country, fell running and ultramarathons. We also have sections for triathlon, cycling, swimming, athletics, duathlon and hybrid fitness. Athletes from every sport are welcome to contribute; coverage and available profile features vary by sport as AthRecs grows.",
  },
  {
    question: "Do I need to be fast or compete professionally to join?",
    answer:
      "No. AthRecs welcomes beginners, recreational participants, club athletes, para-athletes, age-group competitors and elite athletes. There is no minimum performance standard for joining. A first finish and a personal milestone deserve recognition just as much as a podium place.",
  },
  {
    question: "Is it free to create an AthRecs athlete profile?",
    answer:
      "Yes. Creating your athlete account and profile is free. Start at athrecs.com/join, enter your name, country, location and email, then follow the verification steps. You can help identify existing results and tell us what is missing.",
  },
  {
    question: "Can I submit results from any sport?",
    answer:
      "Yes. Athletes from all sports and at every level are welcome to submit results for review. Include your name, event, date, discipline or distance, performance and an official result link where available. If your sport or event is not yet represented, contact AthRecs so we can review the information and discuss how it can be included.",
  },
  {
    question: "How do I report a missing result, fixture or amendment?",
    answer:
      "Use your athlete account to submit results, use the amendment option on the relevant page where available, or contact AthRecs through the site chat or support@athrecs.com. Include the event name, edition date and the details that need adding or updating. Supporting results links, bib numbers and certificates can help the review.",
  },
  {
    question: "Are all results on AthRecs verified?",
    answer:
      "No. Recorded achievements and verification are separate. Check each result’s status and qualifications. We review supporting evidence, distinguish timing methods and investigate identity matches; sharing a name does not establish that two results belong to the same athlete.",
  },
  {
    question: "Can I speak to AthRecs if I am just starting out?",
    answer:
      "Yes. We welcome questions, results and feedback from everyone, whatever their ability, experience or level. Use the site chat or email support@athrecs.com. You do not need to be a professional athlete or a club member to get in touch.",
  },
  {
    question: "Does AthRecs organise the events it lists?",
    answer:
      "AthRecs helps you discover events and reach their organisers or authorised entry providers. A listing does not mean AthRecs organises that event. Always check the organiser’s latest information for entry availability, schedules, course details and race instructions.",
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
              alternateName: "AthRecs",
              url: SITE_URL,
              logo: DEFAULT_OG_IMAGE,
              description: questions[0].answer,
              email: "support@athrecs.com",
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

const actionClass =
  "inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-center text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";
const sectionClass = "space-y-4 text-base leading-8";
const headingClass = "font-display text-2xl font-semibold tracking-tight sm:text-3xl";

function AboutPage() {
  return (
    <article className="mx-auto max-w-5xl space-y-10 py-3 sm:space-y-14 sm:py-6">
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

      <header className="overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-10">
        <p className="mb-4 text-sm font-bold uppercase tracking-widest text-accent">
          About AthRecs
        </p>
        <h1 className="max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Every athlete has a story.
          <br />
          Yours belongs here.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
          AthRecs brings athlete profiles, sporting results, personal bests, clubs and event
          fixtures together. We help you preserve the achievements you worked for, see how far you
          have come and find your next challenge.
        </p>
        <p className="mt-4 max-w-3xl text-lg font-semibold leading-8">
          Running is our focus today. All sports, all abilities and all levels are welcome.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/join" className={`${actionClass} bg-[#08756f] text-white hover:bg-[#065d58]`}>
            Create my free athlete profile
          </Link>
          <a
            href="#contribute"
            className={`${actionClass} bg-[#e9e2f8] text-[#49356b] hover:bg-[#ded3f1]`}
          >
            Share my results
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-10 sm:space-y-14">
        <section id="our-story" className={sectionClass}>
          <h2 className={headingClass}>How AthRecs was born</h2>
          <p>
            AthRecs began with a runner’s ambition: bring athletes’ race records together, check the
            details and preserve a lasting record of their achievements. The idea was simple. The
            effort behind a result deserves to be remembered.
          </p>
          <p>
            Anyone who has tried to piece together a sporting history knows the challenge. One
            result sits on a timing website, another in an old event archive, another on a
            certificate kept in a drawer. Years of training can become a collection of scattered
            links, with important moments missing from the picture.
          </p>
          <p>
            AthRecs is being built to help bring that picture together. A place where you can
            explore your performances, recognise your progress and keep adding to your sporting
            story. The ambition reaches beyond any single race, season or sport.
          </p>
          <p>
            Behind the times and positions are the early starts, the training fitted around everyday
            life, the setbacks and the decision to try again. A first finish can mean as much to one
            person as a championship medal means to another. Both belong here.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>One athlete. Every sport.</h2>
          <p>
            Our current focus is running: road races, trail running, cross country, fell running,
            ultramarathons and the local events that bring people together. From a first 5K or
            parkrun to a marathon or a much longer adventure, we want athletes to be able to find
            their events and build a meaningful record of their progress.
          </p>
          <p>
            That same welcome extends to triathlon, cycling, swimming, track and field, duathlon,
            hybrid fitness and athletes in every other sport. You may compete in one discipline or
            move between several. Your sporting life does not have to fit into a single category.
          </p>
          <p>
            Coverage is growing, and the depth of results, fixtures and profile features varies by
            sport. If your discipline or event is missing, we still want to hear from you. Send the
            details and help us understand what your sporting community needs.
          </p>
          <Link
            to="/find-events"
            className="inline-flex min-h-11 items-center font-semibold text-accent underline"
          >
            Explore sports and find an event
          </Link>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h2 className={headingClass}>Every ability. Every level. A real welcome.</h2>
          <div className="mt-4 space-y-4 text-base leading-8">
            <p>
              You do not need a qualifying time, a club vest or a place on the podium to belong at
              AthRecs. Beginners, recreational participants, club athletes, para-athletes, age-group
              competitors and professionals are all welcome.
            </p>
            <p>
              Perhaps you are starting out, returning after a break, chasing a personal best or
              simply enjoying taking part. We want to celebrate the achievements that matter to you,
              with the same respect for the last finisher as the first.
            </p>
            <p className="font-semibold">
              We welcome results, questions and conversations from everyone—whatever your ability,
              experience or level.
            </p>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Your sporting life, connected</h2>
          <p>
            <Link to="/athletes" className="font-semibold text-accent underline">
              Athlete profiles
            </Link>{" "}
            bring performances and personal milestones together. Explore recorded results, revisit
            past events and see the achievements built from your sporting history.
          </p>
          <p>
            Our{" "}
            <Link to="/results" className="font-semibold text-accent underline">
              results section
            </Link>{" "}
            helps you explore events and performances, while{" "}
            <Link to="/find-events" className="font-semibold text-accent underline">
              fixtures and event guides
            </Link>{" "}
            help you look ahead. You can also discover{" "}
            <Link to="/clubs" className="font-semibold text-accent underline">
              clubs
            </Link>{" "}
            and the communities that make sport possible.
          </p>
          <p>
            Creating your athlete account and profile is free. If we already have results that may
            belong to you, help us identify the right ones. If your history is incomplete, tell us
            what to investigate.
          </p>
        </section>

        <section id="contribute" className={sectionClass}>
          <h2 className={headingClass}>Help us tell the whole story</h2>
          <p>
            All athletes are welcome to submit their results to AthRecs. A recent event, an older
            performance, a first attempt or a career milestone: if it belongs in your sporting
            record, we want to hear about it.
          </p>
          <ol className="list-decimal space-y-3 pl-6">
            <li>
              <strong>Create your free account.</strong> Start at{" "}
              <Link to="/join" className="text-accent underline">
                athrecs.com/join
              </Link>{" "}
              and follow the steps to build or connect your profile.
            </li>
            <li>
              <strong>Share the useful details.</strong> Include your name, the event and date,
              discipline or distance, your result and an official results link where available. A
              bib number, previous racing name or certificate can help resolve a match.
            </li>
            <li>
              <strong>Keep the conversation going.</strong> Submit through your athlete account or
              contact us using the site chat or{" "}
              <a href="mailto:support@athrecs.com" className="break-words text-accent underline">
                support@athrecs.com
              </a>
              . If something needs clarification, we can work through it with you.
            </li>
          </ol>
          <p>
            Organisers, clubs and results providers are welcome too. Tell us about missing fixtures,
            share results or suggest an amendment or update. A contribution that helps one athlete
            can make the record more useful for many others.
          </p>
          <p>
            Submissions are reviewed, and inclusion depends on the information available and the
            sport’s current coverage. You can still get in touch when you do not have every detail;
            explain what you know and what is missing.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <IntercomAskButton />
            <a
              href="mailto:support@athrecs.com?subject=AthRecs%20results%2C%20fixtures%20or%20update"
              className={`${actionClass} bg-[#e9e2f8] text-[#49356b] hover:bg-[#ded3f1]`}
            >
              Send results or an update
            </a>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>A record worth trusting—and improving</h2>
          <p>
            Accuracy matters because these are people’s achievements. Names can be shared, event
            distances can change, and chip times, gun times and other finish times need to be
            understood correctly. For example, parkrun results are finish times, not chip times.
          </p>
          <p>
            We review supporting evidence and keep verification separate from recorded achievements.
            A result appearing on a profile does not, by itself, mean it has been verified. Check
            the status and qualifications shown with the result. A missing result is a gap to
            investigate.
          </p>
          <p>
            Athletes can help identify errors and improve their records, with public profiles
            respecting their sharing choices. Learn more about{" "}
            <Link to="/privacy" className="text-accent underline">
              privacy on AthRecs
            </Link>
            . For event-day arrangements and entries, always check the organiser’s latest
            information.
          </p>
        </section>

        <section id="questions" className="space-y-6" aria-labelledby="questions-heading">
          <h2 id="questions-heading" className={headingClass}>
            Questions about AthRecs
          </h2>
          {questions.map(({ question, answer }) => (
            <section key={question} className="space-y-2 border-b border-border pb-5">
              <h3 className="font-display text-xl font-semibold">{question}</h3>
              <p className="text-base leading-7 text-muted">{answer}</p>
            </section>
          ))}
        </section>
      </div>

      <nav
        aria-label="Explore sports"
        className="rounded-2xl border border-border bg-surface p-6 sm:p-8"
      >
        <h2 className={headingClass}>Find your sport. Add your story.</h2>
        <p className="mt-3 leading-7 text-muted">
          Explore our current sport pages. Athletes from other sports are welcome to get in touch.
        </p>
        <ul className="mt-5 grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
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

      <section className="space-y-5 rounded-3xl bg-[#173247] p-7 text-white sm:p-10">
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">
          Your races. Your results. Your story.
        </h2>
        <p className="max-w-2xl text-lg leading-8 text-[#d8e6ec]">
          You put in the effort. Let’s give those achievements a home—and keep building the story
          together.
        </p>
        <Link
          to="/join"
          className={`${actionClass} bg-[#9ae2d5] text-[#173247] hover:bg-[#b4eee3]`}
        >
          Create my free athlete profile
        </Link>
      </section>
    </article>
  );
}
