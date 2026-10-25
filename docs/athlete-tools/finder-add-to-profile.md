# Add a finder result to an athlete profile

In the staff result finder, choose **Add to profile** beside an unassigned central
archive observation or saved race capture. Select an existing athlete. For a
capture, also select its existing race edition and check the original column
mapping. The panel displays finish/chip/gun times separately, all supplied
placings, the original row and the source link.

Record the identity evidence and confirm the source comparison and publication
authority, then choose **Add result to athlete profile**. The confirmation links
to the athlete's results. New results follow the selected profile's existing
public/private visibility; adding a result does not publish a private profile,
grant account ownership or set a verification tick.

Canonical results and athlete histories already have a profile attachment. The
finder labels those attachments and keeps the existing review link. An archive
row already attached elsewhere cannot be copied or reassigned with this button;
use identity review/merging to resolve the profiles. A managed destination needs
its linked owner's confirmation unless that owner is the signed-in staff user.

Previews and cancellation are read-only. Saves re-read the source, target and
duplicate checks, compare the exact preview fingerprint, and run one transaction
through the existing archive importer/reviewer. Replayed requests return the
same receipt. A source identity clash, stale/held/revoked capture, edition/date/
distance conflict, team/leg result or existing performance stops the addition.
Captures retain their original values and stable source locator; they do not
create guessed race editions or profiles. Total Race Timing captures also pass
the independent heading reader with exact timing and placing comparisons.

The private audit retains the staff actor, source snapshot, identity note and
receipt. Staff middleware protects lookup, preview and save; preview deployments
and temporary storage cannot write. Existing profile privacy and result
publication controls remain in effect.

Validation: `npm run verify:finder-add-to-profile` exercises real PostgreSQL
semantics against disposable synthetic data. The finder browser suite covers the
actual React → staff API → database path, cancellation, archive addition, repeat
assignment protection, captured-row edition selection and mobile/private saves.
