"""Read the public WMM ranking feed with counted, resumable category coverage.

Run against a private output directory. No credentials or database mutations.
Preserves source row identifiers; never infers race dates or athlete identity.
"""
import argparse, concurrent.futures, datetime, gzip, hashlib, json, pathlib, time, urllib.request

API='https://gxo3mfmtr4.execute-api.eu-west-1.amazonaws.com'
EDITION=8
AGES=['80+','75-79','70-74','65-69','60-64','55-59','50-54','45-49','40-44']
RANK_FIELDS=['edition','age_group','gender','nationality','firstname','lastname','fullname','overall_ranking','country_ranking','total_races','fastest_finish_time_secs','top_two_results']
RESULT_FIELDS=['result_type','athlete_id','firstname','lastname','fullname','gender','nationality','result_id','event_title','race_title','result_year','finish_time','finish_time_secs','bibnumber','place','age_group','points','edition']

def request(index,q):
    req=urllib.request.Request(API+'/'+index+'/_search',data=json.dumps(q).encode(),headers={'Content-Type':'application/json','Accept':'application/json'})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req,timeout=55) as r: obj=json.load(r)
            if obj.get('error') or obj.get('timed_out') or obj.get('_shards',{}).get('failed'): raise ValueError('Incomplete source response')
            return obj
        except Exception:
            if attempt==3:raise
            time.sleep(2**attempt)

def ranks_query(gender,age):
    return {'bool':{'filter':[{'match':{'edition':str(EDITION)}},{'term':{'gender.keyword':gender}},{'term':{'age_group.keyword':age}}],'must_not':{'match':{'overall_ranking':0}}}}

def results(ids):
    q={'size':10000,'track_total_hits':True,'_source':RESULT_FIELDS,'query':{'bool':{'filter':[{'match':{'edition':str(EDITION)}},{'terms':{'athlete_id.keyword':ids}}],'must_not':[{'match_phrase':{'result_type':'Virtual Ranking'}}]}}}
    obj=request('raceresults',q)
    total=obj['hits']['total'];rows=obj['hits']['hits']
    if total['relation']!='eq':raise ValueError('Unknown result total')
    if total['value']>len(rows):
        if len(ids)<2:raise ValueError('Single athlete result overflow')
        cut=len(ids)//2;return results(ids[:cut])+results(ids[cut:])
    if any(r['_source'].get('athlete_id') not in ids for r in rows):raise ValueError('Unexpected athlete result')
    return rows

def save(path,obj):
    temp=path.with_suffix(path.suffix+'.part')
    with gzip.open(temp,'wt',encoding='utf-8') as f:json.dump(obj,f,ensure_ascii=False,separators=(',',':'))
    temp.replace(path)

def collect_range(output,gender,age,lo,hi):
    path=output/f'{gender}-{age}-{lo}-{hi}.json.gz'
    if path.exists():
        with gzip.open(path,'rt') as f:obj=json.load(f)
        if obj['edition'] != EDITION:raise ValueError('Capture directory contains another edition')
        return len(obj['rankings']),len(obj['results'])
    query=ranks_query(gender,age)
    query['bool']['filter'].append({'range':{'overall_ranking':{'gte':lo,'lte':hi}}})
    obj=request('rankings',{'size':5000,'track_total_hits':True,'_source':RANK_FIELDS,'query':query,'sort':[{'overall_ranking':'asc'}]})
    rows=obj['hits']['hits'];total=obj['hits']['total']
    if total['relation']!='eq':raise ValueError('Unknown rank total')
    if total['value']>len(rows):
        if lo==hi:raise ValueError('Rank overflow')
        mid=(lo+hi)//2
        a=collect_range(output,gender,age,lo,mid);b=collect_range(output,gender,age,mid+1,hi)
        return a[0]+b[0],a[1]+b[1]
    detail=results([r['_id'] for r in rows]) if rows else []
    save(path,{'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'edition':EDITION,'gender':gender,'ageGroup':age,'rankRange':[lo,hi],'rankings':rows,'results':detail})
    print(json.dumps({'phase':'captured','gender':gender,'age':age,'range':[lo,hi],'rankings':len(rows),'results':len(detail)}),flush=True)
    return len(rows),len(detail)

def cohort(output,gender,age):
    obj=request('rankings',{'size':0,'track_total_hits':True,'query':ranks_query(gender,age),'aggs':{'max_rank':{'max':{'field':'overall_ranking'}}}})
    expected=obj['hits']['total']['value'];maximum=int(obj['aggregations']['max_rank']['value'] or 0)
    got=details=0
    for lo in range(1,maximum+1,4000):
        r,d=collect_range(output,gender,age,lo,min(lo+3999,maximum));got+=r;details+=d
    if expected!=got:raise ValueError(f'Category count changed: {gender} {age}: expected {expected}, collected {got}')
    result={'gender':gender,'ageGroup':age,'expected':expected,'collected':got,'results':details,'maxRank':maximum}
    (output/f'{gender}-{age}.coverage.json').write_text(json.dumps(result))
    print(json.dumps({'phase':'category_complete',**result}),flush=True)
    return result

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--output',type=pathlib.Path,required=True);p.add_argument('--workers',type=int,default=3);p.add_argument('--ages',nargs='+',default=AGES);p.add_argument('--edition',type=int,choices=[7,8],default=8)
    a=p.parse_args();EDITION=a.edition;a.output.mkdir(parents=True,exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=a.workers) as pool:
        fs=[pool.submit(cohort,a.output,g,age) for age in a.ages for g in ['F','M']]
        coverage=[f.result() for f in fs]
    (a.output/'coverage.json').write_text(json.dumps(coverage,indent=2))
    print(json.dumps({'phase':'complete','rankings':sum(x['collected'] for x in coverage),'results':sum(x['results'] for x in coverage)}),flush=True)
