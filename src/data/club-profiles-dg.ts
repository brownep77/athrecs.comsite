import type { ClubProfile } from "./club-profiles";

// Batch 111: recovered club programme; no inferred origin or athlete associations.
export const mojoRunFitProfiles: Record<string, ClubProfile> = {
  "mojo-run-fit": {
    summary: "Mojo Run Fit is a women's road-running club in Beckenham and Forest Hill, London, England, offering sociable coached groups and a separate beginner programme.",
    biography: [
      "Mojo Run Fit brings women together for road running in Beckenham and Forest Hill, London, England. Its focus is sociable, non-competitive training. The intermediate club welcomes runners who can cover 5km in 40 minutes or less, with smaller groups to accommodate different paces. Beginners have a separate ten-week walk-and-run programme, combining one coached group session with two independently arranged sessions each week.",
      "The Beckenham group meets at New Beckenham Station car park, on the Lennard Road side of the railway. Its published Monday session starts at 8pm during term time. Sessions mix running with optional intervals, hills and strength work; some spring and summer sessions use a park. The club also lists Wednesday evenings near Forest Hill Station and longer monthly group runs whose times and locations vary.",
      "Membership is offered by subscription, with online training plans and supporting videos alongside the in-person programme. Prospective members can book a free trial through the club website or use its enquiry form and published phone number. Check the current calendar before attending: the programme takes school-holiday breaks, and the website's September 2026 beginner-course starts have already passed. No founding year or notable-member history has been established from the sources reviewed."
    ],
    sources: [
      { title: "Mojo Fit: running programmes, eligibility, trial links and enquiries", url: "https://mojofit.uk/running/" },
      { title: "Mojo Run Fit Beckenham: subscription and training meeting point", url: "https://mojofit.uk/register/mojo-run-fit-beckenham/" }
    ],
    reviewed_at: "2026-10-18",
    location_note: "New Beckenham Station car park is a training meeting point, not a clubhouse. The club's joining page specifies Lennard Road; Forest Hill and longer-run locations are separate.",
    contact_note: "Sources read on 18 October 2026. The running page publishes the provider's enquiry form and phone. Its email is obscured and is not guessed. Social links are attributed to that page; their destinations could not be read. Holiday-year and clinic-frequency inconsistencies remain unresolved, so exact holiday dates and clinic frequency are omitted. Existing England Athletics directory provenance and adult eligibility are retained.",
    corrections: {
      city: "Beckenham",
      website: "https://mojofit.uk/running/",
      address: "New Beckenham Station Car Park, Lennard Road, Beckenham, BR3 1QN",
      address_kind: "training"
    }
  }
};
