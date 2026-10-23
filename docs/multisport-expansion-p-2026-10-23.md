# Americas aquatics directory and Canadian swimming — 23 October 2026

Adds 24 national aquatics member bodies missing from the Americas directory, taking the directory from 643 to 667 organisations. Each is checked against the current World Aquatics membership listing and linked to the existing exact membership page in staff Sources. All prior directory objects are preserved. The registry remains 776 distinct pages with 36 enabled collectors; these additions create no duplicate source jobs or automatic collection.

Membership references establish affiliation only. They do not establish legislative powers, government funding responsibilities, or actual fixture, result and athlete-profile coverage. The existing Swimming Canada calendar, results and profile sources remain registered and linked.

## Athletes and performances

Two new public unclaimed profiles add 47 individual performances from current World Aquatics personal-best tables: Kylie Masse (16) and Sydney Pickrem (31). All seven non-country table columns match an independent fresh text extraction; competition country is read under its explicit HTML heading. Exact marks and tied performances on different dates are preserved. Short-course and long-course performances remain separate. Twenty-two relay rows are excluded; no numerical placing, round or complete career history is inferred.

Both profiles retain explicitly reported Canadian sporting nationality. Exact birth dates and birthplaces are checked against Canadian Olympic Committee profiles. Current residence is absent and remains empty; hometown and training history are not substituted. Additional club and height observations and provenance remain private. Source verification does not establish account ownership.

Ilya Kharun is held for further review because the federation reports an intended nationality change while the World Aquatics profile still labels CAN. No nationality decision or new profile is inferred from the conflict.

## Fixtures

Four meeting editions are checked against the official Swimming Canada calendar:

| Meeting | Dates | Listed location |
| --- | --- | --- |
| Ken Demchuk International Invitational | 26–28 November 2027 | Laval, Quebec; venue unconfirmed |
| Speedo Canadian Swimming Open | 6–8 April 2028 | Kinsmen Sports Centre, Edmonton |
| Olympic & Paralympic Trials, Presented by Bell | 2–8 June 2028 | Toronto Pan Am Sports Centre |
| Ken Demchuk International Invitational | 24–26 November 2028 | Laval, Quebec; venue unconfirmed |

All four use 50m pools. These are meeting ranges, not individual race distances. Session starts and entry availability remain unconfirmed. The existing Canadian Open series is reused, preserving its 2027 edition. Two new series are created. End dates are retained in the database and in dated seed metadata.

The 2028 Masters edition is held because its venue differs from the existing series venue; publishing it against that venue would be misleading. Ontario Junior International is held because its location is absent.

## Validation

The additive database transaction was rehearsed on the existing review branch and compared with production readback: all 47 performances and reviewed profile facts match, including empty residence fields. Source registration checks link all 667 organisations, while the prior 643 objects are unchanged. Performance schemas, unique source keys, exact fixture-edition matching, TypeScript, focused ESLint and the development build pass. Private captures and publication audits are retained in staff storage, outside the public code repository.

No public profile source evidence, guessed start times or entry links are introduced. Signed-in Sources UI interactions are not part of this data-only batch's validation.
