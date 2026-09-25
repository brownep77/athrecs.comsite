import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import crypto from "node:crypto";
const require = createRequire(import.meta.url);
const ts = require("typescript");
function loadTs(path, deps = {}) {
  const module = { exports: {} };
  const compiled = ts.transpileModule(readFileSync(path, "utf8"), { fileName: path, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } });
  new Function("require", "module", "exports", compiled.outputText)(name => {
    if (!(name in deps)) throw new Error(`Unexpected dependency ${name}`);
    return deps[name];
  }, module, module.exports);
  return module.exports;
}
const core = loadTs("src/lib/staff-results-upload/core.ts");
const headers = ["Position","Forename","Surname","Gender","Gender Pos","Category","Cat Pos","Club","Tag","Time"];
const rows = [
  ["1","Riley","Fresh","M","1","MO","1","Example Club","101","00:35:09.0"],
  ["2","Chris","Match","M","2","MO","2","Example Club","102","00:35:50.1"],
  ["3","Private","Person","F","1","FO","1","","103","00:36:31.5"],
  ["4","Already","Here","M","3","MO","3","","104","00:37:02.9"],
];
const csv = table => table.map(row => row.map(c => '"'+String(c).replaceAll('"','""')+'"').join(",")).join("\r\n");
const text = csv([headers, ...rows]);
const parsed = core.parseTable(core.csvTable(text), "chip");
assert.equal(parsed.length, 4);
assert.equal(parsed[1].chipSeconds, 2150.1);
assert.equal(parsed[1].chipText, "00:35:50.1");
assert.equal(parsed[1].gunSeconds, null);
assert.equal(core.parseTable([headers,...rows],"unspecified")[1].chipSeconds,null);
assert.equal(core.parseTable([headers,...rows],"gun")[1].gunSeconds,2150.1);
assert.equal(core.possibleIdentity("Dom Blake","Dominic Blake"),true);
assert.equal(core.possibleIdentity("Chris Match","Christopher Match"),true);
assert.equal(core.possibleIdentity("Riley Fresh","Another Person"),false);
assert.equal(core.possibleIdentity("José O’Neil","Jose O'Neil"),true);
assert.equal(core.runningClub("CC: Company & CC: Company & Example RC"),"Example RC");
const polluted = [...headers]; polluted[3]="GenderFM";polluted[5]="CategoryF40-44F45-49FOMO";polluted[7]="ClubExample ClubOther Running Club";
assert.equal(core.parseTable([polluted,...rows],"chip")[0].club,"Example Club");
const double = core.parseTable([headers,rows[0],rows[0]],"chip");
assert(double.every(r=>r.issues.includes("Repeated bib in this upload")));
assert.throws(()=>core.csvTable('"not closed'),/not closed/);
assert.throws(()=>core.parseTable([["Name","Time"],["Example","35:00"]],"chip"),/Missing bib/);
assert(core.parseTable([headers,[...rows[0].slice(0,9),"00:99:00"]],"chip")[0].issues.length);
assert.equal(core.parseTable([headers,[...rows[0].slice(0,9),2109/86400]],"chip")[0].chipSeconds,2109);
const api = readFileSync("src/lib/staff-results-upload/api.ts","utf8");
assert.match(api,/middleware\(\[staffMiddleware\]\)/);
const serviceText = readFileSync("src/lib/staff-results-upload/service.server.ts","utf8");
assert.doesNotMatch(serviceText,/\b(?:insert\s+into|update\s+athletes|delete\s+from|applyResultsImport|publishAthleteProfiles|ensureAthrecsSeeded)\b/i);
assert.match(serviceText,/dbSource !== "neon"/);
if (process.argv.includes("--core-only")) { console.log("PASS: upload parser, chip/gun distinction, Excel durations, aliases, duplicate rows and read-only guards"); process.exit(0); }
const { PGlite } = await import("@electric-sql/pglite");
const cheerio = await import("cheerio");
const audit = await import("./lib/result-evidence-audit.mjs");
const excel = await import("exceljs");
const db = new PGlite(); await db.waitReady;
let sqlCalls=0;
const sql = async (strings,...values)=> {
  let query=strings[0]; values.forEach((_,i)=>query+=`$${i+1}${strings[i+1]}`);
  assert.match(query.trim(),/^select\b/i,"Review may execute SELECT only");sqlCalls++;
  return (await db.query(query,values)).rows;
};
let html = `<h2>Synthetic 10K</h2><h3>10k</h3><p>Start: 20/09/2026 10:00</p><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const source = { fetchSource: async ()=>html }, scope = { IS_RUNRECS_SITE:false }, connection = { getSql:async()=>sql, dbSource:"neon" };
const service = loadTs("src/lib/staff-results-upload/service.server.ts",{ "node:crypto":crypto,cheerio,"../db":connection,"../site-scope":scope,"../club-scanner/provider.server":source,"../../../scripts/lib/result-evidence-audit.mjs":audit,"./core":core,exceljs:excel });
try {
  await db.exec(`
    create table clubs(id integer,name text);
    create table athletes(id integer,display_name text,slug text,club_id integer,source_club_name text,profile_visibility text);
    create table athlete_account_links(athlete_id integer,status text);
    create table "user"("id" text,"name" text);
    create table athlete_private_profiles(user_id text,display_name text,full_name text,club_or_team text);
    create table events(id integer,slug text,name text,sport text);
    create table editions(id integer,event_id integer,event_date date,distance_code text,distance_km numeric);
    create table results(id integer,athlete_id integer,edition_id integer,bib text,source_url text,finish_time_seconds integer,chip_time_seconds integer,gun_time_seconds integer,overall_place integer,gender_place integer,category_place integer,category text);
    insert into clubs values(1,'Example Club');
    insert into athletes values(1,'Christopher Match','christopher-match',1,'Example Club','public'),(2,'Already Here','already-here',null,'','public');
    insert into "user" values('private-u','Private Person');
    insert into athlete_private_profiles values('private-u','Private Person','Private Person','');
    insert into events values(10,'synthetic-10k','Synthetic 10K','Running');
    insert into editions values(20,10,'2026-09-20','10K',10);
    insert into results values(99,2,20,'104','https://totalracetiming.co.uk/raceresults/1',2223,2223,null,4,3,3,'MO');
  `);
  const snapshot = async()=>JSON.stringify((await db.query('select * from athletes order by id')).rows)+JSON.stringify((await db.query('select * from results order by id')).rows);
  const before=await snapshot();
  const input={filename:"synthetic.csv",content:text,eventName:"Synthetic 10K",date:"2026-09-20",distance:"10K",distanceKm:10,sourceUrl:"https://totalracetiming.co.uk/raceresults/1",timingBasis:"chip"};
  const review=await service.previewUpload(input);
  assert.deepEqual(review.rows.map(r=>r.state),['new','review','review','duplicate']);
  assert.equal(review.summary.identitiesChecked,3);
  assert.equal(review.rows[2].candidates[0].managed,true,"Unlinked private accounts must be checked");
  const altered=await service.previewUpload({...input,content:text.replace('00:35:09.0','00:35:09.1')});
  assert.equal(altered.rows[0].state,'blocked',"Even subsecond source changes must be detected");
  assert.equal((await service.previewUpload(input)).reviewHash,review.reviewHash);
  assert.equal(await snapshot(),before,"Duplicate checking must not change any record");
  assert(sqlCalls>=4);
  await assert.rejects(()=>service.previewUpload({...input,sourceUrl:'http://localhost/'}),/exact Total Race Timing/);
  await assert.rejects(()=>service.previewUpload({...input,date:'2099-01-01'}),/past race date/);
  await assert.rejects(()=>service.previewUpload({...input,distanceKm:5}),/distance table/);
  connection.dbSource='pglite'; await assert.rejects(()=>service.previewUpload(input),/live database/); connection.dbSource='neon';
  scope.IS_RUNRECS_SITE=true; await assert.rejects(()=>service.previewUpload(input),/AthRecs staff/);scope.IS_RUNRECS_SITE=false;
  const Workbook=excel.Workbook ?? excel.default.Workbook;
  const wb=new Workbook(),sheet=wb.addWorksheet('Results');sheet.addRow(headers);rows.forEach(r=>sheet.addRow(r));
  sheet.getCell('J2').value=2109/86400;sheet.getCell('J2').numFmt='[h]:mm:ss.0';
  const encoded=Buffer.from(await wb.xlsx.writeBuffer()).toString('base64');
  const xlsx=await service.previewUpload({...input,filename:'synthetic.xlsx',content:encoded});
  assert.equal(xlsx.rows[0].chipSeconds,2109);
  assert.deepEqual(xlsx.rows.map(r=>r.state),['new','review','review','duplicate']);
  sheet.getCell('J2').value={formula:'1+1',result:2};
  const formulaContent=Buffer.from(await wb.xlsx.writeBuffer()).toString('base64');
  await assert.rejects(()=>service.previewUpload({...input,filename:'formula.xlsx',content:formulaContent}),/formulas/);
  html=html.replace('20/09/2026','21/09/2026');
  const changedDate=await service.previewUpload(input);assert(changedDate.rows.every(r=>r.state==='blocked'));
  console.log('PASS: isolated PostgreSQL live-directory comparisons, private identities, source mismatches, duplicates, Excel, source URL/date guards, no-write and RunRecs isolation');
} finally { await db.close(); }
