import argparse,collections,unicodedata,pathlib,importlib.util,json
parser=argparse.ArgumentParser(description='Screen Trackie athlete candidates on the server; do not publish data.')
parser.add_argument('--work',type=pathlib.Path,required=True)
parser.add_argument('--captures',type=pathlib.Path,required=True)
parser.add_argument('--connection',type=pathlib.Path,required=True)
parser.add_argument('--confirm-branch',required=True)
args=parser.parse_args();WORK=args.work;WORK.mkdir(exist_ok=True)
spec=importlib.util.spec_from_file_location('publisher',pathlib.Path(__file__).with_name('publish-trackie-profiles.py'))
p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
cfg,q=p.w.base.connection(args.connection,args.confirm_branch,180)
if cfg['projectId']!=p.w.PROJECT:raise ValueError('Wrong project')
names=[]
for f in args.captures.glob('*.capture.json'):
 c=json.loads(f.read_text())
 if c['state']=='compared':names.extend(p.display_name(r['name']) for r in c['payload']['rows'])
allowed={key for name in names for key in p.w.prep.name_keys(name)}
nicks={k:min(v) for k,v in p.w.prep.finder.NICK.items()}
marks=''.join(chr(i) for i in range(0x110000) if unicodedata.combining(chr(i)))
fn="""CREATE OR REPLACE FUNCTION pg_temp.trackie_candidate(raw text, allowed jsonb, nick jsonb, marks text) RETURNS boolean LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE n text; ts text[]; f text; l text; ks text[]; i integer;
BEGIN
 IF raw IS NULL OR raw='' THEN RETURN false; END IF;
 IF raw ~ '^[ -~]*$' THEN n:=lower(raw);
 ELSE n:=lower(translate(normalize(raw,NFKD),marks,'')); END IF;
 -- Non-ASCII leftovers use the original Python matcher, conservatively.
 IF n ~ '[^ -~]' THEN RETURN true; END IF;
 n:=trim(regexp_replace(replace(n,chr(39),''),'[^a-z0-9]+',' ','g'));
 ts:=string_to_array(n,' ');
 WHILE cardinality(ts)>0 AND ts[1]=ANY(ARRAY['mr','mrs','ms','miss','mx','dr','sir','dame']) LOOP ts:=ts[2:]; END LOOP;
 IF coalesce(cardinality(ts),0)=0 THEN RETURN false; END IF;
 n:=array_to_string(ts,' ');
 ks:=ARRAY['exact:'||replace(n,' ',''),'tokens:'||(SELECT string_agg(v,' ' ORDER BY v COLLATE "C") FROM unnest(ts) v)];
 IF cardinality(ts)>=2 THEN
  f:=coalesce(nick->>ts[1],ts[1]); l:=ts[cardinality(ts)];
  ks:=array_append(ks,'family:'||f||' '||l);
  IF length(l)>=5 THEN
   ks:=array_append(ks,'family-spelling:'||f||' '||l);
   FOR i IN 1..length(l) LOOP ks:=array_append(ks,'family-spelling:'||f||' '||substr(l,1,i-1)||substr(l,i+1)); END LOOP;
  END IF;
  IF length(f)>=5 THEN
   ks:=array_append(ks,'given-spelling:'||f||' '||l);
   FOR i IN 1..length(f) LOOP ks:=array_append(ks,'given-spelling:'||substr(f,1,i-1)||substr(f,i+1)||' '||l); END LOOP;
  END IF;
 END IF;
 RETURN allowed ?| ks;
END $$"""
# Names JSON traversal is deliberately broader than the Python alias reader.
# It can return extra candidates but cannot remove a supported nested alias.
sql="""WITH d AS ("""+p.w.ATH+""") SELECT * FROM d WHERE EXISTS(
 SELECT 1 FROM (
 SELECT unnest(ARRAY[display_name,race_entry_name,concat_ws(' ',given_name,family_name)]) n
 UNION SELECT j #>> '{}' FROM jsonb_path_query(name_details,'$.** ? (@.type() == "string")') j
 ) names WHERE pg_temp.trackie_candidate(n,$2::jsonb,$3::jsonb,$4::text))"""
sql_params=[0,json.dumps(dict.fromkeys(allowed,True)),json.dumps(nicks),marks]
# Synthetic cases ensure the prefilter never drops a Python key overlap.
samples=['Stephen Example','Steve Example','Dr Steven Example','Steven Exampel','Stéven Example','Steven_Example',"Steven O'Example",'Example Steven','StevenExample','İpek Öztürk','Straße Runner','Runner, Demo','陳 小明']
source=['Steve Example','Steven Oexample','Ipek Ozturk','Strasse Runner','Demo Runner']
testkeys={k for n in source for k in p.w.prep.name_keys(n)}
checks=q([(fn,[]),("SELECT n,pg_temp.trackie_candidate(n,$2::jsonb,$3::jsonb,$4::text) matched FROM unnest($1::text[]) n",[samples,json.dumps(dict.fromkeys(testkeys,True)),json.dumps(nicks),marks])])[-1]
for row in checks:
 if set(p.w.prep.name_keys(row['n'])) & testkeys:assert row['matched'],row
print('Synthetic candidate coverage passed',flush=True)
# One filtered read, not a download of the entire athlete directory.
r=q([("SET LOCAL statement_timeout='150s'",[]),(fn,[]),(p.w.FP,[0]),(sql,sql_params),(p.w.ACCOUNTS,[]),("SELECT id,slug,name,source_names FROM clubs",[]),(p.w.FP,[0])])
assert r[2][0]['fingerprint']==r[6][0]['fingerprint'],'Directory changed during screening'
idx=collections.defaultdict(set);entities={}
for a in r[3]:p.w.register(idx,entities,a,allowed)
for i,a in enumerate(r[4]):
 ident='account:'+str(a.get('athlete_number') or i)
 if p.w.prep.add(idx,ident,[a.get('name'),a.get('full_name'),a.get('display_name'),*p.w.prep.finder.names_from(a.get('previous_names'))],allowed):entities[ident]={'name':a.get('name')}
p.dump(WORK/'directory.json',{'fingerprint':r[2][0]['fingerprint'],'index':{k:sorted(v) for k,v in idx.items()},'entities':entities});p.dump(WORK/'clubs.json',r[5])
p.dump(WORK/'directory-screen.private.json',{'sourceRows':len(names),'candidateRowsTransferred':len(r[3]),'matchedEntities':len(entities),'syntheticCoveragePassed':True})
print('Directory ready',len(r[3]),'candidate rows;',len(entities),'matched entities')
