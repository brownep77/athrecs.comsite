"""Supervised private capture import using Neon's authenticated HTTPS SQL API.

Credentials stay in the supplied private connection file. SQL batches are atomic;
source/payload keys make ambiguous network retries repeat-safe. No public result
or athlete table is writable through the generated statements.
"""
import argparse
import datetime as dt
import json
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VALIDATOR_VERSION = 4


def main(args):
    args.run_id = str(uuid.UUID(args.run_id))
    config = json.loads(Path(args.connection).read_text())
    if config.get('branchId') != args.confirm_branch:
        raise ValueError('Explicit target branch does not match the connection file')
    connection = config['databaseUrl']
    hostname = urllib.parse.urlsplit(connection).hostname
    if not hostname or not hostname.endswith('.neon.tech'):
        raise ValueError('Expected the selected Neon project connection')
    endpoint = 'https://' + hostname.replace('-pooler', '') + '/sql'
    captures = Path(args.captures).resolve()
    receipt_file = Path(args.receipts).resolve()
    receipts = json.loads(receipt_file.read_text()) if receipt_file.exists() else []
    by_key = {r['sourceKey']: r for r in receipts}
    inventory = json.loads(Path(args.manifest).read_text())['races']

    def query(statements):
        body = json.dumps({'queries': [{'query': sql, 'params': []} for sql in statements]}).encode()
        request = urllib.request.Request(endpoint, data=body, headers={
            'Neon-Connection-String': connection, 'Content-Type': 'application/json',
            'Neon-Batch-Isolation-Level': 'ReadCommitted',
        })
        for attempt in range(3):
            try:
                with urllib.request.urlopen(request, timeout=60) as response:
                    output = json.loads(response.read())
                if not isinstance(output.get('results'), list):
                    raise ValueError('Database did not return transaction results')
                return output['results']
            except urllib.error.HTTPError as exc:
                if exc.code < 500 or attempt == 2:
                    raise RuntimeError('Database transaction failed: HTTP ' + str(exc.code)) from None
            except (urllib.error.URLError, TimeoutError):
                if attempt == 2:
                    raise RuntimeError('Database transaction connection failed; batch can be replayed') from None
            time.sleep(2 * (attempt + 1))

    def save():
        temp = receipt_file.with_suffix('.tmp')
        temp.write_text(json.dumps(list(by_key.values()), indent=2))
        temp.replace(receipt_file)

    def summary():
        rows = list(by_key.values())
        return {'pagesProcessed': len(rows), 'pagesStored': sum(r['status'] == 'stored' for r in rows),
                'rowsStored': sum(r['rows'] for r in rows if r['status'] == 'stored'),
                'pagesHeld': sum(r['status'] == 'held' for r in rows),
                'rowsHeld': sum(r['rows'] for r in rows if r['status'] == 'held'),
                'publishedResults': 0, 'updatedAt': dt.datetime.now(dt.timezone.utc).isoformat()}

    batch, batch_bytes = [], 0
    def flush():
        nonlocal batch, batch_bytes
        if not batch:
            return
        output = query([p['sql'] for p in batch])
        if len(output) != len(batch):
            raise ValueError('Unexpected database batch receipt count')
        for item, response in zip(batch, output):
            rows = response.get('rows', [])
            if len(rows) != 1 or int(rows[0]['row_count']) != item['rows']:
                raise ValueError('Active approval or result count check failed; inspect stored receipts')
            by_key[item['sourceKey']] = {'sourceKey': item['sourceKey'], 'status': 'stored',
                'rows': item['rows'], 'id': rows[0]['id'], 'validatorVersion': VALIDATOR_VERSION}
        save()
        print(json.dumps(summary()), flush=True)
        batch, batch_bytes = [], 0

    while True:
        # Snapshot completion before discovering files. Collection can finish
        # while this batch imports; that must trigger one final discovery pass.
        collection_finished_at_start = (captures / 'collection-complete.json').exists()
        ready = []
        for source in inventory:
            key = source['source_race_key']
            prior = by_key.get(key)
            if prior and (prior['status'] == 'stored' or prior.get('validatorVersion') == VALIDATOR_VERSION):
                continue
            file = captures / (key + '.capture.json')
            if file.exists():
                ready.append(file)
        for file in ready:
            prepared = subprocess.run(['node', str(ROOT / 'scripts/prepare-private-result-capture.mjs'),
                str(file), args.run_id, args.approval_id], cwd=ROOT, check=True, capture_output=True, text=True)
            data = json.loads(prepared.stdout)
            if data['action'] == 'hold':
                by_key[data['sourceKey']] = {'sourceKey': data['sourceKey'], 'status': 'held',
                    'rows': data['rows'], 'issues': data['check']['issues'], 'validatorVersion': VALIDATOR_VERSION}
                save()
            else:
                size = len(data['sql'].encode())
                if batch and (len(batch) >= 5 or batch_bytes + size > 6_000_000):
                    flush()
                batch.append(data)
                batch_bytes += size
        flush()
        if not args.watch or collection_finished_at_start:
            break
        time.sleep(3)
    final = summary()
    errors = [p for p in captures.glob('*.error.json')
              if not p.with_name(p.name.replace('.error.json', '.capture.json')).exists()
              or p.stat().st_mtime > p.with_name(p.name.replace('.error.json', '.capture.json')).stat().st_mtime]
    final['pagesFetchFailed'] = len(errors)
    final['sourceInventoryPages'] = len(inventory)
    final['futureListingsSkipped'] = sum(r['date'] > dt.datetime.now(dt.timezone.utc).date().isoformat() for r in inventory)
    final['heldSources'] = [r['sourceKey'] for r in by_key.values() if r['status'] == 'held']
    final['failedSources'] = [p.name.split('.')[0] for p in errors]
    value = json.dumps(final).replace("'", "''")
    state = 'partial' if final['pagesHeld'] or errors else 'completed'
    query(["update result_archive_capture_runs set summary='" + value + "'::jsonb,status='" + state + "',updated_at=now() where id='" + args.run_id + "'::uuid returning id,status"])
    Path(args.summary).write_text(json.dumps(final, indent=2))
    print(json.dumps(final), flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    for flag in ['connection', 'confirm-branch', 'captures', 'receipts', 'manifest', 'run-id', 'approval-id', 'summary']:
        parser.add_argument('--' + flag, required=True)
    parser.add_argument('--watch', action='store_true')
    main(parser.parse_args())
