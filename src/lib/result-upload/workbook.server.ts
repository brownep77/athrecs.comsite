import { MAX_BYTES, MAX_ROWS, csvTable, formatMs, guessMapping } from './core.ts';
/** Check ZIP metadata before ExcelJS allocates the workbook. No macros/external links. */
export function checkXlsxZip(buffer:Buffer):void{
  if(buffer.length>MAX_BYTES||buffer.length<22)throw Error('Excel upload exceeds the 3 MB limit or is not a workbook.');
  let end=-1;for(let i=buffer.length-22;i>=Math.max(0,buffer.length-65557);i--)if(buffer.readUInt32LE(i)===0x06054b50){end=i;break;}
  if(end<0)throw Error('Not a supported .xlsx workbook.');
  const entries=buffer.readUInt16LE(end+10),size=buffer.readUInt32LE(end+12),offset=buffer.readUInt32LE(end+16);
  if(buffer.readUInt16LE(end+4)||buffer.readUInt16LE(end+6)||entries>2048||entries===65535||offset+size>end)throw Error('Unsupported or oversized Excel archive.');
  let p=offset,total=0;
  for(let i=0;i<entries;i++){
    if(p+46>buffer.length||buffer.readUInt32LE(p)!==0x02014b50)throw Error('Invalid Excel archive directory.');
    const flags=buffer.readUInt16LE(p+8),packed=buffer.readUInt32LE(p+20),unpacked=buffer.readUInt32LE(p+24),nameLength=buffer.readUInt16LE(p+28),extra=buffer.readUInt16LE(p+30),comment=buffer.readUInt16LE(p+32);
    const name=buffer.subarray(p+46,p+46+nameLength).toString('utf8');total+=unpacked;
    if(flags&1||unpacked===0xffffffff||total>25_000_000||unpacked>Math.max(1,packed)*300||/vbaProject|externalLinks|\.\.\//i.test(name))throw Error('Encrypted, macro-enabled, external-link or oversized workbooks are not accepted.');
    p+=46+nameLength+extra+comment;if(p>offset+size)throw Error('Invalid Excel archive length.');
  }
}
export async function readUpload(fileName:string,base64:string,sheetName?:string){
  if(typeof fileName!=='string'||fileName.length>200||!/^.{1,195}\.(xlsx|csv)$/i.test(fileName))throw Error('Choose an Excel .xlsx or CSV file.');
  if(typeof base64!=='string'||base64.length>4_000_000||!base64||!/^[A-Za-z0-9+/]*={0,2}$/.test(base64))throw Error('Choose a file no larger than 3 MB.');
  const bytes=Buffer.from(base64,'base64');if(bytes.length>MAX_BYTES)throw Error('The file is larger than 3 MB.');
  let table:string[][],sheets:string[],chosen:string;
  if(/\.csv$/i.test(fileName)){table=csvTable(new TextDecoder('utf-8',{fatal:true}).decode(bytes));sheets=['CSV'];chosen='CSV';}
  else{
    checkXlsxZip(bytes);
    const {default:ExcelJS}=await import('exceljs');
    const workbook=new ExcelJS.Workbook();
    await workbook.xlsx.load(bytes as unknown as Parameters<typeof workbook.xlsx.load>[0]);
    sheets=workbook.worksheets.filter(s=>s.state==='visible').map(s=>s.name);
    if(!sheets.length||sheets.length>20)throw Error('Choose a workbook with 1–20 visible worksheets.');
    chosen=sheetName||sheets[0];if(!sheets.includes(chosen))throw Error('Select a visible worksheet.');
    const sheet=workbook.getWorksheet(chosen)!;
    if(sheet.rowCount>MAX_ROWS+50||sheet.columnCount>100)throw Error('Worksheet exceeds 5,000 results or 100 columns.');
    table=[];
    sheet.eachRow({includeEmpty:false},row=>{
      const values:string[]=[];
      for(let c=1;c<=sheet.columnCount;c++){
        const cell=row.getCell(c),v=cell.value;
        if(v===null||v===undefined)values.push('');
        else if(v instanceof Date){
          const base=workbook.properties.date1904?Date.UTC(1904,0,1):Date.UTC(1899,11,30);
          const duration=v.getTime()-base;if(duration<0||duration>604800000)throw Error(`Cell ${cell.address}: use a duration, not a calendar timestamp.`);
          values.push(formatMs(duration));
        }else if(typeof v==='number'&&/[hms]/i.test((cell.numFmt??'').replace(/"[^"]*"/g,''))){if(v<0||v>7)throw Error(`Invalid Excel duration in ${cell.address}.`);values.push(formatMs(v*86400000));}
        else if(typeof v==='object')throw Error(`Cell ${cell.address}: paste values only; formulas, links and rich-text objects are not accepted.`);
        else values.push(String(v));
      }
      table.push(values);
    });
  }
  // Find the actual header within an optional title block; never silently pick another sheet.
  const header=table.slice(0,25).findIndex(row=>{const m=guessMapping(row);return m.bib!==undefined&&(m.name!==undefined||(m.given!==undefined&&m.family!==undefined));});
  if(header>0)table=table.slice(header);
  if(table.length<2)throw Error('No results rows found in the selected worksheet.');
  return {table,sheets,chosen,bytes};
}
