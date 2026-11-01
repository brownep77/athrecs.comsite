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
    snap.HISTORIES_SQL = snap._HISTORIES_SQL_TEMPLATE.replace("__LONDON_YEAR__", str(snap.YEAR))
    snap.PARTS = tuple((name, {"results": snap.RESULTS_SQL, "histories": snap.HISTORIES_SQL}.get(name, sql), order)
                       for name, sql, order in snap.PARTS)
    return context


def _bound_configure(context=None):
    if context is None:
        raise ValueError("--edition-config is required for official-results snapshots")
    return configure(context)


# The shared snapshot function resolves these names in its own module at call
# time: give it this adapter's planner and configuration, never the Pace Notes one.
snap.plan = plan
snap.configure = _bound_configure


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
    args = parser.parse_args()
    if args.make_config:
        if not (args.source and args.output and args.year and args.date and args.edition_id and args.batch):
            parser.error("--make-config needs --source --output --year --date --edition-id --batch")
        make_config(args)
    elif not (args.connection and args.confirm_branch):
        parser.error("--connection and --confirm-branch are required")
    elif args.list_editions:
        list_editions(args)
    else:
        if not (args.source and args.output and args.edition_config):
            parser.error("--source, --output and --edition-config are required for a snapshot")
        snap.snapshot(args)
