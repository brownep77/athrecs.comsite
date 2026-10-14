#!/usr/bin/env python3
"""Review existing calendar results before adding career histories.

Input is a fresh staff export of ALL recorded results for the selected athletes.
Never infer an event link from a name or a rounded time. Source IDs, exact mark,
date, discipline and placing must agree. The export stays outside source control.
"""
import argparse
import datetime
import json
import pathlib
import re
import urllib.parse

ROAD = {'Half': 'Half Marathon', 'Marathon': 'Marathon',
        '10K': '10 Kilometres Road', '5K': '5 Kilometres Road',
        '10 Miles': '10 Miles Road'}


def source_identity(record):
    source = record.get('result_details', {}).get('sourceRow', {})
    url = source.get('url') or record.get('source_url') or ''
    parsed = urllib.parse.urlparse(url)
    competition = re.fullmatch(r'/competition/calendar-results/results/(\d+)', parsed.path)
    if parsed.hostname not in ('worldathletics.org', 'www.worldathletics.org') or not competition:
        return None
    event = urllib.parse.parse_qs(parsed.query).get('eventId', [None])[0]
    athlete = source.get('sourceAthleteId')
    return (str(athlete).lstrip('0'), competition[1], event) if athlete and event else None


def reconcile(candidate, records):
    h = candidate['history']
    rows = [r for r in records if r['athlete_id'] == candidate['target']['athlete_id']]
    originals = {r['sourceKey']: r for r in candidate['originalRows']}
    links, conflicts = [], []
    for performance in h['performances']:
        raw = originals[performance['sourceKeys'][0]]['row']
        if re.search(r'\bUNC\b', raw.get('remark') or '', re.I):
            performance.update(profileExcluded=True, verificationStatus='unverified')
            if 'UNC: uncertified' not in performance['notes']:
                performance['notes'] = 'UNC: uncertified source performance; held from public profile and calculations. ' + performance['notes']
        if not raw.get('competitionId') or not raw.get('eventId'):
            continue
        identity = (h['externalId'], str(raw['competitionId']), str(raw['eventId']))
        related = [r for r in rows if source_identity(r) == identity]
        matches = []
        for record in related:
            source_row = record['result_details']['sourceRow'].get('raw', {})
            mark = source_row.get('mark')
            place = str(source_row.get('place') or '').rstrip('.')
            if (record['event_date'] == performance['date'] and
                ROAD.get(record['distance_code']) == performance['discipline'] and
                mark == performance['performance'] and place == performance['place'] and
                str(raw.get('race') or '').upper() in ('', 'F') and
                (record['gender_place'] is None or str(record['gender_place']) == place) and
                (record['overall_place'] is None or str(record['overall_place']) == place)):
                matches.append(record)
        if related and len(matches) != 1:
            conflicts.append({'sourceKey': performance['sourceKeys'][0],
                              'resultIds': [r['result_id'] for r in related],
                              'reason': 'Calendar identity found but exact date, distance, mark, round or placing differs/ambiguous'})
            continue
        if not matches:
            continue
        record, = matches
        performance['eventSlug'] = record['event_slug']
        details = record['result_details']
        if details.get('profileExcluded') or record.get('result_visibility') != 'public':
            performance['profileExcluded'] = True
        if details.get('verificationStatus') == 'unverified':
            performance['verificationStatus'] = 'unverified'
        if details.get('disqualification'):
            performance['disqualification'] = details['disqualification']
        links.append({'sourceKey': performance['sourceKeys'][0], 'resultId': record['result_id'],
                      'eventSlug': record['event_slug'], 'sourceIdentity': identity,
                      'profileExcluded': bool(performance.get('profileExcluded')),
                      'verificationStatus': performance['verificationStatus'],
                      'before': record})
    review = {'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
              'recordedResultCount': len(rows), 'links': links, 'conflicts': conflicts}
    candidate['recordedResultsReview'] = review
    return review


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--careers', type=pathlib.Path, required=True)
    parser.add_argument('--recorded-results', type=pathlib.Path, required=True)
    args = parser.parse_args()
    records = json.loads(args.recorded_results.read_text())
    failed = False
    for path in args.careers.glob('*/candidate.json'):
        candidate = json.loads(path.read_text())
        review = reconcile(candidate, records)
        path.write_text(json.dumps(candidate, ensure_ascii=False, indent=2))
        print(candidate['history']['externalId'], 'recorded', review['recordedResultCount'],
              'linked', len(review['links']), 'conflicts', len(review['conflicts']))
        failed |= bool(review['conflicts'])
    raise SystemExit(1 if failed else 0)
