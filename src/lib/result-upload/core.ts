/** Pure upload parsing and identity triage. A name match is never an automatic link. */
export const MAX_ROWS = 5000;
export const MAX_BYTES = 3_000_000;
export const normal = (s: unknown) => String(s ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
export function canonicalDistance(value:string):string {
  const s=value.trim().toLowerCase();if(s==='half')return 'Half';if(s==='marathon')return 'Marathon';
  const m=s.match(/^(\d+(?:\.\d+)?)\s*(k|km|mi)$/);if(!m||Number(m[1])<=0)throw Error('Choose a positive distance.');return `${Number(m[1])}${m[2]==='mi'?'mi':'K'}`;
}
export type Basis = 'chip' | 'gun' | 'unspecified';
export type Meta = { eventName: string; date: string; distance: string; sourceUrl: string; basis: Basis; timingConfirmed: boolean };
export const FIELDS = ['name','given','family','bib','gender','category','club','time','chip','gun','place','genderPlace','categoryPlace'] as const;
export type Field = typeof FIELDS[number];
export type Mapping = Partial<Record<Field, number>>;
export type Row = { key: string; line: number; name: string; given: string; family: string; bib: string; gender: string; category: string; club: string; rawTime: string; chipMs: number | null; gunMs: number | null; finishMs: number | null; place: number | null; genderPlace: number | null; categoryPlace: number | null; issues: string[] };
export type Athlete = { id: number; name: string; slug: string; gender: string; club: string | null; visibility: string; managed: boolean };
export type Existing = { id: number; athlete_id: number; name: string; bib: string | null; source_url: string | null; status: string; chip_time_seconds: number | null; gun_time_seconds: number | null; finish_time_seconds: number | null; overall_place: number | null; gender_place: number | null; category_place: number | null; category: string | null; result_details: Record<string, unknown> | null };
export type ReviewRow = { row: Row; status: 'new'|'review'|'duplicate'|'blocked'; reason: string; candidates: Athlete[] };
const aliases: Record<Field, string[]> = {
  name:['name','fullname','athletename','displayname'], given:['forename','firstname','givenname'], family:['surname','lastname','familyname'], bib:['bib','bibnumber','racenumber','tag'],
  gender:['gender','sex','genderfm'], category:['category','agecategory','agegroup'], club:['club','clubname','team'], time:['time','finishtime','totaltime'], chip:['chiptime','nettime'], gun:['guntime','grosstime'],
  place:['position','place','overallplace','overallposition'], genderPlace:['genderpos','genderplace','genderposition','sexposition'], categoryPlace:['catpos','categorypos','categoryplace','categoryposition']
};
export function guessMapping(headers: string[]): Mapping {
  const out: Mapping = {};
  for (const field of FIELDS) {
    const found = headers.flatMap((h,i) => {
      const n=normal(h);
      // TRT's table-export headers can include the filter's option text.
      return aliases[field].includes(n) || (field==='category' && /^categoryf\d/.test(n)) || (field==='club' && /^club(?:attleborough|aylsham|beccles|cityof|cc)/.test(n)) ? [i] : [];
    });
    if(found.length===1) out[field]=found[0];
  }
  return out;
}
export function validateMeta(m: Meta): Meta {
  if(!m || typeof m.eventName!=='string' || !m.eventName.trim() || m.eventName.length>180) throw Error('Enter the race name.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(m.date) || Number.isNaN(Date.parse(m.date)) || new Date(m.date).toISOString().slice(0,10)!==m.date || m.date>new Date().toISOString().slice(0,10)) throw Error('Choose a real race date in the past.');
  if(!/^(?:\d+(?:\.\d+)?\s*(?:K|KM|MI)|Half|Marathon)$/i.test(m.distance)) throw Error('Enter a distance such as 10K, 5mi, Half or Marathon.');
  if(!['chip','gun','unspecified'].includes(m.basis) || m.timingConfirmed!==true) throw Error('Confirm what the Time column represents.');
  const u=new URL(m.sourceUrl);
  if(u.protocol!=='https:' || u.username || u.password || u.search) throw Error('Use the official HTTPS results page, without credentials or query parameters.');
  return {...m,eventName:m.eventName.trim(),distance:canonicalDistance(m.distance),sourceUrl:u.href};
}
export function timeMs(s: string): number | null {
  if(!s.trim()) return null;
  const m=s.trim().match(/^(\d{1,3}):(\d{2})(?::(\d{2}))?(?:[.,](\d{1,3}))?$/);
  if(!m) throw Error('Use a time such as 00:42:18.7, not a bare number.');
  const minutes=Number(m[2]), last=m[3]===undefined?null:Number(m[3]);
  if(minutes>59 || (last!==null && last>59)) throw Error('Minutes and seconds must be below 60.');
  const ms=((last===null?Number(m[1])*60+minutes:Number(m[1])*3600+minutes*60+last)*1000)+Number((m[4]??'').padEnd(3,'0'));
  if(ms<=0 || ms>604800000) throw Error('Finish time must be positive and no longer than seven days.');
  return ms;
}
export function formatMs(ms: number): string {
  const n=Math.round(ms), seconds=Math.floor(n/1000);
  return `${String(Math.floor(seconds/3600)).padStart(2,'0')}:${String(Math.floor(seconds/60)%60).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}.${String(n%1000).padStart(3,'0')}`;
}
export function csvTable(text: string): string[][] {
  const rows:string[][]=[];let row:string[]=[],cell='',quoted=false;
  text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"'){if(quoted && text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
    else if(c===',' && !quoted){row.push(cell);cell='';}
    else if((c==='\r'||c==='\n')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell='';}
    else cell+=c;
    if(rows.length>MAX_ROWS+50 || cell.length>50000 || row.length>100)throw Error('The file exceeds the supported table size.');
  }
  if(quoted)throw Error('A CSV quoted field is not closed.');
  row.push(cell);if(row.some(x=>x.trim()))rows.push(row);return rows;
}
export function parseTable(table:string[][],mapping:Mapping,meta:Meta):Row[]{
  validateMeta(meta);
  if(table.length<2 || table.length>MAX_ROWS+1)throw Error(`Choose a results table with 1–${MAX_ROWS} rows.`);
  const indices=Object.values(mapping).filter((x):x is number=>x!==undefined);
  if(indices.some(i=>!Number.isInteger(i)||i<0||i>=table[0].length)||new Set(indices).size!==indices.length)throw Error('Each mapped field must use a different valid column.');
  if(mapping.bib===undefined || (mapping.name===undefined && (mapping.given===undefined||mapping.family===undefined)))throw Error('Map the bib and athlete name columns.');
  if(mapping.time===undefined&&mapping.chip===undefined&&mapping.gun===undefined)throw Error('Map at least one timing column.');
  const rows=table.slice(1).map((cells,i):Row=>{
    const issues:string[]=[];
    const value=(f:Field)=>mapping[f]===undefined?'':String(cells[mapping[f]!]??'').trim();
    const rank=(f:Field)=>{const s=value(f);if(!s)return null;if(!/^[1-9]\d{0,7}$/.test(s)){issues.push(`Invalid ${f}`);return null;}return Number(s);};
    const timing=(s:string)=>{try{return timeMs(s);}catch(e){issues.push(e instanceof Error?e.message:'Invalid time');return null;}};
    const name=value('name')||`${value('given')} ${value('family')}`.trim(),bib=value('bib');
    if(value('name')&&value('given')&&value('family')&&normal(value('name'))!==normal(`${value('given')} ${value('family')}`))issues.push('Full name and separate name columns disagree.');
    if(!name || name.length>200 || !bib || bib.length>80)issues.push('Name or bib is missing or too long.');
    if(name.split(/\s+/).length<2 || normal(name.split(/\s+/)[0]).length<2)issues.push('Initial-only or incomplete name needs identity review.');
    const rawTime=value('time'),generic=timing(rawTime);
    let chipMs=timing(value('chip')),gunMs=timing(value('gun'));
    if(generic!==null && meta.basis==='chip'){if(chipMs!==null&&chipMs!==generic)issues.push('Time and Chip Time disagree.');else chipMs=generic;}
    if(generic!==null && meta.basis==='gun'){if(gunMs!==null&&gunMs!==generic)issues.push('Time and Gun Time disagree.');else gunMs=generic;}
    const finishMs=chipMs??generic??gunMs;
    if(finishMs===null)issues.push('A positive finish time is required; non-finishers stay held.');
    if(chipMs!==null&&gunMs!==null&&chipMs>gunMs)issues.push('Chip time exceeds gun time.');
    const place=rank('place'),genderPlace=rank('genderPlace'),categoryPlace=rank('categoryPlace');
    if(place!==null&&genderPlace!==null&&genderPlace>place)issues.push('Gender placing exceeds overall placing.');
    if(genderPlace!==null&&categoryPlace!==null&&categoryPlace>genderPlace)issues.push('Category placing exceeds gender placing.');
    const gender=value('gender').toUpperCase();if(gender&&!['M','F','U','X'].includes(gender))issues.push('Unrecognised gender value.');
    if(cells.length!==table[0].length)issues.push('Row does not match the header width.');
    return {key:`${meta.sourceUrl}|${meta.date}|${normal(meta.distance)}|bib:${bib}`,line:i+2,name,given:value('given'),family:value('family'),bib,gender:gender||'U',category:value('category'),club:value('club'),rawTime,chipMs,gunMs,finishMs,place,genderPlace,categoryPlace,issues};
  });
  const keys=new Map<string,number>(),names=new Map<string,number>();for(const r of rows){keys.set(r.key,(keys.get(r.key)??0)+1);names.set(normal(r.name),(names.get(normal(r.name))??0)+1);}
  for(const r of rows){if(keys.get(r.key)!>1)r.issues.push('Repeated bib/source key in this upload.');if(names.get(normal(r.name))!>1)r.issues.push('Repeated name in this race needs review; no profiles have been merged.');}
  return rows;
}
export function possibleMatches(row:Row,athletes:Athlete[]):Athlete[]{
  const p=row.name.split(/\s+/),surname=normal(p.at(-1)),initial=normal(p[0])[0];
  return athletes.filter(a=>normal(a.name)===normal(row.name)||(normal(a.name.split(/\s+/).at(-1))===surname&&normal(a.name)[0]===initial));
}
export function sameStored(row:Row,r:Existing):boolean{
  const round=(n:number|null)=>n===null?null:Math.round(n/1000);
  const detail=r.result_details?.upload as {sourceRowKey?:string;chipMs?:number|null;gunMs?:number|null;finishMs?:number|null;club?:string;gender?:string}|undefined;
  return ['finished','fin'].includes(r.status.toLowerCase())&&normal(r.name)===normal(row.name)&&r.bib===row.bib&&r.chip_time_seconds===round(row.chipMs)&&r.gun_time_seconds===round(row.gunMs)&&r.finish_time_seconds===round(row.finishMs)&&r.overall_place===row.place&&r.gender_place===row.genderPlace&&r.category_place===row.categoryPlace&&(r.category??'')===row.category&&Boolean(detail)&&detail!.sourceRowKey===row.key&&detail!.chipMs===row.chipMs&&detail!.gunMs===row.gunMs&&detail!.finishMs===row.finishMs&&detail!.club===row.club&&detail!.gender===row.gender;
}
export function classify(rows:Row[],athletes:Athlete[],existing:Existing[],sourceUrl:string):ReviewRow[]{
  const names=new Map<string,Athlete[]>(),initials=new Map<string,Athlete[]>();
  const identityKey=(name:string)=>{const p=name.split(/\s+/);return `${normal(p.at(-1))}:${normal(p[0])[0]}`;};
  for(const a of athletes){const n=normal(a.name),k=identityKey(a.name);names.set(n,[...(names.get(n)??[]),a]);initials.set(k,[...(initials.get(k)??[]),a]);}
  const byBib=new Map<string,Existing[]>();for(const r of existing)if((r.source_url??'').split('#')[0]===sourceUrl.split('#')[0])byBib.set(r.bib??'',[...(byBib.get(r.bib??'')??[]),r]);
  return rows.map(row=>{
    const allCandidates=[...new Map([...(names.get(normal(row.name))??[]),...(initials.get(identityKey(row.name))??[])].map(a=>[a.id,a])).values()];
    const candidates=allCandidates.slice(0,20); // More matches still remain held, never mistaken for no match.
    if(row.issues.length)return{row,status:'blocked',reason:row.issues.join(' '),candidates};
    const old=byBib.get(row.bib)??[];
    if(old.length)return old.length===1&&sameStored(row,old[0])?{row,status:'duplicate',reason:'Exact source entry already imported; skipped.',candidates}: {row,status:'blocked',reason:'An existing entry needs comparison. It will not be overwritten.',candidates};
    if(candidates.length)return{row,status:'review',reason:candidates.some(a=>a.managed||a.visibility!=='public')?'Possible private or account-managed profile; use its separate review process.':'Possible existing athlete. Staff must confirm identity before linking.',candidates};
    return{row,status:'new',reason:'No likely profile match found. Bulk approval creates a private profile; this is not proof of a new identity.',candidates};
  });
}
