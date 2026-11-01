"""Read-only duplicate-screening snapshot for one London edition from the official results site.

Reuses snapshot-london-profiles.py (same streamed directory scan, scoped
results/histories, privacy rows and table fingerprint) bound to an official
edition configuration (scripts/lib/london-official-context.py).

  # 1. Find the canonical edition IDs to put in the private edition config:
  python scripts/snapshot-london-official-profiles.py --connection /private/conn.json \
      --confirm-branch <branch> --list-editions
  # 2. Snapshot one configured edition:
  python scripts/snapshot-london-official-profiles.py --connection /private/conn.json \
      --confirm-branch <branch> --edition-config /private/london-2026.json \
      --source /private/london-official --output /private/snapshot-2026

  # 0. Write the private edition config from the retained year file:
  python scripts/snapshot-london-official-profiles.py --make-config --source /private/london-official \
      --year 2026 --date 2026-04-26 --edition-id <id> [--equivalent-id <id> ...] \
      --batch london-official-2026-20261101 --output /private/london-2026.json

Private outputs, configs and connection files belong outside the repository.
"""

import argparse
import importlib.util
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent


def load_module(name, relative):
    spec = importlib.util.spec_from_file_location(name, ROOT / relative)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


snap = load_module("london_official_snapshot_base", "snapshot-london-profiles.py")
plan = load_module("london_official_snapshot_plan", "lib/london-official-plan.py")
PROJECT, PRODUCTION_BRANCH = snap.PROJECT, snap.PRODUCTION_BRANCH
FINGERPRINT_TABLES = snap.FINGERPRINT_TABLES

LIST_EDITIONS_SQL = """SELECT d.id,d.event_date::text event_date,d.distance_code,d.distance_km,
 e.id event_id,e.name event_name,e.slug event_slug,
 (SELECT count(*) FROM results r WHERE r.edition_id=d.id)::int results
 FROM editions d JOIN events e ON e.id=d.event_id
 WHERE (e.slug ~* 'london-marathon' OR e.name ~* 'london marathon')
 AND (d.distance_km BETWEEN 42.1 AND 42.3 OR d.distance_code ~* '^marathon$')
 AND d.event_date BETWEEN '2010-01-01' AND '2026-12-31'
 ORDER BY d.event_date,d.id"""


def configure(context):
    """Bind the shared snapshot SQL and this module's planner to one official edition."""
    context = plan.configure(context)
    snap.EDITION_CONTEXT = context
    snap.BATCH, snap.YEAR, snap.DATE = context["batchId"], context["year"], context["date"]
    snap.EDITION_IDS = tuple([context["edition"]["id"], *context["edition"]["equivalentIds"]])
    snap.RESULTS_SQL = snap._RESULTS_SQL_TEMPLATE.replace("__LONDON_EDITION_IDS__", ",".join(str(v) for v in snap.EDITION_IDS))
    snap.HISTORIES_SQL = _slim_histories_sql().replace("__LONDON_YEAR__", str(snap.YEAR))
    snap.PARTS = tuple((name, {"results": snap.RESULTS_SQL, "histories": snap.HISTORIES_SQL}.get(name, sql), order)
                       for name, sql, order in snap.PARTS)
    return context


# Only the performance fields the planner reads, plus an md5 of the complete
# performance so any other change still alters the fingerprint. The full rows
# exceed the database HTTP endpoint's 64 MB response cap for London editions.
SLIM_PERFORMANCE = """jsonb_strip_nulls(jsonb_build_object(
 'discipline',p.performance->'discipline','meeting',p.performance->'meeting','eventSlug',p.performance->'eventSlug',
 'date',p.performance->'date','year',p.performance->'year','yearLabel',p.performance->'yearLabel',
 'performance',p.performance->'performance','timing',p.performance->'timing','ageGroup',p.performance->'ageGroup',
 'profileExcluded',p.performance->'profileExcluded','syntheticTest',p.performance->'syntheticTest',
 'disqualification',p.performance->'disqualification','status',p.performance->'status',
 'sourceUrls',p.performance->'sourceUrls','bib',p.performance->'bib','place',p.performance->'place',
 'places',p.performance->'places','archiveReference',jsonb_strip_nulls(jsonb_build_object(
   'bib',p.performance#>'{archiveReference,bib}','sourceUrl',p.performance#>'{archiveReference,sourceUrl}',
   'sourceKey',p.performance#>'{archiveReference,sourceKey}')))) performance,
 md5(p.performance::text) performance_md5"""
HISTORY_PAGE = 5000


def _slim_histories_sql():
    template = snap._HISTORIES_SQL_TEMPLATE
    if template.count("p.ordinal,p.performance\n FROM") != 1:
        raise ValueError("Unexpected shared history snapshot SQL")
    return template.replace("p.ordinal,p.performance\n FROM", "p.ordinal," + SLIM_PERFORMANCE + "\n FROM")


def _bib(value):
    text = str(value or "").strip()
    return text.upper() if re.fullmatch(r"[A-Za-z0-9-]{1,12}", text) else None


def normalize_result(row, kind):
    """Shared normalization plus the bib and overall place the official planner may match on."""
    result = _legacy_normalize_result(row, kind)
    if kind == "canonical":
        result["bib"] = _bib(row.get("bib"))
        result["overallPlace"] = row.get("overall_place")
    else:
        performance = row["performance"]
        result["bib"] = _bib(performance.get("bib")) or _bib((performance.get("archiveReference") or {}).get("bib"))
        place = str(performance.get("place") or "").strip()
        result["overallPlace"] = int(place) if place.isdigit() else None
        result["meetingIsLondon"] = bool(re.search(r"\blondon\s+marathon\b", str(performance.get("meeting") or ""), re.I)) or performance.get("eventSlug") == "london-marathon"
    return result


_legacy_normalize_result = snap.normalize_result


def _bound_configure(context=None):
    if context is None:
        raise ValueError("--edition-config is required for official-results snapshots")
    return configure(context)


# The shared snapshot function resolves these names in its own module at call
# time: give it this adapter's planner and configuration, never the Pace Notes one.
snap.plan = plan
snap.configure = _bound_configure
snap.normalize_result = normalize_result


def _paged(query, sql, order, params, keys, page=HISTORY_PAGE):
    """Keyset pages in the part's own order, so the digest equals the fingerprint's."""
    rows, last = [], None
    columns = ",".join("t." + k for k in keys)
    placeholders = ",".join(f"${len(params) + i + 1}" for i in range(len(keys)))
    while True:
        where = f" WHERE ({columns})>({placeholders})" if last else ""
        page_sql = "SELECT t.*,md5(to_jsonb(t)::text) row_hash FROM (" + sql + ") t" + where + " ORDER BY " + order + f" LIMIT {page}"
        batch = query([(page_sql, params + ([last[k] for k in keys] if last else []))], True)[0]
        rows.extend(batch)
        if len(batch) < page:
            return rows
        last = batch[-1]


def snapshot(args):
    """The shared snapshot, with the large history part read in keyset pages."""
    original_query_builder = snap.base.connection

    def connection(path, branch, timeout=60):
        cfg, query = original_query_builder(path, branch, timeout)

        def paged_query(statements, readonly=False):
            out = []
            for sql, params in statements:
                if sql == snap.hashed_rows_sql(snap.HISTORIES_SQL, "athlete_id,provider,external_id,ordinal"):
                    out.append(_paged(query, snap.HISTORIES_SQL, "athlete_id,provider,external_id,ordinal", list(params),
                                      ["athlete_id", "provider", "external_id", "ordinal"]))
                else:
                    out.extend(query([(sql, params)], readonly))
            return out
        return cfg, paged_query
    snap.base.connection = connection
    try:
        return snap.snapshot(args)
    finally:
        snap.base.connection = original_query_builder


def fingerprint_sql():
    return snap.fingerprint_sql()


def make_config(args):
    """Write a private edition config from the retained year file and reviewed edition IDs."""
    import collections, datetime as dt, hashlib
    if args.output.resolve().is_relative_to(ROOT.parent.resolve()):
        raise ValueError("Private edition configuration must remain outside the repository")
    path = args.source / f"london_{args.year}.json"
    rows = json.loads(path.read_text(encoding="utf-8"))
    context = {
        "formatVersion": 1, "year": args.year, "date": args.date, "batchId": args.batch,
        "edition": {"id": args.edition_id, "equivalentIds": args.equivalent_id or [], "eventSlug": "london-marathon",
                    "eventName": "London Marathon", "date": args.date, "distanceKm": 42.195, "country": "United Kingdom"},
        "sourceFile": path.name, "sourceSha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "expectedRows": len(rows), "expectedByEvent": dict(collections.Counter(r["event"] for r in rows)),
        "capturedAt": args.captured_at or dt.datetime.fromtimestamp(path.stat().st_mtime, dt.timezone.utc).isoformat(),
        "ownerInstruction": OWNER_INSTRUCTION, "instructionDate": "2026-11-01",
    }
    plan._context.validate_context(context)
    args.output.write_text(json.dumps(context, indent=2))
    args.output.chmod(0o600)
    print(json.dumps(context, indent=2))


OWNER_INSTRUCTION = ("Paul Browne, 1 November 2026: \"can you just copy and paste these results into the browser to upload "
                     "them to athrecs ?\" … \"and create profiles\" … \"so change and adapt it\" (London Marathon official results, 2010–2026).")


CANDIDATE_ATHLETES_SQL = """SELECT a.id,a.source_club_name,c.name club_name,
 (SELECT coalesce(jsonb_agg(DISTINCT ac2.name),'[]'::jsonb) FROM athlete_clubs x JOIN clubs ac2 ON ac2.id=x.club_id WHERE x.athlete_id=a.id) member_clubs,
 a.profile_details#>>'{sourceNationalityObservation,value}' source_nationality,
 a.profile_details->>'nationality' stated_nationality
 FROM athletes a LEFT JOIN clubs c ON c.id=a.club_id WHERE a.id = ANY($1::int[]) ORDER BY a.id"""

CANDIDATE_HISTORIES_SQL = """SELECT h.athlete_id,h.provider,p.ordinal,
 jsonb_strip_nulls(jsonb_build_object('year',p.performance->'year','date',p.performance->'date',
 'meeting',p.performance->'meeting','eventSlug',p.performance->'eventSlug','discipline',p.performance->'discipline',
 'performance',p.performance->'performance','ageGroup',p.performance->'ageGroup','bib',coalesce(p.performance->'bib',p.performance#>'{archiveReference,bib}'),
 'sourceClub',coalesce(p.performance->'sourceClub',p.performance#>'{archiveReference,club}'),
 'sourceReportedNationality',coalesce(p.performance->'sourceReportedNationality',p.performance#>'{archiveReference,nationality}'),
 'profileExcluded',p.performance->'profileExcluded',
 'sourceUrls',(SELECT jsonb_agg(u) FROM jsonb_array_elements_text(CASE WHEN jsonb_typeof(p.performance->'sourceUrls')='array' THEN p.performance->'sourceUrls' ELSE '[]'::jsonb END) u
   WHERE u ~* 'londonmarathon\\.com/'))) perf
 FROM athlete_source_histories h CROSS JOIN LATERAL jsonb_array_elements(h.performances) WITH ORDINALITY p(performance,ordinal)
 WHERE h.athlete_id = ANY($1::int[]) ORDER BY h.athlete_id,h.provider,h.external_id,p.ordinal"""

CANDIDATE_RESULTS_SQL = """SELECT r.athlete_id,r.category,r.finish_time_seconds,r.chip_time_seconds,r.bib,r.source_url,
 r.result_details->>'clubAtRace' club_at_race,d.event_date::text event_date,d.distance_km,e.name event_name,e.slug event_slug
 FROM results r JOIN editions d ON d.id=r.edition_id JOIN events e ON e.id=d.event_id
 WHERE r.athlete_id = ANY($1::int[]) ORDER BY r.athlete_id,r.id"""


def _hms(value):
    if value is None:
        return None
    total = int(round(float(value)))
    return f"{total // 3600:02}:{total % 3600 // 60:02}:{total % 60:02}"


def candidate_evidence(args):
    """Read-only: other facts of every snapshot athlete, for multi-signal identity scoring."""
    import datetime as dt
    if args.output.resolve().is_relative_to(ROOT.parent.resolve()):
        raise ValueError("Private candidate evidence must remain outside the repository")
    snapshot_data = json.loads((args.snapshot / "snapshot.json").read_text(encoding="utf-8"))
    ids = sorted({int(a["id"]) for a in snapshot_data["athletes"]})
    _, query = snap.base.connection(args.connection, args.confirm_branch, timeout=180)
    started = dt.datetime.now(dt.timezone.utc).isoformat()
    out = {str(i): {"clubs": [], "performances": [], "sourceNationality": None, "privacyFlags": []} for i in ids}
    for offset in range(0, len(ids), 4000):
        chunk = ids[offset:offset + 4000]
        athletes, histories, results = query([(CANDIDATE_ATHLETES_SQL, [chunk]), (CANDIDATE_HISTORIES_SQL, [chunk]), (CANDIDATE_RESULTS_SQL, [chunk])], True)
        for row in athletes:
            rec = out[str(row["id"])]
            rec["clubs"] = sorted({c for c in [row.get("source_club_name"), row.get("club_name"), *(row.get("member_clubs") or [])] if c})
            rec["sourceNationality"] = row.get("source_nationality")
            if row.get("stated_nationality"):
                rec["statedNationality"] = row["stated_nationality"]
        for row in histories:
            perf = dict(row["perf"] or {})
            perf["provider"] = row["provider"]
            perf["officialSemantics"] = row["provider"] in OFFICIAL_LONDON_PROVIDERS
            rec = out[str(row["athlete_id"])]
            rec["performances"].append(perf)
            if perf.get("sourceClub"):
                rec["clubs"] = sorted(set(rec["clubs"]) | {perf["sourceClub"]})
        for row in results:
            rec = out[str(row["athlete_id"])]
            date = row.get("event_date") or ""
            london = row.get("event_slug") == "london-marathon"
            rec["performances"].append({
                "provider": "canonical", "year": int(date[:4]) if date[:4].isdigit() else None, "date": date,
                "meeting": row.get("event_name"), "eventSlug": row.get("event_slug"),
                "discipline": "Marathon" if row.get("distance_km") and abs(float(row["distance_km"]) - 42.195) < 0.1 else str(row.get("distance_km")),
                "performance": _hms(row.get("chip_time_seconds") or row.get("finish_time_seconds")), "ageGroup": row.get("category"),
                "bib": row.get("bib"), "sourceUrls": [row["source_url"]] if london and row.get("source_url") else [],
                "officialSemantics": False})
            if row.get("club_at_race"):
                rec["clubs"] = sorted(set(rec["clubs"]) | {row["club_at_race"]})
        snap.progress(phase="candidate_evidence", athletes=min(offset + 4000, len(ids)), total=len(ids))
    document = {"metadata": {"readAt": started, "branchId": args.confirm_branch, "snapshotFingerprint": snapshot_data["metadata"]["fingerprint"],
                             "snapshotDigest": plan._hash(snapshot_data), "athletes": len(ids)}, "athletes": out}
    document["metadata"]["digest"] = plan._hash(out)
    target = args.output
    target.write_text(json.dumps(document, ensure_ascii=False, separators=(",", ":")))
    target.chmod(0o600)
    snap.progress(phase="candidate_evidence_complete", **document["metadata"])


# Same-source London providers whose age categories use race-day semantics.
OFFICIAL_LONDON_PROVIDERS = {"TCS London Marathon results", "mika:timing (London Marathon supplied results)"}


def build_chain_index(args):
    """Private provisional cross-year chain index from all retained official year files."""
    if args.output.resolve().is_relative_to(ROOT.parent.resolve()):
        raise ValueError("Private chain index must remain outside the repository")
    rows = {}
    for path in sorted(args.source.glob("london_*.json")):
        year = int(path.stem.split("_")[1])
        rows[year] = json.loads(path.read_text(encoding="utf-8"))
    index = plan.evidence.build_chains(rows)
    index["sourceSha256"] = {str(y): plan._file_hash(args.source / f"london_{y}.json") for y in rows}
    args.output.write_text(json.dumps(index, ensure_ascii=False, separators=(",", ":")))
    args.output.chmod(0o600)
    print(json.dumps(index["stats"], indent=2))


def list_editions(args):
    _, query = snap.base.connection(args.connection, args.confirm_branch, timeout=60)
    rows = query([(LIST_EDITIONS_SQL, [])], True)[0]
    print(json.dumps(rows, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--make-config", action="store_true", help="write a private edition config (no database access)")
    parser.add_argument("--year", type=int)
    parser.add_argument("--date")
    parser.add_argument("--edition-id", type=int)
    parser.add_argument("--equivalent-id", type=int, action="append")
    parser.add_argument("--captured-at")
    parser.add_argument("--connection", type=pathlib.Path)
    parser.add_argument("--confirm-branch")
    parser.add_argument("--list-editions", action="store_true")
    parser.add_argument("--source", type=pathlib.Path)
    parser.add_argument("--output", type=pathlib.Path)
    parser.add_argument("--edition-config", type=pathlib.Path)
    parser.add_argument("--batch")
    parser.add_argument("--candidate-evidence", action="store_true", help="read-only: candidate athletes' other facts")
    parser.add_argument("--snapshot", type=pathlib.Path)
    parser.add_argument("--build-chains", action="store_true", help="write the private cross-year chain index (no database access)")
    args = parser.parse_args()
    if args.build_chains:
        if not (args.source and args.output):
            parser.error("--build-chains needs --source and --output")
        build_chain_index(args)
    elif args.make_config:
        if not (args.source and args.output and args.year and args.date and args.edition_id and args.batch):
            parser.error("--make-config needs --source --output --year --date --edition-id --batch")
        make_config(args)
    elif not (args.connection and args.confirm_branch):
        parser.error("--connection and --confirm-branch are required")
    elif args.list_editions:
        list_editions(args)
    elif args.candidate_evidence:
        if not (args.snapshot and args.output):
            parser.error("--candidate-evidence needs --snapshot and --output")
        candidate_evidence(args)
    else:
        if not (args.source and args.output and args.edition_config):
            parser.error("--source, --output and --edition-config are required for a snapshot")
        snapshot(args)
