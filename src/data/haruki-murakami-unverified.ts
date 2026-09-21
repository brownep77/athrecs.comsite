// Author, eyewitness and secondary chronology accounts, with unresolved details.
// Keep these separate from canonical results: no invented dates or finish times.
const essay = "https://www.newyorker.com/magazine/2008/06/09/haruki-murakami-the-running-novelist";
const eyewitness = "https://hawaiireviewofbooks.com/stories/running-with-haruki-murakami";
const chronology = "https://murakami-haruki-times.com/";

export const harukiMurakamiUnverifiedRecords = [
  ...[
    { id: "murakami-triathlon-1997", event: "Murakami International Triathlon", location: "Murakami, Niigata, Japan", reportedDate: "28 September 1997 (reported)", reportedTime: "Time not found", uncertainty: "Reader-compiled chronology reports participation. An official individual result has not been located." },
    { id: "tinman-triathlon-1998", event: "Tinman Triathlon", location: "Oahu, Hawaii", reportedDate: "12 July 1998 (reported)", reportedTime: "Time not found", uncertainty: "Reader-compiled chronology reports participation with bib 1647. Official result and race date remain unverified." },
    { id: "murakami-triathlon-2000", event: "Murakami International Triathlon", location: "Murakami, Niigata, Japan", reportedDate: "2000 · exact date unknown", reportedTime: "Reported withdrawal during swim", uncertainty: "Reader-compiled chronology reports withdrawal during swimming. This is not a reported finish; official status remains unverified." },
    { id: "murakami-triathlon-2004", event: "Murakami International Triathlon", location: "Murakami, Niigata, Japan", reportedDate: "2004 · exact date unknown", reportedTime: "Time not found", uncertainty: "Reader-compiled chronology reports his return to this event. An official individual result has not been located." },
    { id: "murakami-triathlon-2006", event: "Murakami–Sasagawa Nagare International Triathlon", location: "Murakami, Niigata, Japan", reportedDate: "1 October 2006", reportedTime: "Time not found", uncertainty: "JTU confirms the event date; the reader chronology reports participation. His individual result remains unverified." },
    { id: "honolulu-triathlon-2007", event: "Honolulu Triathlon", location: "Honolulu, Hawaii", reportedDate: "May 2007 · exact date unverified", reportedTime: "Time not found", uncertainty: "Reader-compiled chronology reports participation. An official individual result has not been located." },
  ].map((record) => ({
    ...record,
    distance: "Triathlon · no standalone running result",
    reportedPlace: "Not verified",
    sources: [
      { label: "Haruki Murakami Times (reader-compiled chronology)", url: chronology },
      ...(record.id === "murakami-triathlon-2006" ? [{ label: "JTU event date and distances", url: "https://archive.jtu.or.jp/race/japancup/06murakami.html" }] : []),
    ],
  })),
  {
    id: "first-road-race-1983",
    event: "First road race — official name unknown",
    distance: "5 km",
    location: "Location not established",
    reportedDate: "1983 · exact date unknown",
    reportedTime: "Time not found",
    reportedPlace: "Not recorded",
    uncertainty:
      "Murakami describes his first road race as a 5 km event in 1983. Participation is supported by his own account; the official race name, exact date, finish time and placing remain unverified.",
    sources: [{ label: "Murakami's first-person account (The New Yorker)", url: essay }],
  },
  {
    id: "lake-yamanaka-1983",
    event: "Lake Yamanaka road race",
    distance: "15 km (as recalled by Murakami)",
    location: "Lake Yamanaka, Japan",
    reportedDate: "May 1983 · exact date unknown",
    reportedTime: "Time not found",
    reportedPlace: "Not recorded",
    uncertainty:
      "Murakami records a 15 km race around Lake Yamanaka in May 1983. This may be the Yamanakako Road Race, but the historical event identity and result sheet have not been confirmed. The present organiser lists a 13.6 km lake circuit; that modern distance has not been substituted for his account.",
    sources: [
      { label: "Murakami's first-person account (The New Yorker)", url: essay },
      { label: "Present-day Yamanakako Road Race", url: "https://www.yamanakako-roadrace.com/" },
    ],
  },
  {
    id: "honolulu-reported-20k",
    event: "Honolulu race — reported as 20K; identity unresolved",
    distance: "20 km (eyewitness account; disputed)",
    location: "Kapiolani Park, Honolulu, Hawaii",
    reportedDate: "Exact date and year unverified",
    reportedTime: "No separate result established",
    reportedPlace: "Not recorded",
    uncertainty:
      "Tom Gammarino recalls meeting Murakami before a 20K at Kapiolani Park shortly before the English publication of 1Q84. The official archive confirms Murakami at P. F. Chang's 30K there on 23 October 2011, which fits that timing, but the distances conflict. This account may describe that same race and is not counted as an additional finish. No matching result was found in the 2011–2013 Runner's HI 20K tables at Kalaeloa.",
    sources: [
      { label: "Gammarino's eyewitness account", url: eyewitness },
      {
        label: "Official 2011 P. F. Chang's 30K results",
        url: "https://timelinehawaii.com/Results/P.F.%20CHANG%20OVERALL%2011.HTM",
      },
    ],
  },
] as const;
