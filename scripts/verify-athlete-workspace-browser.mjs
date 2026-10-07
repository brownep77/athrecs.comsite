import assert from 'node:assert/strict';
import { mkdirSync,writeFileSync,rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
const require=createRequire(import.meta.url),{chromium}=require(process.env.ATHRECS_BROWSER_MODULE||'playwright');
const root=resolve('artifacts/workspace-fixture');mkdirSync(root,{recursive:true});
const profile={id:7,slug:'synthetic-athlete',profile_visibility:'public',display_name:'Synthetic Athlete',given_name:'Synthetic',family_name:'Athlete',gender:'U',source_club_name:'Synthetic Club',city:'',county:'',country:'',bio:''};
const result={id:11,race:'Existing Synthetic 10K',date:'2026-09-20',distance:'10K',time:'00:40:00.1',excluded:false};
writeFileSync(resolve(root,'api.js'),`window.calls=[];window.workspace={profile:${JSON.stringify(profile)},profileVersion:'${'a'.repeat(64)}',editable:true,linked:[],results:[${JSON.stringify(result)}],batches:[],email:'staff@example.test'};
const clone=x=>JSON.parse(JSON.stringify(x));
export async function searchStaffAthletes(){return [{id:7,name:'Synthetic Athlete',club:'Synthetic Club',visibility:'public',slug:'synthetic-athlete'}]}
export async function getStaffWorkspace(){return clone(window.workspace)}
export const getMyWorkspace=getStaffWorkspace;
export async function editStaffAthlete({data}){window.calls.push({kind:'edit',data});Object.assign(window.workspace.profile,data.fields);return {saved:true}}
export const editOwnedAthlete=editStaffAthlete;
export async function excludeStaffResult({data}){window.calls.push({kind:'exclude',data});window.workspace.results[0].excluded=data.excluded;return {saved:true}}
export const excludeOwnedResult=excludeStaffResult;
export async function saveStaffPastedResults({data}){window.calls.push({kind:'draft',data});window.batch={id:data.id,athlete_id:data.athleteId,submitted_by:'staff',source_url:data.sourceUrl,original_text:data.text,input_hash:'${'d'.repeat(64)}',entries:data.rows.map(r=>({...r,state:'pending'})),revision:1,evidence_for:'',evidence_against:'',updated_at:'2026-09-26'};window.workspace.batches=[window.batch];return {id:data.id,reused:false}}
export const saveMyPastedResults=saveStaffPastedResults;
export async function getStaffResultBatch(){return clone(window.batch)}
export const getMyResultBatch=getStaffResultBatch;
export async function createAthleteReviewLink({data}){window.calls.push({kind:'invite',data});return {id:'00000000-0000-4000-8000-000000000009',url:'https://www.athrecs.com/review-results#${'b'.repeat(64)}',expiresInDays:7}}
export async function revokeAthleteReviewLink({data}){window.calls.push({kind:'revoke',data});return {revoked:true}}
export async function reviewStaffPastedResults({data}){window.calls.push({kind:'publish',data});if(window.failPublish)throw new Error('Synthetic source conflict; nothing saved.');window.batch.entries[0].state='approved';window.batch.revision++;return {added:1,duplicates:0,resultIds:[12],replay:false}}
export async function loadAthleteReview(){return {athleteName:'Synthetic Athlete',rows:[{index:1,race:'Suggested Synthetic Race',date:'2026-09-20',distance:'10K',time:'00:40:00.1',timingBasis:'chip',sourceUrl:'https://example.test/results',bib:'1',place:'1'}]}}
export async function respondToAthleteReview({data}){window.calls.push({kind:'response',data});return {recorded:true}}
`);
writeFileSync(resolve(root,'router.js'),'export const createFileRoute=()=>options=>({options});');
writeFileSync(resolve(root,'auth.js'),'export const openAthleteAuth=()=>{};');
writeFileSync(resolve(root,'user.js'),"export const useCurrentUserState=()=>({user:{id:'synthetic-recipient'},isPending:false});");
writeFileSync(resolve(root,'scope.js'),'export const IS_ATHRECS_SITE=true;');
writeFileSync(resolve(root,'style.css'),`@import "${resolve('src/styles.css')}";\n@source "${resolve('src')}";`);
writeFileSync(resolve(root,'main.tsx'),`import React from 'react';import{createRoot}from'react-dom/client';import{QueryClient,QueryClientProvider}from'@tanstack/react-query';import{AthleteWorkspace}from'/@fs/${resolve('src/components/athletes/AthleteWorkspace.tsx')}';import{Route}from'/@fs/${resolve('src/routes/review-results.tsx')}';import'./style.css';const Review=Route.options.component;const client=new QueryClient({defaultOptions:{queries:{retry:false}}});createRoot(document.getElementById('root')!).render(<QueryClientProvider client={client}><div style={{maxWidth:1280,margin:'auto',padding:16}}><p>ISOLATED SYNTHETIC TEST — NO LIVE DATA</p>{location.search.includes('review')?<Review/>:<AthleteWorkspace staff initialAthleteId={7}/>}</div></QueryClientProvider>);`);
writeFileSync(resolve(root,'index.html'),'<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>');
const server=await createServer({configFile:false,root,plugins:[react(),tailwindcss()],resolve:{alias:[{find:'@/lib/athlete-workspace/api',replacement:resolve(root,'api.js')},{find:'@tanstack/react-router',replacement:resolve(root,'router.js')},{find:'@/lib/auth/client',replacement:resolve(root,'auth.js')},{find:'@/lib/auth/use-current-user',replacement:resolve(root,'user.js')},{find:'@/lib/site-scope',replacement:resolve(root,'scope.js')},{find:'@',replacement:resolve('src')}]},server:{host:'127.0.0.1',port:8102,strictPort:true,fs:{allow:[process.cwd()]}}});
await server.listen();const browser=await chromium.launch({headless:true});let page;
try{
  page=await browser.newPage({viewport:{width:1365,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.goto('http://127.0.0.1:8102');await page.getByRole('heading',{name:'Edit Synthetic Athlete',exact:true}).waitFor();assert.equal(await page.evaluate(()=>window.calls.length),0);
  await page.getByLabel('Factual biography').fill('A factual profile correction.');await page.getByLabel('Reason / source for this edit').fill('Synthetic source checked for this correction.');await page.getByRole('button',{name:'Save profile changes'}).click();
  await page.waitForFunction(()=>window.calls.some(c=>c.kind==='edit'));
  await page.getByRole('button',{name:'Remove from profile',exact:true}).click();assert.equal(await page.evaluate(()=>window.calls.filter(c=>c.kind==='exclude').length),0);
  await page.getByLabel('Reason',{exact:true}).fill('Wrong profile attribution; retain original race record.');await page.getByRole('button',{name:'Confirm change',exact:true}).click();await page.getByRole('button',{name:'Restore to profile',exact:true}).waitFor();
  // A manual entry with no URL or a malformed URL must show issues, not crash React.
  await page.getByRole('button',{name:'Add a race manually',exact:true}).click();
  await page.getByText(/Source-results HTTPS link required/).waitFor();
  assert(await page.getByRole('button',{name:'Save proposed results for review'}).isDisabled());
  await page.getByLabel('Source profile or results URL').fill('not a URL');
  assert(await page.getByRole('button',{name:'Save proposed results for review'}).isDisabled());
  assert.deepEqual(errors,[]);
  await page.getByLabel('Source profile or results URL').fill('https://example.test/results');await page.getByLabel('Unlabelled times mean').selectOption('chip');
  await page.getByLabel('Copied results table').fill('Race,Date,Distance,Time\nNew Synthetic 10K,20/09/2026,10K,00:41:00.1');await page.getByRole('button',{name:'Preview pasted rows'}).click();
  assert.equal(await page.evaluate(()=>window.calls.filter(c=>c.kind==='draft').length),0);await page.getByLabel('I am authorised to submit this material for review.',{exact:false}).check();await page.getByRole('button',{name:'Save proposed results for review'}).click();
  await page.getByRole('heading',{name:'Review proposed races',exact:true}).waitFor();await page.getByRole('button',{name:'Select 1 ready proposals',exact:true}).click();
  const publish=page.getByRole('button',{name:'Add 1 checked results to profile'});assert(await publish.isDisabled());
  await page.getByLabel('Athlete’s email').fill('athlete@example.test');await page.getByRole('button',{name:'Create confirmation link'}).click();await page.getByLabel('Copy this link').waitFor();assert.match(await page.getByLabel('Copy this link').inputValue(),/review-results#/);
  await page.getByLabel('Evidence supporting this addition').fill('Opened the official source and checked bib and identity.');await page.getByLabel('I opened the source and checked race, date, distance, timing and supplied placing.').check();await page.getByLabel('I checked the selected results belong to this athlete, not just a similar name.').check();await page.getByLabel('I am authorised to add these records with the profile’s existing visibility.').check();assert(await publish.isEnabled());
  await page.evaluate(()=>{window.failPublish=true;});await publish.click();await page.getByText(/Synthetic source conflict; nothing saved./).waitFor();const first=await page.evaluate(()=>window.calls.filter(c=>c.kind==='publish')[0].data);
  await page.screenshot({path:'artifacts/workspace-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'artifacts/workspace-mobile.png',fullPage:true});
  await page.evaluate(()=>{window.failPublish=false;});await publish.click();await page.waitForFunction(()=>window.calls.filter(c=>c.kind==='publish').length===2);const retry=await page.evaluate(()=>window.calls.filter(c=>c.kind==='publish')[1].data);assert.deepEqual(retry,first,'Retry retains the reviewed payload and request ID');
  await page.getByText('1 results added; 0 existing results retained. No athlete ownership was changed.',{exact:true}).waitFor();
  // Unassigned member proposals remain open while staff select their intended athlete.
  await page.evaluate(()=>{window.batch.athlete_id=null;window.batch.entries[0].state='pending';window.batch.revision++;window.workspace.batches=[window.batch];});
  await page.getByRole('button',{name:'Show all proposal batches'}).click();
  await page.getByRole('button',{name:/1 proposed races.*not linked yet/}).click();
  await page.getByRole('heading',{name:'Review proposed races',exact:true}).waitFor();
  await page.getByLabel('Find an athlete',{exact:true}).fill('Synthetic');await page.getByRole('button',{name:'Search athletes',exact:true}).click();
  await page.getByRole('button',{name:/Synthetic Athlete.*Record 7/}).click();
  await page.getByText(/Target athlete 7/).waitFor();
  assert(await page.getByRole('heading',{name:'Review proposed races',exact:true}).isVisible());
  assert(await page.getByRole('button',{name:'Add 0 checked results to profile'}).isDisabled());
  await page.goto(`http://127.0.0.1:8102/?review=1#${'c'.repeat(64)}`);await page.getByRole('heading',{name:'Proposed matches for Synthetic Athlete'}).waitFor();assert.equal(await page.evaluate(()=>window.calls.length),0);
  await page.getByLabel('Not mine',{exact:true}).check();const submit=page.getByRole('button',{name:'Submit my responses'});assert(await submit.isDisabled());await page.getByLabel('I have reviewed these answers.',{exact:false}).check();await page.screenshot({path:'artifacts/workspace-recipient-mobile.png',fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await submit.click();await page.getByRole('heading',{name:'Response recorded'}).waitFor();
  const calls=await page.evaluate(()=>window.calls);assert.deepEqual(calls.map(c=>c.kind),['response']);assert.equal(calls[0].data.responses[0].response,'no');assert.equal(await page.evaluate(()=>sessionStorage.getItem('athrecs:recipient-result-review')),null);assert.deepEqual(errors,[]);
  console.log('PASS: actual React edits, explicit removal, invalid-link recovery, paste preview/private save, link creation, approval gates, identical failed-save retry, persistent receipt, unassigned target selection and recipient denial without publication; desktop/mobile. APIs are synthetic mocks.');
}catch(e){if(page)await page.screenshot({path:'artifacts/workspace-failure.png',fullPage:true});throw e;}finally{await browser.close();await server.close();rmSync(root,{recursive:true,force:true});}
