#!/usr/bin/env python3
"""Independent source-row comparison; no network/database writes."""
import datetime
import json
import pathlib
import sys


def verify(path):
    candidate = json.loads(path.read_text())
    h = candidate['history']
    source = json.loads((path.parent / 'profile.json').read_text())['props']['pageProps']['competitor']
    assert str(source['_id']) == h['externalId'], 'Wrong athlete ID'
    expected = sorted(map(int, source['resultsByYear']['activeYears']))
    assert expected == h['yearsExpected'], 'Active seasons lost'
    assert set(h['yearsCaptured']) <= set(expected)
    assert h['complete'] == (bool(expected) and expected == h['yearsCaptured'])
    source_rows = {}
    for year in h['yearsCaptured']:
        season = json.loads((path.parent / f'{year}.json').read_text())
        assert season['parameters']['resultsByYear'] == year, 'Wrong returned season'
        position = 0
        for event in season['resultsByEvent']:
            for row in event['results']:
                position += 1
                source_rows[f'wa:{h["externalId"]}:{year}:{position}'] = (event['discipline'], row)
    seen = set()
    for row in h['performances']:
        key, = row['sourceKeys']
        assert key not in seen, 'Repeated source row'
        seen.add(key)
        event, raw = source_rows[key]
        assert row['discipline'] == event
        assert row['performance'] == raw['mark'], 'Source precision changed'
        assert row['date'] == datetime.datetime.strptime(raw['date'], '%d %b %Y').date().isoformat()
        assert row['place'] == str(raw.get('place') or '').rstrip('.')
        assert row['wind'] == str(raw.get('wind') or '')
        assert row['meeting'] == (raw.get('competition') or '')
        assert row['venue'] == (raw.get('venue') or '')
        assert row['country'] == (raw.get('country') or '')
        assert row['sourceUrls'] == [h['sourceUrl']]
        assert not raw.get('race') or 'Round: ' + raw['race'] in row['labels']
        assert not raw.get('notLegal') or ('Not legal' in row['labels'] and 'Not legal.' in row['notes'])
        assert not raw.get('remark') or raw['remark'] in row['labels']
    # Every original source row is represented or an exact duplicate of one that is.
    def source_fingerprint(event, row):
        return json.dumps([event,row], ensure_ascii=False, sort_keys=True)
    represented = {source_fingerprint(*source_rows[k]) for k in seen}
    assert represented == {source_fingerprint(*row) for row in source_rows.values()}, 'Missing source performances'
    print(h['externalId'], 'independent comparison passed', len(h['performances']), 'performances')


if __name__ == '__main__':
    for path in pathlib.Path(sys.argv[1]).glob('*/candidate.json'):
        verify(path)
