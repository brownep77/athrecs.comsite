"""Retain page/line evidence from saved PDFs; never normalise athlete performances.

The input inventory references immutable source captures. All extracted rows are
private observations held for column/identity review. Non-results and ambiguous
layouts remain explicitly held. No database credentials or source data live here.
"""
import argparse,datetime as dt,hashlib,json,re,subprocess
from pathlib import Path

MONTHS={m.lower():i for i,m in enumerate(['January','February','March','April','May','June','July','August','September','October','November','December'],1)}
MONTHS.update({k[:3]:v for k,v in list(MONTHS.items())})

def dates(text):
    out=[]
    for pat,kind in [(r'\b(20\d{2})-(\d{1,2})-(\d{1,2})\b','iso'),(r'\b(\d{1,2})[/.](\d{1,2})[/.](20\d{2})\b','dmy'),(r'\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,9})\s+(20\d{2})\b','month')]:
        for m in re.finditer(pat,text):
            try:
                a,b,c=m.groups()
                y,mo,d=(int(a),int(b),int(c)) if kind=='iso' else (int(c),MONTHS[b.lower()] if kind=='month' else int(b),int(a))
                out.append(dt.date(y,mo,d).isoformat())
            except (ValueError,KeyError):pass
    return list(dict.fromkeys(out))

def extract(d,root):
    original=root/(d['id']+'.original');dis=d['payload']['discovery'];context=dis.get('context') or dis.get('label','')
    result={'capture_id':d['id'],'state':'held','reason':'Unsupported document format','rows':[], 'index':{},'text':''}
    data=original.read_bytes()
    assert hashlib.sha256(data).hexdigest()==d['payload']['documentSha256']
    if not data.startswith(b'%PDF'):return result
    proc=subprocess.run(['pdftotext','-layout',str(original),'-'],capture_output=True)
    if proc.returncode:result.update(state='failed',reason='PDF text extraction failed');return result
    text=proc.stdout.decode('utf-8','replace');result['text']=text
    result['pages']=len(text.rstrip('\f\n ').split('\f'))
    if not text.strip():result['reason']='Scanned PDF; OCR review required';return result
    if re.search(r'\b(Points after \d+ races|individual results include only runners|PRESS RELEASE|post.event e.mail)\b',text[:1800],re.I) or re.search(r'\b(series to date|race report)\b',context,re.I):
        result.update(state='excluded',reason='Cumulative standings or narrative, not a race result table');return result
    name=re.sub(r'^\s*\d{1,2}(?=[A-Za-z])','',context)
    name=re.sub(r'(?:PDF|Link|\(pdf\)\s*Download)$','',name,flags=re.I).strip()
    if d['provider']=='SportSoft':name=re.sub(r'\b20\d{2}\b','',name).strip(' -')
    if not name or name.lower() in ('pdf','results'):result['reason']='Event heading needs review';return result
    if re.search(r'\b(triathlon|duathlon|aquathlon|swim|cycling|walk|jumps|throws)\b',name,re.I):
        result.update(state='excluded',reason='Outside running-only register scope');return result
    first='\n'.join(text.splitlines()[:12]); ds=dates(first)
    if d['provider']=='Running Events Devon':
        found=[]; event_dates=[]; unread=0
        for pn,page in enumerate(text.split('\f'),1):
            lines=page.splitlines()
            if not any(line.strip() for line in lines):continue
            headers=[(i,line) for i,line in enumerate(lines) if 'First Name' in line and 'Last Name' in line and re.search(r'\bTime\b',line)]
            if not headers:unread+=1;continue
            hi,h=headers[0];starts=[m.start() for m in re.finditer('First Name',h)]
            cuts=[0]+starts[1:]+[max(len(line) for line in lines)+1]
            for col in range(len(cuts)-1):
                left,right=cuts[col:col+2];parts=[line[left:right] for line in lines]
                ds_col=dates('\n'.join(parts[:hi]))
                if len(ds_col)!=1:unread+=1;continue
                day=ds_col[0];event_dates.append(day);section='';head=parts[hi].strip()
                for ln,line in enumerate(parts[hi+1:],hi+2):
                    clean=line.strip()
                    if re.fullmatch(r'(Ultra|Marathon|Half[ -]Marathon|\d+(?:\.\d+)?\s*[KkMm]|\d+\s*Laps?)',clean,re.I):section=clean;continue
                    if re.search(r'[A-Za-z]',clean) and re.search(r'\d+(?::\d{2}){2}(?:\.\d+)?\s*$',clean):
                        found.append({'sourcePage':pn,'sourceLine':ln,'sourceColumn':col+1,'sourceText':clean,'sourceHeadings':head,'distanceLabel':section,'date':day,'identity':'unreviewed'})
        if found:
            years={int(day[:4]) for day in event_dates}
            if len(years)!=1:result['reason']='Multiple edition years need separate intake';return result
            result.update(index={'name':name,'date':event_dates[0] if len(set(event_dates))==1 else None,'year':years.pop(),'location':None},rows=found,state='partial',reason='Source-labelled day columns extracted; remaining layouts and performance mapping require review',unsupportedPages=unread)
            return result
    if len(ds)>1:result['reason']='Multiple event dates; split document before import';return result
    date=ds[0] if ds else None
    ys=re.findall(r'\b20\d{2}\b',first)
    archive_ys=re.findall(r'/results/(20\d{2})/',dis.get('pageUrl',''))
    year=int(date[:4]) if date else int(ys[0]) if len(set(ys))==1 else int(archive_ys[0]) if len(archive_ys)==1 else None
    if year is None:result['reason']='Edition year needs review';return result
    result['index']={'name':name,'date':date,'year':year,'location':None}
    heading=''; header=''; rows=[]; unsupported=0
    for page_no,page in enumerate(text.split('\f'),1):
        for line_no,line in enumerate(page.splitlines(),1):
            clean=line.strip()
            if re.search(r'FINAL RESULTS',line):
                heading=re.sub(r'\s*[—–-]\s*FINAL RESULTS.*','',clean);header=''
            if re.search(r'\b(Name|Surname)\b',line,re.I) and re.search(r'\b(Time|Chip|Gun|Finish)\b',line,re.I):
                header=clean;continue
            if re.search(r'\b(TEAM RESULTS|Points after|Teams?:|Team Results)\b',line,re.I):header='';continue
            if not header:continue
            # Preserve raw, source-labelled text. Splitting uses the printed time
            # terminators, allowing two side-by-side result columns. No field
            # is assigned a chip/gun/place meaning from positional offsets.
            segments=re.split(r'(?<=\d)\s{2,}(?=\d{1,4}\s+\d)',line)
            for segment in segments:
                if re.match(r'^\s*\d+\s+',segment) and re.search(r'[A-Za-z]',segment) and re.search(r'\d+(?::\d{2}){1,2}(?:\.\d+)?\s*$',segment):
                    rows.append({'sourcePage':page_no,'sourceLine':line_no,'sourceText':segment.strip(),'sourceHeadings':header,'distanceLabel':heading,'date':date,'identity':'unreviewed'})
                elif re.match(r'^\s*\d+\s+',segment) and re.search(r'[A-Za-z]',segment):unsupported+=1
    result['rows']=rows
    if rows:result.update(state='partial',reason='Raw result lines extracted; column mapping, remaining layouts and identity review required',unsupportedLines=unsupported)
    else:result['reason']='No supported labelled result rows; layout review required'
    return result

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--inventory',required=True);p.add_argument('--documents',required=True);p.add_argument('--output',required=True);a=p.parse_args()
    out=Path(a.output);out.mkdir(exist_ok=True,parents=True);summary=[]
    for d in json.loads(Path(a.inventory).read_text()):
        if not (Path(a.documents)/(d['id']+'.original')).exists():continue
        r=extract(d,Path(a.documents));(out/(d['id']+'.json')).write_text(json.dumps(r,ensure_ascii=False))
        summary.append({k:v for k,v in r.items() if k not in ('rows','text') }|{'rows':len(r['rows']),'provider':d['provider']})
    (out/'summary.json').write_text(json.dumps(summary,indent=2));from collections import Counter
    print(json.dumps({'documents':len(summary),'states':dict(Counter(x['state'] for x in summary)),'rawResultLines':sum(x['rows'] for x in summary)}))
