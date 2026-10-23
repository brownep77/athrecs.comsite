import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {registerHooks} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
registerHooks({resolve(s,c,n){if(s.startsWith('.')&&c.parentURL?.includes('/src/')){let p=fileURLToPath(new URL(s,c.parentURL));if(!path.extname(p))p=fs.existsSync(p+'.ts')?p+'.ts':path.join(p,'index.ts');return n(pathToFileURL(p).href,c);}return n(s,c);}});
const {seriesList,editions}=await import('../src/data/catalogue.ts');
const {catalogueCalendarRace}=await import('../src/lib/athrecs/catalogue-calendar.ts');
const {buildCalendarEvent,calendarIcs}=await import('../src/lib/athrecs/event-calendar.ts');
const {publicCatalogueContent}=await import('../src/lib/athrecs/public-catalogue-content.ts');
const bySlug=new Map(seriesList.map(s=>[s.slug,publicCatalogueContent(s)]));const ids=new Set();
let valid=0,disabled=0,timed=0,dateOnly=0;const sports=new Set();
for(const [i,e] of editions.entries()){
 const s=bySlug.get(e.seriesSlug);if(!s)continue;
 const input=catalogueCalendarRace(s,{id:i,event_date:e.date,distance_code:e.distance,distance_km:e.distanceKm,status:e.status,start_time:e.startTime??null},'https://www.athrecs.com');
 const model=buildCalendarEvent(input);if(!model){disabled++;continue;}
 const ics=calendarIcs(model);assert(!ics.includes('NaN'));assert(!ics.includes('undefined'));assert(!/run\s*abc/i.test(ics));assert(!ids.has(model.uid));ids.add(model.uid);
 if(model.startUtc)timed++;else dateOnly++;valid++;sports.add(s.sport);
}
console.log(JSON.stringify({checkedEditions:editions.length,exportable:valid,disabled,timed,dateOnly,sports:[...sports]},null,2));
