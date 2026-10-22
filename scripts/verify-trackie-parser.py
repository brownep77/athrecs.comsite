"""Synthetic PDF regression: seed/final/points must never become team names."""
import importlib.util, pathlib, tempfile, json, subprocess, sys
from reportlab.pdfgen import canvas

root=pathlib.Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('parser',root/'prepare-trackie-captures.py')
parser=importlib.util.module_from_spec(spec);spec.loader.exec_module(parser)
with tempfile.TemporaryDirectory() as folder:
    path=pathlib.Path(folder)/'synthetic.pdf'
    pdf=canvas.Canvas(str(path));pdf.setFont('Courier',10)
    pdf.drawString(18,740,'Girls 1500 Meter Run CC Tyke')
    for x,text in [(42,'Name'),(180,'Year'),(216,'Team'),(320,'Seed'),(410,'Finals'),(461,'Points')]:pdf.drawString(x,720,text)
    pdf.drawString(30,700,'1');pdf.drawString(42,700,'Example, Runner');pdf.drawString(216,700,'Example Club')
    pdf.drawRightString(344,700,'6:00.00');pdf.drawRightString(446,700,'5:50.40');pdf.drawString(473,700,'3')
    pdf.drawString(18,660,'Women 35-39 Shot Put MASTER')
    for x,text in [(42,'Name'),(180,'Year'),(216,'Team'),(360,'Finals'),(425,'Points')]:pdf.drawString(x,640,text)
    pdf.drawString(30,620,'1');pdf.drawString(42,620,'Sample, Athlete');pdf.drawString(216,620,'Example Club')
    pdf.drawRightString(396,620,'8.63m');pdf.drawRightString(461,620,'639')
    pdf.drawString(30,600,'2');pdf.drawString(42,600,'Record, Athlete');pdf.drawString(216,600,'Example Club')
    pdf.drawRightString(402,600,'8.50mR')
    pdf.drawString(18,580,'Event 2 Men 100 Meter Dash OPEN')
    for x,text in [(42,'Name'),(180,'Year'),(216,'Team'),(360,'Prelims')]:pdf.drawString(x,560,text)
    pdf.drawString(30,540,'1');pdf.drawString(42,540,'Heat, Runner');pdf.drawString(216,540,'Example Club')
    pdf.drawRightString(396,540,'11.31q')
    pdf.drawString(18,500,'Event 3 Men 4x100 Meter Relay OPEN')
    for x,text in [(42,'Team'),(180,'Relay'),(360,'Finals')]:pdf.drawString(x,480,text)
    pdf.drawString(30,460,'1');pdf.drawString(42,460,'Example Club');pdf.drawString(180,460,'A')
    pdf.drawRightString(396,460,'44.00');pdf.save()
    rows,issues=parser.parse_pdf(path,{'date':'2026-09-27','files':[{'url':'https://example.org/synthetic.pdf'}]})
    assert not issues,issues
    assert len(rows)==3
    assert [r['club'] for r in rows]==['Example Club']*3
    assert rows[0]['performance']=='5:50.40' and rows[0]['original']['Seed']=='6:00.00'
    assert rows[0]['original']['Points']=='3' and rows[0]['finishSeconds']==350.4
    assert rows[1]['performance']=='8.63m' and rows[1]['finishSeconds'] is None
    assert rows[2]['performance']=='8.50mR'
    assert all(r['independentTextCompared'] for r in rows)
    columns=pathlib.Path(folder)/'columns.pdf'
    pdf=canvas.Canvas(str(columns),pagesize=(612,792));pdf.setFont('Courier',8)
    for offset,heading,name,time in [(0,'Women 100 Meter Run Open','Left, Runner','12.34'),(291.6,'Men 200 Meter Run Open','Right, Runner','24.56')]:
        if offset:pdf.drawString(18+offset,760,'2026 - 2026-06-13')
        pdf.drawString(18+offset,740,heading)
        for x,text in [(42,'Name'),(140,'Age'),(168,'Team'),(235,'Finals')]:pdf.drawString(x+offset,720,text)
        pdf.drawString(30+offset,700,'1');pdf.drawString(42+offset,700,name);pdf.drawString(168+offset,700,'Example Club')
        pdf.drawRightString(263.8+offset,700,time)
    pdf.save()
    rows,issues=parser.parse_pdf(columns,{'date':'2026-07-22','files':[{'url':'https://example.org/columns.pdf'}]})
    assert not issues,issues
    assert [(r['name'],r['performance'],r['gender']) for r in rows]==[('Left, Runner','12.34','Female'),('Right, Runner','24.56','Male')]
    assert len({r['sourceRow'] for r in rows})==2
    shifted=pathlib.Path(folder)/'shifted.pdf'
    pdf=canvas.Canvas(str(shifted));pdf.setFont('Courier',10)
    pdf.drawString(18,740,'Women 100 Meter Sprint U20')
    for x,text in [(42,'Name'),(216,'Team'),(320,'Prelims'),(410,'Finals')]:pdf.drawString(x,720,text)
    pdf.drawString(30,700,'1');pdf.drawString(42,700,'Example, Runner');pdf.drawString(214.9,700,'Example Club')
    pdf.drawRightString(362,700,'12.12');pdf.drawRightString(446,700,'12.34')
    pdf.showPage();pdf.setFont('Courier',10);pdf.drawString(18,740,'4 - 1/11/2026');pdf.save()
    rows,issues=parser.parse_pdf(shifted,{'date':'2026-06-09','files':[{'url':'https://example.org/shifted.pdf'}]})
    assert not issues and len(rows)==1,issues
    assert rows[0]['name']=='Example, Runner' and rows[0]['club']=='Example Club'
    assert rows[0]['original']['Prelims']=='12.12' and rows[0]['performance']=='12.34'
    assert rows[0]['finishSeconds']==12.34 and rows[0]['status']=='finished'
    assert rows[0]['category']=='U20'
    yearbib=pathlib.Path(folder)/'yearbib.pdf'
    pdf=canvas.Canvas(str(yearbib));pdf.setFont('Courier',10)
    pdf.drawString(18,740,'Girls 60 Meter Dash U14')
    for x,text in [(42,'Name'),(180,'Yr'),(216,'Team'),(360,'Finals')]:pdf.drawString(x,720,text)
    pdf.drawString(30,700,'1');pdf.drawString(42,700,'444 Demo, Runner');pdf.drawRightString(192,700,'14');pdf.drawString(216,700,'Example Club');pdf.drawRightString(396,700,'8.61')
    pdf.drawString(18,680,'Preliminaries')
    pdf.drawString(30,660,'2');pdf.drawString(42,660,'555 Heat, Runner');pdf.drawRightString(192,660,'14');pdf.drawString(216,660,'Example Club');pdf.drawRightString(396,660,'9.75');pdf.save()
    rows,issues=parser.parse_pdf(yearbib,{'date':'2026-03-15','files':[{'url':'https://example.org/yearbib.pdf'}]})
    assert not issues and len(rows)==1,issues
    assert rows[0]['name']=='Demo, Runner' and rows[0]['bib']=='444'
    assert rows[0]['original']['Yr']=='14' and rows[0]['performance']=='8.61'
    ambiguous=pathlib.Path(folder)/'ambiguous.pdf'
    pdf=canvas.Canvas(str(ambiguous));pdf.setFont('Courier',10)
    pdf.drawString(18,780,'Example Twilight - 6/2/2026 to 5/19/2026')
    pdf.drawString(18,740,'Women 100 Meter Dash')
    for x,text in [(42,'Name'),(180,'Year'),(216,'Team'),(360,'Finals')]:pdf.drawString(x,720,text)
    pdf.drawString(30,700,'1');pdf.drawString(42,700,'Example, Runner');pdf.drawString(216,700,'Example Club');pdf.drawRightString(396,700,'12.34');pdf.save()
    (pathlib.Path(folder)/'inventory.json').write_text(json.dumps([{'key':'synthetic','url':'https://example.org/result','name':'Example Twilight','dateLabel':'Jun 2','location':'Example','files':[{'url':'https://example.org/ambiguous.pdf','path':str(ambiguous),'format':'pdf'}]}]))
    subprocess.run([sys.executable,str(root/'prepare-trackie-captures.py'),folder],check=True,capture_output=True)
    capture=json.loads((pathlib.Path(folder)/'synthetic.capture.json').read_text())
    assert capture['state']=='held' and capture['rows']==0
    assert 'event-specific dates' in capture['issues'][0]
    # Archive year must survive both capture and publication-plan preparation.
    inventory=[{'key':'prior-year','url':'https://example.org/result','name':'Example Meet','dateLabel':'Dec 27','location':'Example','files':[{'url':'https://example.org/yearbib.pdf','path':str(yearbib),'format':'pdf'}]}]
    (pathlib.Path(folder)/'inventory.json').write_text(json.dumps(inventory))
    subprocess.run([sys.executable,str(root/'prepare-trackie-captures.py'),folder,'--year','2025'],check=True,capture_output=True)
    capture=json.loads((pathlib.Path(folder)/'prior-year.capture.json').read_text())
    assert capture['payload']['rows'][0]['date']=='2025-12-27'
    work=pathlib.Path(folder)/'work';work.mkdir()
    (work/'directory.json').write_text(json.dumps({'index':{},'entities':{},'fingerprint':'synthetic'}))
    (work/'clubs.json').write_text('[]')
    config={'batchId':'trackie-public-synthetic','clubs':[],'meetings':{'prior-year':{'name':'Example Meet','slug':'example-meet','city':'','region':'','country':'','venue':'Example','surface':'Indoor Track','sport':'Athletics','disciplineId':9,'existingId':None}}}
    (work/'config.json').write_text(json.dumps(config))
    subprocess.run([sys.executable,str(root/'publish-trackie-profiles.py'),'prepare','--work',str(work),'--captures',folder,'--config',str(work/'config.json')],check=True,capture_output=True)
    plan=json.loads((work/'plan.private.json').read_text());assert len(plan['profiles'])==1
    assert plan['profiles'][0]['years']==[2025]
    assert plan['profiles'][0]['performances'][0]['year']==2025
print('Trackie synthetic PDF: headings, columns, titles, exact marks and record suffix checks passed.')
