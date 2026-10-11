import test from 'node:test';
import assert from 'node:assert/strict';
import {historyPublicationApproval,profileVisibility} from './publication.mjs';
const approval={visibility:'public',scope:'duv_matched_unclaimed_public_profiles',approvalId:'test',approvedBy:'Test owner',approvedAt:'2026-10-10T20:52:00Z',instruction:'Make imported results public'};
test('history publication defaults private and is separate from profile approval',()=>{
 assert.equal(historyPublicationApproval({configuration:{}}),null);
 assert.equal(historyPublicationApproval({configuration:{profilePublication:approval}}),null);
 assert.equal(profileVisibility({configuration:{historyPublication:approval}}),'private');
});
test('only explicit, valid, current history approval publishes evidence',()=>{
 assert.equal(historyPublicationApproval({configuration:{historyPublication:approval}}),approval);
 assert.equal(historyPublicationApproval({configuration:{historyPublication:{...approval,revokedAt:'2026-10-11'}}}),null);
 for(const key of ['visibility','scope','approvalId','approvedBy','approvedAt','instruction'])
  assert.throws(()=>historyPublicationApproval({configuration:{historyPublication:{...approval,[key]:''}}}),/invalid_history_publication_approval/);
});
