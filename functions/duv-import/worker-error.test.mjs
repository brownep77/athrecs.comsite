import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyWorkerFailure } from './worker.mjs';

test('DOM TimeoutError code 23 is retryable, not a database guard',()=>{
 const failure=classifyWorkerFailure(new DOMException('The operation was aborted due to timeout','TimeoutError'));
 assert.equal(failure.sqlState,'');
 assert.equal(failure.guard,false);
 assert.equal(failure.retry,true);
});

test('Postgres SQLSTATE remains a blocking database guard',()=>{
 const error=Object.assign(new Error('canceling statement due to lock timeout'),{code:'55P03'});
 const failure=classifyWorkerFailure(error);
 assert.equal(failure.sqlState,'55P03');
 assert.equal(failure.guard,true);
});

test('identity conflict remains a blocking guard',()=>{
 const failure=classifyWorkerFailure(new Error('existing_source_history_conflict'));
 assert.equal(failure.guard,true);
 assert.equal(failure.retry,false);
});

test('ordinary fetch failures remain retryable without bypassing guards',()=>{
 const error=Object.assign(new TypeError('fetch failed'),{code:'ECONNRESET'});
 const failure=classifyWorkerFailure(error);
 assert.equal(failure.sqlState,'');
 assert.equal(failure.guard,false);
 assert.equal(failure.retry,true);
});
