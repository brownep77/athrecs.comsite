import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
// Read-only SAL archive inventory. Results and fixtures are only candidates for reviewed import.
const base = "https://www.southernathletics.org.uk";
const years = process.argv.includes("--all") ? Array.from({length:16},(_,i)=>2011+i) : [2024,2025,2026];
const output = process.argv.find(a=>a.startsWith("--output="))?.slice(9) ?? "tmp/sal-source-manifest.json";
const pause = () => new Promise(r=>setTimeout(r,900));
const clean = t => t.replace(/<[^>]*>/g," ").replace(/&nbsp;|&#160;/gi," ").replace(/&amp;/gi,"&").replace(/\s+/g," ").trim();
const links = (html,baseUrl) => [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].flatMap(m=>{try {const url=new URL(m[1].replace(/&amp;/g,"&"),baseUrl);return url.origin===base?[{url:url.href,label:clean(m[2])}]:[];}catch{return [];}});
async function fetchHtml(url){await pause();const r=await fetch(url,{signal:AbortSignal.timeout(15000),headers:{"User-Agent":"AthRecs archival discovery (athrecs.com)"}});if(!r.ok)throw Error("HTTP "+r.status);if(!/text\/html/.test(r.headers.get("content-type")??""))throw Error("Non-HTML");return r.text();}
const resultFiles=new Map(), fixtures=new Map(), errors=[];
for(const year of years){
 const index=base+"/"+year+".html";
 try {
  const yearLinks=links(await fetchHtml(index),index).filter(x=>/^Division\s+[1-3]/i.test(x.label));
  for(const division of yearLinks){
   try {
    const html=await fetchHtml(division.url);
    for(const a of links(html,division.url)){
     if(/full results/i.test(a.label)&&/\/assets\/files\/results\//i.test(a.url))
      resultFiles.set(a.url,{year,division:division.label,divisionUrl:division.url,resultUrl:a.url,status:"review_required"});
    }
   }catch(e){errors.push({url:division.url,error:String(e)});}
  }
 }catch(e){errors.push({url:index,error:String(e)});}
}
try {
 const index=base+"/fixtures.html";
 for(const division of links(await fetchHtml(index),index).filter(x=>/^Division\s+[1-3]/i.test(x.label)&&/fixtures_div/i.test(x.url))){
  try {
   const html=await fetchHtml(division.url);
   for(const tr of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){
    const c=[...tr[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(x=>clean(x[1]));
    if(c.length>=4&&/^[A-Z][a-z]+ \d{1,2}$/.test(c[0])){
      const row={year:2026,dateLabel:c[0],round:c[1],venue:c[2],postcode:c[3],clubs:c.slice(4).filter(Boolean),division:division.label,sourceUrl:division.url,status:"historical_review_only"};
      fixtures.set([division.url,c[0],c[1],c[2]].join("|"),row);
    }
   }
  }catch(e){errors.push({url:division.url,error:String(e)});}
 }
}catch(e){errors.push({url:base+"/fixtures.html",error:String(e)});}
const manifest={source:base,checkedAt:new Date().toISOString(),years,resultFileCount:resultFiles.size,fixtureCandidateCount:fixtures.size,resultFiles:[...resultFiles.values()],fixtures:[...fixtures.values()],errors,publication:"not approved; check rights, participant identity, meeting dates, existing editions, cancellations and duplicates"};
await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(manifest,null,2)+"\n");
console.log(JSON.stringify({output,resultFileCount:manifest.resultFileCount,fixtureCandidateCount:manifest.fixtureCandidateCount,errors:errors.length}));
