# Profile competition honours

AthRecs uses presentation tiers to distinguish achievements. These are not
World Athletics ranking categories, points or an athlete rating.

| Competition                               | Display                                                                       |
| ----------------------------------------- | ----------------------------------------------------------------------------- |
| Olympic Games                             | Laurel and torch medals for verified final podiums; flame participation badge |
| Paralympic Games                          | Laurel and star medals; separate participation collection                     |
| World Championships                       | Globe medals; separate championship participation collection                  |
| Continental championships and major Games | Level-labelled podium medals and winning trophies                             |
| Recognised major marathons                | Level-labelled podium medals and crown trophies                               |
| Recognised international competition      | Level-labelled medals and winning trophies                                    |
| National championships                    | Level-labelled medals and title shields                                       |
| Regional/county championships             | Level-labelled medals and title shields                                       |
| Club championships                        | Level-labelled medals and winning trophies                                    |
| Community events                          | Finish/podium row decoration; parkrun is not counted as a race win            |
| Unclassified races                        | Standard race decoration, without an inferred prestige tier                   |

Tier recognition uses anchored championship identities or the curated marathon
registry in `competition-awards.ts`. Overseas venues, fast times and a provider's
brand cannot establish competition level. The major-marathon label describes
recognised races, not historical membership of a commercial series. Sydney is
eligible from 2025; Tokyo from its 2007 inception. Expand recognition only when
an event's identity and status are established.

Overall, gender and category places remain distinct. Masters and youth divisions
remain labelled and grouped separately. Category awards require a named category
and an explicit category position; an age group, birth date or general placing
cannot substitute for that evidence. These collections do not total overlapping
overall, gender and category awards as separate races.

The honours board uses verified, completed results from the unified timeline.
Contradictory copies earn no honours. Championship track/field medals require a
confirmed final; heat, qualifying and unknown-round placings cannot create titles.
Single-race disciplines such as marathon may establish the final without a round
annotation. Explicit contradictory round annotations still block medals.

Olympic and Paralympic participation is counted once per Games edition, including
verified DNF participation. World appearances group the same championship and
year. DNS, disqualifications, future results and excluded records earn no honours.
DNF earns no medal. Unsupported rows retain their visible verification label and
standard finish/placing decoration; they do not earn verified honours.

All awards are derived presentation. Stored times, places, category, source
provenance, personal-best eligibility and ranking calculations are unchanged.
Editorial career highlights can explicitly specify a competition tier and medal
kind when their existing cited evidence supports it.

Run `npm run verify:profile-timeline` for synthetic classification, deduplication,
eligibility and rendering checks. The unified-profile integration suite verifies
that gender and category honours survive the public read path and privacy gates.
