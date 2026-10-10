import { load } from 'cheerio';
import { Parser } from 'htmlparser2';
import { createHash } from 'node:crypto';
export const PROVIDER='DUV Ultra Marathon Statistics';
export const clean=x=>String(x??'').replace(/\s+/gu,' ').trim();
export const sha=x=>createHash('sha256').update(x).digest('hex');
export const eventId=url=>/^https:\/\/statistik\.d-u-v\.org\/getresultevent\.php\?event=(\d+)$/.exec(url)?.[1];
const required=['Rank','Performance','Surname, first name','Club','Nat.','YOB','M/F','Rank M/F','Cat','Cat. Rank'];

// A streaming HTML tokenizer independently reconstructs the original tables.
// It does not use the primary parse5/Cheerio tree or its selectors.
function alternateTables(raw){
 const tables=[],stack=[];let row=null,cell=null,anchor=null;
 const p=new Parser({
  onopentag(tag,attrs){
   if(tag==='table')stack.push({id:attrs.id,rows:[]});
   else if(stack.length&&tag==='tr')row=[];
   else if(row&&['td','th'].includes(tag))cell={text:'',links:[],linkTexts:[]};
   else if(cell&&tag==='a'&&attrs.href){cell.links.push(attrs.href);anchor='';}
  },
  ontext(value){if(cell)cell.text+=value;if(anchor!==null)anchor+=value;},
  onclosetag(tag){
   if(tag==='a'&&cell&&anchor!==null){cell.linkTexts.push(clean(anchor));anchor=null;}
   if(['td','th'].includes(tag)&&cell){cell.text=clean(cell.text);row.push(cell);cell=null;}
   else if(tag==='tr'&&row){stack.at(-1)?.rows.push(row);row=null;}
   else if(tag==='table'&&stack.length)tables.push(stack.pop());
  },
 },{decodeEntities:true});p.write(raw);p.end();return tables;
}
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function ymd(y,m,d){
 const s=`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
 if(new Date(s+'T00:00:00Z').toISOString().slice(0,10)!==s)throw Error('invalid_source_date');
 return s;
}
export function dates(value){
 let m;
 if(m=/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value))return {start:ymd(m[3],m[2],m[1]),end:ymd(m[3],m[2],m[1])};
 if(m=/^(\d{1,2})\.-(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value))return {start:ymd(m[4],m[3],m[1]),end:ymd(m[4],m[3],m[2])};
 if(m=/^(\d{1,2})\.(\d{1,2})\.-(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value))return {start:ymd(m[5],m[2],m[1]),end:ymd(m[5],m[4],m[3])};
 if(m=/^(\d{1,2})\.(\d{1,2})\.(\d{4})\s*-\s*(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value))return {start:ymd(m[3],m[2],m[1]),end:ymd(m[6],m[5],m[4])};
 throw Error('unsupported_source_date');
}
function decimalScale(value,multiplier){
 const [whole,frac='']=value.split('.');const n=(BigInt(whole+frac)*BigInt(multiplier)).toString().padStart(frac.length+1,'0');
 return frac?n.slice(0,-frac.length)+'.'+n.slice(-frac.length):n;
}
export function measurement(display,distance){
 let m;const duration=/^(\d+(?:\.\d+)?)(h|d)$/.exec(distance);
 const eventDurationSeconds=duration?decimalScale(duration[1],duration[2]==='h'?3600:86400):null;
 if(m=/^(\d+(?:\.\d+)?) km$/.exec(display))return {kind:'distance',display,value:m[1],unit:'km',achievedDistanceMetres:decimalScale(m[1],1000),finishTimeSeconds:null,eventDurationSeconds,timeBasis:'not_applicable'};
 if(m=/^(\d+):(\d{2}):(\d{2})(?:\.(\d+))?(?: h)?$/.exec(display)){
  if(+m[2]>=60||+m[3]>=60)throw Error('invalid_time_component');
  const seconds=String(BigInt(m[1])*3600n+BigInt(m[2])*60n+BigInt(m[3]))+(m[4]?'.'+m[4]:'');
  if(duration)throw Error('time_in_timed_distance_race');
  return {kind:'time',display,value:seconds,unit:'seconds',achievedDistanceMetres:null,finishTimeSeconds:seconds,eventDurationSeconds:null,timeBasis:'not_stated_in_table'};
 }
 return {kind:'unparsed',display,value:null,unit:null,achievedDistanceMetres:null,finishTimeSeconds:null,eventDurationSeconds,timeBasis:'unknown'};
}

export function parseEvent(rawBuffer,inventory,capturedAt,year=2026,pageUrl=inventory.sourceUrl){
 const sourceUrl=inventory.sourceUrl,id=eventId(sourceUrl);if(!id)throw Error('unapproved_source_url');
 const pu=new URL(pageUrl);if(pu.origin!=='https://statistik.d-u-v.org'||pu.pathname!=='/getresultevent.php'||pu.searchParams.get('event')!==id||[...pu.searchParams.keys()].some(k=>!['event','page'].includes(k)))throw Error('invalid_page_url');
 const raw=rawBuffer.toString('utf8'),$=load(raw),table=$('table#Resultlist');
 if(table.length!==1)throw Error('missing_or_ambiguous_result_table');
 const headers=table.find('thead > tr > th').toArray().map(x=>clean($(x).text()));
 const nameHeader=headers.includes('Surname, first name')?'Surname, first name':'Original name Surname, first name';
 if(new Set(headers).size!==headers.length||required.some(h=>!headers.includes(h==='Surname, first name'?nameHeader:h)))throw Error('unmapped_source_headings');
 const primary=table.find('tbody > tr').toArray().map(tr=>$(tr).children('td').toArray().map(c=>({text:clean($(c).text()),links:$(c).find('a[href]').toArray().map(a=>$(a).attr('href')),linkTexts:$(c).find('a[href]').toArray().map(a=>clean($(a).text()))})));
 if(primary.some(r=>r.length!==headers.length))throw Error('incomplete_source_row');
 const alternatives=alternateTables(raw),result=alternatives.filter(t=>t.id==='Resultlist');
 if(result.length!==1||!same(result[0].rows[0].map(c=>c.text),headers)||!same(result[0].rows.slice(1),primary))throw Error('independent_source_comparison_failed');
 const meta={},links={};
 $('table > tbody > tr, table > tr').each((_,tr)=>{
  const cells=$(tr).children('td');if(cells.length>=2&&cells.eq(0).children('b').length){
   const key=clean(cells.eq(0).text()).replace(/:$/,'');meta[key]=clean(cells.eq(1).text());links[key]=cells.eq(1).find('a[href]').toArray().map(a=>$(a).attr('href'));
  }
 });
 for(const [k,v] of Object.entries(meta)){
  const candidates=alternatives.flatMap(t=>t.rows).filter(r=>r.length>=2&&r[0].text.replace(/:$/,'')===k);
  if(!candidates.some(r=>r[1].text===v&&same(r[1].links,links[k])))throw Error('independent_metadata_comparison_failed');
 }
 // DUV sometimes adds an edition/display prefix only on the detail page.
 // Keep both originals; require the entire remaining title to match exactly.
 const detailName=meta.Event??'',indexName=inventory.index.Event??'';
 const withoutPrefix=detailName.replace(/^\d+(?:(?:st|nd|rd|th|a|\^|[ºª°])|\s*\.)?\s+/i,'');
 if((detailName!==indexName&&withoutPrefix!==indexName)||meta.Date!==inventory.index.Date)throw Error('index_metadata_changed');
 const distance=inventory.index.Distance;
 const comparisonDistance=distance?.replace(/^(\d+(?:\.\d+)?km\/\d+)Etappen$/,'$1stages');
 if(!distance||!meta.Distance?.startsWith(comparisonDistance+' '))throw Error('index_distance_changed');
 const range=dates(meta.Date);
 if(range.start>range.end||range.start.slice(0,4)!==String(year)||range.end>capturedAt.slice(0,10))throw Error('invalid_or_future_date_range');
 const count=/^(\d+)\s*\((\d+) M, (\d+) F\)$/.exec(meta.Finishers);
 if(!count)throw Error('unrecognized_source_finisher_count');
 const listedTotal=+count[1];let total=listedTotal;
 const pagination=$('a[href]').toArray().map(a=>new URL($(a).attr('href'),sourceUrl).href).filter(u=>{
  const p=new URL(u);return p.origin==='https://statistik.d-u-v.org'&&p.pathname==='/getresultevent.php'&&p.searchParams.get('event')===id&&p.searchParams.has('page');
 });
 const fullText=clean($.root().text());
 const span=/(\d+) to (\d+) of (\d+) search results/.exec(fullText);
 const offset=span?+span[1]-1:0;
 // Some complete, unpaginated tables list explicit X-category performances
 // outside the displayed M/F subtotal. Keep every row and both original totals;
 // never use this exception for missing/unknown categories or incomplete pages.
 const sourceGenders=primary.map(cells=>cells[headers.indexOf('M/F')].text);
 const male=sourceGenders.filter(g=>g==='M').length,female=sourceGenders.filter(g=>g==='F').length,explicitX=sourceGenders.filter(g=>g==='X').length;
 const extraX=!span&&!pagination.length&&explicitX>0&&listedTotal===+count[2]+ +count[3]&&male===+count[2]&&female===+count[3]&&primary.length===listedTotal+explicitX;
 if(extraX)total=primary.length;
 if(span&&(+span[3]!==total||+span[2]-offset!==primary.length))throw Error('source_page_range_mismatch');
 if(!span&&total!==primary.length)throw Error('partial_page_without_range');
 const indexCount=Number(inventory.index.Finishers);
 if(indexCount!==listedTotal)throw Error('index_finisher_count_changed');
 const seen=new Set(),rows=primary.map((cells,n)=>{
  const original=Object.fromEntries(headers.map((h,i)=>[h,cells[i].text]));
  const originalLinks=Object.fromEntries(headers.map((h,i)=>[h,cells[i].links]));
  const runnerLinks=originalLinks[nameHeader].map(u=>new URL(u,sourceUrl).href);
  if(runnerLinks.length!==1)throw Error('missing_or_ambiguous_runner_link');
  const ru=new URL(runnerLinks[0]),rid=ru.searchParams.get('runner');
  if(ru.origin!=='https://statistik.d-u-v.org'||ru.pathname!=='/getresultperson.php'||!/^\d+$/.test(rid??''))throw Error('invalid_source_runner_id');
  if(seen.has(rid))throw Error('repeated_source_runner');seen.add(rid);
  const full=cells[headers.indexOf(nameHeader)].linkTexts[0],comma=full.indexOf(',');
  const family=comma>=0?clean(full.slice(0,comma)):'',given=comma>=0?clean(full.slice(comma+1)):'';
  const performance=measurement(original.Performance,distance);
  const places=Object.fromEntries([['overall','Rank'],['gender','Rank M/F'],['category','Cat. Rank']].map(([k,h])=>[k,/^\d+$/.test(original[h])&&+original[h]>0?+original[h]:null]));
  const status=places.overall!==null&&!/^DN[FS]|^DSQ|^DQ$/i.test(original.Performance)?'finished':'unknown';
  const birth=/^\d{4}$/.test(original.YOB)?+original.YOB:null;
  return {name:given&&family?given+' '+family:full,givenName:given,familyName:family,bib:null,club:original.Club,
   gender:original['M/F'],category:original.Cat,date:range.start,endDate:range.end,distanceLabel:distance,status,
   tableKey:'Resultlist',sourceRow:offset+n+1,sourcePageUrl:pageUrl,sourceDocumentHash:sha(rawBuffer),sourceName:full,sourceAthleteId:rid,sourceAthleteUrl:runnerLinks[0],original,originalLinks,
   performanceDisplay:original.Performance,performance,places,sourceBirthYear:birth,sourceNationality:original['Nat.'],
   clubDisplayTruncated:original.Club.endsWith('...'),verificationStatus:'unverified'};
 });
 if(rows.length===total&&(rows.filter(r=>r.gender==='M').length!==+count[2]||rows.filter(r=>r.gender==='F').length!==+count[3]))throw Error('gender_count_mismatch');
 return {schemaVersion:2,provider:PROVIDER,sourceKey:'duv-'+id,sourceUrl,capturedAt,htmlSha256:sha(rawBuffer),publication:'staff_only',
  index:{name:meta.Event,date:range.start,endDate:range.end,location:'',distance,raw:inventory.index},
  eventMetadata:meta,eventMetadataLinks:links,rows,
  provenance:{indexUrl:inventory.indexUrl,indexHtmlSha256:inventory.indexHtmlSha256,originalResultUrls:links.Source??[],originalResultSourceInspected:false,sourceRole:'secondary_statistics_provider',organiser:null},
  pagination:{total,listedTotal,male:+count[2],female:+count[3],offset,pageUrl,pageLinks:[...new Set(pagination)]},
  coverage:{duvPageComplete:rows.length===total,organiserFieldComplete:'unknown',note:'Complete displayed DUV field; statistical thresholds may exclude other participants.'},
  audit:{sourceCheck:'compared',parser:'parse5/cheerio',independentParser:'htmlparser2 streaming callbacks',version:2,comparedRows:rows.length,comparedCells:rows.length*headers.length,runnerLinksCompared:true,metadataCompared:true,identityVerified:false,
   metadataComparisons:{eventName:detailName===indexName?'exact':'detail_numeric_prefix',distance:comparisonDistance===distance?'exact':'Etappen_to_stages',finisherCount:{method:extraX?'listed_MF_plus_explicit_X':'exact',listedTotal,displayedRows:total,explicitX:extraX?explicitX:null}}}};
}

export function combinePages(parts){
 if(!parts.length)throw Error('missing_source_pages');
 const first=parts.find(p=>p.pagination.offset===0);if(!first)throw Error('missing_first_page');
 const total=first.pagination.total,ids=new Set(),rows=[];
 for(const p of parts){
  if(p.sourceKey!==first.sourceKey||!same(p.eventMetadata,first.eventMetadata)||p.pagination.total!==total)throw Error('changed_metadata_across_pages');
  rows.push(...p.rows);
 }
 rows.sort((a,b)=>a.sourceRow-b.sourceRow);
 if(rows.length!==total||rows.some((r,i)=>r.sourceRow!==i+1))throw Error('source_pages_not_complete');
 for(const r of rows){if(ids.has(r.sourceAthleteId))throw Error('duplicate_runner_across_pages');ids.add(r.sourceAthleteId);}
 if(rows.filter(r=>r.gender==='M').length!==first.pagination.male||rows.filter(r=>r.gender==='F').length!==first.pagination.female)throw Error('combined_gender_counts_differ');
 return {...first,rows,pagination:undefined,coverage:{...first.coverage,duvPageComplete:true},
  provenance:{...first.provenance,sourceDocuments:parts.map(p=>({sourceUrl:p.pagination.pageUrl,htmlSha256:p.htmlSha256,capturedAt:p.capturedAt,rows:p.rows.length}))},
  audit:{...first.audit,comparedRows:rows.length,comparedCells:parts.reduce((n,p)=>n+p.audit.comparedCells,0),comparedPages:parts.length}};
}
export function parseIndex(rawBuffer,sourceUrl,year=2026){
 const raw=rawBuffer.toString('utf8'),$=load(raw),t=$('table#Resultlist');
 if(t.length!==1||$('select[name="year"] option[selected]').attr('value')!==String(year))throw Error('index_year_or_table_mismatch');
 const rows=t.find('tr').toArray().map(tr=>$(tr).children('th,td').toArray().map(c=>({text:clean($(c).text()),links:$(c).find('a[href]').toArray().map(a=>$(a).attr('href')),linkTexts:$(c).find('a[href]').toArray().map(a=>clean($(a).text()))})));
 const other=alternateTables(raw).filter(t=>t.id==='Resultlist');
 if(other.length!==1||!same(other[0].rows,rows))throw Error('independent_index_comparison_failed');
 const heads=rows[0].map(c=>c.text),events=[];
 for(const cells of rows.slice(1)){
  const urls=cells.flatMap(c=>c.links.map(h=>new URL(h,sourceUrl).href)).filter(u=>eventId(u));if(!urls.length)continue;
  if(urls.length!==1||heads.length!==cells.length)throw Error('unmapped_index_row');
  events.push({sourceUrl:urls[0],index:Object.fromEntries(heads.map((h,i)=>[h,cells[i].text])),indexUrl:sourceUrl,indexHtmlSha256:sha(rawBuffer)});
 }
 const count=/Results of ([\d,]+) events found/.exec(clean($.root().text()));
 if(!count)throw Error('missing_index_total');
 return {events,total:Number(count[1].replaceAll(',','')),htmlSha256:sha(rawBuffer)};
}
