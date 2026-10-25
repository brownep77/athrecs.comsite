import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EyeOff, LockKeyhole, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: siteGraphMeta({
      title: "Athlete account and profile privacy | ATHRECS",
      description:
        "Learn how AthRecs handles athlete accounts, profile visibility, result claims, Entry Passport details and preferences.",
      url: `${SITE_URL}/privacy`,
    }),
    links: [{ rel: "canonical", href: `${SITE_URL}/privacy` }],
  }),
  component: AthletePrivacyPage,
});

function AthletePrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="bg-gradient-to-r from-slate-950 to-cyan-950 px-5 py-7 text-white md:px-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
            <ShieldCheck className="size-4" aria-hidden="true" /> Athlete privacy
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold">
            Your account data, under your control
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            This notice explains the Athlete Account and Entry Passport. It is designed to keep
            required identity data separate from optional sport, product, analytics and marketing
            choices.
          </p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <PrivacyPrinciple
          icon={LockKeyhole}
          title="Private by default"
          text="Account details, product choices and claim evidence are restricted to you and authorised ATHRECS staff."
        />
        <PrivacyPrinciple
          icon={EyeOff}
          title="Not your public profile"
          text="Private account data is not published on athlete or result pages automatically."
        />
        <PrivacyPrinciple
          icon={RefreshCw}
          title="Choices can change"
          text="You can update optional answers or withdraw analytics, research and marketing consent at any time."
        />
      </div>

      <section className="space-y-6 rounded-xl border border-border bg-surface p-5 shadow-card md:p-8">
        <div id="assistant-chat">
          <NoticeSection title="AI assistant and chat transcripts">
            <p>
              When you send a message to the AthRecs AI assistant, we save the conversation,
              selected language, timestamps and starting public page so authorised staff can review
              support enquiries and improve the service. Recent messages are processed by our
              hosting provider Vercel and OpenAI to generate a reply. AI answers may be incorrect;
              the assistant cannot verify your identity, claim results or change your account. This
              is not a live human chat, and staff monitoring or a reply is not guaranteed.
            </p>
            <p className="mt-3">
              Chats are anonymous unless you identify yourself in your messages. Do not send
              passwords, sign-in codes, payment details or sensitive documents. A secure browser
              cookie keeps your conversation available for up to seven days. Chat records expire
              after 90 days and are removed on the next chat or staff history visit. Staff can
              download or delete a transcript. We use these records to provide requested support and
              prevent abuse; sending a message does not sign you up for marketing. A short-lived
              hashed network identifier may be used for rate limits. Contact paul@athrecs.com to
              request access or deletion, including the approximate time and topic of your
              conversation so we can locate it.
            </p>
            <p className="mt-3">
              If an Open WhatsApp link is available, it opens a separate conversation in WhatsApp.
              Your website chat is not forwarded automatically, and WhatsApp messages are not
              included in these website transcripts.
            </p>
          </NoticeSection>
        </div>
        <div id="club-registration">
          <NoticeSection title="Club registration and representative verification">
            <p>
              A public club listing does not establish that a person is authorised to manage it.
              When you apply, we keep your account email, name, club role, optional contact details,
              evidence references and authority statement private to you and authorised AthRecs
              reviewers. We use these details to assess the club and your authority, communicate
              review decisions, prevent impersonation and record approved access. Your account email
              must be verified. Club contact details you enter are not automatically verified.
            </p>
            <p className="mt-3">
              We process an application to provide the registration service you request and use
              verification and decision records for our legitimate interests in preventing
              unauthorised access. A reviewer may check your role through an independently sourced
              club contact. Do not upload membership lists, government identity documents, passwords
              or private access links in this form. If further evidence is necessary, a reviewer
              will explain what is needed. Your declaration does not authorise marketing, member
              invitations or publication of athletes’ private information.
            </p>
            <p className="mt-3">
              You can save and update drafts, view decisions and withdraw open applications in My
              club registrations. We retain application and review records while needed to resolve
              the application, administer representative access or handle a dispute, and review
              their continued necessity. Withdrawn applications are not automatically erased.
              Contact paul@athrecs.com to request access, correction, deletion, object to processing
              or report an unauthorised club representative. Club affiliation and profile ownership
              remain separate from representative approval.
            </p>
          </NoticeSection>
        </div>
        <NoticeSection title="Information required to operate the account">
          <p>
            When email codes are available, you can sign in or create an account with just your
            email and a one-time code. A name is requested for password sign-up or when you save
            your athlete details. Saving athlete details requires a verified email and
            acknowledgement of this notice. These details help authenticate you, protect result
            claims, prevent duplicate ownership and support your account.
          </p>
        </NoticeSection>

        <NoticeSection title="Required and optional details for a profile claim">
          <p>
            A profile claim requires your full name and verified email. Date of birth and
            nationality are optional: you can leave either blank, add them later or remove them
            without losing access to profile claims or stored-result suggestions. If supplied, birth
            date helps compare your age on historical race dates with recorded age categories and
            route child claims for staff review. Nationality helps distinguish similar records only
            when the source explicitly reports it; we never infer it from your address, club or
            name. You can enter multiple nationalities or Stateless. These details are supporting
            clues, not proof of identity. Uncertain or conflicting claims receive human review.
          </p>
          <p className="mt-3">
            Birth date is hidden unless you explicitly choose to share it in profile settings. Email
            stays private. You can correct or clear your private details in My Athlete Account; only
            a missing name or unverified email prevents a claim for incomplete account details.
            Existing ownership is not automatically removed when you correct a field. Contact us to
            dispute ownership or request deletion.
          </p>
        </NoticeSection>

        <NoticeSection title="Other names, result sources and optional contact details">
          <p>
            You may save up to eight other full names, eight other surnames, a maiden surname,
            sporting identifiers and up to ten additional public result/profile links. These help
            find your records under the names used at the time. They stay in your private account.
            Manual searches use your saved names and can be narrowed by distance and year.
            Suggestions never claim, merge or publish results automatically.
          </p>
          <p className="mt-3">
            Address, postcode and phone are optional and are not needed to claim or match results.
            Address and phone are used only for account-support contact if you choose that option.
            Turning that option off and saving clears them. Clear any other optional field and save
            to remove it. Do not provide another person's contact details or private sign-in links.
          </p>
        </NoticeSection>

        <NoticeSection title="Optional external result searches">
          <p>
            A separate choice, off by default, allows adults to request a public-results search
            using xAI (the provider of Grok). On your request we send saved racing names, public
            source links, sporting IDs, club, general location and any known-race details you
            supplied. We do not send birth date, nationality, postcode, street address, phone or
            email fields. This separate adult-only feature checks a saved birth date; if you prefer
            not to provide one, you can still use stored-result matching and ask staff for search
            assistance. Under-18 and guardian searches also need staff assistance. Internal matching
            does not require external-search consent. Saved links are searched only when you request
            it; access to third-party sites and complete coverage cannot be guaranteed.
          </p>
          <p className="mt-3">
            Before sending athlete details we check that the provider reports zero data retention.
            External processing may take place outside the UK/EEA under the provider's{" "}
            <a
              className="text-accent underline"
              href="https://x.ai/legal/data-processing-addendum"
              target="_blank"
              rel="noreferrer"
            >
              data processing terms
            </a>
            , including its international-transfer safeguards. These searches return unverified
            suggestions with source links for you to check. They are not an ownership decision. Turn
            off the choice and save to stop future searches and delete cached external suggestions.
            Withdrawal does not undo processing already carried out.
          </p>
        </NoticeSection>

        <NoticeSection title="Purposes, access and retention">
          <p>
            AthRecs controls the account and matching information described here. We use account
            information to provide the service you request, and identity and claim information for
            our legitimate interests in accurate records, preventing disputed ownership and
            protecting children. Optional contact use and external searches rely on your separate
            consent. Acknowledging this notice is not consent to marketing. Private data is
            accessible to you and authorised staff, and is processed by our hosting, database and
            email service providers to operate the service. It is not supplied to sponsors through
            this form.
          </p>
          <p className="mt-3">
            Saved account details remain while your account needs them, until you clear them or
            request deletion. Claim decisions and evidence may be retained where needed to resolve
            ownership disputes, prevent repeat fraudulent claims or meet legal obligations; we
            assess that need when handling a deletion request. External suggestions are reused for
            at most seven days, and old cache rows are cleared when you next search; saving matching
            choices clears all your cached suggestions. No automatic deletion period is claimed for
            inactive accounts. Contact us for an assessment of the information still needed for your
            account.
          </p>
        </NoticeSection>

        <NoticeSection title="Sign-in and recognised browser records">
          <p className="mb-3">
            We also record failed authentication requests, verification and recovery requests,
            sign-out requests and technical error categories to help resolve access problems.
            An email entered during a failed attempt is unverified and does not prove who made it.
            Diagnostics include the website and page category, response status and duration,
            browser version, release reference, and a support reference. Browser error reports
            include a broad screen-size category and whether the browser reports being online.
            We do not store passwords, verification codes, session tokens, request bodies,
            page query strings, raw error messages or stack traces in these diagnostics.
            Browser reports are limited to five per page load and rate-limited using a short-lived,
            keyed network reference; raw IP addresses are not stored in this log.
          </p>
          <p>
            To support your account and investigate access problems, authorised staff can see your
            email verification status, successful sign-in counts, sign-in times and methods,
            browser-reported device types, and approximate country, region and city supplied by our
            hosting platform. Network locations can be inaccurate and do not establish your address
            or nationality. We do not collect a phone serial number or IMEI.
          </p>
          <p className="mt-3">
            A signed, secure browser cookie recognises repeat sign-ins on this website for up to 90
            days after a sign-in. Its stored reference is separate for each account and site.
            Clearing cookies, private browsing or using another browser can create a new device
            number. We do not use browser fingerprinting. Detailed login history and inactive
            recognised browser records expire after 90 days and are removed on the next sign-in or
            staff client-data visit. Overall counts remain while the account exists. Deleting the
            account also deletes its login history and recognised browser records. These records are
            private and are not used for marketing. Failed-attempt and error diagnostics also
            expire after 90 days and are removed on the next diagnostic capture or staff log
            visit. Short-lived rate-limit references are removed after a day on the next such
            request. Account deletion removes associated diagnostics and failed attempts using
            that account's current email. Browser reports can be missing if the network is
            unavailable, the page cannot start, or reporting limits are reached.
          </p>
        </NoticeSection>

        <NoticeSection title="Optional Entry Passport information">
          <p>
            You can add location, club, sports, disciplines, training patterns, goals and coach
            name. You can also record equipment, nutrition, technology, clothing, recovery and
            purchasing preferences. These questions are optional. Do not add medical diagnoses or
            other information you do not want ATHRECS to hold.
          </p>
        </NoticeSection>

        <NoticeSection title="Separate consent choices">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Performance insights uses approved sport, training and race data to produce athlete
              insights.
            </li>
            <li>Personalisation uses your choices to improve events and content shown to you.</li>
            <li>Product research uses optional preferences in aggregated analysis.</li>
            <li>
              Marketing permits relevant ATHRECS news, product information or partner offers by
              email.
            </li>
          </ul>
          <p className="mt-3">
            These choices are independent, switched off by default and are not required to create an
            account or claim a result.
          </p>
        </NoticeSection>

        <div id="website-statistics">
          <NoticeSection title="Optional website visitor statistics">
            <p>
              If you select Allow anonymous analytics in Privacy choices, AthRecs records page
              visits in its own reporting system and uses Vercel Web Analytics to report page views,
              visitor estimates, referring websites, countries and device types. The Vercel tracker
              is loaded only after you agree. A previous choice covering only AthRecs reporting does
              not turn on Vercel tracking automatically.
            </p>
            <p className="mt-3">
              Page views also include simple on/off values for public site features, such as the
              homepage colour picker and language selector, so we can compare feature usage. These
              values describe the site version shown, not your chosen colours, language, identity or
              profile details.
            </p>
            <p className="mt-3">
              We exclude account, staff, claim and registration-management pages and remove query
              strings and URL fragments from tracked page addresses. We do not send form contents,
              account details or result-claim evidence. Vercel processes request information to
              produce its statistics; see{" "}
              <a className="underline" href="https://vercel.com/docs/analytics/privacy-policy">
                Vercel’s analytics privacy information
              </a>
              .
            </p>
            <p className="mt-3">
              Use Privacy choices and select Keep analytics off to stop future tracking. AthRecs
              also requests deletion of its own events for the current browser session. This does
              not delete statistics already aggregated by Vercel. Your choice is saved in this
              browser and does not change your separate account, research or marketing choices.
            </p>
          </NoticeSection>
        </div>

        <NoticeSection title="Public sporting records, private archive and claims">
          <p className="mb-3">
            The optional “Find my race results” choice at sign-up opens suggestions from the AthRecs
            results database. You can add your racing name after signing in. The choice does not
            publish a profile, claim results, start an external search, or enable analytics or
            marketing consent.
          </p>
          <p>
            ATHRECS preserves factual sporting records from published results and athlete
            submissions. Reviewed records may appear on public race pages and approved public
            athlete previews, including unclaimed source profiles. These public pages can appear in
            our athlete directory and search engines. An unclaimed profile does not mean that the
            athlete has joined or endorsed ATHRECS; uncertain identities and results retain their
            qualifications. Other profile information and shared account profiles may require
            sign-in.
          </p>
          <p className="mt-3">
            Original source captures, identity-review evidence and account contact details remain
            private. We use legitimate interests to preserve accurate sporting history and help
            athletes find and claim their records, with checks for mistaken identities and existing
            privacy choices. You can ask us to correct a result, object to publication or review a
            profile using the contact details below. Claiming does not automatically publish private
            account information or the contents of your Entry Passport.
          </p>
        </NoticeSection>

        <NoticeSection title="Shareable profile links">
          <p>
            You can optionally create an unlisted shareable profile from My Athlete Profile. That
            page is off unless you turn sharing on, is not added to the Athletes directory, and can
            be withdrawn immediately. A published share includes only the display name plus the
            club, location, bio and claimed results you select. Email, postcode, photograph,
            previous names, external IDs and product preferences stay private. Your AthRecs ID
            identifies the profile across sports. Nationality, country of birth, age category,
            coach, manager and contact preference can appear on the shared profile. Your birthday
            stays hidden unless you choose to display its day and month or full date in your
            account. Viewers must log in to open an unlisted shared account profile. These unlisted
            pages are excluded from our search-engine sitemaps and marked not to be indexed. This is
            separate from approved public sporting-record previews. Search engines may take time to
            remove older listings.
          </p>
        </NoticeSection>

        <NoticeSection title="Suggested profile and race edits">
          <p>
            Signed-in visitors can submit factual corrections and supporting links for staff review.
            Suggestions and the submitting account reference stay in the staff review queue; they do
            not change a public profile or race page automatically. Race suggestions also retain
            the race reference and staff review status so we can check and handle the correction.
          </p>
        </NoticeSection>

        <NoticeSection title="Race, athlete and influencer sponsorship enquiries">
          <p>
            Sponsorship enquiries submitted on RunRecs or AthRecs are private to you and authorised
            staff. We use your account email, representative name, public website or profile, event
            details, audience evidence and sponsorship brief to assess and respond to your request.
            Nothing is published or shared with a potential partner automatically.
          </p>
          <p className="mt-3">
            Staff responses appear on the sponsorship page after you sign in. You can withdraw an
            open enquiry there. Withdrawal stops us progressing it; the enquiry and action history
            remain for account support and dispute handling. Submitting does not enable marketing
            emails, grant sponsorship or advertising rights, verify your profile, or agree a service
            fee. A specific introduction and any fee require a separate agreement.
          </p>
        </NoticeSection>

        <NoticeSection title="Brand partnerships and applications">
          <p>
            Registering a brand shares your company details, representative name, role and account
            email with authorised AthRecs reviewers. Only approved company descriptions, categories,
            websites, sports and markets are public. Representative details and email stay private.
          </p>
          <p className="mt-3">
            Partnership choices are separate from email marketing consent and start switched off.
            They do not publish an athlete profile or give companies access to private account data.
            Applications are currently for adults aged 18 and over. After review, applying shares
            the selected athlete or club name, club website if supplied, and application message
            with that opportunity's brand. A reply stays in your dashboard. No automatic marketing
            emails are enabled by these choices.
          </p>
          <p className="mt-3">
            You can withdraw an application in Opportunities. Turning off a partnership category
            also withdraws your athlete applications in that category. Withdrawal removes the
            brand's access in AthRecs but cannot recall information already read or copied.
            Decisions, declarations and withdrawals are recorded for review and dispute handling.
            Agreement to an application does not grant advertising or image rights.
          </p>
        </NoticeSection>

        <NoticeSection title="Access, correction and withdrawal">
          <p>
            Use My Athlete Account to review and correct your details or change consent choices.
            ATHRECS records consent changes so its systems can respect a withdrawal. Account access,
            portability, restriction, objections, deletion and questions about international
            transfers can be requested from{" "}
            <a href="mailto:paul@athrecs.com" className="text-accent underline">
              paul@athrecs.com
            </a>
            . We may need to verify your identity before responding. You may also complain to the{" "}
            <a
              href="https://ico.org.uk/make-a-complaint/"
              className="text-accent underline"
              target="_blank"
              rel="noreferrer"
            >
              UK Information Commissioner's Office
            </a>{" "}
            or your local data protection authority. You can ask for human review of a disputed
            match; nationality and name similarity do not prove ownership.
          </p>
        </NoticeSection>

        <p className="text-xs text-subtle">
          Athlete Account notice: 23 August 2026. Partnerships addition: 16 September 2026. Sign-in
          and optional identity details clarified: 2 October 2026. Claim identity, matching and
          external-search notice: 13 October 2026.
        </p>
      </section>

      <div className="flex justify-end">
        <Button asChild>
          <Link to="/athlete-account">Open My Athlete Account</Link>
        </Button>
      </div>
    </div>
  );
}

function PrivacyPrinciple({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof LockKeyhole;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-xl border border-border bg-surface p-5 shadow-card">
      <Icon className="size-5 text-accent" aria-hidden="true" />
      <h2 className="mt-3 font-display text-lg font-semibold text-fg">{title}</h2>
      <p className="mt-1 text-sm leading-5 text-muted">{text}</p>
    </article>
  );
}

function NoticeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="text-sm leading-6 text-muted">
      <h2 className="font-display text-lg font-semibold text-fg">{title}</h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}
