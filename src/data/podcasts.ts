// Athletes' podcasts: show overviews, host bios and episode previews.
//
// Editorial rules (see AGENTS.md):
// - Every fact comes from the show's own page, feed or episode description, or from an
//   already-reviewed AthRecs biography. Never invent results, dates or URLs.
// - Episode takeaways are paraphrased from the official episode description. They are
//   previews, not transcripts — never copy show notes verbatim.
// - Only link a person to an AthRecs profile when the profile has been checked to be the
//   same person (sport, nationality, recorded races). Leave `slug` empty otherwise; the
//   page then shows the name without a link and the person is listed in PODCAST_PROFILE_GAPS
//   so a profile can be created.

export type PodcastPerson = {
  name: string;
  /** AthRecs athlete slug, only when identity has been checked. */
  slug?: string;
  /** Short context shown next to the name, e.g. "Kenyan marathon runner". */
  note?: string;
};

export type PodcastEpisode = {
  slug: string;
  title: string;
  /** ISO date (GMT feed date). */
  date: string;
  displayDate: string;
  url: string;
  guests: PodcastPerson[];
  /** 2–3 sentences about the guest(s); empty for hosts-only episodes. */
  guestBio?: string;
  summary: string;
  takeaways: string[];
  /** Other athletes or sports people named in the episode description. */
  mentioned: PodcastPerson[];
};

export type Podcast = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  hosts: (PodcastPerson & { role: string; bio: string[] })[];
  about: string[];
  facts: { label: string; value: string }[];
  listen: { label: string; url: string }[];
  episodes: PodcastEpisode[];
  checkedAt: string;
  sports: string[];
};

export const PODCASTS_CHECKED_AT = "2026-10-30";

export const PODCASTS: Podcast[] = [
  {
    slug: "untapped-spencer-matthews",
    name: "UNTAPPED with Spencer Matthews",
    tagline: "A twice-weekly running podcast from the team behind High Performance.",
    description:
      "UNTAPPED with Spencer Matthews: show guide, host background and episode previews with Paula Radcliffe, Daryll Neita, Nick Bester, Will Goodge and more, linked to AthRecs athlete profiles.",
    hosts: [
      {
        name: "Spencer Matthews",
        slug: "spencer-matthews-untapped",
        role: "Host",
        bio: [
          "Spencer Matthews comes to the microphone as the improving amateur rather than the finished article, which is what gives UNTAPPED its angle. He interviews elite runners, coaches and scientists with the questions an ambitious club runner would ask — and then tests the answers on himself.",
          "Before the podcast he was best known from Made in Chelsea and as the founder of the alcohol-free spirits brand CleanCo. Endurance sport has since become the centre of his public life: a Guinness World Record for 30 marathon distances on sand in 30 days, a 140.6-mile triathlon on all seven continents, and a steady march down the marathon rankings that has taken him under three hours and, in Berlin in September 2026, to 2:49:46.",
          "That running story is told race by race on his AthRecs profile. Here the focus is the show.",
        ],
      },
      {
        name: "Oli Patrick",
        role: "Co-presenter, Thursday episodes",
        bio: [
          "Physiologist Oli Patrick joins Spencer on the Thursday episodes to unpack the science behind everyday training questions, such as sleep, training zones, supplements and caffeine.",
        ],
      },
    ],
    about: [
      "UNTAPPED bills itself as a podcast for runners. The format is simple: on Mondays Spencer sits down with a world-class athlete, coach or expert to dig into the training, habits and mindset behind their performances; on Thursdays he and Oli Patrick take one health or fitness topic and explain the science behind it.",
      "The guest list runs from sprinters to marathoners and ultra runners, and past guests highlighted by the show include Mo Farah, Alistair Brownlee and Stephen Scullion. The oldest episode in the official feed was published in January 2025, with free solo climber Alex Honnold.",
    ],
    facts: [
      { label: "Produced by", value: "High Performance" },
      { label: "First episode in feed", value: "27 January 2025" },
      { label: "Schedule", value: "Mondays (guest interview) and Thursdays (science episode)" },
      { label: "Distances covered", value: "Sprints to the marathon and beyond" },
    ],
    listen: [
      {
        label: "Official UNTAPPED page",
        url: "https://www.thehighperformancepodcast.com/untapped",
      },
      {
        label: "Apple Podcasts",
        url: "https://podcasts.apple.com/us/podcast/untapped/id1788474884",
      },
      { label: "Spotify", url: "https://open.spotify.com/show/0RxsgH2rGo40esXKht3A7o" },
      { label: "YouTube", url: "https://www.youtube.com/@Untapped-Podcast" },
      { label: "Acast", url: "https://shows.acast.com/untapped" },
    ],
    episodes: [
      {
        slug: "emily-jane-fairs",
        title: "Emily Jane Fairs on Marathon Underfuelling Risks & Running Mentality",
        date: "2026-10-26",
        displayDate: "26 October 2026",
        url: "https://shows.acast.com/untapped/episodes/emily-jane-fairs-on-marathon-underfuelling-risks-running-men",
        guests: [{ name: "Emily Jane Fairs", slug: "emily-fairs-fairs-london-2026-mass-12476" }],
        guestBio:
          "Emily Jane Fairs never thought of herself as a runner, yet within two years of starting she had completed marathons and 100 km ultras.",
        summary:
          "A frank conversation about fuelling, food and self-belief, and how eating properly changed what Emily could do on the road.",
        takeaways: [
          "Eating more and fuelling better brought her more energy, quicker sessions and faster recovery.",
          "Running reshaped her relationship with food after years of restricting and bingeing.",
          "She now treats fuelling as part of the training, not an afterthought.",
          "Believing she could do it changed the limits she set herself.",
        ],
        mentioned: [],
      },
      {
        slug: "bronson-hearn-smith",
        title: "Your Running Form Is Slowing You Down | Bronson Hearn-Smith",
        date: "2026-10-19",
        displayDate: "19 October 2026",
        url: "https://shows.acast.com/untapped/episodes/bronson-hearn-smith-your-running-form-slows-you-down",
        guests: [{ name: "Bronson Hearn-Smith" }],
        guestBio:
          "Bronson Hearn-Smith is a teenage British sprinter described by the show as European U18 200m champion. His smooth running style has been watched millions of times online.",
        summary:
          "A masterclass in mechanics: why speed is about how you move rather than how much you run.",
        takeaways: [
          "Getting faster comes from moving differently, not just adding mileage.",
          "Plyometrics, strength work and simple drills do much of the heavy lifting.",
          "Good mechanics turn effort into power and efficiency.",
          "Recovery, and knowing when to back off, is part of training smarter rather than harder.",
        ],
        mentioned: [],
      },
      {
        slug: "paula-radcliffe",
        title: "Paula Radcliffe: The Training Behind My 2:15 Marathon",
        date: "2026-10-12",
        displayDate: "12 October 2026",
        url: "https://shows.acast.com/untapped/episodes/paula-radcliffe-the-training-behind-my-215-marathon",
        guests: [{ name: "Paula Radcliffe", slug: "paula-radcliffe" }],
        guestBio:
          "Paula Radcliffe ran 2:15:25 at the 2003 London Marathon, a women's world record that stood until 2019. She is a world marathon champion, a four-time Olympian and co-host of Paula's Run Club.",
        summary:
          "One of the greatest marathon runners of all time on the training, pacing and setbacks behind her records.",
        takeaways: [
          "Her golden rule for pacing a marathon.",
          "Staying flexible with a plan and listening to your body.",
          "How setbacks on the track and in life changed her perspective.",
          "Her world records, the toughest moments of her career, and why running is about more than results.",
        ],
        mentioned: [],
      },
      {
        slug: "daryll-neita",
        title: "How To Run Like An Olympic Medallist | Daryll Neita",
        date: "2026-10-05",
        displayDate: "5 October 2026",
        url: "https://shows.acast.com/untapped/episodes/how-to-run-like-an-olympic-medallist-daryll-neita",
        guests: [{ name: "Daryll Neita", slug: "daryll-neita" }],
        guestBio:
          "Daryll Neita is a British Olympic medallist sprinter who trains five days a week in Florida.",
        summary:
          "What distance runners can learn from the way an elite sprinter builds speed and strength.",
        takeaways: [
          "Winter is for long, strength-building sessions; speed comes later from short, explosive work.",
          "Sprinters rarely run more than 300–400m at a time in training.",
          "The gym matters as much as the track.",
          "For everyday runners: stay injury-free, make strength work explosive, nail your drills and keep chipping away.",
        ],
        mentioned: [],
      },
      {
        slug: "nick-bester",
        title: "5 Rules NOT To Break In A Marathon & Sub 2.45 Training Tips | Nick Bester",
        date: "2026-09-28",
        displayDate: "28 September 2026",
        url: "https://shows.acast.com/untapped/episodes/5-rules-not-to-break-in-a-marathon-sub-245-training-tips-nic",
        guests: [{ name: "Nick Bester", slug: "nick-bester" }],
        guestBio:
          "Nick Bester's running career is a lesson in patience: two years to break 20 minutes for 5K, and a first marathon of 3:17 that he lowered to 2:19:45 thirteen years later.",
        summary:
          "Marathon rules for anyone chasing a big time, from a runner who has spent more than a decade chipping away at his own.",
        takeaways: [
          "There are no shortcuts — progress comes from years of small wins.",
          "How he handled seven failed attempts at breaking 2:20.",
          "Why near misses can keep the fire burning.",
          "Fuelling, racing tactics and playing the long game.",
        ],
        mentioned: [],
      },
      {
        slug: "will-goodge",
        title: "How To Run a 2:47 Marathon, Hack Your Endurance and Recover Quicker | Will Goodge",
        date: "2026-09-21",
        displayDate: "21 September 2026",
        url: "https://shows.acast.com/untapped/episodes/how-to-run-a-247-marathon-hack-your-endurance-and-recover-qu",
        guests: [{ name: "Will Goodge", slug: "william-goodge" }],
        guestBio:
          "Will Goodge is a British ultra-endurance runner who went from a 2:47 marathon to running across entire countries. His Mission America project set out to run 50 marathons in all 50 US states in 24 days, in memory of his mother and in support of Stand Up To Cancer.",
        summary:
          "Consistency, discomfort and grief: the mindset behind running marathon after marathon.",
        takeaways: [
          "His five-minute rule for getting out of the door.",
          "Consistency beats quick gains.",
          "Accepting discomfort — you don't have to love every run.",
          "Running as a way of processing the loss of his mum.",
        ],
        mentioned: [],
      },
    ],
    checkedAt: PODCASTS_CHECKED_AT,
    sports: ["road-running"],
  },
  {
    slug: "paulas-run-club",
    name: "Paula's Run Club",
    tagline: "Paula Radcliffe and Chris Thompson's weekly running podcast.",
    description:
      "Paula's Run Club with Paula Radcliffe and Chris Thompson: show guide, host backgrounds and episode previews with Meb Keflezighi, Dathan Ritzenhein, Spencer Matthews and more, linked to AthRecs profiles.",
    hosts: [
      {
        name: "Paula Radcliffe",
        slug: "paula-radcliffe",
        role: "Co-host",
        bio: [
          "Paula Radcliffe hosts the show as someone who has trained at the very top of the sport and still loves talking to runners at every level. The podcast puts that experience to work for everyone from first-time marathoners to club runners chasing a PB.",
          "Her own record speaks for itself: a 2:15:25 marathon in London in 2003 that stood as the women's world record until 2019, a world marathon title, three London and three New York City Marathon wins, and four Olympic Games. The full race-by-race story is on her AthRecs profile.",
          "Away from the microphone she is an ambassador for Children with Cancer UK, the charity the podcast supported in its first series.",
        ],
      },
      {
        name: "Chris Thompson",
        slug: "chris-thompson-wa-14191000",
        role: "Co-host",
        bio: [
          'Chris "Thommo" Thompson brings more than 25 years of elite distance running to the show. He took 10,000m silver at the 2010 European Championships behind Mo Farah, and ran at the 2012 and 2020 Olympic Games, qualifying for the Tokyo marathon.',
          "Other highlights include the European U23 5000m title in 2003 and victory at the 2019 Bath Half Marathon. He announced his retirement from elite running in October 2024, shortly before the podcast launched.",
        ],
      },
    ],
    about: [
      "The show launched in January 2025 as Paula's Marathon Run Club, a 16-week series that took listeners through their build-up to the London Marathon. It has since grown into a year-round running podcast under the name Paula's Run Club, part of the Sport Social podcast network.",
      "Each week has a rhythm: a main episode on Monday, often with a guest, The Shakeout listener Q&A on Thursday, and a Weekend Wrap of race news on Sundays. The current series, Leaves, Laces & Long Runs, follows runners through their autumn marathon build-ups.",
    ],
    facts: [
      { label: "Hosts", value: "Paula Radcliffe and Chris Thompson" },
      { label: "Launched", value: "January 2025 (as Paula's Marathon Run Club)" },
      { label: "Network", value: "Sport Social" },
      { label: "Schedule", value: "Monday main episode, Thursday Shakeout, Sunday Weekend Wrap" },
    ],
    listen: [
      {
        label: "Apple Podcasts",
        url: "https://podcasts.apple.com/gb/podcast/paulas-run-club/id1786774007",
      },
      { label: "Spotify", url: "https://open.spotify.com/show/2jq77dl0I99gFkYuDxB7G4" },
      { label: "YouTube", url: "https://www.youtube.com/@paulasrunclub" },
    ],
    episodes: [
      {
        slug: "shakeout-2026-10-29",
        title: "Paula's Run Club: The Shakeout",
        date: "2026-10-29",
        displayDate: "29 October 2026",
        url: "https://podcasts.apple.com/gb/podcast/paulas-run-club-the-shakeout/id1786774007?i=1000798638632",
        guests: [],
        summary:
          "Paula and Thommo answer listener questions on the hardest part of the marathon: miles 20 to 22.",
        takeaways: [
          "Mental strategies and visualisation for avoiding the wall.",
          "Fuelling and pacing so you still have something left late in the race.",
          "Staying calm when fatigue sets in.",
          "Listeners who came back from injury to finish their marathons.",
        ],
        mentioned: [],
      },
      {
        slug: "meb-keflezighi",
        title: "Taking On New York, and Giving Back - Meb Keflezighi BONUS POD",
        date: "2026-10-28",
        displayDate: "28 October 2026",
        url: "https://podcasts.apple.com/gb/podcast/taking-on-new-york-and-giving-back-meb-keflezighi-bonus-pod/id1786774007?i=1000798467812",
        guests: [{ name: "Meb Keflezighi", slug: "meb-keflezighi" }],
        guestBio:
          "Meb Keflezighi is a retired American marathon runner who won Olympic silver in 2004, the New York City Marathon in 2009 and the Boston Marathon in 2014. He competed at four Olympic Games.",
        summary:
          "A New York Marathon special looking back at Meb's career and forward to race week.",
        takeaways: [
          "His 2009 New York win and his emotional Boston victory in 2014.",
          "Marathon strategy: saving energy, pacing sensibly and hydration.",
          "Recovery, warm-weather training and his famous push-ups at the end of the Rio Olympic marathon.",
          "His foundation and two decades as an ambassador for Team for Kids, ahead of the 50th New York City Marathon.",
        ],
        mentioned: [],
      },
      {
        slug: "dathan-ritzenhein",
        title: "Going Big in The Big Apple - Dathan Ritzenhein's New York Marathon Guide",
        date: "2026-10-26",
        displayDate: "26 October 2026",
        url: "https://podcasts.apple.com/gb/podcast/going-big-in-the-big-apple-dathan-ritzenheins-new/id1786774007?i=1000798115559",
        guests: [{ name: "Dathan Ritzenhein", slug: "dathan-ritzenhein" }],
        guestBio:
          "Dathan Ritzenhein is a former US 5,000m record holder and 2008 Olympian who now coaches the OAC Boulder group.",
        summary:
          "An elite coach's guide to the 50th New York City Marathon, through all five boroughs.",
        takeaways: [
          "How his group is preparing, including contender Hellen Obiri.",
          "How super shoes have changed recovery and the way marathons are raced.",
          "Handling New York's concrete, hills and bridges.",
          "Keeping race-morning adrenaline in check on a first New York start.",
        ],
        mentioned: [
          {
            name: "Hellen Obiri",
            slug: "hellen-obiri-wa-14424921",
            note: "Kenyan distance runner",
          },
        ],
      },
      {
        slug: "weekend-wrap-2026-10-25",
        title:
          "The Weekend Wrap: Jepchirchir suspended plus reaction to results from Frankfurt, Valencia and Dublin.",
        date: "2026-10-25",
        displayDate: "25 October 2026",
        url: "https://podcasts.apple.com/gb/podcast/the-weekend-wrap-jepchirchir-suspended-plus-reaction/id1786774007?i=1000798068668",
        guests: [],
        summary:
          "The hosts react to the week's biggest running news and the weekend's race results.",
        takeaways: [
          "The Athletics Integrity Unit's announcement of a provisional suspension for Peres Jepchirchir.",
          "Reaction to the Frankfurt and Dublin Marathons and the Valencia Half.",
          "Details of the show's New York shakeout run.",
        ],
        mentioned: [
          {
            name: "Peres Jepchirchir",
            slug: "peres-jepchirchir-wa-14593938",
            note: "Kenyan marathon runner",
          },
        ],
      },
      {
        slug: "shakeout-2026-10-22",
        title: "Paula's Run Club: The Shakeout",
        date: "2026-10-22",
        displayDate: "22 October 2026",
        url: "https://podcasts.apple.com/gb/podcast/paulas-run-club-the-shakeout/id1786774007?i=1000797544021",
        guests: [],
        summary:
          "Listener questions on fitting marathon training around real life, and on race-day pacing.",
        takeaways: [
          "Keeping training going around parenthood, and the guilt of taking time for yourself.",
          "The 10-10-10 approach to pacing a marathon.",
          "Preparing mentally and physically for race day.",
          "Why the goal you achieve on the day matters more than the one you started with.",
        ],
        mentioned: [],
      },
      {
        slug: "spencer-matthews",
        title: "Negative Splits, Positive Results with Spencer Matthews",
        date: "2026-10-19",
        displayDate: "19 October 2026",
        url: "https://podcasts.apple.com/gb/podcast/negative-splits-positive-results-with-spencer-matthews/id1786774007?i=1000797002955",
        guests: [{ name: "Spencer Matthews", slug: "spencer-matthews-untapped" }],
        guestBio:
          "Spencer Matthews, host of UNTAPPED, holds a Guinness World Record for 30 marathon distances on sand in 30 days and took his marathon best to 2:49:46 in Berlin in 2026.",
        summary: "The host of a rival running podcast on going from amateur to PB chaser.",
        takeaways: [
          "How structured training and mental resilience brought his times down.",
          "Lessons from the Tokyo, London, Berlin and Valencia marathons, including hitting the wall.",
          "What ultras taught him, and fitting training around family life.",
          "Why consistency beats quick fixes.",
        ],
        mentioned: [],
      },
    ],
    checkedAt: PODCASTS_CHECKED_AT,
    sports: ["road-running"],
  },
  {
    slug: "rich-roll-podcast",
    name: "The Rich Roll Podcast",
    tagline: "Long-form conversations on performance, endurance and personal change.",
    description:
      "The Rich Roll Podcast: show guide, host background and episode previews with Jenny Simpson, Will Goodge, Tommie Runz, Terry Bradshaw and more, linked to AthRecs athlete profiles.",
    hosts: [
      {
        name: "Rich Roll",
        slug: "rich-roll",
        role: "Host",
        bio: [
          "Rich Roll interviews like an endurance athlete races: slowly, patiently and for a long time. Episodes regularly run beyond two hours, giving guests room to talk about the setbacks and turning points behind their achievements, not just the highlights.",
          "His own story is the template. A former Stanford swimmer turned entertainment lawyer, he rebuilt his health around his fortieth birthday, adopted a plant-based diet and went on to finish the Ultraman World Championships twice and complete EPIC5 — five iron-distance triathlons on five Hawaiian islands in under a week. He told that story in his memoir Finding Ultra.",
          "His swimming, Ultraman and swimrun results are recorded on his AthRecs profile.",
        ],
      },
    ],
    about: [
      "The Rich Roll Podcast started in 2012 and has passed 1,000 episodes. Each one is a long-form interview, released weekly, with guests from sport, science, business and the arts.",
      "For athletes, the show is a rich seam: Olympians, ultrarunners, adventurers and professional sports stars talking in depth about training, mindset, recovery and life after competition. The previews below focus on its sporting guests.",
    ],
    facts: [
      { label: "Started", value: "2012" },
      { label: "Episodes", value: "More than 1,000 (episode #1023 on 29 October 2026)" },
      { label: "Format", value: "Weekly long-form interviews, often over two hours" },
      { label: "Watch or listen", value: "YouTube, Apple Podcasts and Spotify" },
    ],
    listen: [
      { label: "Episodes on richroll.com", url: "https://richroll.com/podcast/" },
      {
        label: "Apple Podcasts",
        url: "https://podcasts.apple.com/us/podcast/the-rich-roll-podcast/id582272991",
      },
      { label: "Spotify", url: "https://open.spotify.com/show/2TGszFKJEbQuEXrWduK63l" },
      { label: "YouTube", url: "https://www.youtube.com/richroll" },
    ],
    episodes: [
      {
        slug: "cole-brauer",
        title: "First Light: Cole Brauer's Life Lessons From Racing Her Sailboat Around The World",
        date: "2026-10-29",
        displayDate: "29 October 2026 · Episode 1023",
        url: "https://richroll.com/podcast/cole-brauer-1023/",
        guests: [{ name: "Cole Brauer", slug: "cole-brauer" }],
        guestBio:
          "Cole Brauer is an American professional ocean-racing sailor. In 2023 she won both legs of the Bermuda 1-2, then sailed her boat First Light around 27,000 nautical miles in a 130-day race to become the first American woman to race solo and nonstop around the globe.",
        summary:
          "Life lessons from four months alone at sea, from a sailor who rewrote the record books.",
        takeaways: [
          "Breaking into a male-dominated sport, including the pay gap she faced.",
          "The mindset she calls Dragon Time.",
          "Racing on with cracked ribs and broken autopilots.",
          "Choosing to protect the boat over chasing the win around Cape Horn — and why returning to land was harder than the ocean.",
        ],
        mentioned: [],
      },
      {
        slug: "terry-bradshaw",
        title:
          "Terry Bradshaw On Lessons From Super Bowl & Broadcasting Stardom, Battling Depression & Surviving Cancer",
        date: "2026-10-26",
        displayDate: "26 October 2026 · Episode 1022",
        url: "https://richroll.com/podcast/terry-bradshaw-1022/",
        guests: [{ name: "Terry Bradshaw", slug: "terry-bradshaw" }],
        guestBio:
          "Terry Bradshaw quarterbacked the Pittsburgh Steelers to four Super Bowl wins in six seasons in the 1970s. He is a Hall of Famer, a two-time Super Bowl MVP and a long-serving FOX NFL Sunday analyst.",
        summary: "An NFL great on fear, self-worth and his mental and physical health battles.",
        takeaways: [
          "Playing scared and being benched early in his career.",
          "The coach who built him up, compared with a drill-sergeant approach.",
          "People-pleasing and learning your own worth.",
          "Living with panic attacks and depression, and surviving two cancers.",
        ],
        mentioned: [],
      },
      {
        slug: "colin-kaepernick",
        title: "The Perilous Fight: Colin Kaepernick On The True Costs Of Conviction",
        date: "2026-09-28",
        displayDate: "28 September 2026 · Episode 1016",
        url: "https://richroll.com/podcast/colin-kaepernick-1016/",
        guests: [{ name: "Colin Kaepernick", slug: "colin-kaepernick" }],
        guestBio:
          "Colin Kaepernick is a former Super Bowl quarterback and activist. He discusses his new book, The Perilous Fight, and says he still trains every day.",
        summary:
          "Ten years after taking a knee, the former quarterback reflects on what his stand cost him.",
        takeaways: [
          "The threats he received after his protest.",
          "Growing up Black with white parents.",
          "Writing down future goals as a form of action.",
          "His continued training and pitch to NFL teams.",
        ],
        mentioned: [],
      },
      {
        slug: "will-goodge",
        title: "If I Can, I Will: William Goodge On Running 50 Marathons In 50 States In 24 Days",
        date: "2026-09-17",
        displayDate: "17 September 2026 · Episode 1014",
        url: "https://richroll.com/podcast/william-goodge-1014/",
        guests: [{ name: "Will Goodge", slug: "william-goodge" }],
        guestBio:
          "Will Goodge is a British ultra-endurance runner who has run the length of the UK and across both America and Australia. This was his second appearance on the show, ahead of his attempt to run a marathon in all 50 US states in 24 days.",
        summary: "The logistics and the emotion behind 50 marathons in 50 states in 24 days.",
        takeaways: [
          "Planning a challenge across all 50 US states in 24 days.",
          "Eating around 9,000 calories a day on the move.",
          "Running as an outlet for grief and anger.",
          "How the attempt was documented and verified as a fastest known time.",
        ],
        mentioned: [],
      },
      {
        slug: "jenny-simpson",
        title:
          "Olympic Medalist Jenny Simpson On Her Sudden Cardiac Arrest After A Race & The Journey Back To Health",
        date: "2026-09-07",
        displayDate: "7 September 2026 · Episode 1012",
        url: "https://richroll.com/podcast/jenny-simpson-1012/",
        guests: [{ name: "Jenny Simpson", slug: "jenny-simpson-wa-14305392" }],
        guestBio:
          "Jenny Simpson is a three-time Olympian and world champion whose 1500m bronze in Rio was the first Olympic medal at that distance by an American woman. She raced professionally for 14 years after winning four NCAA titles at Colorado.",
        summary:
          "A world champion on surviving a sudden cardiac arrest at a local mile race, and rebuilding her life afterwards.",
        takeaways: [
          "Building confidence from evidence rather than belief.",
          "Keeping your sense of self separate from your sport.",
          "What happened on the day of her cardiac arrest, and her recovery.",
          "Rebuilding identity after running — and why everyone should learn CPR.",
        ],
        mentioned: [],
      },
      {
        slug: "tommie-runz",
        title:
          "From Drinking Every Morning to Running 340 Miles: Tommie Runz on Recovery, Running & Redemption",
        date: "2026-09-03",
        displayDate: "3 September 2026 · Episode 1011",
        url: "https://richroll.com/podcast/tommie-runz-1011/",
        guests: [{ name: "Tommie Runz", slug: "tommie-runz-duv-2501635" }],
        guestBio:
          "Tommie Runz is an American runner and sobriety advocate who ran all six World Marathon Majors in one calendar year before moving to trails and finishing Western States. In 2025 he ran 340 miles solo from Santa Monica to Las Vegas.",
        summary:
          "From years of drinking to ultramarathons: recovery, running and representation on the trails.",
        takeaways: [
          "Fifteen years of functional drinking, and the week that changed it.",
          "Putting sobriety first and running second.",
          "His 340-mile solo run and the film he made about it.",
          "Representation of Black runners in trail running.",
        ],
        mentioned: [],
      },
    ],
    checkedAt: PODCASTS_CHECKED_AT,
    sports: ["road-running", "trail-running", "triathlon"],
  },
];

export function getPodcast(slug: string) {
  return PODCASTS.find((podcast) => podcast.slug === slug);
}

/** Guests and named athletes on podcast pages who do not yet have a linked AthRecs profile. */
export function podcastProfileGaps() {
  const gaps = new Map<string, string[]>();
  for (const podcast of PODCASTS)
    for (const episode of podcast.episodes)
      for (const person of [...episode.guests, ...episode.mentioned])
        if (!person.slug)
          gaps.set(person.name, [
            ...(gaps.get(person.name) ?? []),
            `${podcast.name}: ${episode.title}`,
          ]);
  return gaps;
}
