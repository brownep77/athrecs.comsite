export function nameKey(value){return String(value??'').normalize('NFKD').toLowerCase().replace(/\p{M}/gu,'').replace(/[’']/gu,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/^(?:(?:mr|mrs|ms|miss|dr|sir|dame) )+/,'');}
const nickGroups=[['alex','alexander','alexandra'],['andrew','andy'],['anthony','antony','tony'],['ben','benjamin'],['bob','bobby','rob','robert','robbie'],['chris','christopher','christine','christina'],['dan','daniel','danny'],['dave','david'],['ed','eddie','edward','ted'],['elizabeth','liz','lizzie','beth'],['james','jim','jimmy'],['jen','jennifer','jenny'],['joe','joseph','joey'],['jon','john','jonathan'],['kate','katie','katherine','kathryn','catherine','kat'],['karl','carl'],['matt','matthew'],['mike','michael','mick'],['nick','nicholas','nicolas'],['pat','patrick','patricia'],['pete','peter'],['phil','philip'],['rich','richard','rick','ricky','dick'],['sam','samuel','samantha'],['steve','steven','stephen'],['stuart','stewart'],['ian','iain'],['graeme','graham'],['rachael','rachel'],['sue','susan','suzanne'],['tom','thomas','tommy'],['will','william','bill','billy'],['vicky','victoria']];
const nicks=new Map();for(const g of nickGroups)for(const n of g)nicks.set(n,new Set(g));
export function editOne(a,b){if(a===b)return true;if(Math.abs(a.length-b.length)>1)return false;if(a.length===b.length)return [...a].filter((c,i)=>c!==b[i]).length===1;if(a.length>b.length)[a,b]=[b,a];let i=0,j=0,skipped=false;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;}else if(skipped)return false;else{skipped=true;j++;}}return true;}
const compatible=(a,b)=>a===b||nicks.get(a)?.has(b)||(a[0]===b[0]&&(a.length===1||b.length===1))||(Math.min(a.length,b.length)>=3&&editOne(a,b));
const deletes=s=>[s,...[...s].map((_,i)=>s.slice(0,i)+s.slice(i+1))];
function namesFrom(v){if(typeof v==='string')return v.includes('://')||v.length>200?[]:[v];if(Array.isArray(v))return v.flatMap(namesFrom);if(v&&typeof v==='object')return ['name','displayName','display_name','full_name','alias','value'].flatMap(k=>namesFrom(v[k]));return [];}
function duvId(url){try{const u=new URL(url);return u.hostname==='statistik.d-u-v.org'&&u.pathname==='/getresultperson.php'&&/^\d+$/.test(u.searchParams.get('runner')??'')?u.searchParams.get('runner'):null;}catch{return null;}}
const put=(map,key,value)=>{if(key){if(!map.has(key))map.set(key,new Set());map.get(key).add(value);}};
export class Directory{
 constructor(athletes=[],accounts=[],histories=[],version='0'){
  this.version=String(version);this.athletes=new Map();this.names=new Map();this.exact=new Map();this.compact=new Map();this.tokens=new Map();this.surnames=new Map();this.deletions=new Map();this.sourceIds=new Map();
  for(const a of athletes)this.addAthlete(a);
  for(let i=0;i<accounts.length;i++){const a=accounts[i];this.register('account:'+i,[a.name,a.full_name,a.display_name,...namesFrom(a.previous_names)]);}
  for(const h of histories){const id=duvId(h.source_url)||(/duv/i.test(h.provider)?/^(?:duv:runner-)?(\d+)(?::event[-:]\d+)?$/.exec(h.external_id)?.[1]:null);if(id)put(this.sourceIds,id,String(h.athlete_id));}
 }
 register(id,values){
  const ns=this.names.get(String(id))??new Set();this.names.set(String(id),ns);
  for(const value of values){const n=nameKey(value);if(!n||ns.has(n))continue;ns.add(n);
   put(this.exact,n,String(id));put(this.compact,n.replaceAll(' ',''),String(id));const t=n.split(' ');put(this.tokens,[...t].sort().join(' '),String(id));
   if(t.length>=2){const surname=t.at(-1);put(this.surnames,surname,String(id));for(const v of deletes(surname))put(this.deletions,v,surname);}
  }
 }
 addAthlete(a){
  this.athletes.set(String(a.id),a);const details=a.name_details??a.profile_details??{};
  const aliases=['aliases','nameAliases','previous_names','research_name_variants','canonicalName','sourceName','requestedName'].flatMap(k=>namesFrom(details[k]));
  this.register(String(a.id),[a.display_name,a.race_entry_name,[a.given_name,a.family_name].filter(Boolean).join(' '),...aliases]);
  const sid=duvId(a.source_url);if(sid)put(this.sourceIds,sid,String(a.id));
  for(const source of a.profile_details?.sourceIdentities??[]){const rid=duvId(source.sourceUrl);if(rid)put(this.sourceIds,rid,String(a.id));}
 }
 matches(name){
  const n=nameKey(name),t=n.split(' '),out=new Set([...(this.exact.get(n)??[]),...(this.compact.get(n.replaceAll(' ',''))??[]),...(this.tokens.get([...t].sort().join(' '))??[])]);
  if(t.length<2)return [...out];const last=t.at(-1),surnames=new Set([last]);
  if(last.length>=4)for(const d of deletes(last))for(const s of this.deletions.get(d)??[])if(editOne(last,s))surnames.add(s);
  for(const s of surnames)for(const id of this.surnames.get(s)??[])for(const other of this.names.get(id)??[]){const b=other.split(' ');if(b.at(-1)!==s)continue;if(t.slice(0,-1).some(a=>b.slice(0,-1).some(b=>compatible(a,b))))out.add(id);}
  return [...out];
 }
 decide(row,eventDirectory){
  const ids=[...(this.sourceIds.get(row.sourceAthleteId)??[])];
  if(ids.length>1)return {status:'held',reasons:['duv_id_linked_to_multiple_profiles'],possibleIds:ids};
  if(ids.length===1){
   const a=this.athletes.get(ids[0]);const names=this.names.get(ids[0]);
   const observation=a?.profile_details?.duvSourceObservation;
   if(!a||a.parent_athlete_id||!names?.has(nameKey(row.name))||(a.gender&&['M','F','X'].includes(a.gender)&&a.gender!==row.gender)||((observation?.birthYear||a.birth_year)&&row.sourceBirthYear&&(observation?.birthYear||a.birth_year)!==row.sourceBirthYear))return {status:'held',reasons:['source_id_identity_details_differ'],possibleIds:ids};
   return {status:'linked',athleteId:Number(ids[0]),reasons:[]};
  }
  const matches=this.matches(row.name);if(matches.length)return {status:'held',reasons:['possible_existing_name_or_alias'],possibleIds:matches};
  const sourceMatches=eventDirectory.matches(row.name).filter(x=>x!==row.sourceAthleteId);
  if(sourceMatches.length)return {status:'held',reasons:['possible_source_name_variant_in_event'],possibleIds:sourceMatches};
  const key=nameKey(row.name);
  if(!row.givenName||!row.familyName||key.split(' ').length<2||nameKey(row.givenName).length<2||/[()0-9]/u.test(row.name))return {status:'held',reasons:['name_requires_review']};
  if(row.sourceBirthYear&&Number(row.date.slice(0,4))-row.sourceBirthYear<19||/under|junior|\b[MF]?U(?:\d|1\d|20)\b/i.test(row.category))return {status:'held',reasons:['possible_youth_profile']};
  if(row.status!=='finished'||row.performance.kind==='unparsed')return {status:'held',reasons:['performance_requires_review']};
  return {status:'created',reasons:[]};
 }
}
export function eventDirectory(rows){const d=new Directory();for(const r of rows)d.register(r.sourceAthleteId,[r.name]);return d;}
