import { timingSafeEqual } from 'node:crypto';
import pg from 'pg';
import { attachDatabasePool } from '@neon/functions';
import { parseTriggerDelivery } from '@neon/functions/triggers';
import { run,status } from './worker.mjs';
const expectedBranch=process.env.EXPECTED_BRANCH,secret=process.env.DUV_ADMIN_SECRET;
if(!expectedBranch||!secret||!process.env.DATABASE_URL)throw Error('Private import configuration missing');
if(process.env.NEON_BRANCH!==expectedBranch)throw Error('Private import branch mismatch');
const connection=new URL(process.env.DATABASE_URL);connection.searchParams.set('sslmode','verify-full');
const pool=new pg.Pool({connectionString:connection.href,max:3,connectionTimeoutMillis:10000,idleTimeoutMillis:30000});
attachDatabasePool(pool);
function admin(request){const v=request.headers.get('x-secret');if(!v)return false;const a=Buffer.from(v),b=Buffer.from(secret);return a.length===b.length&&timingSafeEqual(a,b);}
export default {
 async fetch(request){
  const url=new URL(request.url);
  if(url.pathname==='/health')return new Response('private-duv-import-v2',{headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});
  if(url.pathname==='/cron'&&request.method==='POST'){
   const parsed=await parseTriggerDelivery(request);
   if(!parsed.ok||parsed.invocation.type!=='schedule'||parsed.invocation.trigger.name!=='duv-2026-import')return new Response('Unauthorized',{status:401});
  }else if(!admin(request))return new Response('Unauthorized',{status:401});
  try{
   if(url.pathname==='/status')return Response.json(await status(pool),{headers:{'Cache-Control':'private, no-store'}});
   if(request.method==='POST'&&['/run','/cron'].includes(url.pathname)){
    const options=url.pathname==='/run'?{maxMs:Math.min(250000,Math.max(30000,Number(url.searchParams.get('maxMs'))||245000)),maxEvents:Math.min(20,Math.max(1,Number(url.searchParams.get('maxEvents'))||20))}:{};
    return Response.json(await run(pool,options),{headers:{'Cache-Control':'private, no-store'}});
   }
   return new Response('Not found',{status:404});
  }catch(e){console.error('duv_import_request_failed',String(e.code??e.name));return Response.json({error:'import_request_failed'},{status:500});}
 }
};
