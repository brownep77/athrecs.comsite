import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import { auditResults } from '../../../scripts/lib/result-evidence-audit.mjs';
import { fetchSource } from '../club-scanner/provider.server.ts';
import { canonicalDistance, normal, parseTable, guessMapping, type Meta, type Row } from './core.ts';
export type SourceCheck = { rows:Row[]; hash:string };
/** Bounded first-party source fetch; this is deliberately not an arbitrary URL proxy. */
export async function checkSource(input:Row[],meta:Meta):Promise<SourceCheck>{
  const url=new URL(meta.sourceUrl);
  if(url.origin!=='https://totalracetiming.co.uk'||!/^\/raceresults\/\d+$/.test(url.pathname))throw Error('This first version checks Total Race Timing result pages. Other sources need their own reviewed adapter.');
  const html=await fetchSource(meta.sourceUrl),$=load(html);$('br').replaceWith(' ');
  const text=(s:string)=>s.replace(/\s+/g,' ').trim();
  const race=text($('h2').first().text());
  if(normal(race)!==normal(meta.eventName))throw Error(`The source calls this race “${race}”. Check the race name before importing.`);
  const captures:Array<{url:string;headings:string[];startTimes:string[];rowCount:number;tables:Array<{headers:string[];rows:string[][]}>}>=[];
  $('table').each((_,element)=>{
    const t=$(element),heading=t.prevAll('h3').first(),anchor=heading.attr('id')??'',discipline=text(heading.text());
    if(url.hash&&decodeURIComponent(url.hash.slice(1))!==anchor)return;
    const dates=text(t.prevAll('p').first().text()).match(/\d{2}\/\d{2}\/\d{4}/g)??[];
    if(dates.length!==1||dates[0].split('/').reverse().join('-')!==meta.date)return;
    try{if(canonicalDistance(discipline)!==canonicalDistance(meta.distance))return;}catch{return;}
    const headers=t.find('thead th').map((_,h)=>text($(h).text())).get();
    const rows:string[][]=[];t.find('tbody tr').each((_,tr)=>{rows.push($(tr).find('td').map((_,td)=>text($(td).text())).get());});
    captures.push({url:meta.sourceUrl,headings:[race,discipline],startTimes:dates,rowCount:rows.length,tables:[{headers,rows}]});
  });
  if(captures.length!==1)throw Error('Could not identify exactly one source table for this date and distance. Supply its table-anchor URL or review the source.');
  const capture=captures[0],table=capture.tables[0],official=parseTable([table.headers,...table.rows],guessMapping(table.headers),meta);
  const rows=input.map(row=>{
    const issues=[...row.issues],matches=official.filter(r=>r.bib===row.bib);
    if(matches.length!==1)issues.push('Bib is missing or repeated on the official source.');
    else{
      const source=matches[0];issues.push(...source.issues);
      for(const field of ['name','gender','category','club','chipMs','gunMs','finishMs','place','genderPlace','categoryPlace'] as const){
        if(field==='name'?normal(row[field])!==normal(source[field]):row[field]!==source[field])issues.push(`Source mismatch: ${field}.`);
      }
    }
    return {...row,issues:[...new Set(issues)]};
  });
  const proposed=rows.map(r=>({id:r.key,athlete_id:r.name,display_name:r.name,event_name:meta.eventName,event_date:meta.date,distance_code:meta.distance,status:'finished',result_visibility:'private',source_url:meta.sourceUrl,finish_time_seconds:r.finishMs===null?null:r.finishMs/1000,chip_time_seconds:r.chipMs===null?null:r.chipMs/1000,gun_time_seconds:r.gunMs===null?null:r.gunMs/1000,overall_place:r.place,gender_place:r.genderPlace,category_place:r.categoryPlace}));
  const audit=auditResults(proposed,[capture]);
  if(audit.scope.untestedResults)throw Error('Independent source audit is incomplete.');
  for(const result of [...audit.issues,...audit.comparisons]){
    const r=rows.find(row=>row.key===result.result_id);if(r)r.issues=[...new Set([...r.issues,...result.flags])];
  }
  return {rows,hash:createHash('sha256').update(JSON.stringify(capture)).digest('hex')};
}
