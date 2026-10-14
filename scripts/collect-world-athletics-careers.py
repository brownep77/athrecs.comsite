#!/usr/bin/env python3
"""Capture public WA career seasons. No database writes or inferred performances.

Input: JSON array with athlete_id (nullable), external_id, source_url.
Output: one evidence JSON per source ID, with original rows and a validated history.
Use --assets-dir for previously captured, current public website JS assets.
Never label the entire collection complete from a successful bounded batch.
"""
import argparse
import concurrent.futures
import datetime as dt
import hashlib
import json
import pathlib
import re
import time
import threading
import urllib.error
import urllib.parse
import urllib.request

USER_AGENT = 'AthRecs public athlete history collection (+https://www.athrecs.com)'
MONTHS = {v: i + 1 for i, v in enumerate('JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC'.split())}
STOP = threading.Event()
REQUEST_LOCK = threading.Lock()
REQUESTS = 0
REQUEST_LIMIT = 500


def checked_date(value):
    match = re.fullmatch(r'(\d{1,2}) ([A-Z]{3}) (\d{4})', value or '')
    if not match:
        raise ValueError('Unrecognised source date: ' + str(value))
    day, month, year = match.groups()
    return dt.date(int(year), MONTHS[month], int(day)).isoformat()


def request(url, payload=None, headers=None):
    global REQUESTS
    with REQUEST_LOCK:
        if STOP.is_set():
            raise RuntimeError('Collection stopped after source access denial or request budget')
        if REQUESTS >= REQUEST_LIMIT:
            STOP.set()
            raise RuntimeError('Request budget reached; preserve checkpoint and resume later')
        REQUESTS += 1
    body = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=body, headers={
        'User-Agent': USER_AGENT, **({'Content-Type': 'application/json'} if body else {}),
        **(headers or {})})
    try:
        with urllib.request.urlopen(req, timeout=45) as response:
            if response.status != 200:
                raise ValueError('Source HTTP ' + str(response.status))
            return response.read().decode()
    except urllib.error.HTTPError as exc:
        if exc.code in [401, 403, 429]:
            STOP.set()
        raise
    except urllib.error.URLError as exc:
        # CONNECT proxy denials arrive as URLError(OSError), not HTTPError.
        # Preserve the exact error and stop all workers rather than retrying years.
        if re.search(r'\b(?:401|403|429)\b', str(exc.reason)):
            STOP.set()
        raise


def next_data(html):
    match = re.search(r'<script[^>]+id=["\']__NEXT_DATA__["\'][^>]*>(.*?)</script>', html, re.S)
    if not match:
        raise ValueError('No public profile data; stop rather than bypass source access controls')
    return json.loads(match[1])


def public_api(assets_dir, html):
    """Read the endpoint and query used by the public site's season selector."""
    endpoint = key = query = None
    def inspect(raw):
        nonlocal endpoint, key, query
        config = re.search(r'graphql:\{endpoint:"([^"]+)",bearerAuthEndpoint:"[^"]+",apiKey:"([^"]+)"', raw)
        if config:
            endpoint, key = config.groups()
        found = re.search(r'("\\n  query GetSingleCompetitorResultsDiscipline.*?\\n")', raw)
        if found:
            query = json.loads(found[1])
    assets_dir.mkdir(parents=True, exist_ok=True)
    for path in assets_dir.glob('chunk-*'):
        inspect(path.read_text())
    if not all([endpoint, key, query]):
        for url in re.findall(r'<script[^>]+src="([^"]+)"', html):
            if not url.startswith('/_next/static/chunks/'):
                continue
            path = assets_dir / ('chunk-' + url.rsplit('/', 1)[-1])
            raw = path.read_text() if path.exists() else request('https://worldathletics.org' + url)
            path.write_text(raw)
            inspect(raw)
            if all([endpoint, key, query]):
                break
    if not all([endpoint, key, query]):
        raise ValueError('Public season query/configuration changed; manual review required')
    host = urllib.parse.urlparse(endpoint).hostname or ''
    if not host.endswith('.worldathletics.org'):
        raise ValueError('Unexpected public API host')
    return endpoint, key, query


def performance(discipline, raw, year, source_url, external_id, ordinal):
    date = checked_date(raw.get('date'))
    if int(date[:4]) != int(year):
        raise ValueError('Season and performance date differ')
    if date > dt.datetime.now(dt.timezone.utc).date().isoformat():
        raise ValueError('Future-dated result requires review')
    if not raw.get('mark') or not discipline:
        raise ValueError('Missing discipline or source mark')
    # Labels preserve round semantics. F1 is not silently upgraded to the medal final.
    labels = ['Round: ' + raw['race']] if raw.get('race') else []
    if raw.get('remark'):
        labels.append(raw['remark'])
    if raw.get('notLegal'):
        labels.append('Not legal')
    if re.search(r'\brelay\b|\d\s*x\s*\d', discipline, re.I):
        labels.append('Relay team result')
    uncertified = bool(re.search(r'\bUNC\b', raw.get('remark') or '', re.I))
    key = f'wa:{external_id}:{year}:{ordinal}'
    return {
        'year': int(year), 'date': date, 'sourceDate': raw['date'], 'ageGroup': '',
        'discipline': discipline, 'performance': str(raw['mark']),
        'wind': str(raw.get('wind') or ''), 'place': str(raw.get('place') or '').rstrip('.'),
        'venue': raw.get('venue') or '', 'meeting': raw.get('competition') or '',
        'country': raw.get('country') or '', 'sourceUrls': [source_url], 'sourceKeys': [key],
        'labels': labels, 'verificationStatus': 'unverified' if uncertified else 'source_verified',
        **({'profileExcluded': True} if uncertified else {}),
        'notes': ('UNC: uncertified source performance; held from public profile and calculations. ' if uncertified else '') +
            ('Not legal. ' if raw.get('notLegal') else '') +
            f'World Athletics athlete {external_id}; season {year}; source row {ordinal}; '
            f'competitionId={raw.get("competitionId")}; eventId={raw.get("eventId")}; '
            'placing retained for the stated round; exact source precision retained.',
    }


def build_history(external_id, source_url, competitor, seasons, captured_at):
    if str(competitor['_id']).lstrip('0') != str(external_id).lstrip('0'):
        raise ValueError('Wrong athlete returned by source')
    expected = sorted({int(y) for y in competitor['resultsByYear']['activeYears']})
    captured, rows, evidence, seen = [], [], [], set()
    for year in expected:
        season = seasons.get(str(year))
        if season is None:
            continue
        if season['parameters']['resultsByYear'] != year:
            raise ValueError('Source ignored requested season')
        # An empty active season is retained as incomplete, not silently accepted.
        if not season.get('resultsByEvent') or not any(g.get('results') for g in season['resultsByEvent']):
            continue
        ordinal = 0
        for group in season['resultsByEvent']:
            for raw in group['results']:
                ordinal += 1
                normalized = performance(group['discipline'], raw, year, source_url, external_id, ordinal)
                # Collapse only literal source duplicates, including source event IDs.
                identity = json.dumps([group['discipline'], raw], ensure_ascii=False, sort_keys=True)
                if identity not in seen:
                    rows.append(normalized)
                    evidence.append({'sourceKey': normalized['sourceKeys'][0], 'discipline': group['discipline'], 'row': raw})
                    seen.add(identity)
        captured.append(year)
    return {
        'provider': 'worldathletics', 'externalId': str(external_id).lstrip('0'),
        'sourceUrl': source_url, 'capturedAt': captured_at,
        'complete': bool(expected) and expected == captured,
        'yearsExpected': expected, 'yearsCaptured': captured,
        'performances': rows,
    }, evidence


def collect(target, output, assets, api, existing_pages=None):
    external_id = str(target['external_id']).lstrip('0')
    url = target['source_url']
    if not re.fullmatch(r'https://(?:www\.)?worldathletics\.org/athletes/[^?#]+', url):
        raise ValueError('Not a public World Athletics athlete URL')
    folder = output / external_id
    folder.mkdir(parents=True, exist_ok=True)
    profile_file = folder / 'profile.json'
    if profile_file.exists():
        page = json.loads(profile_file.read_text())
    else:
        prior = existing_pages / f'{target["athlete_id"]}.json' if existing_pages else None
        page = json.loads(prior.read_text())['page'] if prior and prior.exists() else next_data(request(url))
        profile_file.write_text(json.dumps(page, ensure_ascii=False))
    competitor = page['props']['pageProps']['competitor']
    if str(competitor['_id']) != external_id:
        raise ValueError('Source ID mismatch')
    initial = competitor['resultsByYear']
    years = sorted({int(y) for y in initial['activeYears']})
    seasons, errors = {}, []
    for year in years:
        path = folder / f'{year}.json'
        try:
            if path.exists():
                season = json.loads(path.read_text())
            elif year == initial['parameters']['resultsByYear']:
                season = initial
            else:
                endpoint, key, query = api
                response = json.loads(request(endpoint, {'query': query, 'variables': {
                    'id': int(external_id), 'resultsByYear': year,
                    'resultsByYearOrderBy': 'discipline'}}, {'X-Api-Key': key}))
                if response.get('errors'):
                    raise ValueError('Source GraphQL error: ' + str(response['errors'])[:300])
                season = response['data']['getSingleCompetitorResultsDiscipline']
                time.sleep(0.2)
            if season['parameters']['resultsByYear'] != year:
                raise ValueError('Wrong season returned')
            path.write_text(json.dumps(season, ensure_ascii=False))
            seasons[str(year)] = season
        except Exception as exc:
            errors.append({'year': year, 'error': str(exc)[:500]})
            # Denials/rate limits are a stop signal, never an invitation to bypass.
            if STOP.is_set():
                break
    now = dt.datetime.now(dt.timezone.utc).isoformat()
    history, original_rows = build_history(external_id, url, competitor, seasons, now)
    result = {'target': target, 'checkedAt': now, 'history': history,
              'identity': competitor['basicData'], 'honours': competitor.get('honours', []),
              'personalBests': competitor.get('personalBests'), 'originalRows': original_rows,
              'sourceSha256': hashlib.sha256(profile_file.read_bytes()).hexdigest(), 'errors': errors}
    (folder / 'candidate.json').write_text(json.dumps(result, ensure_ascii=False, indent=2))
    print(json.dumps({'external_id': external_id, 'athlete_id': target.get('athlete_id'),
                      'complete': history['complete'], 'seasons': len(history['yearsCaptured']),
                      'expected': len(years), 'rows': len(history['performances']), 'errors': errors}), flush=True)
    return result


def main():
    global REQUEST_LIMIT
    parser = argparse.ArgumentParser()
    parser.add_argument('--targets', type=pathlib.Path, required=True)
    parser.add_argument('--output', type=pathlib.Path, required=True)
    parser.add_argument('--assets-dir', type=pathlib.Path, required=True)
    parser.add_argument('--existing-pages', type=pathlib.Path)
    parser.add_argument('--max-requests', type=int, default=500)
    parser.add_argument('--max-athletes', type=int, default=25)
    args = parser.parse_args()
    targets = json.loads(args.targets.read_text())
    if not targets or len(targets) > args.max_athletes:
        raise ValueError('Supply a nonempty, bounded athlete batch within --max-athletes')
    REQUEST_LIMIT = args.max_requests
    args.output.mkdir(parents=True, exist_ok=True)
    html = (args.assets_dir / 'keely.html').read_text() if (args.assets_dir / 'keely.html').exists() else request(targets[0]['source_url'])
    api = public_api(args.assets_dir, html)
    # Three source requests maximum in flight; each athlete's seasons are sequential.
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        futures = [pool.submit(collect, target, args.output, args.assets_dir, api, args.existing_pages) for target in targets]
        for future in futures:
            future.result()


if __name__ == '__main__':
    main()
