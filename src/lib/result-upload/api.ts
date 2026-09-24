import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { staffMiddleware } from '../auth/staff-middleware';
import { FIELDS, type Mapping } from './core.ts';
const file=z.object({fileName:z.string().min(1).max(200),base64:z.string().min(1).max(4_000_000),sheetName:z.string().max(100).optional()});
const meta=z.object({eventName:z.string().min(1).max(180),date:z.string().length(10),distance:z.string().min(1).max(30),sourceUrl:z.string().url().max(500),basis:z.enum(['chip','gun','unspecified']),timingConfirmed:z.boolean()});
const mapping=z.record(z.string(),z.number().int().min(0).max(99)).refine(m=>Object.keys(m).every(k=>FIELDS.includes(k as typeof FIELDS[number])),'Unknown column mapping');
async function tools(write=false){
  const { IS_RUNRECS_SITE }=await import('../site-scope');
  if(IS_RUNRECS_SITE)throw Error('Athlete uploads are only available on AthRecs.');
  if(write&&process.env.VERCEL_ENV==='preview')throw Error('Preview deployments do not write to the live import workspace. Use isolated tests or the production staff site after review.');
  const {getSql}=await import('../db');return getSql();
}
export const inspectResultsFile=createServerFn({method:'POST'}).middleware([staffMiddleware]).validator(file.parse).handler(async({data})=>{
  const {IS_RUNRECS_SITE}=await import('../site-scope');if(IS_RUNRECS_SITE)throw Error('Use the AthRecs staff site.');
  const {readUpload}=await import('./workbook.server.ts');const {guessMapping}=await import('./core.ts');
  const parsed=await readUpload(data.fileName,data.base64,data.sheetName);
  return {sheets:parsed.sheets,sheet:parsed.chosen,headers:parsed.table[0],mapping:guessMapping(parsed.table[0]),rows:parsed.table.length-1,sample:parsed.table.slice(1,4)};
});
export const previewResultsFile=createServerFn({method:'POST'}).middleware([staffMiddleware]).validator(file.extend({meta,mapping}).parse).handler(async({data,context})=>{
  const sql=await tools(true),{readUpload}=await import('./workbook.server.ts'),{parseTable,validateMeta}=await import('./core.ts'),{checkSource}=await import('./source.server.ts'),{stageUpload}=await import('./service.server.ts'),{createHash}=await import('node:crypto');
  const parsed=await readUpload(data.fileName,data.base64,data.sheetName),metadata=validateMeta(data.meta),rows=parseTable(parsed.table,data.mapping as Mapping,metadata),checked=await checkSource(rows,metadata);
  return stageUpload(sql,{userId:context.userId,staffEmail:context.staffEmail},{meta:metadata,rows:checked.rows,sourceHash:checked.hash,fileHash:createHash('sha256').update(parsed.bytes).digest('hex'),fileName:data.fileName});
});
export const getResultsUpload=createServerFn({method:'GET'}).middleware([staffMiddleware]).validator(z.object({id:z.string().uuid()}).parse).handler(async({data,context})=>{
  const sql=await tools(),{getUpload}=await import('./service.server.ts');return getUpload(sql,{userId:context.userId,staffEmail:context.staffEmail},data.id);
});
export const importReviewedResults=createServerFn({method:'POST'}).middleware([staffMiddleware]).validator(z.object({id:z.string().uuid(),confirmed:z.literal(true),decisions:z.array(z.object({key:z.string().max(800),athleteId:z.number().int().positive().optional(),evidenceNote:z.string().max(1000).optional()})).min(1).max(100)}).parse).handler(async({data,context})=>{
  const sql=await tools(true),{commitUpload}=await import('./service.server.ts'),{checkSource}=await import('./source.server.ts');
  return commitUpload(sql,{userId:context.userId,staffEmail:context.staffEmail},data.id,data.decisions,data.confirmed,checkSource);
});
export const downloadResultsTemplate=createServerFn({method:'GET'}).middleware([staffMiddleware]).handler(async()=>{
  const {default:ExcelJS}=await import('exceljs');const workbook=new ExcelJS.Workbook(),sheet=workbook.addWorksheet('Results');
  sheet.addRow(['Position','Forename','Surname','Gender','Gender Pos','Category','Cat Pos','Club','Tag','Chip Time','Gun Time']);
  sheet.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};sheet.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF0F766E'}};sheet.getRow(1).height=28;
  sheet.columns.forEach((column,i)=>{column.width=i===7?30:i===1||i===2?22:16;});sheet.views=[{state:'frozen',ySplit:1}];
  for(let r=2;r<=501;r++){sheet.getCell(r,9).numFmt='@';sheet.getCell(r,10).numFmt='[h]:mm:ss.000';sheet.getCell(r,11).numFmt='[h]:mm:ss.000';}
  const guide=workbook.addWorksheet('Read me');guide.getColumn(1).width=110;
  ['Fill the Results sheet. One row per race entry. No sample athletes are included.','Enter the race name, date, distance and official source URL once on the upload screen.','Keep original bibs and placings. Leave unknown information blank.','Chip and gun times are separate. Use hh:mm:ss.000 or a correctly formatted Excel duration.','No formulas, macros, contact information or medical data. Maximum 5,000 rows and 3 MB.','Choose Preview and check, then approve a group. Same-name matches are never automatically merged.','Imported records are private. Publication and athlete ownership are separate approvals.'].forEach(line=>guide.addRow([line]));
  return {fileName:'AthRecs_Race_Results_Template.xlsx',base64:Buffer.from(await workbook.xlsx.writeBuffer()).toString('base64')};
});
