import fs from 'node:fs';
import assert from 'node:assert/strict';
import { sourceHistorySchema } from '../src/lib/athrecs/source-performance-history.ts';

const plan = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const seen = new Set();
let performances = 0;
for (const profile of [...plan.profiles, ...plan.existingHistories]) {
  assert(!seen.has(profile.externalId), 'Duplicate planned source identity');
  seen.add(profile.externalId);
  sourceHistorySchema.parse({
    provider: 'Brentwood Half Marathon historical archive',
    externalId: profile.externalId, sourceUrl: profile.sourceUrl,
    capturedAt: profile.capturedAt ?? '2026-10-24T23:00:00Z',
    complete: false, yearsExpected: [], yearsCaptured: profile.years,
    performances: profile.performances,
  });
  const years = new Set();
  for (const p of profile.performances) {
    assert(!years.has(p.year), 'Two Brentwood performances in the same edition');
    years.add(p.year);
    assert.equal(p.verificationStatus, 'unverified');
    assert.equal(p.eventSlug, 'brentwood-half-marathon');
    assert(p.sourceKeys.length > 0);
    assert.equal(p.archiveReference.identityVerified, false);
    assert(p.archiveReference.original.source_sha256);
    assert(!p.sourceUrls.some(url => /runabc/i.test(url)));
    performances++;
  }
}
console.log(JSON.stringify({ profiles: plan.profiles.length, existingHistories: plan.existingHistories.length, performances, schemaAndEditionChecks: 'passed' }));
