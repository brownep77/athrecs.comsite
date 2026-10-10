"""Apply a privately reviewed day-duration plan on one explicit branch."""
import argparse,decimal,importlib.util,json,pathlib,re
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('private_db',ROOT/'scripts/create-private-archive-profiles.py');db=importlib.util.module_from_spec(spec);spec.loader.exec_module(db)
p=argparse.ArgumentParser()
p.add_argument('--connection',type=pathlib.Path,required=True);p.add_argument('--branch',required=True);p.add_argument('--plan',type=pathlib.Path,required=True);p.add_argument('--revision');p.add_argument('--receipt',type=pathlib.Path,required=True)
a=p.parse_args();_,query=db.connection(a.connection,a.branch);plan=json.loads(a.plan.read_text());revision=a.revision or plan['revision']
assert re.fullmatch(r'[0-9]+',revision)
keys=set();newids=set()
for item in plan['items']:
 row=item['original'];d,h,m,s=re.fullmatch(r'([1-9][0-9]*)d ([0-9]{2}):([0-9]{2}):([0-9]{2}(?:\.[0-9]+)?) h',row['performanceDisplay']).groups()
 assert int(h)<24 and int(m)<60 and decimal.Decimal(s)<60
 computed=decimal.Decimal(d)*86400+decimal.Decimal(h)*3600+decimal.Decimal(m)*60+decimal.Decimal(s)
 perf=item['performances'][0];measurement=perf['performanceMeasurement']
 assert decimal.Decimal(measurement['value'])==computed==decimal.Decimal(measurement['finishTimeSeconds'])
 assert measurement['kind']=='time' and measurement['unit']=='seconds' and measurement['eventDurationSeconds'] is None and measurement['achievedDistanceMetres'] is None
 assert row['original']['Performance']==perf['performance']==measurement['display']
 assert perf['archiveReference']['original']==row['original'] and perf['archiveReference']['originalLinks']==row['originalLinks']
 assert perf['verificationStatus']=='unverified' and perf['places']==row['places']
 assert perf['date']==row['date'] and perf['discipline']==row['distanceLabel']
 assert item['externalId'] not in keys;keys.add(item['externalId'])
 if item['decision']['status']=='created':
  assert row['sourceAthleteId'] not in newids;newids.add(row['sourceAthleteId'])
  profile=item['profile'];assert profile['profileVisibility']=='public' and profile['displayName']==row['name'] and profile['sourceUrl']==row['sourceAthleteUrl']
  assert profile['details']['duvSourceObservation']['nationality']==row['sourceNationality']
  assert profile['details']['duvSourceObservation']['birthYear']==row['sourceBirthYear']
sql=(ROOT/'scripts/apply-duv-day-recovery.sql').read_text().replace('__REVISION__',revision)
summary="""SELECT count(*)::int AS audits,count(*) FILTER(WHERE after_value->>'status'='created')::int created,count(*) FILTER(WHERE after_value->>'status'='linked')::int linked,count(*) FILTER(WHERE after_value->>'status'='held')::int held,(SELECT version::text FROM result_archive_identity_clock WHERE singleton) revision FROM network_audit_log WHERE action='duv.held_day_recovered' AND after_value->>'reviewId' LIKE 'duv-day-recovery-v1:%'"""
try:
 result=query([("SELECT set_config('athrecs.duv_day_plan',$1,true)",[json.dumps(plan)]),(summary,[]),(sql,[]),(summary,[])])
 receipt={'branchId':a.branch,'independentDecimalComparisons':len(plan['items']),'insertedAuditRows':result[3][0]['audits']-result[1][0]['audits'],'before':result[1][0],'after':result[3][0]}
 db.dump(a.receipt,receipt);print(json.dumps(receipt))
except RuntimeError as e:
 print(str(e));raise SystemExit(1)
