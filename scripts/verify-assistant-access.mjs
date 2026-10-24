// Execute the real request handlers and staff guards with synthetic sessions and in-memory SQL.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import crypto from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
const require = createRequire(import.meta.url), ts = require('typescript'), zod = require('zod');
function load(path, deps = {}) {
  const module = {exports:{}};
  const {outputText} = ts.transpileModule(readFileSync(path,'utf8'), {fileName:path, compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
  new Function('require','module','exports',outputText)(name => {
    if (!(name in deps)) throw Error(`Unexpected test dependency: ${name}`);
    return deps[name];
  },module,module.exports);
  return module.exports;
}
const db = new PGlite();
await db.exec(readFileSync('migrations/20261016_assistant_chats.sql','utf8'));
await db.exec(readFileSync('migrations/20261020_assistant_chat_alerts.sql','utf8'));
function wrap(connection) {
  const sql = async (strings,...params) => (await connection.query(strings.reduce((s,p,i)=>s+(i?`$${i}`:'')+p,''),params)).rows;
  sql.transaction = fn => connection.transaction(tx => fn(wrap(tx)));
  return sql;
}
const sql = wrap(db);
const config = load('src/lib/athrecs/assistant-config.server.ts');
const alerts = load('src/lib/athrecs/assistant-alerts.server.ts', {'node:crypto':crypto});
const analytics = load('src/lib/athrecs/web-analytics.ts');
const translation = load('src/lib/athrecs/site-translation.ts', {'./web-analytics.ts':analytics});
const core = load('src/lib/athrecs/assistant.ts', {zod,'./site-translation.ts':translation});
const copy = load('src/lib/athrecs/assistant-copy.ts');
const store = load('src/lib/athrecs/assistant-store.server.ts', {'node:crypto':crypto,'./assistant.ts':core,'./assistant-copy.ts':copy});
let request, cookies = {}, setCookies = [], headers = {}, user = null, google = true;
const requestApi = {getRequest:()=>request,getCookie:name=>cookies[name],setCookie:(name,value,options)=>{cookies[name]=value;setCookies.push({name,value,options});},setResponseHeader:(name,value)=>{headers[name]=value;}};
const database = {getSql:async()=>sql};
const server = load('src/lib/athrecs/assistant.server.ts', {'node:crypto':crypto,'@tanstack/react-start/server':requestApi,'../db':database,'./assistant-store.server':store,'./assistant-provider.server':{askOpenAI:async()=> 'Synthetic reply'},'./assistant-config.server':config,'./assistant-alerts.server':alerts});
const staffConfig = load('src/lib/auth/staff-config.ts');
class UnauthorizedError extends Error {}
const staff = load('src/lib/auth/staff.server.ts', {'@tanstack/react-start/server':requestApi,'@/lib/db':{getSql:async()=>async()=>google?[{provider_id:'google'}]:[{provider_id:'credential'}]},'./verify.server':{UnauthorizedError,getSessionUser:async()=>user},'./staff-config':staffConfig});
const isolation = load('src/lib/auth/isolation.server.ts', {'@tanstack/react-start/server':requestApi});
const middleware = load('src/lib/auth/staff-middleware.ts', {'@tanstack/react-start':{createMiddleware:()=>{const chain={client:()=>chain,server:fn=>fn};return chain;}},'@tanstack/react-start/server':requestApi,'./isolation.server':isolation,'./staff.server':staff});
const api = load('src/lib/athrecs/assistant-api.ts', {'@tanstack/react-start':{createServerFn:()=>{let guards=[], validator;const chain={middleware:list=>{guards=list;return chain;},validator:input=>{validator=input;return chain;},handler:handler=>async({data}={})=>{data=validator?validator.parse(data):data;const run=(i,context={})=>i<guards.length?guards[i]({context,next:({context:extra}={})=>run(i+1,{...context,...extra})}):handler({data,context});return run(0);}};return chain;}},zod,'../auth/staff-middleware':middleware,'./assistant':core,'./assistant.server':server,'../db':database});
const keys = ['OPENAI_API_KEY','ATHRECS_ASSISTANT_ENABLED','DATABASE_URL','ATHRECS_ASSISTANT_PROVIDER','ATHRECS_STAFF_EMAILS','ATHRECS_WHATSAPP_NUMBER','VERCEL'];
const saved = Object.fromEntries(keys.map(k=>[k,process.env[k]]));
function setRequest(host='www.athrecs.com', origin=`https://${host}`, site='same-origin') {
  request = new Request(`https://${host}/_serverFn/synthetic`,{method:'POST',headers:{origin,host,'sec-fetch-site':site}});
  headers={};
}
try {
  Object.assign(process.env,{OPENAI_API_KEY:'synthetic-never-sent',ATHRECS_ASSISTANT_ENABLED:'true',DATABASE_URL:'synthetic-in-memory-only',ATHRECS_ASSISTANT_PROVIDER:'openai',ATHRECS_STAFF_EMAILS:'staff@example.test',VERCEL:'0'});
  delete process.env.ATHRECS_WHATSAPP_NUMBER;
  assert.equal(server.assistantConfig().whatsappUrl,null);
  assert.deepEqual(await api.getAssistantStatus(),{enabled:true,whatsappUrl:null});
  setRequest();
  assert.deepEqual(await api.getAssistantHistory(),{messages:[],error:null});
  assert.equal(setCookies.length,0,'history must not create a visitor session');
  for (const [origin,site] of [['https://evil.test','cross-site'],['https://other.athrecs.com','same-site'],['https://evil.test','same-origin'],['https://www.athrecs.com','same-site']]) {
    setRequest('www.athrecs.com',origin,site);
    await assert.rejects(()=>api.getAssistantHistory(),/only on this website/);
    await assert.rejects(()=>api.sendAssistantMessage({data:{message:'Synthetic',language:'en',page:'/athletes',requestId:crypto.randomUUID()}}),/only on this website/);
  }
  setRequest();
  const result = await api.sendAssistantMessage({data:{message:'Synthetic access question',language:'pl',page:'/athletes?private=removed#fragment',requestId:crypto.randomUUID()}});
  assert.equal(result.messages.at(-1).content,'Synthetic reply');
  assert.deepEqual(setCookies[0].options,{httpOnly:true,secure:true,sameSite:'strict',path:'/',maxAge:604800});
  assert.equal(setCookies[0].name,'__Host-athrecs-assistant');
  const [chat] = await sql`SELECT * FROM assistant_conversations`;
  assert.equal(chat.page_path,'/','unknown query parameters must not be retained');
  assert.notEqual(chat.token_hash,setCookies[0].value);
  cookies={};
  assert.deepEqual((await api.getAssistantHistory()).messages,[],'another visitor cannot read this transcript');
  const calls=[()=>api.getStaffAssistantChats({data:{page:0}}),()=>api.getStaffAssistantTranscript({data:{id:chat.id}}),()=>api.deleteStaffAssistantTranscript({data:{id:chat.id}})];
  const denied = async () => {
    for (const call of calls) await assert.rejects(call);
    assert.equal((await sql`SELECT count(*)::int AS n FROM assistant_messages`)[0].n,2,'denied deletion must preserve messages');
    assert.equal(headers['Cache-Control'],'private, no-store');
  };
  user={id:'synthetic-staff',email:'staff@example.test'};
  setRequest();await denied(); // public host
  setRequest('update.athrecs.com');user=null;await denied();
  user={id:'synthetic-member',email:'member@example.test'};await denied();
  user={id:'synthetic-staff',email:'staff@example.test'};google=false;await denied();
  google=true;setRequest('update.athrecs.com','https://evil.test','cross-site');await denied();
  setRequest('update.athrecs.com');
  assert.equal((await calls[0]()).chats.length,1);
  assert.equal((await calls[1]()).messages.length,2);
  assert.equal(headers['X-Robots-Tag'],'noindex, nofollow, noarchive');
  await calls[2]();
  assert.equal((await sql`SELECT count(*)::int AS n FROM assistant_messages`)[0].n,0);
  console.log('PASS: real assistant handlers reject cross-origin requests; secure host-only cookies, hashed session isolation, sanitized pages; staff list/read/delete reject public-host, anonymous, unlisted, non-Google and cross-site sessions; allowed staff read/delete with private no-store headers and cascading deletion. Synthetic sessions and in-memory SQL only.');
} finally {
  for (const key of keys) {if(saved[key]===undefined)delete process.env[key];else process.env[key]=saved[key];}
  await db.close();
}
