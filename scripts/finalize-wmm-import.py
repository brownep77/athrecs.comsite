"""Verify completed WMM workers and write the owner's import audit.

Run only after every disjoint production partition has completed. Credentials
remain outside the repository and never enter the report or review archive.
"""
import argparse, collections, datetime, gzip, hashlib, html, importlib.util, json, pathlib, zipfile

ROOT = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('wmm_apply', ROOT/'apply-wmm-profiles.py')
wmm = importlib.util.module_from_spec(spec); spec.loader.exec_module(wmm)

def dump(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2))

def main(work, output, edition=8, partitions=3, connection=None):
    wmm.configure(edition)
    prefix='WMM' if edition==8 else f'WMM-edition{edition}'
    receipts = [json.loads((work/f'production-{n}.json').read_text()) for n in range(partitions)]
    if not all(r.get('reviewLimited') is False and r['branchId'] == wmm.PROD and r['batchId'] == wmm.BATCH for r in receipts):
        raise ValueError('All production partitions must finish first')
    plan = json.loads((work/'plans/summary.json').read_text())
    manifest = json.loads((work/'validated-plan-manifest.json').read_text())
    counts = collections.Counter()
    for receipt in receipts: counts.update(receipt['counts'])
    fresh = [h for receipt in receipts for h in receipt['newHolds']]
    if len({h['sourceAthleteId'] for h in fresh}) != len(fresh): raise ValueError('Repeated fresh hold')
    if counts['newly_held'] != len(fresh): raise ValueError('Hold receipt mismatch')
    if counts['captured_pages'] != len(manifest['sha256']): raise ValueError('Incomplete captured pages')
    if counts['created'] + counts['previously_imported'] + len(fresh) != plan['summary']['eligible_profiles']:
        raise ValueError('Eligible source IDs are not fully accounted for')
    cfg, query = wmm.base.connection(connection or work/'connection.json', wmm.PROD)
    if cfg['projectId'] != wmm.PROJECT: raise ValueError('Wrong project')
    scope = "FROM athletes a JOIN athlete_source_histories h ON h.athlete_id=a.id WHERE a.profile_details#>>'{archiveCreation,batchId}'=$1 AND h.provider=$2"
    aggregate = """SELECT count(*)::int profiles, count(distinct h.external_id)::int unique_source_ids,
      sum(jsonb_array_length(h.performances))::int results,
      count(*) FILTER(WHERE a.profile_visibility IS DISTINCT FROM 'public' OR a.date_of_birth IS NOT NULL OR a.country IS DISTINCT FROM '' OR a.county IS DISTINCT FROM '' OR h.published_at IS NULL OR h.complete IS DISTINCT FROM false
       OR EXISTS(SELECT 1 FROM athlete_account_links l WHERE l.athlete_id=a.id))::int invalid_profile_rows """+scope
    grouped = "SELECT a.gender,a.profile_details#>>'{worldMarathonMajors,ageGroup}' age_group,count(*)::int profiles,sum(jsonb_array_length(h.performances))::int results "+scope+" GROUP BY 1,2 ORDER BY 1,2"
    agg, groups, caps, audits = query([
        (aggregate,[wmm.BATCH,wmm.PROVIDER]), (grouped,[wmm.BATCH,wmm.PROVIDER]),
        ("SELECT count(*)::int pages,count(distinct source_key)::int unique_pages,sum(row_count)::int results FROM result_archive_source_captures WHERE run_id=$1::uuid",[wmm.RUN]),
        ("SELECT count(*)::int publications FROM network_audit_log WHERE action='athlete.history_admin_published' AND after_value->>'batchId'=$1",[wmm.BATCH])
    ], True)
    agg, caps, audits = agg[0],caps[0],audits[0]
    if agg['profiles'] != counts['created']+counts['previously_imported'] or agg['unique_source_ids'] != agg['profiles'] or agg['invalid_profile_rows']:
        raise ValueError('Published profiles failed reconciliation')
    if not counts['previously_imported'] and agg['results'] != counts['results']: raise ValueError('Result receipt mismatch')
    if caps['pages'] != len(manifest['sha256']) or caps['unique_pages'] != caps['pages'] or caps['results'] != sum(x['results'] for x in plan['coverage']):
        raise ValueError('Captured source coverage mismatch')
    if audits['publications'] != agg['profiles']: raise ValueError('Publication audit mismatch')
    rows = "WITH performances AS (SELECT jsonb_array_elements(h.performances) p "+scope+") "
    result_check = rows+"""SELECT count(*)::int results,
      count(*) FILTER(WHERE p->>'date' IS DISTINCT FROM '' OR p->>'verificationStatus' IS DISTINCT FROM 'unverified' OR p->>'providerName' IS DISTINCT FROM $2 OR (p->'sourceUrls' @> jsonb_build_array($3::text)) IS DISTINCT FROM true
       OR p->>'performance' IS DISTINCT FROM p#>>'{archiveReference,original,finish_time}'
       OR p->>'year' IS DISTINCT FROM p#>>'{archiveReference,original,result_year}')::int invalid_results FROM performances"""
    duplicates = rows+""", ids AS (SELECT jsonb_array_elements_text(p#>'{archiveReference,sourceResultIds}') id FROM performances)
      SELECT count(*)::int duplicate_source_result_ids FROM (SELECT id FROM ids GROUP BY id HAVING count(*)>1) d"""
    perf, dup = query([(result_check,[wmm.BATCH,wmm.PROVIDER,wmm.prep.SOURCE]),(duplicates,[wmm.BATCH,wmm.PROVIDER])],True)
    perf, dup = perf[0],dup[0]
    if perf['results'] != agg['results'] or perf['invalid_results'] or dup['duplicate_source_result_ids']:
        raise ValueError('Published results failed source or duplicate checks')

    # Export every held source ID, retaining both supporting and opposing evidence.
    queue = output/f'{prefix}-review-queue-2026-10-10.jsonl.gz'
    temp = queue.with_suffix('.writing'); seen=set(); initial=0; fresh_ids={h['sourceAthleteId'] for h in fresh}; fresh_details={}
    with gzip.open(temp,'wt',encoding='utf-8',compresslevel=6) as out:
        for path in sorted((work/'plans').glob('*.plan.json.gz')):
            if hashlib.sha256(path.read_bytes()).hexdigest()!=manifest['sha256'][path.name]: raise ValueError('Plan changed')
            with gzip.open(path,'rt') as inp: page=json.load(inp)
            for p in page['profiles']:
                if p['externalId'] in fresh_ids:
                    fresh_details[p['externalId']]={'gender':p['gender'],'ageGroup':p['details']['worldMarathonMajors']['ageGroup'],'sourceFile':p['sourceFile'],'sourceRow':p['sourceRow'],'resultCount':len(p['performances'])}
            for hold in page['held']:
                aid=hold['sourceAthleteId']
                if aid in seen: raise ValueError('Repeated held source ID')
                seen.add(aid);initial+=1;out.write(json.dumps(hold,ensure_ascii=False)+'\n')
        for h in fresh:
            aid=h['sourceAthleteId']
            if aid in seen or aid not in fresh_details: raise ValueError('Fresh review mismatch')
            seen.add(aid)
            record={**h,**fresh_details[aid], 'reasons':['possible_live_directory_match'],
                'caseForMatch':'A name/alias variant or shared race-year bib matched the live AthRecs directory after initial screening.',
                'caseAgainstMatch':'This is a possible match, not established identity. Review source rows and the candidate profile before merging or creating a profile.'}
            out.write(json.dumps(record,ensure_ascii=False)+'\n')
    if initial != plan['summary']['held_profiles'] or agg['profiles']+len(seen) != plan['summary']['rankings_screened']:
        raise ValueError('Full ranking population does not reconcile')
    if agg['results']+sum(h['resultCount'] for h in fresh_details.values()) != plan['summary']['eligible_results']:
        raise ValueError('Eligible performances do not reconcile')
    temp.replace(queue)
    final={'batchId':wmm.BATCH,'verifiedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'sourcePeriod':plan['sourcePeriod'],'rankingsScreened':plan['summary']['rankings_screened'],
        'rawSourceResults':caps['results'],'publishedProfiles':agg['profiles'],'publishedResults':agg['results'],
        'heldProfiles':len(seen),'initialHeld':initial,'freshHeld':len(fresh),
        'duplicateSourceRowsCollapsed':plan['summary']['duplicate_source_results_removed'],
        'sourceCoverage':plan['coverage'],'publishedCoverage':groups,'holdReasons':{**plan['holdReasons'],'possible_live_directory_match':len(fresh)},
        'checks':{'profiles':agg,'results':perf,'duplicates':dup,'captures':caps,'audits':audits},
        'planManifestSha256':hashlib.sha256((work/'validated-plan-manifest.json').read_bytes()).hexdigest(),
        'identityStatus':'provisional; source observation comparison is not independent identity verification',
        'publicSourceCredit':'Provider and URLs stored with each result. HistoricalResultRow displays the named provider link on public result rows when this version is deployed.',
        'examples':[e for r in receipts for e in r['examples'][:2]],'freshHolds':fresh}
    dump(work/'final-verification.json',final)
    query([("UPDATE result_archive_capture_runs SET status='completed',summary=$2::jsonb,updated_at=now() WHERE id=$1::uuid AND provider=$3 RETURNING id",[wmm.RUN,json.dumps(final),wmm.PROVIDER])])

    esc=html.escape
    by={(g['gender'],g['age_group']):g for g in groups}; coverage={(g['gender'],g['ageGroup']):g for g in plan['coverage']}
    body=[]
    for age in ['40-44','45-49','50-54','55-59','60-64','65-69','70-74','75-79','80+']:
        values=[]
        for gender in ['F','M']:
            values.extend([coverage[gender,age]['collected'],by.get((gender,age),{}).get('profiles',0),by.get((gender,age),{}).get('results',0)])
        body.append('<tr><th>'+age+'</th>'+''.join(f'<td>{v:,}</td>' for v in values)+'</tr>')
    links=''.join('<li><a href="https://www.athrecs.com/athletes/'+esc(e['slug'])+'">'+esc(e['slug'].split('-wmm-')[0].replace('-',' ').title())+'</a></li>' for e in final['examples'])
    reasons=''.join('<tr><th>'+esc(k.replace('_',' '))+'</th><td>'+format(v,',')+'</td></tr>' for k,v in sorted(final['holdReasons'].items(),key=lambda item:-item[1]))
    report=output/f'{prefix}-import-report-2026-10-10.html'
    scope='The ranking period is 1 October 2025–30 September 2026.' if edition==8 else 'These are retained edition-7 observations with source result year 2025. This snapshot is not asserted to reconstruct the entire historical ranking season.'
    report.write_text(f'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WMM athlete import — 10 October 2026</title>
    <style>body{{font:16px/1.55 system-ui,sans-serif;color:#182635;margin:40px auto;max-width:1050px;padding:0 20px}}h1{{font-size:32px}}h2{{margin-top:32px}}a{{color:#075f8c}}table{{width:100%;border-collapse:collapse;font-size:14px}}th,td{{padding:9px;border-bottom:1px solid #dce3e8;text-align:right}}th:first-child,td:first-child{{text-align:left}}thead{{background:#eff4f7}}.totals{{font-size:20px;background:#edf7f3;padding:20px;border-radius:12px}}.note{{background:#fff6df;padding:15px}}small{{color:#556575}}@media print{{body{{margin:0;max-width:none}}tr{{break-inside:avoid}}}}</style>
    <h1>World Marathon Majors athlete import</h1><p>Completed 10 October 2026 · AthRecs · Ranking edition {edition}</p>
    <p class="totals"><strong>{agg['profiles']:,} public profiles</strong> with <strong>{agg['results']:,} results</strong>.<br>{len(seen):,} source identities held for possible duplicates or source conflicts.</p>
    <p>Checked all {final['rankingsScreened']:,} captured ranking entries across both genders and all nine age groups from the <a href="{wmm.prep.SOURCE}">official WMM feed</a>. {scope} Captured {caps['results']:,} detailed source result rows across {caps['pages']} pages.</p>
    <h2>Coverage</h2><table><thead><tr><th>Age</th><th>Women screened</th><th>Profiles added</th><th>Results added</th><th>Men screened</th><th>Profiles added</th><th>Results added</th></tr></thead><tbody>{''.join(body)}</tbody></table>
    <h2>Duplicate checks</h2><p>Compared official source IDs, names and aliases, accents and punctuation, token order, nickname variants, spelling similarities, and shared race-year bibs. Checked existing AthRecs profiles and accounts, then refreshed those checks before every insert. Collapsed {final['duplicateSourceRowsCollapsed']:,} repeated source result rows during screening while retaining the original IDs and observations.</p>
    <p>{initial:,} source identities were held during initial screening and {len(fresh):,} more during live checks. These are possible matches or source problems, not confirmed duplicate people. Matching names did not authorize a merge. Existing profiles, ownership, claims, privacy settings and canonical result records were not overwritten by this importer.</p>
    <table><thead><tr><th>Review reason</th><th>Flagged identities</th></tr></thead><tbody>{reasons}</tbody></table><p><small>Reasons overlap; the rows above must not be summed. The compressed review queue contains one record per held source identity, with candidates and supporting/opposing reasons. Candidate lists are capped at 20, with total candidate counts retained.</small></p>
    <h2>Evidence and limits</h2><p>All published performances were compared with captured official source rows and retain source athlete/result IDs. Each is explicitly unverified and each profile is provisional and unclaimed. WMM supplies the year, event name and finish time, but no exact race date or chip/gun classification; missing values remain blank. The import does not establish verified personal bests, medals, residence or dates of birth.</p>
    <p>Database checks found zero duplicate source athlete IDs, zero duplicate source result IDs across the published WMM histories, and zero rows failing the publication/source checks. The branch rehearsal also passed repeat-import and concurrent-batch checks.</p>
    <p class="note">Provider names and source links are stored with every result. This version of the public historical-results table displays the named source link. Deployment and live-page visibility should be checked separately from the database reconciliation.</p>
    <h2>Sample public profiles</h2><ul>{links}</ul><p>Provider: <a href="https://www.worldmarathonmajors.com/rankings/claim-results">Abbott World Marathon Majors</a>. Original source observations and complete review records are preserved in the accompanying audit files.</p><small>Batch {wmm.BATCH} · Checked {esc(final['verifiedAt'])}</small></html>''',encoding='utf-8')
    archive=output/f'{prefix}-import-audit-2026-10-10.zip'
    with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
        evidence=[work/name for name in ['live-page-verification.json','source-credit-check.json','cross-edition-result-id-check.json'] if (work/name).exists()]
        for p in [report,queue,work/'final-verification.json',work/'validated-plan-manifest.json',work/'plans/summary.json',work/'captures/coverage.json',*evidence,*[work/f'production-{n}.json' for n in range(partitions)],*sorted(work.glob('review*-receipt.json')),*sorted(work.glob('review-concurrent-*.json'))]:
            z.write(p,p.name)
    print(json.dumps({k:final[k] for k in ['publishedProfiles','publishedResults','heldProfiles','freshHeld','rankingsScreened']},indent=2))
    print(report); print(archive)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--work',type=pathlib.Path,required=True);p.add_argument('--output',type=pathlib.Path,required=True);p.add_argument('--edition',type=int,choices=[7,8],default=8);p.add_argument('--partitions',type=int,default=3);p.add_argument('--connection',type=pathlib.Path);a=p.parse_args();main(a.work,a.output,a.edition,a.partitions,a.connection)
