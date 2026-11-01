"""Scoped freshness guard for official London imports (replaces the whole-directory fingerprint).

Other site automations write to production continuously, so a fingerprint of the
entire directory rarely survives an hour-long publish. The duplicate screen only
depends on:

* the athletes each batch's decisions reference (link/attach targets, ranked and
  possible-duplicate candidates, existing candidates behind holds and
  distinct-person decisions): their names/aliases, gender, nation, date of birth,
  visibility, profile type, parent and active account links;
* this edition's scoped results and histories, and the privacy rows (snapshot parts);
* that no athlete or account created or renamed after the snapshot has a
  screening name key that collides with a name this plan creates or attaches.

Start-up certifies the referenced athletes and scoped parts against the snapshot
and screens the whole live directory/accounts for colliding keys (Python, same
keys as the planner). Every batch transaction then locks the tables and asserts,
in SQL, the referenced-athlete digest, the scoped-part digest, the certified
directory name digest and maximum athlete ID, and the account digest. An unrelated
change makes only the name/account assertions fail; the applier re-screens the
changed rows, re-baselines if nothing collides and retries. A collision, or any
change to a referenced athlete or scoped part, stops the run for a re-plan.
"""
from __future__ import annotations

import hashlib

GUARD_VERSION = "london-official-scoped-guard/v1"
SCOPED_PARTS = ("results", "histories", "shares", "historyChoices", "hiddenSourceResults")
GUARD_TABLES = ("london_guard_parts", "london_guard_refs", "london_guard_names", "london_guard_accounts")
RETRYABLE = ("london_guard_names", "london_guard_accounts")
PAGE = 20000


def md5(text):
    return hashlib.md5(text.encode("ascii")).hexdigest()


def referenced_ids(group):
    """Existing athletes whose state this group's decision depends on."""
    ids = set()
    for m in group.get("existingMatches", []):
        ids.add(str(m["athleteId"]))
    if group.get("athleteId") is not None:
        ids.add(str(group["athleteId"]))
    for c in group.get("samePerformanceCandidates", []):
        ids.add(str(c["athleteId"]))
    for token in group.get("existingCandidates", []):
        if token.startswith("athlete:"):
            ids.add(token[len("athlete:"):])
    ev = group.get("identityEvidence") or {}
    for c in ev.get("rankedCandidates", []):
        ids.add(str(c["athleteId"]))
    for c in ev.get("possibleDuplicateOf", []):
        ids.add(str(c["athleteId"]))
    return {int(i) for i in ids if str(i).isdigit()}


def batch_name_keys(plan, planner):
    """Screening keys of every name this plan creates or attaches."""
    keys = set()
    for g in plan["groups"]:
        if g["disposition"] in ("new", "evidence_linked"):
            for name in g["names"]:
                keys |= planner.screening_name_keys(name)
    return keys


def screen_rows(rows, keys, snapshot_athletes, athlete_record, snapshot_name_keys):
    """Live athlete rows whose names now collide with this plan, unchanged-from-snapshot excepted."""
    collisions = []
    for row in rows:
        record = athlete_record(row)
        if not snapshot_name_keys(record) & keys:
            continue
        before = snapshot_athletes.get(str(row["id"]))
        if before is None or before.get("displayName") != record["displayName"] or before.get("aliases") != record["aliases"]:
            collisions.append({"athleteId": row["id"], "displayName": record["displayName"]})
    return collisions


def screen_accounts(rows, keys, snapshot_accounts, names_from, screening_name_keys):
    collisions = []
    for row in rows:
        names = sorted({n for v in [row.get("name"), row.get("full_name"), row.get("display_name"), row.get("previous_names")]
                        for n in names_from(v)})
        if not any(screening_name_keys(n) & keys for n in names):
            continue
        before = snapshot_accounts.get(str(row["id"]))
        if before is None or sorted(before.get("names", [])) != names:
            collisions.append({"accountId": row["id"]})
    return collisions


class ScopedGuard:
    def __init__(self, snap, planner, plan, snapshot, metadata, batch):
        self.snap, self.planner, self.batch = snap, planner, batch
        self.snapshot_athletes = {str(a["id"]): a for a in snapshot["athletes"]}
        self.snapshot_accounts = {str(a["id"]): a for a in snapshot["accounts"]}
        self.snapshot_linked = {int(i) for a in snapshot["accounts"] for i in a.get("linkedAthleteIds", [])}
        self.keys = batch_name_keys(plan, planner)
        parts = {name: (sql, order) for name, sql, order in snap.PARTS}
        self.parts_sql = "SELECT md5(" + " || ".join(
            "(SELECT md5(coalesce(string_agg(md5(to_jsonb(t)::text),'' ORDER BY " + parts[n][1] + "),'')) FROM (" + parts[n][0] + ") t)"
            for n in SCOPED_PARTS) + ") fp"
        self.parts_expected = md5("".join(metadata["partHashes"][n] for n in SCOPED_PARTS))
        self.names_sql = ("SELECT t.*,md5(jsonb_build_array(t.display_name,t.given_name,t.family_name,t.race_entry_name,t.name_details)::text) h FROM ("
                          + snap.ATHLETES_SQL + ") t")
        self.names_fp_sql = "SELECT md5(coalesce(string_agg(n.h,'' ORDER BY n.id),'')) fp FROM (" + self.names_sql + ") n WHERE n.id<=$2"
        self.max_sql = "SELECT coalesce(max(t.id),0) max_id FROM (" + snap.ATHLETES_SQL + ") t"
        self.refs_sql = ("SELECT x.*,md5(to_jsonb(x)::text) h FROM (SELECT t.*,EXISTS(SELECT 1 FROM athlete_account_links l "
                         "WHERE l.athlete_id=t.id AND l.status='active') linked FROM (" + snap.ATHLETES_SQL + ") t WHERE t.id=ANY($2::int[])) x")
        self.accounts_sql = ("SELECT md5(coalesce((SELECT string_agg(md5(to_jsonb(a)::text),'' ORDER BY a.id) FROM (" + snap.ACCOUNTS_SQL
                             + ") a),'') || coalesce((SELECT string_agg(md5(to_jsonb(l)::text),'' ORDER BY l.athlete_id,l.user_id) FROM ("
                             + snap.LINKS_SQL + ") l),'')) fp")
        self.ref_hash, self.name_hash = {}, {}
        self.max_id = 0
        self.accounts_fp = None
        self.refreshes = 0

    # ---- start-up certification -------------------------------------------------
    def certify(self, query, all_ref_ids):
        live = query([(self.parts_sql, [self.batch])], True)[0][0]["fp"]
        if live != self.parts_expected:
            raise ValueError("This edition's scoped results/histories or privacy rows changed since the snapshot; re-plan")
        ids = sorted(all_ref_ids)
        changed = []
        for offset in range(0, len(ids), 5000):
            chunk = ids[offset:offset + 5000]
            rows = query([(self.refs_sql, [self.batch, chunk])], True)[0]
            found = {int(r["id"]): r for r in rows}
            for i in chunk:
                row = found.get(i)
                before = self.snapshot_athletes.get(str(i))
                if row is None or before is None:
                    changed.append(i)
                    continue
                h = row.pop("h")
                linked = row.pop("linked")
                record = self.snap.athlete_record(row)
                if any(record[k] != before.get(k) for k in record) or bool(linked) != (i in self.snapshot_linked):
                    changed.append(i)
                self.ref_hash[i] = h
        if changed:
            raise ValueError(f"{len(changed)} referenced athletes changed since the snapshot (e.g. {changed[:5]}); re-plan")
        self._scan_names(query, 0)
        self._check_accounts(query)

    def _scan_names(self, query, after, rebaseline=False):
        """Screen live directory rows with id > after (or every row when rebaselining)."""
        start = 0 if rebaseline else after
        maximum = query([(self.max_sql, [self.batch])], True)[0][0]["max_id"]
        last, seen, collisions = start, {}, []
        while last < maximum:
            rows = query([(self.names_sql + " WHERE t.id>$2 AND t.id<=$3 ORDER BY t.id LIMIT " + str(PAGE),
                           [self.batch, last, maximum])], True)[0]
            if not rows:
                break
            for row in rows:
                seen[int(row["id"])] = row.pop("h")
            changed = [r for r in rows if self.name_hash.get(int(r["id"])) != seen[int(r["id"])]]
            collisions += screen_rows(changed, self.keys, self.snapshot_athletes, self.snap.athlete_record, self.planner.snapshot_name_keys)
            last = int(rows[-1]["id"])
        if collisions:
            raise ValueError(f"{len(collisions)} athletes created or renamed after the snapshot collide with names in this plan "
                             f"(e.g. {collisions[:3]}); take a new snapshot and re-plan")
        if rebaseline:
            self.name_hash = seen
        else:
            self.name_hash.update(seen)
        self.max_id = int(maximum)

    def _check_accounts(self, query):
        rows = query([(self.snap.ACCOUNTS_SQL, [])], True)[0]
        collisions = screen_accounts(rows, self.keys, self.snapshot_accounts, self.planner._screen.finder.names_from,
                                     self.planner.screening_name_keys)
        if collisions:
            raise ValueError(f"Accounts created or renamed after the snapshot collide with names in this plan: {collisions[:3]}; re-plan")
        self.accounts_fp = query([(self.accounts_sql, [])], True)[0][0]["fp"]

    def names_fp(self):
        return md5("".join(self.name_hash[i] for i in sorted(self.name_hash) if i <= self.max_id))

    # ---- between batches ------------------------------------------------------
    def refresh(self, query):
        """Accept unrelated directory/account changes; stop on any colliding name."""
        self.refreshes += 1
        live_max = query([(self.max_sql, [self.batch])], True)[0][0]["max_id"]
        if query([(self.names_fp_sql, [self.batch, self.max_id])], True)[0][0]["fp"] != self.names_fp():
            self._scan_names(query, 0, rebaseline=True)          # rename(s) among known ids
        elif int(live_max) != self.max_id:
            self._scan_names(query, self.max_id)                 # new athletes only
        if query([(self.accounts_sql, [])], True)[0][0]["fp"] != self.accounts_fp:
            self._check_accounts(query)

    # ---- in-transaction assertions -------------------------------------------
    def statements(self, batch_ref_ids):
        ids = sorted(batch_ref_ids)
        refs_expected = md5("".join(self.ref_hash[i] for i in ids))
        return [
            (f"CREATE TEMP TABLE {t}(ok boolean CHECK(ok IS TRUE)) ON COMMIT DROP", []) for t in GUARD_TABLES
        ] + [
            ("INSERT INTO london_guard_parts SELECT fp=$2 FROM (" + self.parts_sql + ") checked", [self.batch, self.parts_expected]),
            ("INSERT INTO london_guard_refs SELECT md5(coalesce(string_agg(r.h,'' ORDER BY r.id),''))=$3 FROM (" + self.refs_sql + ") r",
             [self.batch, ids, refs_expected]),
            ("INSERT INTO london_guard_names SELECT (" + self.names_fp_sql + ")=$3 AND NOT EXISTS(SELECT 1 FROM (" + self.snap.ATHLETES_SQL
             + ") t WHERE t.id>$2)", [self.batch, self.max_id, self.names_fp()]),
            ("INSERT INTO london_guard_accounts SELECT fp=$1 FROM (" + self.accounts_sql + ") checked", [self.accounts_fp]),
        ]

    def receipt(self, ref_count):
        return {"version": GUARD_VERSION, "scopedPartsFingerprint": self.parts_expected, "referencedAthletes": ref_count,
                "planNameKeys": len(self.keys), "directoryMaxId": self.max_id, "refreshes": self.refreshes}
