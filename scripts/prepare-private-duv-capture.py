"""Compare a saved DUV result page using two independent HTML parsers.

No network or database writes. Run separately for each event. The raw HTML,
source cells and exact performance precision are retained. Fail closed on a
changed table, pagination, missing runner IDs or a mismatched event index row.
"""
import argparse
import datetime as dt
import hashlib
import json
import re
from decimal import Decimal
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import parse_qs, urljoin, urlsplit
from lxml import html

PROVIDER = 'DUV Ultra Marathon Statistics'
BASE = 'https://statistik.d-u-v.org/'
HEADERS = ['Rank', 'Performance', 'Surname, first name', 'Club', 'Nat.', 'YOB',
           'M/F', 'Rank M/F', 'Cat', 'Cat. Rank', 'Avg.Speed km/h', 'Age graded performance']

def clean(value):
    return ' '.join(value.split())

class IndependentTables(HTMLParser):
    """stdlib event parser; does not use lxml selectors or serialized output."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tables=[]; self.stack=[]; self.row=None; self.cell=None
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='table':
            self.stack.append({'id':a.get('id'), 'rows':[]})
        elif self.stack and tag=='tr': self.row=[]
        elif self.row is not None and tag in ('td','th'):
            self.cell={'text':'', 'links':[]}
        elif self.cell is not None and tag=='a' and a.get('href'):
            self.cell['links'].append(a['href'])
    def handle_data(self, data):
        if self.cell is not None: self.cell['text']+=data
    def handle_endtag(self, tag):
        if tag in ('td','th') and self.cell is not None:
            self.cell['text']=' '.join(self.cell['text'].split())
            self.row.append(self.cell); self.cell=None
        elif tag=='tr' and self.row is not None:
            self.stack[-1]['rows'].append(self.row); self.row=None
        elif tag=='table' and self.stack:
            self.tables.append(self.stack.pop())

def parse(raw, index_raw, source_url, captured_at):
    u=urlsplit(source_url)
    if u.scheme!='https' or u.netloc!='statistik.d-u-v.org' or u.path!='/getresultevent.php':
        raise ValueError('Expected an observed HTTPS DUV result URL')
    qs=parse_qs(u.query)
    if set(qs)!={'event'} or len(qs['event'])!=1 or not qs['event'][0].isdigit():
        raise ValueError('Only an unfiltered event page may be imported')
    event_id=qs['event'][0]
    doc=html.fromstring(raw.decode('utf-8'))
    tables=doc.xpath('//table[@id="Resultlist"]')
    if len(tables)!=1: raise ValueError('Expected exactly one result table')
    table=tables[0]
    headers=[clean(x.text_content()) for x in table.xpath('./thead/tr/th')]
    if len(headers)!=len(set(headers)) or set(headers)!=set(HEADERS):
        raise ValueError('Unknown result headings; review mapping before import')
    primary=[]
    for tr in table.xpath('./tbody/tr'):
        cells=tr.xpath('./td')
        if len(cells)!=len(headers): raise ValueError('Incomplete or extended source row')
        primary.append([{'text':clean(c.text_content()), 'links':c.xpath('.//a/@href')} for c in cells])
    independent=IndependentTables(); independent.feed(raw.decode('utf-8'))
    alternate=[t for t in independent.tables if t['id']=='Resultlist']
    if len(alternate)!=1: raise ValueError('Independent parser did not find one result table')
    if [c['text'] for c in alternate[0]['rows'][0]]!=headers or alternate[0]['rows'][1:]!=primary:
        raise ValueError('Independent source comparison failed')
    metadata={}; metadata_links={}
    for tr in doc.xpath('//table/tr'):
        cells=tr.xpath('./td')
        if len(cells)>=2 and cells[0].xpath('./b'):
            key=clean(cells[0].text_content()).rstrip(':')
            metadata[key]=clean(cells[1].text_content())
            metadata_links[key]=cells[1].xpath('.//a/@href')
    second_meta={}
    for t in independent.tables:
        for tr in t['rows']:
            if len(tr)>=2 and tr[0]['text'].rstrip(':') in metadata:
                second_meta[tr[0]['text'].rstrip(':')]=(tr[1]['text'],tr[1]['links'])
    if second_meta!={k:(v,metadata_links[k]) for k,v in metadata.items()}:
        raise ValueError('Independent metadata comparison failed')
    date=dt.datetime.strptime(metadata['Date'],'%d.%m.%Y').date().isoformat()
    if date>captured_at[:10]: raise ValueError('Future result date requires review')
    counts=re.fullmatch(r'(\d+) \((\d+) M, (\d+) F\)',metadata['Finishers'])
    if not counts or int(counts[1])!=len(primary): raise ValueError('Incomplete page or unexpected finisher count')
    idx=html.fromstring(index_raw.decode('utf-8'))
    indexlinks=[a for a in idx.xpath('//a[@href]') if urljoin(BASE,a.get('href'))==source_url]
    if len(indexlinks)!=1: raise ValueError('Event URL not uniquely present in saved index')
    ic=[clean(c.text_content()) for c in indexlinks[0].xpath('ancestor::tr[1]/td')]
    # Index columns are independently identified by their table headings.
    it=indexlinks[0].xpath('ancestor::table[1]')[0]
    ih=[clean(c.text_content()) for c in it.xpath('./thead/tr/th')]
    if not ih: ih=[clean(c.text_content()) for c in it.xpath('./tr[1]/th')]
    if len(ih)!=len(ic): raise ValueError('Unknown index structure')
    index_values=dict(zip(ih,ic))
    # These exact named fields are checked below; do not rely on offsets.
    if index_values.get('Date')!=metadata['Date'] or index_values.get('Event')!=metadata['Event']:
        raise ValueError('Index date/name differs from event source')
    distance=index_values.get('Distance')
    if not distance or not metadata['Distance'].startswith(distance+' '): raise ValueError('Index distance mismatch')
    fin=index_values.get('Finishers')
    if fin is None or int(fin)!=len(primary): raise ValueError('Index row count mismatch')
    duration=re.fullmatch(r'(\d+(?:\.\d+)?)h',distance)
    rows=[]; ids=set()
    for n, cells in enumerate(primary,1):
        original=dict(zip(headers,[c['text'] for c in cells]))
        refs=dict(zip(headers,[c['links'] for c in cells]))
        urls=[urljoin(BASE,x) for x in refs['Surname, first name']]
        if len(urls)!=1: raise ValueError('Missing or ambiguous source runner link')
        ru=urlsplit(urls[0]); rid=parse_qs(ru.query).get('runner',[])
        if ru.netloc!='statistik.d-u-v.org' or ru.path!='/getresultperson.php' or len(rid)!=1 or not rid[0].isdigit():
            raise ValueError('Unexpected source runner identifier')
        if rid[0] in ids: raise ValueError('Repeated runner in same event requires review')
        ids.add(rid[0])
        name=original['Surname, first name'].split(',',1)
        if len(name)!=2 or not all(clean(x) for x in name): raise ValueError('Missing source name components')
        family,given=map(clean,name)
        perf=original['Performance']; achieved=None; seconds=None
        if duration:
            m=re.fullmatch(r'(\d+(?:\.\d+)?) km',perf)
            if not m: raise ValueError('Expected kilometre performance for timed race')
            achieved=str(Decimal(m[1])*1000)
            kind='distance'; unit='km'; value=m[1]
        else:
            m=re.fullmatch(r'(\d+):(\d{2}):(\d{2})(?:\.(\d+))? h',perf)
            if not m or int(m[2])>=60 or int(m[3])>=60: raise ValueError('Unsupported time representation; review source')
            seconds=str(Decimal(m[1])*3600+Decimal(m[2])*60+Decimal(m[3])+Decimal('0.'+(m[4] or '0')))
            kind='time'; unit='seconds'; value=seconds
        for key in ('Rank','Rank M/F','Cat. Rank'):
            if not original[key].isdigit() or int(original[key])<1: raise ValueError('Unsupported placing or finish status')
        if original['M/F'] not in ('M','F'): raise ValueError('Unknown source sex')
        yob=original['YOB']
        if yob and not re.fullmatch(r'\d{4}',yob): raise ValueError('Unsupported source birth year')
        rows.append({'name':given+' '+family,'givenName':given,'familyName':family,'bib':None,
            'club':original['Club'],'gender':original['M/F'],'category':original['Cat'],'date':date,
            'distanceLabel':distance,'status':'finished','tableKey':'Resultlist','sourceRow':n,
            'sourceAthleteId':rid[0],'sourceAthleteUrl':urls[0],'original':original,'originalLinks':refs,
            'performanceDisplay':perf,'performance':{'kind':kind,'value':value,'unit':unit,'display':perf,
              'achievedDistanceMetres':achieved,'finishTimeSeconds':seconds,
              'eventDurationSeconds':str(Decimal(duration[1])*3600) if duration else None,
              'timeBasis':'not_applicable' if duration else 'not_stated_in_table'},
            'places':{'overall':int(original['Rank']),'gender':int(original['Rank M/F']),'category':int(original['Cat. Rank'])},
            'sourceBirthYear':int(yob) if yob else None,'sourceNationality':original['Nat.'],
            'clubDisplayTruncated':original['Club'].endswith('...'),
            'verificationStatus':'unverified'})
    if [sum(r['gender']==g for r in rows) for g in ('M','F')]!=[int(counts[2]),int(counts[3])]:
        raise ValueError('Source gender counts differ')
    return {'schemaVersion':1,'provider':PROVIDER,'sourceKey':'duv-'+event_id,'sourceUrl':source_url,
        'capturedAt':captured_at,'htmlSha256':hashlib.sha256(raw).hexdigest(),'publication':'staff_only',
        'index':{'name':metadata['Event'],'date':date,'location':'','distance':distance,'raw':index_values},
        'eventMetadata':metadata,'eventMetadataLinks':metadata_links,'rows':rows,
        'provenance':{'indexUrl':BASE+'geteventlist.php','indexHtmlSha256':hashlib.sha256(index_raw).hexdigest(),
            'originalResultUrls':metadata_links.get('Source',[]),'originalResultSourceInspected':False,
            'sourceRole':'secondary_statistics_provider','organiser':None},
        'coverage':{'duvPageComplete':True,'organiserFieldComplete':'unknown',
            'note':'DUV can exclude performances below its statistical thresholds; this is the complete displayed DUV page, not a claim about the organiser field.'},
        'audit':{'sourceCheck':'compared','parser':'lxml','independentParser':'stdlib.HTMLParser',
            'version':1,'comparedRows':len(rows),'comparedCells':len(rows)*len(headers),
            'runnerLinksCompared':True,'metadataCompared':True,'identityVerified':False}}

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--html',type=Path,required=True);p.add_argument('--index',type=Path,required=True)
    p.add_argument('--source-url',required=True);p.add_argument('--captured-at',required=True);p.add_argument('--output',type=Path,required=True)
    a=p.parse_args();capture=parse(a.html.read_bytes(),a.index.read_bytes(),a.source_url,a.captured_at)
    a.output.write_text(json.dumps(capture,ensure_ascii=False,separators=(',',':')))
    print(json.dumps({'sourceKey':capture['sourceKey'],'rows':len(capture['rows']),'audit':capture['audit']}))
