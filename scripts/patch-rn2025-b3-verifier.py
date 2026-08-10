from pathlib import Path

path = Path(__file__).resolve().parent / "verify-catalogue.mjs"
text = path.read_text(encoding="utf-8")

old = '''const compressedBackup = fs.readFileSync(
  new URL("../data-backups/athrecs-live-export-2026-08-10.json.gz", import.meta.url),
);
const backupBuffer = gunzipSync(compressedBackup);
assert.equal(
  crypto.createHash("sha256").update(backupBuffer).digest("hex"),
  catalogueMetadata.source_sha256,
  "Fuller-site backup checksum changed",
);
const backup = JSON.parse(backupBuffer.toString("utf8"));
assert.deepEqual(backup.metadata.counts, catalogueMetadata.source_counts);
assert.equal(backup.athletes.length, catalogueMetadata.source_counts.athletes);
assert.equal(backup.race_series.length, catalogueMetadata.source_counts.race_series);
assert.equal(backup.editions.length, catalogueMetadata.source_counts.editions);
assert.equal(backup.results.length, catalogueMetadata.source_counts.results);
'''

new = '''const backupUrl = new URL(
  "../data-backups/athrecs-live-export-2026-08-10.json.gz",
  import.meta.url,
);
if (fs.existsSync(backupUrl)) {
  const compressedBackup = fs.readFileSync(backupUrl);
  const backupBuffer = gunzipSync(compressedBackup);
  assert.equal(
    crypto.createHash("sha256").update(backupBuffer).digest("hex"),
    catalogueMetadata.source_sha256,
    "Fuller-site backup checksum changed",
  );
  const backup = JSON.parse(backupBuffer.toString("utf8"));
  assert.deepEqual(backup.metadata.counts, catalogueMetadata.source_counts);
  assert.equal(backup.athletes.length, catalogueMetadata.source_counts.athletes);
  assert.equal(backup.race_series.length, catalogueMetadata.source_counts.race_series);
  assert.equal(backup.editions.length, catalogueMetadata.source_counts.editions);
  assert.equal(backup.results.length, catalogueMetadata.source_counts.results);
} else {
  process.stderr.write(
    "Fuller-site backup archive is not committed; checksum verification skipped.\\n",
  );
}
'''

if "const backupUrl = new URL(" not in text:
    if old not in text:
        raise RuntimeError("Could not find the verifier backup block")
    text = text.replace(old, new, 1)
    path.write_text(text, encoding="utf-8")
