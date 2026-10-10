"""A collector finishing during an upload must not strand its last pages."""
import argparse
import contextlib
import importlib.util
import io
import json
import tempfile
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('private_import', Path(__file__).with_name('import-private-result-captures.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

with tempfile.TemporaryDirectory() as temp:
    root = Path(temp)
    captures = root / 'captures'
    captures.mkdir()
    (captures / 'one.capture.json').write_text('{}')
    (root / 'connection.json').write_text(json.dumps({'branchId': 'synthetic', 'databaseUrl': 'postgresql://test:test@synthetic.neon.tech/test'}))
    (root / 'manifest.json').write_text(json.dumps({'races': [
        {'source_race_key': key, 'date': '2026-01-01'} for key in ('one', 'two')]}))
    args = argparse.Namespace(run_id='00000000-0000-0000-0000-000000000001',
        connection=str(root / 'connection.json'), confirm_branch='synthetic', captures=str(captures),
        receipts=str(root / 'receipts.json'), manifest=str(root / 'manifest.json'),
        approval_id='synthetic', summary=str(root / 'summary.json'), watch=True)
    prepared_keys = []

    def prepare(command, **kwargs):
        key = Path(command[2]).name.split('.')[0]
        prepared_keys.append(key)
        if key == 'one':
            (captures / 'two.capture.json').write_text('{}')
            (captures / 'collection-complete.json').write_text('{}')
        return SimpleNamespace(stdout=json.dumps({'action': 'insert', 'sourceKey': key, 'rows': 1, 'sql': 'synthetic insert'}))

    def query(request, **kwargs):
        count = len(json.loads(request.data)['queries'])
        return io.BytesIO(json.dumps({'results': [{'rows': [{'id': i, 'row_count': 1}]} for i in range(count)]}).encode())

    with patch.object(module.subprocess, 'run', prepare), patch.object(module.urllib.request, 'urlopen', query), patch.object(module.time, 'sleep'), contextlib.redirect_stdout(io.StringIO()):
        module.main(args)
    assert prepared_keys == ['one', 'two']
    receipts = json.loads((root / 'receipts.json').read_text())
    assert len(receipts) == 2 and all(r['status'] == 'stored' for r in receipts)
    assert json.loads((root / 'summary.json').read_text())['rowsStored'] == 2
print('Final pages collected during import are included in a final discovery pass.')
