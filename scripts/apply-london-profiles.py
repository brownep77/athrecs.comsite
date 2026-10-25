"""Owner-authorized London edition profile import, with immutable evidence and replay guards.

Plans, credentials, snapshots and receipts belong outside the repository. This
adapter creates provisional unclaimed profiles, preserves every observation in
the private capture inbox, and attaches evidence to explicitly resolved existing
performances without rewriting their publication, claims, results or histories.
"""
from __future__ import annotations

import argparse
import collections
import concurrent.futures
import copy
import datetime as dt
import gzip
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import tempfile
import threading
import uuid

ROOT = Path(__file__).resolve().parent
PROJECT = 'lively-resonance-04577945'
PRODUCTION = 'br-flat-unit-aydbwlfk'
YEAR = 2025
EDITION_DATE = '2025-04-27'
BATCH = 'london-2025-20261024'
EDITION_CONTEXT = None
INSTRUCTION = 'can you create athletes and profiles and merge the ones there already checking for duplicates please.'
COLLECTION_FILE_ID = 'libfile_3119e0d114d0819190bd1ba13c1ce5a0'
COLLECTION_SHA256 = '347788b3bf0e0b3043c5a6011ae52b6c8ca6024847c9465b451114766e8cd3ea'


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


base = load('london_apply_base', ROOT / 'create-private-archive-profiles.py')
planner = load('london_apply_plan', ROOT / 'lib/london-profile-plan.py')
context_schema = load('london_apply_context', ROOT / 'lib/london-edition-context.py')
_LEGACY = {
    'year': YEAR, 'date': EDITION_DATE, 'batchId': BATCH,
    'ownerInstruction': INSTRUCTION, 'collectionFileId': COLLECTION_FILE_ID,
    'collectionSha256': COLLECTION_SHA256,
}


def encoded(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'))


def digest(value):
    return hashlib.sha256(encoded(value).encode()).hexdigest()


def read_json(path):
    if path.suffix == '.gz':
        with gzip.open(path, 'rt', encoding='utf-8') as handle:
            return json.load(handle)
    return json.loads(path.read_text(encoding='utf-8'))


def dump(path, value):
    """Receipts contain athlete evidence: create privately before writing bytes."""
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    fd, name = tempfile.mkstemp(prefix=path.name + '.', suffix='.writing', dir=path.parent)
    temp = Path(name)
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as handle:
            json.dump(value, handle, ensure_ascii=False, indent=2, allow_nan=False)
            handle.flush()
            os.fsync(handle.fileno())
        temp.replace(path)
    finally:
        temp.unlink(missing_ok=True)


def validate_private_paths(args):
    for key in ('connection', 'plan', 'snapshot', 'receipt', 'rehearsal_receipt'):
        path = getattr(args, key, None)
        if path is not None and path.resolve().is_relative_to(ROOT.parent):
            raise ValueError('Private inputs and receipts must remain outside the repository')
    if args.rehearsal_receipt and args.rehearsal_receipt.resolve() == args.receipt.resolve():
        raise ValueError('Keep the rehearsal receipt separate from the production receipt')


def select_groups(plan, review, limit, linked_limit=100):
    if isinstance(linked_limit, bool) or not isinstance(linked_limit, int) or not 1 <= linked_limit <= 1000:
        raise ValueError('Review linked limit must be between 1 and 1000')
    chosen = [g for g in plan['groups'] if g['disposition'] in ('new', 'linked')]
    if not review or not limit:
        return chosen, None
    # A creation-heavy edition must still rehearse the existing-performance path.
    chosen = ([g for g in chosen if g['disposition'] == 'new'][:limit]
              + [g for g in chosen if g['disposition'] == 'linked'][:linked_limit])
    held = [g for g in plan['groups'] if g['disposition'] == 'held'][:50]
    return chosen, {key for g in [*chosen, *held] for key in g['observationKeys']}


def captured_row(observation, group):
    """The staff capture browser and participant search consume these headings."""
    original = {
        'Original Name': observation['originalName'],
        'Finish Time': observation['originalFinishTime'],
        'Source Result ID': observation['sourceResultId'],
        'Source URL': observation['sourceUrl'],
        'Publication': observation['publicationUrl'],
        'Captured At': observation['capturedAt'],
        'Timing Basis': 'Unspecified; generic finish time',
        'Import Decision': group['disposition'],
        'Review Reasons': '; '.join(group['reasons']),
    }
    if observation.get('countryCodeInOriginalName'):
        original['Country Code in Original Name'] = observation['countryCodeInOriginalName']
    if observation.get('sourceReportedPlace') is not None:
        original['Secondary Archive Place (not verified official rank)'] = str(observation['sourceReportedPlace'])
    return {
        'name': observation['name'], 'bib': '', 'club': '',
        'gender': observation.get('gender') or '', 'category': observation.get('category') or '',
        'distanceLabel': 'Marathon', 'date': EDITION_DATE, 'status': 'finished',
        'tableKey': observation['sourceScope'], 'sourceRow': observation['sourceKey'],
        'sourceKey': observation['sourceKey'], 'sourceUrl': observation['sourceUrl'],
        'finishTime': observation['finishTime'], 'finishSeconds': observation['finishSeconds'],
        'chipSeconds': None, 'gunSeconds': None,
        'original': original, 'sourceObservation': observation,
        'importDecision': {key: group[key] for key in (
            'groupId', 'disposition', 'reasons', 'existingCandidates',
            'existingCandidateCount', 'existingMatches', 'sourceNameCollisionWitnesses'
        ) if key in group},
    }


def capture_parts(plan, selected=None):
    assert_plan_context(plan)
    groups = {key: group for group in plan['groups'] for key in group['observationKeys']}
    by_provider = collections.defaultdict(list)
    for observation in plan['observations']:
        if selected is None or observation['observationKey'] in selected:
            by_provider[observation['provider']].append(observation)
    for provider, observations in sorted(by_provider.items()):
        # The plan applies groups in groupId order. Keep neighbouring groups in
        # neighbouring capture parts so a bounded write checks bounded evidence,
        # rather than touching the entire edition's captures every time.
        observations.sort(key=lambda o: (groups[o['observationKey']]['groupId'], o['observationKey']))
        for offset in range(0, len(observations), 500):
            part = observations[offset:offset + 500]
            rows = [captured_row(o, groups[o['observationKey']]) for o in part]
            # Locator-derived identity stays stable when a trial uses a subset.
            source_key = f'london-{YEAR}:' + provider + ':rows-' + digest([o['sourceKey'] for o in part])[:24]
            payload = {
                'format': 'london-secondary-results-v1', 'contentType': 'application/json',
                'publication': 'staff_only', 'batchId': BATCH,
                'index': {'name': f'London Marathon {YEAR}', 'date': EDITION_DATE, 'location': 'London'},
                'provider': part[0]['providerName'], 'rows': rows,
                'retainedCollection': {'fileId': COLLECTION_FILE_ID, 'sha256': COLLECTION_SHA256},
                'inputDigest': plan['inputDigest'],
                'qualification': 'Compared with retained secondary collection. No fresh primary-source check or identity verification.',
            }
            raw = encoded([o['original'] for o in part]).encode()
            yield {
                'providerKey': provider, 'provider': part[0]['providerName'], 'sourceKey': source_key,
                'sourceUrl': part[0]['publicationUrl'], 'payload': payload, 'payloadHash': digest(payload),
                'rawSha256': hashlib.sha256(raw).hexdigest(), 'rawGzip': gzip.compress(raw, mtime=0).hex(),
                'capturedAt': max(o['capturedAt'] for o in part),
                'observationKeys': [o['observationKey'] for o in part], 'rowCount': len(part),
            }


def setup(query, plan, parts):
    for provider_key in sorted({p['providerKey'] for p in parts}):
        chosen = [p for p in parts if p['providerKey'] == provider_key]
        approval = BATCH + '-' + provider_key + '-owner'
        run = str(uuid.uuid5(uuid.NAMESPACE_URL, 'https://athrecs.com/imports/' + approval))
        evidence = {
            'requestedBy': 'Paul Browne', 'instruction': INSTRUCTION,
            'reviewedAt': plan['createdAt'], 'batchId': BATCH,
            'privateCaptureAuthorized': True, 'newPaceNotesProfilesAuthorized': True,
            'sourceVerification': 'unverified_secondary_source',
            'sourceAttribution': plan['sourceAttribution'],
            'retainedCollection': {'fileId': COLLECTION_FILE_ID, 'sha256': COLLECTION_SHA256},
        }
        query([
            ("INSERT INTO result_archive_capture_approvals(id,provider,approved_by,approval_basis,scope,evidence) VALUES($1,$2,'Paul Browne','owner_private_import','staff_only',$3::jsonb) ON CONFLICT(id) DO NOTHING", [approval, chosen[0]['provider'], encoded(evidence)]),
            ("INSERT INTO result_archive_capture_runs(id,approval_id,provider,inventory,status) VALUES($1::uuid,$2,$3,$4::jsonb,'processing') ON CONFLICT(id) DO NOTHING", [run, approval, chosen[0]['provider'], encoded([{'sourceKey': p['sourceKey'], 'sourceUrl': p['sourceUrl']} for p in chosen])]),
        ])
        for part in chosen:
            part['approvalId'], part['runId'] = approval, run


def retain_capture(query, part, plan_hash):
    """One independent private transaction; the comparison is unchanged on replay."""
    result = query([
            ("SET LOCAL statement_timeout='55s'", []),
            ("CREATE TEMP TABLE london_capture_guard(ok boolean CHECK(ok IS TRUE)) ON COMMIT DROP", []),
            ("INSERT INTO london_capture_guard SELECT EXISTS(SELECT 1 FROM result_archive_capture_approvals WHERE id=$1 AND revoked_at IS NULL AND scope='staff_only')", [part['approvalId']]),
            ("""INSERT INTO result_archive_source_captures(run_id,approval_id,provider,source_key,source_url,payload_hash,html_sha256,source_html_gzip,payload,row_count,source_check,audit,captured_at)
            VALUES($1::uuid,$2,$3,$4,$5,$6,$7,decode($8,'hex'),$9::jsonb,$10,'compared',$11::jsonb,$12::timestamptz)
            ON CONFLICT(provider,source_key,payload_hash) DO NOTHING""", [
                part['runId'], part['approvalId'], part['provider'], part['sourceKey'], part['sourceUrl'],
                part['payloadHash'], part['rawSha256'], part['rawGzip'], encoded(part['payload']), part['rowCount'],
                encoded({'batchId': BATCH, 'planHash': plan_hash, 'method': 'Raw retained rows compared with the checksum-validated CSV export; secondary evidence only.', 'identityVerified': False, 'officialResultsVerified': False}),
                part['capturedAt']]),
            ("""SELECT id,payload_hash,html_sha256,row_count,source_check,
            md5((to_jsonb(c)-'last_seen_at')::text) AS integrity_hash
            FROM result_archive_source_captures c WHERE provider=$1 AND source_key=$2 AND payload_hash=$3
            AND payload=$4::jsonb AND source_html_gzip=decode($5,'hex')
            AND captured_at=$6::timestamptz AND source_url=$7 AND approval_id=$8 AND run_id=$9::uuid""", [
                part['provider'], part['sourceKey'], part['payloadHash'], encoded(part['payload']),
                part['rawGzip'], part['capturedAt'], part['sourceUrl'], part['approvalId'], part['runId']]),
    ])[-1]
    if len(result) != 1 or result[0]['html_sha256'] != part['rawSha256'] or result[0]['row_count'] != part['rowCount'] or result[0]['source_check'] != 'compared':
        raise ValueError('Retained capture differs from compared plan')
    return {**result[0], 'provider': part['provider'], 'source_key': part['sourceKey'], 'approval_id': part['approvalId']}


def retain_captures(query, parts, receipt, save, workers=4):
    """Parallelize only private captures; publish only after every one is confirmed.

    Workers never mutate the receipt. Input-ordered map results keep checkpoints
    deterministic even when independent transactions finish in a different order.
    """
    if not 1 <= workers <= 4:
        raise ValueError('Use 1–4 independent private capture workers')
    parts = list(parts)
    evidence = {}
    receipt.update({'captures': [], 'captureWorkers': workers, 'retainedCaptures': 0, 'retainedObservations': 0})
    plan_hash = receipt['planHash']
    stopped = threading.Event()

    def retain(part):
        if stopped.is_set():
            raise concurrent.futures.CancelledError('Private capture cancelled after another failure')
        try:
            return retain_capture(query, part, plan_hash)
        except BaseException:
            stopped.set()
            raise

    executor = concurrent.futures.ThreadPoolExecutor(max_workers=workers, thread_name_prefix='london-capture')
    try:
        completed = executor.map(retain, parts)
        for index, (part, cap) in enumerate(zip(parts, completed), 1):
            evidence.update({key: cap for key in part['observationKeys']})
            receipt['captures'].append(cap)
            receipt['retainedCaptures'] = index
            receipt['retainedObservations'] = len(evidence)
            save()
            if index % 10 == 0 or index == len(parts):
                print(json.dumps({'phase': 'private_evidence', 'captures': index, 'observations': len(evidence)}), flush=True)
    except BaseException:
        stopped.set()
        # Preserve the ordered confirmed prefix. Any later completed private
        # transactions are discovered by the same exact-content check on replay.
        try:
            save()
        except Exception:
            pass
        raise
    finally:
        # No profile/publication call can follow a failure. Cancel work that has
        # not started and let in-flight private transactions finish before exit.
        executor.shutdown(wait=True, cancel_futures=True)
    return evidence


_NEW_PROFILES_SQL = """WITH incoming AS (SELECT value p FROM jsonb_array_elements($1::jsonb)), created AS (
 INSERT INTO athletes(slug,display_name,given_name,family_name,gender,city,county,country,nation,bio,source_url,profile_type,profile_visibility,profile_roles,profile_details,profile_source_checked_at)
 SELECT p#>>'{athleteDraft,slug}',p#>>'{athleteDraft,displayName}',p#>>'{athleteDraft,givenName}',p#>>'{athleteDraft,familyName}',coalesce(nullif(p#>>'{athleteDraft,gender}',''),'U'),NULL,'','',NULL,'',p#>>'{history,sourceUrl}','Athlete','public','',p#>'{athleteDraft,profileDetails}',NULL
 FROM incoming WHERE NOT EXISTS(SELECT 1 FROM athlete_source_histories h WHERE h.provider='Pace Notes' AND h.external_id=p#>>'{history,externalId}')
 ON CONFLICT(slug) DO NOTHING RETURNING id,slug
), histories AS (
 INSERT INTO athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances,published_at)
 SELECT a.id,'Pace Notes',p#>>'{history,externalId}',p#>>'{history,sourceUrl}',(p#>>'{history,capturedAt}')::timestamptz,false,ARRAY[__LONDON_YEAR__],ARRAY[__LONDON_YEAR__],p#>'{history,performances}',now()
 FROM incoming JOIN created a ON a.slug=p#>>'{athleteDraft,slug}' RETURNING athlete_id,external_id
), audits AS (
 INSERT INTO network_audit_log(action,entity_type,entity_id,after_value,note)
 SELECT 'athlete.history_admin_published','athlete_source_history','Pace Notes:'||h.external_id,
 jsonb_build_object('athleteId',h.athlete_id,'batchId',$2::text,'planHash',$3::text,'groupId',p->>'groupId','sourceCaptureIds',p->'captureIds','sourceCompared',true,'officialSourceChecked',false,'identityVerified',false,'ownerInstruction',$4::text),
 'Owner-authorized London __LONDON_YEAR__ profile; provisional unclaimed identity; retained secondary finish time; public CC BY credit; no chip/gun, placings, nationality or DOB inferred.'
 FROM histories h JOIN incoming ON h.external_id=p#>>'{history,externalId}' RETURNING id
) SELECT (SELECT count(*) FROM created)::int created,(SELECT count(*) FROM histories)::int histories,(SELECT count(*) FROM audits)::int audits"""


# Keep each history lookup tied to its incoming external ID. The barrier avoids
# stale provider statistics choosing all Pace Notes histories before the input.
_VERIFY_NEW_SQL = """WITH incoming AS (SELECT value p FROM jsonb_array_elements($1::jsonb))
 SELECT a.id,a.slug,a.display_name,h.external_id,i.athlete_number
 FROM incoming CROSS JOIN LATERAL (
 SELECT hx.* FROM athlete_source_histories hx
 WHERE hx.provider='Pace Notes' AND hx.external_id=p#>>'{history,externalId}' OFFSET 0
 ) h JOIN athletes a ON a.id=h.athlete_id AND a.slug=p#>>'{athleteDraft,slug}'
 LEFT JOIN athlete_resolved_ids i ON i.athlete_id=a.id
 WHERE a.profile_details=p#>'{athleteDraft,profileDetails}' AND a.display_name=p#>>'{athleteDraft,displayName}'
 AND a.given_name IS NOT DISTINCT FROM p#>>'{athleteDraft,givenName}' AND a.family_name IS NOT DISTINCT FROM p#>>'{athleteDraft,familyName}'
 AND a.gender=coalesce(nullif(p#>>'{athleteDraft,gender}',''),'U') AND a.profile_visibility='public' AND a.profile_type='Athlete'
 AND a.date_of_birth IS NULL AND a.nation IS NULL AND a.country='' AND a.county='' AND a.city IS NULL
 AND a.profile_source_checked_at IS NULL AND a.parent_athlete_id IS NULL AND a.club_id IS NULL
 AND a.source_url=p#>>'{history,sourceUrl}' AND a.bio='' AND a.profile_roles=''
 AND h.performances=p#>'{history,performances}' AND h.published_at IS NOT NULL AND NOT h.complete
 AND h.captured_at=(p#>>'{history,capturedAt}')::timestamptz AND h.source_url=p#>>'{history,sourceUrl}'
 AND h.years_expected=ARRAY[__LONDON_YEAR__] AND h.years_captured=ARRAY[__LONDON_YEAR__]
 AND NOT EXISTS(SELECT 1 FROM athlete_account_links l WHERE l.athlete_id=a.id)
 AND NOT EXISTS(SELECT 1 FROM results r WHERE r.athlete_id=a.id)
 AND EXISTS(SELECT 1 FROM network_audit_log l WHERE l.action='athlete.history_admin_published' AND l.entity_id='Pace Notes:'||h.external_id AND l.after_value->>'athleteId'=a.id::text)
 ORDER BY a.id"""


_LINK_EVIDENCE_SQL = """WITH incoming AS(SELECT value p FROM jsonb_array_elements($1::jsonb)), added AS (
 INSERT INTO network_audit_log(action,entity_type,entity_id,after_value,note)
 SELECT 'athlete.london__LONDON_YEAR___evidence_reused','athlete',(p->>'athleteId'),
 p||jsonb_build_object('batchId',$2::text,'planHash',$3::text,'ownerInstruction',$4::text,'identityVerified',false,'existingPerformancePreserved',true),
 'Imported observations reconciled with an existing performance. Original profile, result, history, visibility, claims and per-performance privacy hashes are unchanged.'
 FROM incoming WHERE NOT EXISTS(SELECT 1 FROM network_audit_log l WHERE l.action='athlete.london__LONDON_YEAR___evidence_reused' AND l.after_value->>'batchId'=$2 AND l.after_value->>'groupId'=p->>'groupId')
 RETURNING id
) SELECT count(*)::int linked FROM added"""


_VERIFY_LINKED_SQL = """INSERT INTO london_import_guard SELECT count(*)=jsonb_array_length($1::jsonb)
 FROM jsonb_array_elements($1::jsonb) p JOIN network_audit_log l
 ON l.action='athlete.london__LONDON_YEAR___evidence_reused' AND l.after_value->>'batchId'=$2
 AND l.after_value->>'groupId'=p->>'groupId'
 WHERE l.entity_type='athlete' AND l.entity_id=p->>'athleteId'
 AND l.after_value=p||jsonb_build_object('batchId',$2::text,'planHash',$3::text,
 'ownerInstruction',$4::text,'identityVerified',false,'existingPerformancePreserved',true)"""


def configure(context=None):
    """Bind one validated edition; transport, integrity and publication rules stay fixed."""
    global YEAR, EDITION_DATE, BATCH, INSTRUCTION, COLLECTION_FILE_ID, COLLECTION_SHA256, EDITION_CONTEXT
    global NEW_PROFILES, VERIFY_NEW, LINK_EVIDENCE, VERIFY_LINKED
    validated = context_schema.validate_context(context) if context is not None else None
    values = validated if validated is not None else _LEGACY
    planner.configure(validated)
    YEAR, EDITION_DATE, BATCH = values['year'], values['date'], values['batchId']
    INSTRUCTION = values['ownerInstruction']
    COLLECTION_FILE_ID, COLLECTION_SHA256 = values['collectionFileId'], values['collectionSha256']
    EDITION_CONTEXT = copy.deepcopy(validated)
    # The only SQL substitution is an independently validated integer edition
    # year. All source values, instructions and identity data remain parameters.
    def year_sql(template):
        return template.replace('__LONDON_YEAR__', str(YEAR))
    NEW_PROFILES, VERIFY_NEW = year_sql(_NEW_PROFILES_SQL), year_sql(_VERIFY_NEW_SQL)
    LINK_EVIDENCE, VERIFY_LINKED = year_sql(_LINK_EVIDENCE_SQL), year_sql(_VERIFY_LINKED_SQL)
    return copy.deepcopy(EDITION_CONTEXT)


def assert_plan_context(plan):
    if plan.get('editionContext') != EDITION_CONTEXT or plan.get('batchId') != BATCH:
        raise ValueError('Plan differs from the configured London edition')


def configure_from_plan(plan):
    configure(plan.get('editionContext'))
    planner.validate_plan(plan)
    assert_plan_context(plan)


def guard_statements(fingerprint_sql, fingerprint, caps, fingerprint_tables):
    tables = list(dict.fromkeys((*fingerprint_tables, 'result_archive_capture_approvals',
                                'result_archive_source_captures', 'network_audit_log')))
    if not tables or any(not re.fullmatch(r'"?[A-Za-z_][A-Za-z_0-9]*"?', table) for table in tables):
        raise ValueError('Invalid fingerprint lock table')
    return [
        ("SET LOCAL lock_timeout='8s'", []), ("SET LOCAL statement_timeout='55s'", []),
        ('LOCK TABLE ' + ','.join(tables) + ' IN SHARE ROW EXCLUSIVE MODE', []),
        ('CREATE TEMP TABLE london_import_guard(ok boolean CHECK(ok IS TRUE)) ON COMMIT DROP', []),
        ('INSERT INTO london_import_guard SELECT fingerprint=$2 FROM (' + fingerprint_sql + ') checked', [BATCH, fingerprint]),
        ("""INSERT INTO london_import_guard SELECT count(*)=jsonb_array_length($1::jsonb)
        FROM jsonb_array_elements($1::jsonb) expected JOIN result_archive_source_captures c ON c.id=(expected->>'id')::bigint
        JOIN result_archive_capture_approvals a ON a.id=c.approval_id
        WHERE c.payload_hash=expected->>'payload_hash' AND c.html_sha256=expected->>'html_sha256' AND c.row_count=(expected->>'row_count')::int
        AND md5((to_jsonb(c)-'last_seen_at')::text)=expected->>'integrity_hash'
        AND c.source_check='compared' AND c.payload->>'publication'='staff_only'
        AND a.provider=c.provider AND a.revoked_at IS NULL AND a.scope='staff_only'""", [encoded(caps)]),
    ]


def prepare_new(group, evidence, plan):
    assert_plan_context(plan)
    row = copy.deepcopy(group)
    caps = {int(evidence[key]['id']): evidence[key] for key in group['observationKeys']}
    row['captureIds'] = sorted(caps)
    details = row['athleteDraft']['profileDetails']
    details['archiveCreation'] = {
        **details.get('archiveCreation', {}), 'batchId': BATCH, 'groupId': group['groupId'],
        'approvedBy': 'Paul Browne', 'approvedAt': plan['createdAt'], 'instruction': INSTRUCTION,
        'profileIdentityVerified': False, 'sourceRowsCompared': True, 'primarySourceChecked': False,
        'captureIds': sorted(caps), 'retainedCollectionFileId': COLLECTION_FILE_ID,
    }
    for performance in row['history']['performances']:
        performance['archiveReference']['captureIds'] = sorted(caps)
        performance['archiveReference']['sourceRow'] = group['primaryObservationKey']
    if row['history']['provider'] != 'Pace Notes':
        raise ValueError('Public licence credit requires the registered Pace Notes provider')
    return row


def apply(args):
    validate_private_paths(args)
    plan = read_json(args.plan)
    configure_from_plan(plan)
    plan_hash = digest(plan)
    snapshot = read_json(args.snapshot / 'snapshot.json')
    metadata = read_json(args.snapshot / 'metadata.json')
    if metadata.get('projectId') != PROJECT or metadata.get('batchId') != BATCH:
        raise ValueError('Identity snapshot belongs to a different project or batch')
    context_digest = digest(EDITION_CONTEXT) if EDITION_CONTEXT is not None else None
    if metadata.get('editionContextDigest') != context_digest:
        raise ValueError('Identity snapshot belongs to a different London edition context')
    if planner._hash(snapshot) != plan['snapshotDigest']:
        raise ValueError('Identity snapshot changed after planning')
    snapshot_module = load('london_apply_snapshot', ROOT / 'snapshot-london-profiles.py')
    snapshot_module.configure(EDITION_CONTEXT)
    fingerprint_sql = snapshot_module.fingerprint_sql()
    # A resumed review compute may need to load the directory into its cache.
    # This transport budget also covers upload time; mutation statements retain
    # their separate 55-second database limit and the unchanged freshness guards.
    cfg, query = base.connection(args.connection, args.confirm_branch, timeout=180)
    if cfg['projectId'] != PROJECT or (args.review and cfg['branchId'] == PRODUCTION) or (not args.review and cfg['branchId'] != PRODUCTION):
        raise ValueError('Explicit review/production target does not match connection')
    if not args.review:
        proof = read_json(args.rehearsal_receipt) if args.rehearsal_receipt else {}
        if not (proof.get('planHash') == plan_hash and proof.get('completed') is True
                and proof.get('replayVerified') is True and proof.get('projectId') == PROJECT
                and proof.get('snapshotFingerprint') == metadata['fingerprint']
                and proof.get('editionContextDigest') == context_digest
                and proof.get('existingDataFingerprintUnchanged') is True
                and proof.get('branchId') and proof.get('branchId') != PRODUCTION
                and proof.get('mode') == 'review'):
            raise ValueError('Production requires a successful same-plan rehearsal and replay receipt')
        if not args.credit_deployment or not re.fullmatch(r'[0-9a-f]{40}', args.credit_deployment):
            raise ValueError('Record the observed production deployment commit providing the public licence credit')
    current = query([(fingerprint_sql, [BATCH])], True)[0][0]['fingerprint']
    if current != metadata['fingerprint']:
        raise ValueError('Live identity data changed; take a new snapshot and re-review the plan')
    linked_limit = getattr(args, 'review_linked_limit', 100)
    chosen, selected = select_groups(plan, args.review, args.limit, linked_limit)
    receipt = {'batchId': BATCH, 'projectId': PROJECT, 'branchId': cfg['branchId'], 'mode': 'review' if args.review else 'production',
               'planHash': plan_hash, 'snapshotFingerprint': metadata['fingerprint'], 'editionContextDigest': context_digest, 'planSummary': plan['summary'],
               'selectedGroups': dict(collections.Counter(g['disposition'] for g in chosen)), 'reviewNewLimit': args.limit if args.review else None,
               'reviewLinkedLimit': linked_limit if args.review else None,
               'startedAt': dt.datetime.now(dt.timezone.utc).isoformat(), 'creditDeployment': args.credit_deployment,
               'created': 0, 'reused': 0, 'alreadyPresent': 0, 'profiles': [], 'reusedGroups': [], 'completed': False}
    save = lambda: dump(args.receipt, receipt)
    save()
    parts = list(capture_parts(plan, selected))
    setup(query, plan, parts)
    evidence = retain_captures(query, parts, receipt, save)
    for kind in ('new', 'linked'):
        selected_groups = [g for g in chosen if g['disposition'] == kind]
        for offset in range(0, len(selected_groups), args.batch_size):
            groups = selected_groups[offset:offset + args.batch_size]
            rows = [prepare_new(g, evidence, plan) if kind == 'new' else {
                'groupId': g['groupId'], 'athleteId': g['athleteId'], 'resultIds': g['resultIds'],
                'existingMatches': g['existingMatches'], 'sourceKeys': g['sourceKeys'], 'sourceUrls': g['sourceUrls'],
                'captureIds': sorted({int(evidence[k]['id']) for k in g['observationKeys']}),
            } for g in groups]
            caps = {int(evidence[k]['id']): evidence[k] for g in groups for k in g['observationKeys']}
            payload = encoded(rows)
            statements = guard_statements(fingerprint_sql, metadata['fingerprint'], list(caps.values()), snapshot_module.FINGERPRINT_TABLES)
            if kind == 'new':
                statements.extend([
                    (NEW_PROFILES, [payload, BATCH, plan_hash, INSTRUCTION]),
                    ('INSERT INTO london_import_guard SELECT count(*)=jsonb_array_length($1::jsonb) FROM (' + VERIFY_NEW + ') verified', [payload]),
                    (VERIFY_NEW, [payload]),
                ])
                result = query(statements)
                inserted, verified = result[-3][0], result[-1]
                if inserted['created'] != inserted['histories'] or inserted['created'] != inserted['audits'] or len(verified) != len(rows):
                    raise ValueError('Unexpected profile transaction receipt')
                receipt['created'] += inserted['created']
                receipt['alreadyPresent'] += len(rows) - inserted['created']
                receipt['profiles'].extend(verified)
            else:
                statements.extend([
                    (LINK_EVIDENCE, [payload, BATCH, plan_hash, INSTRUCTION]),
                    (VERIFY_LINKED, [payload, BATCH, plan_hash, INSTRUCTION]),
                ])
                result = query(statements)
                receipt['reused'] += result[-2][0]['linked']
                receipt['reusedGroups'].extend(rows)
            save()
            print(json.dumps({'phase': 'profiles' if kind == 'new' else 'existing_performance_evidence', 'created': receipt['created'], 'reused': receipt['reused'], 'alreadyPresent': receipt['alreadyPresent']}), flush=True)
            if args.review:
                replay = query(statements)
                values = replay[-3][0] if kind == 'new' else replay[-2][0]
                if any(values.values()):
                    raise ValueError('Idempotence failure: an identical replay inserted data')
    ending = query([(fingerprint_sql, [BATCH])], True)[0][0]['fingerprint']
    if ending != metadata['fingerprint']:
        raise ValueError('Existing screened data changed during the import; inspect before completion')
    receipt.update({'completed': True, 'replayVerified': bool(args.review), 'finishedAt': dt.datetime.now(dt.timezone.utc).isoformat(),
                    'retainedObservations': len(evidence), 'newProfileResults': len(receipt['profiles']), 'existingDataFingerprintUnchanged': True})
    for run in sorted({p['runId'] for p in parts}):
        query([("UPDATE result_archive_capture_runs SET status='completed',summary=$2::jsonb,updated_at=now() WHERE id=$1::uuid", [run, encoded({key: value for key, value in receipt.items() if key not in ('profiles', 'reusedGroups', 'captures')})])])
    save()
    print(json.dumps({key: value for key, value in receipt.items() if key not in ('profiles', 'reusedGroups', 'captures', 'planSummary')}, ensure_ascii=False), flush=True)


configure()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ('connection', 'plan', 'snapshot', 'receipt'):
        parser.add_argument('--' + name, type=Path, required=True)
    parser.add_argument('--confirm-branch', required=True)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--review', action='store_true')
    mode.add_argument('--publish', action='store_true')
    parser.add_argument('--rehearsal-receipt', type=Path)
    parser.add_argument('--credit-deployment')
    parser.add_argument('--limit', type=int, default=0)
    parser.add_argument('--review-linked-limit', type=int, default=100)
    parser.add_argument('--batch-size', type=int, default=1000)
    args = parser.parse_args()
    if not 1 <= args.batch_size <= 1000 or not 1 <= args.review_linked_limit <= 1000 or args.limit < 0 or (args.limit and not args.review) or (args.review_linked_limit != 100 and not args.review):
        parser.error('Use batches/review-linked limits of 1–1000; selection limits are allowed only for review')
    apply(args)
