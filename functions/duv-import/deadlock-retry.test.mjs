import test from 'node:test';
import assert from 'node:assert/strict';
import {markRollbackConfirmed,retryAbortedProfileChunk} from './deadlock-retry.mjs';

const databaseError=(code='40P01')=>Object.assign(new Error('database transaction failed'),{code});
const options=()=>({deadline:60000,now:()=>0,sleep:async()=>{}});
const lockTimeout=()=>Object.assign(new Error('canceling statement due to lock timeout'),{code:'55P03'});

test('an acknowledged lock-timeout rollback permits fresh screening and one commit',async()=>{
 let attempts=0,commits=0;
 const screened=[];
 const result=await retryAbortedProfileChunk(async()=>{
  screened.push(++attempts);
  if(attempts===1)throw markRollbackConfirmed(lockTimeout());
  commits++;return 'committed after fresh identity screening';
 },options());
 assert.equal(result,'committed after fresh identity screening');
 assert.deepEqual(screened,[1,2]);assert.equal(commits,1);
});

test('a lock timeout without acknowledged rollback or with only public flags never retries',async()=>{
 for(const error of [lockTimeout(),Object.assign(lockTimeout(),{rollbackConfirmed:true})]){
  let attempts=0;
  await assert.rejects(retryAbortedProfileChunk(async()=>{attempts++;throw error;},options()),e=>e===error);
  assert.equal(attempts,1);
 }
});

test('a continuing lock timeout exhausts the bounded retry budget',async()=>{
 let attempts=0;
 await assert.rejects(retryAbortedProfileChunk(async()=>{attempts++;throw markRollbackConfirmed(lockTimeout());},options()),{code:'55P03'});
 assert.equal(attempts,3);
});

test('NOWAIT, changed/localized messages and wrong SQLSTATE remain blocked',async()=>{
 const errors=[
  Object.assign(lockTimeout(),{message:'could not obtain lock on relation'}),
  Object.assign(lockTimeout(),{message:'lock timeout'}),
  Object.assign(lockTimeout(),{code:'57014'}),
 ];
 for(const error of errors){
  markRollbackConfirmed(error);let attempts=0;
  await assert.rejects(retryAbortedProfileChunk(async()=>{attempts++;throw error;},options()),e=>e===error);
  assert.equal(attempts,1);
 }
});

test('a confirmed deadlock retries a fresh operation and returns its committed result',async()=>{
 const error=markRollbackConfirmed(databaseError());
 const versions=['before rollback','after concurrent writer committed'];
 const decisions=[],sleeps=[],callbacks=[];
 let attempts=0;
 const result=await retryAbortedProfileChunk(async()=>{
  // The operation obtains its directory and computes decisions anew each time.
  decisions.push(versions[attempts]);
  attempts++;
  if(attempts===1)throw error;
  return {linked:1,created:0};
 },{...options(),sleep:async ms=>sleeps.push(ms),onRetry:details=>callbacks.push(details)});
 assert.deepEqual(result,{linked:1,created:0});
 assert.equal(attempts,2);
 assert.deepEqual(decisions,versions);
 assert.deepEqual(sleeps,[250]);
 assert.deepEqual(callbacks,[{error,retry:1,delayMs:250}]);
});

test('an unconfirmed deadlock cannot enable retries through public error properties',async()=>{
 const error=Object.assign(databaseError(),{rollbackConfirmed:true});
 let attempts=0;
 await assert.rejects(retryAbortedProfileChunk(async()=>{attempts++;throw error;},options()),e=>e===error);
 assert.equal(attempts,1);
});

test('other database and identity guard errors never retry even after a confirmed rollback',async()=>{
 for(const code of ['55P03','57014','23505','40001',undefined]){
  const error=markRollbackConfirmed(databaseError(code));
  // The default argument applies for undefined; explicitly remove that code.
  if(code===undefined)delete error.code;
  let attempts=0;
  await assert.rejects(retryAbortedProfileChunk(async()=>{attempts++;throw error;},options()),e=>e===error);
  assert.equal(attempts,1,`Unexpected retry for ${code}`);
 }
});

test('repeated confirmed deadlocks stop after exactly three attempts',async()=>{
 const errors=Array.from({length:3},()=>markRollbackConfirmed(databaseError()));
 const sleeps=[];
 let attempts=0;
 await assert.rejects(retryAbortedProfileChunk(async()=>{throw errors[attempts++];},
  {...options(),sleep:async ms=>sleeps.push(ms)}),e=>e===errors[2]);
 assert.equal(attempts,3);
 assert.deepEqual(sleeps,[250,750]);
});

test('insufficient deadline reserve preserves the error without another operation',async()=>{
 const error=markRollbackConfirmed(databaseError());
 let attempts=0,sleeps=0,callbacks=0;
 await assert.rejects(retryAbortedProfileChunk(async()=>{attempts++;throw error;},
  {deadline:12250,now:()=>0,sleep:async()=>{sleeps++;},onRetry:()=>{callbacks++;}}),e=>e===error);
 assert.equal(attempts,1);
 assert.equal(sleeps,0);
 assert.equal(callbacks,0);
});

test('a deadline reached during backoff prevents another transaction attempt',async()=>{
 const error=markRollbackConfirmed(databaseError());
 let time=0,attempts=0;
 await assert.rejects(retryAbortedProfileChunk(async()=>{attempts++;throw error;},
  {deadline:13000,now:()=>time,sleep:async()=>{time=1000;}}),e=>e===error);
 assert.equal(attempts,1);
});

test('a deadline reached by the retry callback prevents sleeping or another attempt',async()=>{
 const error=markRollbackConfirmed(databaseError());
 let time=0,attempts=0,sleeps=0;
 await assert.rejects(retryAbortedProfileChunk(async()=>{attempts++;throw error;},
  {deadline:13000,now:()=>time,onRetry:()=>{time=1000;},sleep:async()=>{sleeps++;}}),e=>e===error);
 assert.equal(attempts,1);
 assert.equal(sleeps,0);
});

test('zero retry budget preserves the first error',async()=>{
 const error=markRollbackConfirmed(databaseError());
 let attempts=0;
 await assert.rejects(retryAbortedProfileChunk(async()=>{attempts++;throw error;},
  {...options(),maxRetries:0}),e=>e===error);
 assert.equal(attempts,1);
});

test('retry configuration cannot exceed three total attempts',async()=>{
 let attempts=0;
 await assert.rejects(retryAbortedProfileChunk(async()=>{attempts++;},
  {...options(),maxRetries:3}),RangeError);
 assert.equal(attempts,0);
});
