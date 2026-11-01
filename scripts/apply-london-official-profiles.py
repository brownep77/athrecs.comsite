"""Owner-authorized London edition profile import from the official results website.

Adapted from apply-london-profiles.py (same private captures, freshness locks,
rehearsal-before-production rule, bounded idempotent transactions and audit).
Differences: one official observation per performance, provider
'TCS London Marathon results', source_verified result rows with chip time,
separate overall/gender/category places, bib, half split and the source-reported
nationality (with provenance). Profiles remain provisional, unclaimed public
profiles; athlete identity is never verified by this import, existing athletes
and performances are never updated, and no canonical results are created.

Plans, credentials, configs, snapshots and receipts belong outside the repository.
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


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


base = load('london_official_apply_base', ROOT / 'create-private-archive-profiles.py')
snapshotter = load('london_official_apply_snapshot', ROOT / 'snapshot-london-official-profiles.py')
# One planner instance: configuring the snapshot binding also configures the planner.
planner = snapshotter.plan
PROJECT = snapshotter.PROJECT
PRODUCTION = snapshotter.PRODUCTION_BRANCH
PROVIDER = planner.PROVIDER_NAME

YEAR = EDITION_DATE = BATCH = INSTRUCTION = SOURCE_SHA256 = EDITION_CONTEXT = None
NEW_PROFILES = VERIFY_NEW = LINK_EVIDENCE = VERIFY_LINKED = APPEND_HISTORY = VERIFY_APPEND = None


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
    chosen = [g for g in plan['groups'] if g['disposition'] in ('new', 'linked', 'evidence_linked')]
    if not review or not limit:
        return chosen, None
    chosen = ([g for g in chosen if g['disposition'] == 'new'][:limit]
              + [g for g in chosen if g['disposition'] == 'linked'][:linked_limit]
              + [g for g in chosen if g['disposition'] == 'evidence_linked'][:linked_limit])
    held = [g for g in plan['groups'] if g['disposition'] == 'held'][:50]
    return chosen, {key for g in [*chosen, *held] for key in g['observationKeys']}


def captured_row(observation, group):
    """Headings consumed by the staff capture browser and participant search."""
    o = observation
    original = {
        'Original Name': o['originalName'], 'Finish Time (net)': o['originalFinishTime'],
        'Half': o['original'].get('half') or '', 'Event': o['sourceScope'] + ' · ' + o['eventLabel'],
        'Overall Place': str(o['places']['overall'] or ''), 'Gender Place': str(o['places']['gender'] or ''),
        'Category Place': str(o['places']['category'] or ''), 'Nationality': o['nationality'] or '',
        'Source Result ID': o['sourceResultId'], 'Source URL': o['sourceUrl'],
        'Publication': o['publicationUrl'], 'Captured At': o['capturedAt'],
        'Timing Basis': 'Net (chip) time published by the official results site',
        'Import Decision': group['disposition'], 'Review Reasons': '; '.join(group['reasons']),
    }
    return {
        'name': o['name'], 'bib': o['bib'] or '', 'club': o['club'] or '',
        'gender': o.get('gender') or '', 'category': o.get('category') or '',
        'distanceLabel': o['discipline'], 'date': EDITION_DATE, 'status': 'finished',
        'tableKey': o['sourceScope'], 'sourceRow': o['sourceKey'],
        'sourceKey': o['sourceKey'], 'sourceUrl': o['sourceUrl'],
        'finishTime': o['finishTime'], 'finishSeconds': o['finishSeconds'],
        'chipSeconds': o['finishSeconds'], 'gunSeconds': None,
        'original': original, 'sourceObservation': o,
        'importDecision': {key: group[key] for key in (
            'groupId', 'disposition', 'reasons', 'existingCandidates',
            'existingCandidateCount', 'existingMatches', 'sourceNameCollisionWitnesses'
        ) if key in group},
    }


def capture_parts(plan, selected=None):
    assert_plan_context(plan)
    groups = {key: group for group in plan['groups'] for key in group['observationKeys']}
    observations = [o for o in plan['observations'] if selected is None or o['observationKey'] in selected]
    observations.sort(key=lambda o: (groups[o['observationKey']]['groupId'], o['observationKey']))
    for offset in range(0, len(observations), 500):
        part = observations[offset:offset + 500]
        rows = [captured_row(o, groups[o['observationKey']]) for o in part]
        source_key = f'london-official-{YEAR}:rows-' + digest([o['sourceKey'] for o in part])[:24]
        payload = {
            'format': 'london-official-results-v1', 'contentType': 'application/json',
            'publication': 'staff_only', 'batchId': BATCH,
            'index': {'name': f'London Marathon {YEAR}', 'date': EDITION_DATE, 'location': 'London'},
            'provider': PROVIDER, 'rows': rows,
            'retainedSource': {'file': EDITION_CONTEXT['sourceFile'], 'sha256': SOURCE_SHA256},
            'inputDigest': plan['inputDigest'],
            'qualification': 'Rows captured from the official results website and mapped by column heading. Result rows are source verified; athlete identities are not.',
        }
        raw = encoded([o['original'] for o in part]).encode()
        yield {
            'providerKey': planner.OFFICIAL, 'provider': PROVIDER, 'sourceKey': source_key,
            'sourceUrl': part[0]['publicationUrl'], 'payload': payload, 'payloadHash': digest(payload),
            'rawSha256': hashlib.sha256(raw).hexdigest(), 'rawGzip': gzip.compress(raw, mtime=0).hex(),
            'capturedAt': max(o['capturedAt'] for o in part),
            'observationKeys': [o['observationKey'] for o in part], 'rowCount': len(part),
        }


def setup(query, plan, parts):
    if not parts:
        return
    approval = BATCH + '-' + planner.OFFICIAL + '-owner'
    run = str(uuid.uuid5(uuid.NAMESPACE_URL, 'https://athrecs.com/imports/' + approval))
    evidence = {
        'requestedBy': 'Paul Browne', 'instruction': INSTRUCTION,
        'instructionDate': EDITION_CONTEXT['instructionDate'],
        'reviewedAt': plan['createdAt'], 'batchId': BATCH,
        'privateCaptureAuthorized': True, 'newOfficialSourceProfilesAuthorized': True,
        'sourceVerification': 'official_primary_source',
        'sourceAcceptance': 'Owner instruction, 15 October 2026: results.tcslondonmarathon.com is an accepted primary verification source.',
        'sourceAttribution': plan['sourceAttribution'],
        'retainedSource': {'file': EDITION_CONTEXT['sourceFile'], 'sha256': SOURCE_SHA256},
    }
    query([
        ("INSERT INTO result_archive_capture_approvals(id,provider,approved_by,approval_basis,scope,evidence) VALUES($1,$2,'Paul Browne','owner_private_import','staff_only',$3::jsonb) ON CONFLICT(id) DO NOTHING", [approval, PROVIDER, encoded(evidence)]),
        ("INSERT INTO result_archive_capture_runs(id,approval_id,provider,inventory,status) VALUES($1::uuid,$2,$3,$4::jsonb,'processing') ON CONFLICT(id) DO NOTHING", [run, approval, PROVIDER, encoded([{'sourceKey': p['sourceKey'], 'sourceUrl': p['sourceUrl']} for p in parts])]),
    ])
    for part in parts:
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
            encoded({'batchId': BATCH, 'planHash': plan_hash, 'method': 'Official listing rows retained with their checksum-pinned year file; result rows source verified.', 'identityVerified': False, 'officialResultsVerified': True}),
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
    """Parallelize only private captures; publish only after every one is confirmed."""
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

    executor = concurrent.futures.ThreadPoolExecutor(max_workers=workers, thread_name_prefix='london-official-capture')
    try:
        for index, (part, cap) in enumerate(zip(parts, executor.map(retain, parts)), 1):
            evidence.update({key: cap for key in part['observationKeys']})
            receipt['captures'].append(cap)
            receipt['retainedCaptures'] = index
            receipt['retainedObservations'] = len(evidence)
            save()
            if index % 10 == 0 or index == len(parts):
                print(json.dumps({'phase': 'private_evidence', 'captures': index, 'observations': len(evidence)}), flush=True)
    except BaseException:
        stopped.set()
        try:
            save()
        except Exception:
            pass
        raise
    finally:
        executor.shutdown(wait=True, cancel_futures=True)
    return evidence


_NEW_PROFILES_SQL = """WITH incoming AS (SELECT value p FROM jsonb_array_elements($1::jsonb)), created AS (
 INSERT INTO athletes(slug,display_name,given_name,family_name,gender,city,county,country,nation,bio,source_url,profile_type,profile_visibility,profile_roles,profile_details,profile_source_checked_at)
 SELECT p#>>'{athleteDraft,slug}',p#>>'{athleteDraft,displayName}',p#>>'{athleteDraft,givenName}',p#>>'{athleteDraft,familyName}',coalesce(nullif(p#>>'{athleteDraft,gender}',''),'U'),NULL,'','',nullif(p#>>'{athleteDraft,nationality}',''),'',p#>>'{history,sourceUrl}','Athlete','public','',p#>'{athleteDraft,profileDetails}',NULL
 FROM incoming WHERE NOT EXISTS(SELECT 1 FROM athlete_source_histories h WHERE h.provider='__PROVIDER__' AND h.external_id=p#>>'{history,externalId}')
 ON CONFLICT(slug) DO NOTHING RETURNING id,slug
), histories AS (
 INSERT INTO athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances,published_at)
 SELECT a.id,'__PROVIDER__',p#>>'{history,externalId}',p#>>'{history,sourceUrl}',(p#>>'{history,capturedAt}')::timestamptz,false,ARRAY[__LONDON_YEAR__],ARRAY[__LONDON_YEAR__],p#>'{history,performances}',now()
 FROM incoming JOIN created a ON a.slug=p#>>'{athleteDraft,slug}' RETURNING athlete_id,external_id
), audits AS (
 INSERT INTO network_audit_log(action,entity_type,entity_id,after_value,note)
 SELECT 'athlete.history_admin_published','athlete_source_history','__PROVIDER__:'||h.external_id,
 jsonb_build_object('athleteId',h.athlete_id,'batchId',$2::text,'planHash',$3::text,'groupId',p->>'groupId','sourceCaptureIds',p->'captureIds','sourceCompared',true,'officialSourceChecked',true,'identityVerified',false,'ownerInstruction',$4::text),
 'Owner-authorized London __LONDON_YEAR__ profile from the official results website; provisional unclaimed identity; source-verified result row with net (chip) time, separate places and source-reported nationality; no DOB inferred.'
 FROM histories h JOIN incoming ON h.external_id=p#>>'{history,externalId}' RETURNING id
) SELECT (SELECT count(*) FROM created)::int created,(SELECT count(*) FROM histories)::int histories,(SELECT count(*) FROM audits)::int audits"""


_VERIFY_NEW_SQL = """WITH incoming AS (SELECT value p FROM jsonb_array_elements($1::jsonb))
 SELECT a.id,a.slug,a.display_name,h.external_id,i.athlete_number
 FROM incoming CROSS JOIN LATERAL (
 SELECT hx.* FROM athlete_source_histories hx
 WHERE hx.provider='__PROVIDER__' AND hx.external_id=p#>>'{history,externalId}' OFFSET 0
 ) h JOIN athletes a ON a.id=h.athlete_id AND a.slug=p#>>'{athleteDraft,slug}'
 LEFT JOIN athlete_resolved_ids i ON i.athlete_id=a.id
 WHERE a.profile_details=p#>'{athleteDraft,profileDetails}' AND a.display_name=p#>>'{athleteDraft,displayName}'
 AND a.given_name IS NOT DISTINCT FROM p#>>'{athleteDraft,givenName}' AND a.family_name IS NOT DISTINCT FROM p#>>'{athleteDraft,familyName}'
 AND a.gender=coalesce(nullif(p#>>'{athleteDraft,gender}',''),'U') AND a.profile_visibility='public' AND a.profile_type='Athlete'
 AND a.date_of_birth IS NULL AND a.nation IS NOT DISTINCT FROM nullif(p#>>'{athleteDraft,nationality}','') AND a.country='' AND a.county='' AND a.city IS NULL
 AND a.profile_source_checked_at IS NULL AND a.parent_athlete_id IS NULL AND a.club_id IS NULL
 AND a.source_url=p#>>'{history,sourceUrl}' AND a.bio='' AND a.profile_roles=''
 AND h.performances=p#>'{history,performances}' AND h.published_at IS NOT NULL AND NOT h.complete
 AND h.captured_at=(p#>>'{history,capturedAt}')::timestamptz AND h.source_url=p#>>'{history,sourceUrl}'
 AND h.years_expected=ARRAY[__LONDON_YEAR__] AND h.years_captured=ARRAY[__LONDON_YEAR__]
 AND NOT EXISTS(SELECT 1 FROM athlete_account_links l WHERE l.athlete_id=a.id)
 AND NOT EXISTS(SELECT 1 FROM results r WHERE r.athlete_id=a.id)
 AND EXISTS(SELECT 1 FROM network_audit_log l WHERE l.action='athlete.history_admin_published' AND l.entity_id='__PROVIDER__:'||h.external_id AND l.after_value->>'athleteId'=a.id::text)
 ORDER BY a.id"""


_LINK_EVIDENCE_SQL = """WITH incoming AS(SELECT value p FROM jsonb_array_elements($1::jsonb)), added AS (
 INSERT INTO network_audit_log(action,entity_type,entity_id,after_value,note)
 SELECT 'athlete.london_official__LONDON_YEAR___evidence_reused','athlete',(p->>'athleteId'),
 p||jsonb_build_object('batchId',$2::text,'planHash',$3::text,'ownerInstruction',$4::text,'identityVerified',false,'existingPerformancePreserved',true),
 'Official London result row reconciled with an existing performance by its exact result locator. Original profile, result, history, visibility, claims and per-performance privacy hashes are unchanged.'
 FROM incoming WHERE NOT EXISTS(SELECT 1 FROM network_audit_log l WHERE l.action='athlete.london_official__LONDON_YEAR___evidence_reused' AND l.after_value->>'batchId'=$2 AND l.after_value->>'groupId'=p->>'groupId')
 RETURNING id
) SELECT count(*)::int linked FROM added"""


_VERIFY_LINKED_SQL = """INSERT INTO london_import_guard SELECT count(*)=jsonb_array_length($1::jsonb)
 FROM jsonb_array_elements($1::jsonb) p JOIN network_audit_log l
 ON l.action='athlete.london_official__LONDON_YEAR___evidence_reused' AND l.after_value->>'batchId'=$2
 AND l.after_value->>'groupId'=p->>'groupId'
 WHERE l.entity_type='athlete' AND l.entity_id=p->>'athleteId'
 AND l.after_value=p||jsonb_build_object('batchId',$2::text,'planHash',$3::text,
 'ownerInstruction',$4::text,'identityVerified',false,'existingPerformancePreserved',true)"""


_APPEND_HISTORY_SQL = """WITH incoming AS (SELECT value p FROM jsonb_array_elements($1::jsonb)), added AS (
 INSERT INTO athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances,published_at)
 SELECT a.id,'__PROVIDER__',p#>>'{history,externalId}',p#>>'{history,sourceUrl}',(p#>>'{history,capturedAt}')::timestamptz,false,ARRAY[__LONDON_YEAR__],ARRAY[__LONDON_YEAR__],p#>'{history,performances}',now()
 FROM incoming JOIN athletes a ON a.id=(p->>'athleteId')::int
 WHERE a.profile_visibility='public' AND a.profile_type='Athlete' AND a.parent_athlete_id IS NULL
 AND NOT EXISTS(SELECT 1 FROM athlete_account_links l WHERE l.athlete_id=a.id)
 AND NOT EXISTS(SELECT 1 FROM athlete_source_histories h WHERE h.provider='__PROVIDER__' AND h.external_id=p#>>'{history,externalId}')
 RETURNING athlete_id,external_id
), audits AS (
 INSERT INTO network_audit_log(action,entity_type,entity_id,after_value,note)
 SELECT 'athlete.london_official__LONDON_YEAR___evidence_history_appended','athlete_source_history','__PROVIDER__:'||h.external_id,
 jsonb_build_object('athleteId',h.athlete_id,'batchId',$2::text,'planHash',$3::text,'groupId',p->>'groupId','sourceCaptureIds',p->'captureIds',
 'identityEvidence',p->'identityEvidence','identityVerified',false,'ownerInstruction',$4::text,'existingProfileFieldsUnchanged',true),
 'Official London result appended to an existing athlete on multi-signal evidence (owner instruction, 1 November 2026). Identity remains unverified; no other profile field, result, claim or privacy choice changed.'
 FROM added h JOIN incoming ON h.external_id=p#>>'{history,externalId}' RETURNING id
) SELECT (SELECT count(*) FROM added)::int appended,(SELECT count(*) FROM audits)::int audits"""

_VERIFY_APPEND_SQL = """INSERT INTO london_import_guard SELECT count(*)=jsonb_array_length($1::jsonb)
 FROM jsonb_array_elements($1::jsonb) p JOIN athlete_source_histories h
 ON h.provider='__PROVIDER__' AND h.external_id=p#>>'{history,externalId}'
 WHERE h.athlete_id=(p->>'athleteId')::int AND h.performances=p#>'{history,performances}'
 AND h.captured_at=(p#>>'{history,capturedAt}')::timestamptz AND h.published_at IS NOT NULL
 AND EXISTS(SELECT 1 FROM network_audit_log l WHERE l.action='athlete.london_official__LONDON_YEAR___evidence_history_appended'
 AND l.entity_id='__PROVIDER__:'||h.external_id AND l.after_value->>'athleteId'=h.athlete_id::text)"""


def configure(context):
    """Bind one validated official edition; transport, integrity and publication rules stay fixed."""
    global YEAR, EDITION_DATE, BATCH, INSTRUCTION, SOURCE_SHA256, EDITION_CONTEXT
    global NEW_PROFILES, VERIFY_NEW, LINK_EVIDENCE, VERIFY_LINKED
    validated = snapshotter.configure(context)
    YEAR, EDITION_DATE, BATCH = validated['year'], validated['date'], validated['batchId']
    INSTRUCTION, SOURCE_SHA256 = validated['ownerInstruction'], validated['sourceSha256']
    EDITION_CONTEXT = copy.deepcopy(validated)

    # Substitutions are only the validated integer year and the fixed provider constant.
    def bind(template):
        return template.replace('__LONDON_YEAR__', str(YEAR)).replace('__PROVIDER__', PROVIDER)
    global APPEND_HISTORY, VERIFY_APPEND
    NEW_PROFILES, VERIFY_NEW = bind(_NEW_PROFILES_SQL), bind(_VERIFY_NEW_SQL)
    APPEND_HISTORY, VERIFY_APPEND = bind(_APPEND_HISTORY_SQL), bind(_VERIFY_APPEND_SQL)
    LINK_EVIDENCE, VERIFY_LINKED = bind(_LINK_EVIDENCE_SQL), bind(_VERIFY_LINKED_SQL)
    return copy.deepcopy(EDITION_CONTEXT)


def assert_plan_context(plan):
    if EDITION_CONTEXT is None or plan.get('editionContext') != EDITION_CONTEXT or plan.get('batchId') != BATCH:
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
        'profileIdentityVerified': False, 'sourceRowsCompared': True, 'primarySourceChecked': True,
        'captureIds': sorted(caps), 'retainedSourceSha256': SOURCE_SHA256,
    }
    if (group.get('identityEvidence') or {}).get('decision') == 'distinct_person':
        details['archiveCreation']['distinctPersonDecision'] = {
            'policyVersion': group['identityEvidence']['policyVersion'],
            'basis': group['identityEvidence']['decisionBasis'],
            'excludedCandidates': [{'athleteId': c['athleteId'], 'hardContradictions': c['hardContradictions']}
                                   for c in group['identityEvidence']['rankedCandidates']],
        }
    for performance in row['history']['performances']:
        performance['archiveReference']['captureIds'] = sorted(caps)
        performance['archiveReference']['sourceRow'] = group['primaryObservationKey']
    if row['history']['provider'] != PROVIDER:
        raise ValueError('Unexpected history provider')
    return row


def prepare_append(group, evidence, plan):
    """An evidence-linked group: one official history appended to the chosen existing athlete."""
    assert_plan_context(plan)
    ev = group['identityEvidence']
    if group['disposition'] != 'evidence_linked' or ev.get('decision') != 'append_history' or str(group['athleteId']) != str(ev['chosenAthleteId']):
        raise ValueError('Only an evidence-linked group can append a history')
    row = {'groupId': group['groupId'], 'athleteId': int(group['athleteId']), 'history': copy.deepcopy(group['history'])}
    caps = sorted({int(evidence[k]['id']) for k in group['observationKeys']})
    row['captureIds'] = caps
    chosen = next(c for c in ev['rankedCandidates'] if c['athleteId'] == str(ev['chosenAthleteId']))
    row['identityEvidence'] = {'policyVersion': ev['policyVersion'], 'score': chosen['score'], 'breakdown': chosen['breakdown'],
                               'signals': chosen['signals'], 'decisionBasis': ev['decisionBasis'], 'chainId': ev.get('chainId'),
                               'otherCandidates': [{'athleteId': c['athleteId'], 'hardContradictions': c['hardContradictions']}
                                                   for c in ev['rankedCandidates'] if c['athleteId'] != chosen['athleteId']]}
    for performance in row['history']['performances']:
        performance['archiveReference']['captureIds'] = caps
        performance['archiveReference']['sourceRow'] = group['primaryObservationKey']
        performance['archiveReference']['identityBasis'] = 'Appended on multi-signal evidence; identity not verified.'
    if row['history']['provider'] != PROVIDER:
        raise ValueError('Unexpected history provider')
    return row



def _retrying(query, attempts=6):
    """Retry dropped HTTP connections. Every write here is replay-safe (ON CONFLICT /
    NOT EXISTS guards and post-write verification), so a lost response is re-sent."""
    import http.client, time, urllib.error
    def wrapped(statements, readonly=False):
        delay = 5
        for attempt in range(attempts):
            try:
                return query(statements, readonly)
            except (ConnectionError, http.client.RemoteDisconnected, urllib.error.URLError, TimeoutError) as exc:
                if attempt == attempts - 1:
                    raise
                print(json.dumps({'phase': 'retry', 'attempt': attempt + 1, 'error': type(exc).__name__}), flush=True)
                time.sleep(delay); delay = min(delay * 2, 60)
    return wrapped

def apply(args):
    validate_private_paths(args)
    plan = read_json(args.plan)
    configure_from_plan(plan)
    plan_hash = digest(plan)
    snapshot = read_json(args.snapshot / 'snapshot.json')
    metadata = read_json(args.snapshot / 'metadata.json')
    if metadata.get('projectId') != PROJECT or metadata.get('batchId') != BATCH:
        raise ValueError('Identity snapshot belongs to a different project or batch')
    context_digest = planner._hash(EDITION_CONTEXT)
    if metadata.get('editionContextDigest') != context_digest:
        raise ValueError('Identity snapshot belongs to a different London edition context')
    if planner._hash(snapshot) != plan['snapshotDigest']:
        raise ValueError('Identity snapshot changed after planning')
    fingerprint_sql = snapshotter.fingerprint_sql()
    cfg, query = base.connection(args.connection, args.confirm_branch, timeout=180)
    query = _retrying(query)
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
    current = query([(fingerprint_sql, [BATCH])], True)[0][0]['fingerprint']
    if current != metadata['fingerprint']:
        raise ValueError('Live identity data changed; take a new snapshot and re-review the plan')
    linked_limit = getattr(args, 'review_linked_limit', 100)
    chosen, selected = select_groups(plan, args.review, args.limit, linked_limit)
    receipt = {'batchId': BATCH, 'projectId': PROJECT, 'branchId': cfg['branchId'], 'mode': 'review' if args.review else 'production',
               'planHash': plan_hash, 'snapshotFingerprint': metadata['fingerprint'], 'editionContextDigest': context_digest, 'planSummary': plan['summary'],
               'selectedGroups': dict(collections.Counter(g['disposition'] for g in chosen)), 'reviewNewLimit': args.limit if args.review else None,
               'reviewLinkedLimit': linked_limit if args.review else None,
               'startedAt': dt.datetime.now(dt.timezone.utc).isoformat(),
               'created': 0, 'reused': 0, 'alreadyPresent': 0, 'profiles': [], 'reusedGroups': [], 'completed': False}
    save = lambda: dump(args.receipt, receipt)
    save()
    parts = list(capture_parts(plan, selected))
    setup(query, plan, parts)
    evidence = retain_captures(query, parts, receipt, save, workers=int(os.environ.get('LONDON_CAPTURE_WORKERS', '4')))
    for kind in ('new', 'linked', 'evidence_linked'):
        selected_groups = [g for g in chosen if g['disposition'] == kind]
        for offset in range(0, len(selected_groups), args.batch_size):
            groups = selected_groups[offset:offset + args.batch_size]
            rows = [prepare_new(g, evidence, plan) if kind == 'new' else prepare_append(g, evidence, plan) if kind == 'evidence_linked' else {
                'groupId': g['groupId'], 'athleteId': g['athleteId'], 'resultIds': g['resultIds'],
                'existingMatches': g['existingMatches'], 'sourceKeys': g['sourceKeys'], 'sourceUrls': g['sourceUrls'],
                'captureIds': sorted({int(evidence[k]['id']) for k in g['observationKeys']}),
            } for g in groups]
            caps = {int(evidence[k]['id']): evidence[k] for g in groups for k in g['observationKeys']}
            payload = encoded(rows)
            statements = guard_statements(fingerprint_sql, metadata['fingerprint'], list(caps.values()), snapshotter.FINGERPRINT_TABLES)
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
            elif kind == 'evidence_linked':
                statements.extend([
                    (APPEND_HISTORY, [payload, BATCH, plan_hash, INSTRUCTION]),
                    (VERIFY_APPEND, [payload]),
                ])
                result = query(statements)
                receipt['evidenceAppended'] = receipt.get('evidenceAppended', 0) + result[-2][0]['appended']
                receipt.setdefault('appendedGroups', []).extend({'groupId': r['groupId'], 'athleteId': r['athleteId']} for r in rows)
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


def plan_command(args):
    """Build the immutable plan from the private source folder and an unchanged snapshot."""
    for path in (args.edition_config, args.source, args.snapshot, args.output):
        if path.resolve().is_relative_to(ROOT.parent):
            raise ValueError('Private inputs and plans must remain outside the repository')
    context = configure(json.loads(args.edition_config.read_text(encoding='utf-8')))
    snapshot = read_json(args.snapshot / 'snapshot.json')
    observations = planner.load_sources(args.source)
    for path in (args.candidate_evidence, args.chains):
        if path is not None and path.resolve().is_relative_to(ROOT.parent):
            raise ValueError('Private evidence files must remain outside the repository')
    candidate_evidence = read_json(args.candidate_evidence) if args.candidate_evidence else None
    chains = read_json(args.chains) if args.chains else None
    plan = planner.build_plan(observations, snapshot, context['edition'], context['batchId'],
                              dt.datetime.now(dt.timezone.utc).isoformat(),
                              candidate_evidence=candidate_evidence, chains=chains)
    dump(args.output, plan)
    print(json.dumps(plan['summary'], ensure_ascii=False), flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    p = sub.add_parser('plan')
    for name in ('edition-config', 'source', 'snapshot', 'output'):
        p.add_argument('--' + name, type=Path, required=True)
    p.add_argument('--candidate-evidence', type=Path, help='read-only candidate facts (snapshot --candidate-evidence)')
    p.add_argument('--chains', type=Path, help='private cross-year chain index (snapshot --build-chains)')
    a = sub.add_parser('apply')
    for name in ('connection', 'plan', 'snapshot', 'receipt'):
        a.add_argument('--' + name, type=Path, required=True)
    a.add_argument('--confirm-branch', required=True)
    mode = a.add_mutually_exclusive_group(required=True)
    mode.add_argument('--review', action='store_true')
    mode.add_argument('--publish', action='store_true')
    a.add_argument('--rehearsal-receipt', type=Path)
    a.add_argument('--limit', type=int, default=0)
    a.add_argument('--review-linked-limit', type=int, default=100)
    a.add_argument('--batch-size', type=int, default=1000)
    args = parser.parse_args()
    if args.command == 'plan':
        plan_command(args)
    else:
        if not 1 <= args.batch_size <= 1000 or not 1 <= args.review_linked_limit <= 1000 or args.limit < 0 or (args.limit and not args.review) or (args.review_linked_limit != 100 and not args.review):
            parser.error('Use batches/review-linked limits of 1–1000; selection limits are allowed only for review')
        apply(args)
