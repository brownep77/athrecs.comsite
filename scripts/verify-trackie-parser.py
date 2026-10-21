"""Synthetic PDF regression: seed/final/points must never become team names."""
import importlib.util, pathlib, tempfile
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
    pdf.drawRightString(396,620,'8.63m');pdf.drawRightString(461,620,'639');pdf.save()
    rows,issues=parser.parse_pdf(path,{'date':'2026-09-27','files':[{'url':'https://example.org/synthetic.pdf'}]})
    assert not issues,issues
    assert len(rows)==2
    assert [r['club'] for r in rows]==['Example Club','Example Club']
    assert rows[0]['performance']=='5:50.40' and rows[0]['original']['Seed']=='6:00.00'
    assert rows[0]['original']['Points']=='3' and rows[0]['finishSeconds']==350.4
    assert rows[1]['performance']=='8.63m' and rows[1]['finishSeconds'] is None
    assert all(r['independentTextCompared'] for r in rows)
print('Trackie synthetic PDF: club, seed, final, decimal precision and field mark checks passed.')
