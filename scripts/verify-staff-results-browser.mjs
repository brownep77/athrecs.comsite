import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.ATHRECS_BROWSER_MODULE || "playwright");
const root=resolve('artifacts/import-ui-fixture');mkdirSync(root,{recursive:true});
const row=(index,name,state,candidates=[])=>({index,name,givenName:name.split(' ')[0],familyName:name.split(' ')[1],gender:'M',category:'MO',club:'Synthetic Club',bib:String(100+index),place:index,genderPlace:index,categoryPlace:index,timeText:'00:40:00.1',chipText:'00:40:00.1',gunText:'',finishSeconds:2400.1,chipSeconds:2400.1,gunSeconds:null,issues:state==='blocked'?['Synthetic source conflict']:[],state,candidates,note:state==='review'?'Possible existing identity; staff review required':'Synthetic test record'});
const review={rows:[row(1,'New Synthetic','new'),row(2,'Existing Synthetic','review',[{id:10,name:'Existing Synthetic',slug:'existing-synthetic',club:'Synthetic Club',visibility:'public',managed:false}]),row(3,'Protected Synthetic','review',[{id:12,name:'Protected Synthetic',slug:'protected-synthetic',club:'',visibility:'private',managed:true}]),row(4,'Duplicate Synthetic','duplicate'),row(5,'Conflict Synthetic','blocked')],summary:{total:5,new:1,review:2,duplicate:1,blocked:1,identitiesChecked:20},sourceRows:5,sourceHash:'b'.repeat(64),reviewHash:'a'.repeat(64),event:{id:1},edition:{id:2}};
writeFileSync(resolve(root,'api.js'),`window.testImportCalls=[];export async function checkRaceUpload(){return ${JSON.stringify(review)}}
export async function importCheckedRaceUpload({data}){if(!data.rightsConfirmed||!data.identitiesConfirmed||data.decisions.some(d=>![1,2].includes(d.index)))throw Error('Unsafe mock request');window.testImportCalls.push(data);return {runId:data.requestId,editionId:2,createdProfiles:data.decisions.filter(d=>d.mode==='new').length,linkedProfiles:data.decisions.filter(d=>d.mode==='link').length,importedResults:data.decisions.length,heldRows:5-data.decisions.length,resultsPath:'/results/2',replay:false}}
export async function downloadResultsUploadTemplate(){throw Error('Template is covered separately; this is an isolated UI fixture')}`);
writeFileSync(resolve(root,'router.js'),'export const createFileRoute=()=>options=>({options});');
const css=['src/styles.css','src/index.css','src/app.css'].find(existsSync);
writeFileSync(resolve(root,'style.css'),css?`@import "${resolve(css)}";`:'@import "tailwindcss";');
writeFileSync(resolve(root,'main.tsx'),`import React from 'react';import {createRoot} from 'react-dom/client';import {Route} from '/@fs/${resolve('src/routes/admin/check-results-upload.tsx')}';import './style.css';const Component=Route.options.component;createRoot(document.getElementById('root')!).render(<div style={{maxWidth:1280,margin:'auto',padding:20}}><p style={{fontSize:12}}>ISOLATED UI TEST — SYNTHETIC DATA — NO LIVE DATABASE</p><Component/></div>);`);
writeFileSync(resolve(root,'index.html'),'<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Isolated AthRecs import test</title></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>');
const server=await createServer({configFile:false,root,plugins:[react(),tailwindcss()],resolve:{alias:[{find:'@/lib/staff-results-upload/api',replacement:resolve(root,'api.js')},{find:'@tanstack/react-router',replacement:resolve(root,'router.js')},{find:'@',replacement:resolve('src')}]},server:{host:'127.0.0.1',port:8099,strictPort:true,fs:{allow:[process.cwd()]}}});
await server.listen();const browser=await chromium.launch({headless:true});
let page;
try{
  page=await browser.newPage({viewport:{width:1365,height:1000}});const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',route=>{const u=new URL(route.request().url());return u.hostname==='127.0.0.1'?route.continue():route.abort();});
  await page.goto('http://127.0.0.1:8099');await page.getByRole('heading',{name:'Import athletes & race results'}).waitFor();
  await page.getByLabel('Choose Excel or CSV race results').setInputFiles({name:'synthetic.csv',mimeType:'text/csv',buffer:Buffer.from('Position,Forename,Surname,Tag,Time\n1,New,Synthetic,101,00:40:00.1')});
  await page.getByRole('button',{name:'Check source & duplicates'}).click();
  await page.getByRole('button',{name:/Select all without a match/}).waitFor();
  assert.equal(await page.evaluate(()=>window.testImportCalls.length),0,'Loading/checking never submits an import');
  await page.getByRole('button',{name:/Select all without a match/}).click();
  let button=page.getByRole('button',{name:'Import 1 selected & publish'});
  assert(await button.isDisabled(),'Publication starts disabled');
  await page.getByRole('combobox',{name:/^Show/}).selectOption('all');
  assert(await page.getByLabel('Create profile for New Synthetic').isChecked());
  // Read the native OPTION itself rather than a locator state retargeted to SELECT.
  const protectedOption=page.getByLabel('Match Protected Synthetic',{exact:true}).locator('option[value="12"]');
  const protectedState=await protectedOption.evaluate(option=>({disabled:option.disabled,attribute:option.hasAttribute('disabled'),text:option.textContent}));
  assert.equal(protectedState.disabled,true,JSON.stringify(protectedState));
  assert.equal(protectedState.attribute,true,'The protected native option must carry disabled');
  assert.equal(await page.getByRole('checkbox',{name:/Create profile/}).count(),1,'Blocked and duplicate entries cannot be selected as new');
  await page.screenshot({path:'artifacts/import-desktop.png',fullPage:true});
  await page.getByRole('checkbox',{name:/I am authorised to import/}).check();
  assert(await button.isDisabled(),'One confirmation alone is insufficient');
  await page.getByRole('checkbox',{name:/I have reviewed the selected/}).check();
  assert(await button.isEnabled());await button.click();
  await page.getByRole('heading',{name:'Import complete',exact:true}).waitFor();
  const first=await page.evaluate(()=>window.testImportCalls[0]);
  assert.deepEqual(first.decisions.map(d=>d.index),[1]);
  assert.equal(first.confirmation,'IMPORT SELECTED RESULTS');
  assert.equal(await page.getByRole('link',{name:'View this race’s results'}).getAttribute('href'),'https://www.athrecs.com/results/2');
  await page.getByRole('button',{name:'Check source & duplicates'}).click();
  await page.getByLabel('Match Existing Synthetic',{exact:true}).selectOption('10');
  button=page.getByRole('button',{name:'Import 1 selected & publish'});
  await page.getByRole('checkbox',{name:/I am authorised to import/}).check();
  await page.getByRole('checkbox',{name:/I have reviewed the selected/}).check();
  assert(await button.isDisabled(),'Existing identity requires its own evidence note');
  await page.getByLabel('Identity evidence for Existing Synthetic').fill('Reviewed source club and confirmed athlete identity.');
  assert(await button.isDisabled(),'Changing a decision resets identity approval');
  await page.getByRole('checkbox',{name:/I have reviewed the selected/}).check();
  await button.click();await page.getByRole('heading',{name:'Import complete',exact:true}).waitFor();
  assert.equal((await page.evaluate(()=>window.testImportCalls[1])).decisions[0].athleteId,10);
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'Check source & duplicates'}).click();
  await page.getByRole('button',{name:/Select all without a match/}).waitFor();
  await page.screenshot({path:'artifacts/import-mobile.png',fullPage:true});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'The mobile page must not overflow horizontally');
  await page.getByLabel('Race name',{exact:true}).fill('Changed Synthetic Race');
  assert.equal(await page.getByRole('button',{name:/Import \d+ selected/}).count(),0,'Editing metadata clears the stale review');
  assert.equal(await page.evaluate(()=>window.testImportCalls.length),2);
  assert.deepEqual(errors,[]);
  console.log('PASS: actual React import screen, file upload, no automatic write, bulk selection, protected native options, explicit confirmations, identity-note gating, receipt links, stale-review reset and mobile width. APIs are synthetic mocks, not a signed-in production import.');
} catch(error) {
  if(page){await page.screenshot({path:'artifacts/import-failure.png',fullPage:true});writeFileSync('artifacts/import-failure.html',await page.content());}
  throw error;
} finally {await browser.close();await server.close();rmSync(root,{recursive:true,force:true});}
