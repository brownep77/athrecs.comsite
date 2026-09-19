"""Reviewed Joe Skipper upload; does not connect to or modify a database."""
import json
from pathlib import Path
ROOT=Path(__file__).parent
ITA='https://ita.sport/news/the-ita-acknowledges-the-international-hearing-panel-decision-sanctioning-ironman-athlete-joe-skipper/'
P10='https://www.thepowerof10.info/athletes/profile.aspx?athleteid=366603'
PTO='https://stats.protriathletes.org/athlete/joe-skipper'
WT='https://triathlon.org/athletes/profile/71400/joe-skipper'
SPIN='https://www.spindata.co.uk/riders/rider/3839-joe-skipper'
decision={'reason':'whereabouts','sourceUrl':ITA,'decisionDate':'2026-08-17','note':'The ITA announcement of 4 September 2026 reports the disqualification of competitive results obtained since 15 May 2025 following three whereabouts failures. This is a whereabouts-rule violation, not a reported positive drug test. The announcement records a right of appeal.'}
rows=[]
def add(date,slug,name,sport,country,city,code,km,time,place,source,splits=None,note=None,surface=None):
    details={}
    if date >= '2025-05-15': details['disqualification']=decision
    if splits: details['splits']=[{'label':k,'time':v} for k,v in splits]
    if note: details['note']=note
    secs=0
    for n in time.split(':'): secs=secs*60+int(n)
    rows.append(dict(date=date,slug=slug,name=name,sport=sport,country=country,city=city,code=code,km=km,time=time,seconds=secs,place=place,source=source,details=details,status='DQ' if 'disqualification' in details else 'finished',surface=surface or ('Road' if sport in ('Running','Cycling') else 'Mixed')))
for args in [
('2019-05-15','wroxham-5k','Wroxham 5K','Wroxham','5K',5,'15:45',None),
('2015-03-29','lowestoft-promenade-dash-5','Lowestoft Promenade Dash 5','Lowestoft','5mi',8.04672,'25:32',None),
('2024-03-03','trafford-10k-partington','Trafford 10K','Partington','10K',10,'30:58',None),
('2015-01-25','freethorpe-10','Freethorpe 10','Freethorpe','10mi',16.09344,'53:30',None),
('2014-11-23','city-of-norwich-half-marathon','City of Norwich Half Marathon (historic)','Norwich','Half',21.0975,'1:11:58',None),
('2016-04-03','wymondham-20','Wymondham 20','Wymondham','20mi',32.18688,'1:54:38',None),
('2025-04-13','norfolk-marathon-half','Norfolk Marathon & Half','Cromer','Marathon',42.195,'2:34:07',1),
('2025-06-06','epic-aylsham-5k','EPIC Aylsham 5K','Aylsham','5K',5,'15:38',3),
]:
    date,slug,name,city,code,km,time,place=args
    note='Power of 10 also lists 2:34:08; timing basis remains unconfirmed.' if code=='Marathon' else ('Power of 10 also lists 15:39; original source precision retained in the linked archive.' if date=='2025-06-06' else None)
    add(date,slug,name,'Running','England',city,code,km,time,place,P10,note=note)
add('2026-05-13','great-yarmouth-promenade-5m','Great Yarmouth Promenade 5','Running','England','Great Yarmouth','5mi',8.04672,'25:21',4,'https://totalracetiming.co.uk/raceresults/683',note='Original timing: chip 25:21.0; gun 25:21.4.')
add('2026-07-24','worstead-5','Worstead 5','Running','England','Worstead','5mi',8.04672,'25:53',2,'https://totalracetiming.co.uk/raceresults/698',note='Original timing: chip 25:52.5; gun 25:53.3. Display time rounded to whole seconds.')
for date,slug,name,mi,time,place in [
('2017-05-21','great-yarmouth-cc-25','Great Yarmouth CC 25-mile time trial',25,'53:25',1),
('2017-09-02','cc-breckland-50','CC Breckland 50-mile time trial',50,'1:40:31',1),
('2018-05-12','vc-norwich-25','VC Norwich 25-mile time trial',25,'48:55',3),
('2019-09-07','norwich-abc-10','Norwich ABC 10-mile time trial',10,'20:18',1),
('2020-08-23','vc-baracchi-50','VC Baracchi 50-mile time trial',50,'1:45:11',1),
('2021-06-27','cc-breckland-50','CC Breckland 50-mile time trial',50,'1:39:20',3),
('2022-05-22','great-yarmouth-cc-25','Great Yarmouth CC 25-mile time trial',25,'52:31',3),
('2026-02-08','ely-district-25','Ely & District 25-mile time trial',25,'55:32',4),
('2026-03-14','west-suffolk-21','West Suffolk 21-mile time trial',21,'44:04',1),
('2026-04-11','stowmarket-debenham-tt','Stowmarket Debenham 15.3-mile time trial',15.3,'32:27',1),
('2026-05-10','vc-norwich-25','VC Norwich 25-mile time trial',25,'50:45',1),
('2026-05-25','hashtag-coaching-10','Hashtag Coaching 10-mile time trial',10,'19:28',1),
]:
    add(date,slug,name,'Cycling','England','',f'{mi}mi',round(mi*1.609344,6),time,place,SPIN+'?year='+date[:4],note='Spindata retains the original performance; status follows the ITA decision covering competitive results since 15 May 2025.' if date>'2025-05-15' else None)
for date,slug,name,country,city,time,place,pto_slug in [
('2018-07-15','ironman-uk','IRONMAN UK','England','Bolton','7:55:34',1,'im-uk'),
('2019-11-02','ironman-florida','IRONMAN Florida','United States','Panama City Beach','7:46:28',1,'im-florida'),
('2020-03-07','ironman-new-zealand','IRONMAN New Zealand','New Zealand','Taupo','7:54:17',1,'im-new-zealand'),
('2021-07-04','ironman-uk','IRONMAN UK','England','Bolton','8:42:58',1,'im-uk'),
('2021-09-26','ironman-chattanooga','IRONMAN Chattanooga','United States','Chattanooga','7:46:18',1,'im-chattanooga'),
('2022-09-11','ironman-wales','IRONMAN Wales','Wales','Tenby','8:35:48',1,'im-wales'),
('2022-11-20','ironman-arizona','IRONMAN Arizona','United States','Tempe','7:45:59',1,'im-arizona'),
('2023-07-23','ironman-lake-placid','IRONMAN Lake Placid','United States','Lake Placid','8:03:45',1,'im-lake-placid'),
('2022-10-08','ironman-world-championship','IRONMAN World Championship','United States','Kailua-Kona','7:54:04',5,'im-hawaii'),
('2023-06-25','challenge-roth','Challenge Roth','Germany','Roth','7:44:10',5,'challenge-roth'),
('2025-03-01','ironman-new-zealand','IRONMAN New Zealand','New Zealand','Taupo','7:48:47',2,'im-new-zealand'),
('2025-07-06','challenge-roth','Challenge Roth','Germany','Roth','7:55:28',14,'challenge-roth'),
('2025-09-14','ironman-world-championship-nice','IRONMAN World Championship Nice','France','Nice','8:33:25',26,None),
('2026-04-19','ironman-south-africa','IRONMAN South Africa','South Africa','Gqeberha','7:56:18',2,None),
]:
    splitmap={'2022-09-11':['49:38','5:00:28','2:37:24'],'2022-10-08':['52:54','4:11:10','2:45:25'],'2023-06-25':['51:18','4:09:04','2:40:52'],'2025-07-06':['56:51','4:09:00','2:45:23'],'2025-09-14':['52:00','4:46:38','2:49:31'],'2026-04-19':['55:42','4:16:05','2:41:00']}
    splits=list(zip(['Swim','Bike','Run'],splitmap[date])) if date in splitmap else None
    add(date,slug,name,'Triathlon',country,city,'Shortened triathlon' if date=='2018-07-15' else '140.6mi Triathlon',0 if date in ('2018-07-15','2021-09-26') else 226.3,time,place,f'https://stats.protriathletes.org/race/{pto_slug}/{date[:4]}/results' if pto_slug else PTO,splits=splits,note='Overall race time includes transitions. Courses and conditions vary; splits are parts of this result, not separate races.')
add('2025-09-07','ironman-703-knokke-heist','IRONMAN 70.3 Knokke-Heist','Triathlon','Belgium','Knokke-Heist','70.3',113.1,'3:46:46',5,PTO,splits=[('Swim','23:59'),('Bike','1:58:34'),('Run','1:18:27')])
for date,slug,name,sport,country,city,code,time,place in [
('2013-05-19','european-middle-distance-barcelona','European Middle Distance Championships Barcelona','Triathlon','Spain','Barcelona','Middle-distance triathlon','4:23:28',13),
('2015-06-27','world-long-distance-motala','World Long Distance Championships Motala','Triathlon','Sweden','Motala','Long-distance triathlon','4:55:10',3),
('2017-09-09','european-long-distance-almere','European Long Distance Championships Almere-Amsterdam','Triathlon','Netherlands','Almere','Long-distance triathlon','7:59:39',1),
('2023-05-07','world-long-distance-ibiza','World Long Distance Championships Ibiza','Triathlon','Spain','Ibiza','Long-distance triathlon','5:35:16',22),
('2014-04-13','european-long-distance-duathlon-horst','European Long Distance Duathlon Championships Horst','Duathlon','Netherlands','Horst aan de Maas','Long-distance duathlon','2:53:04',14),
]:add(date,slug,name,sport,country,city,code,0,time,place,WT)
add('2018-07-29','ironman-hamburg-2018-duathlon','IRONMAN Hamburg (duathlon)','Duathlon','Germany','Hamburg','Run–bike–run',0,'7:12:35',2,'https://stats.protriathletes.org/race/im-hamburg/2018/results',splits=[('Opening run','19:49')],note='Swim cancelled; converted to duathlon. The opening run is labelled Swim in the original generic results table.')
add('2024-09-29','ironman-chattanooga-2024-bike-run','IRONMAN Chattanooga (bike–run)','Duathlon','United States','Chattanooga','Bike–run (no swim)',0,'6:43:53',7,'https://stats.protriathletes.org/race/im-chattanooga/2024/results',splits=[('Bike','3:55:51'),('Transition','2:40'),('Run','2:45:22')],note='No swim or opening run recorded; bike–run format, not a standard triathlon or run–bike–run duathlon.')
track=[]
for date,discipline,performance,meeting,venue in [('2011-05-31','3000m','9:25.67','Trafford Grand Prix','Trafford'),('2024-05-11','5000m','15:37.4','Norfolk County Championships','Norfolk')]:
    track.append(dict(year=int(date[:4]),date=date,sourceDate=date,ageGroup='',discipline=discipline,performance=performance,wind='',place='',venue=venue,meeting=meeting,sourceUrls=[P10],labels=[]))
manifest=dict(athleteId=128,athleteNumber='ATH-000128',slug='joe-skipper',checkedAt='2026-09-19',decision=decision,results=rows,sourceHistory=dict(provider='powerof10',externalId='366603',sourceUrl=P10,capturedAt='2026-09-19T12:00:00Z',complete=False,yearsExpected=[2011,2014,2015,2016,2019,2024,2025],yearsCaptured=[2011,2024],performances=track),withheldExistingResultIds=[12255,11181])
ROOT.joinpath('manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({'results':len(rows),'disqualified':sum(r['status']=='DQ' for r in rows),'sourceHistory':len(track)}))
