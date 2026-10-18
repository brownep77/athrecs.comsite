import type { ClubProfile } from "./club-profiles";

// Primary governing-body and club-published accounts read 18 October 2026.
export const recoveredPoliceAndVectorProfiles: Record<string, ClubProfile> = {
  "devon-and-cornwall-police-ac": {
    summary: "Devon & Cornwall Police AC is a South West England athletics club with a Newquay directory address and a documented history of hosting police cross-country and road-running events.",
    biography: [
      "Devon & Cornwall Police AC connects athletics with the police sporting community across South West England. The retained club directory gives Newquay, Cornwall, as its contact location, while England Athletics' February 2026 affiliation list groups the club under Devon. That list records cross-country, road and trail running, hill and fell running, track and field, and race walking. The two counties are part of the club's identity; the Newquay police-station address is a directory address, not an invitation to attend a training session.",
      "The club's wider sporting setting is illustrated by the Police Sport UK Cross Country Championships held at Beer in East Devon on 13 April 2011. The organising body's report, written by its cross-country representative Sally Broome, credits Devon and Cornwall Police with staging the meeting. More than 320 athletes tackled a demanding coastal course combining grass, a pebble-beach section and the climb known as The Hooken. The account gives a vivid sense of the terrain and the work of the hosts without turning that one-day course into a regular club route.",
      "Road running is another part of this history. Police Sport UK's January 2014 programme named Devon and Cornwall as the planned host of its 10-mile championships that September. This is a dated organising commitment, not a current fixture. The club's founding year, present training timetable and joining arrangements remain unconfirmed. Prospective members should establish eligibility and the correct athletics contact before travelling; neither an old national-event rule nor the force's general public-service contacts establishes access to club sessions today."
    ],
    location_note: "Newquay Police Station remains the original directory address, not a confirmed clubhouse or training venue. The February 2026 affiliation PDF groups the club under Devon, whereas the retained directory address is in Cornwall; no relocation is inferred. Beer was the 2011 championship venue only.",
    contact_note: "Reviewed 18 October 2026. No current club-specific email, telephone or official social account was established. The 2025–2026 handbook search lead is not imported as a current contact; the freshly checked 2026–2027 handbook did not list the club. The February affiliation record and historical event accounts do not settle current affiliation or membership availability.",
    sources: [
      { title: "England Athletics: affiliated clubs at 1 February 2026, page 38", url: "https://d1laub10p5ibfa.cloudfront.net/2026/02/Affiliated-Clubs-and-Organisations-at-1-Feb-2026.pdf" },
      { title: "Police Sport UK: Sally Broome's report of the 13 April 2011 cross-country championships", url: "https://www.slateman.co.uk/psuk/psuk-xc-11a.htm" },
      { title: "Police Sport UK: 2014 championship programme, updated 23 January 2014", url: "https://www.slateman.co.uk/Psuk/psuk-eventsummary-14.htm" }
    ],
    reviewed_at: "2026-10-18"
  },
  "vector-racing": {
    summary: "Vector Racing is a North East England running, cycling and triathlon team, listed in Tyne and Wear, with a Newcastle-based Strava presence and a role in organising cycling time trials.",
    biography: [
      "Vector Racing brings running and multisport racing together in North East England. Its public Strava description identifies a triathlon and cycling race team based in the region, with Newcastle upon Tyne as the profile's location. England Athletics' February 2026 club list places Vector in Tyne and Wear and records road, trail and cross-country running alongside hill and fell running and track and field. These sources describe a broader sporting identity than a running-only label, without establishing a particular weekly meeting place.",
      "The team's contribution includes putting on events as well as taking part. Cycling Time Trials' official listing for 14 June 2026 names Vector Racing and organiser Lewis Timmins for a 25-mile time trial in Northumberland. The event used the M2510 out-and-back course and offered road-bike and time-trial-bike classifications. That dated organising association is part of the club's story, not evidence that the course is a training base or that any named organiser holds the same role today.",
      "For joining enquiries, the ECCA 2026–2027 handbook publishes a club email, and Vector's public Strava page offers a request-to-join route. Membership of that online group should not be confused with athletics affiliation or admission to coached sessions. A founding year, current session schedule, training venue and membership costs have not been established. Anyone looking for a North East running or triathlon team should confirm those practical details with the club before making plans."
    ],
    notable_members: [
      { name: "Lewis Timmins", connection: "2026 time-trial organiser", detail: "Cycling Time Trials names Lewis Timmins as organiser for Vector Racing's 25-mile event on 14 June 2026. This is a dated organising association, not a current committee or athlete-identity claim." }
    ],
    corrections: { county: "Tyne and Wear", sports: ["Running", "Athletics", "Cycling", "Triathlon"] },
    location_note: "The February 2026 England Athletics PDF, page 19, supports Tyne and Wear in place of County Durham. The original value is retained in the underlying source record. The NE39 1HD directory postcode is preserved without treating it as a venue; Strava's Newcastle location is regional context, not a new street address. The Northumberland time-trial course is an event location only.",
    contact_note: "Reviewed 18 October 2026. The existing ECCA email was reconfirmed on printed page 28; one public club-labelled Strava link is added. No additional phone is established. The alternative vectoracing.co.uk site contains explicit placeholder results and has not been sufficiently tied to the registered club to replace its website or import its email, social links or free-membership claim. No placeholder achievement or result is adopted.",
    sources: [
      { title: "Vector Racing: public Strava club description and regional location", url: "https://www.strava.com/clubs/vectorracing" },
      { title: "England Athletics: affiliated clubs at 1 February 2026, page 19", url: "https://d1laub10p5ibfa.cloudfront.net/2026/02/Affiliated-Clubs-and-Organisations-at-1-Feb-2026.pdf" },
      { title: "Cycling Time Trials: Vector Racing 25-mile event, 14 June 2026", url: "https://www.cyclingtimetrials.org.uk/events/43513" },
      { title: "ECCA 2026–2027 handbook: public club contact, printed page 28", url: "https://www.englishcrosscountry.co.uk/wp-content/uploads/2026/09/ECCA_Handbook_2026-27.pdf" }
    ],
    reviewed_at: "2026-10-18"
  }
};
