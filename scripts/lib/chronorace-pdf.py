#!/usr/bin/env python3
"""Read inspected Brussels ChronoRace detail reports, comparing two PDF engines.

No network, database or identity matching. Output is private collection evidence.
Dependencies: pdfplumber and PyMuPDF (see requirements-brussels-collector.txt).
"""
import collections
import hashlib
import json
import re
import sys

import fitz
import pdfplumber


def require(condition, message):
    if not condition:
        raise ValueError(message)


def cell_text(chars):
    lines = []
    # Collapse identical painted glyphs, not repeated letters within a word.
    unique = {}
    for c in chars:
        key = (c['text'], round(c['x0'], 1), round(c['top'], 1))
        unique.setdefault(key, c)
    for c in sorted(unique.values(), key=lambda c: ((c['top'] + c['bottom']) / 2, c['x0'])):
        y = (c['top'] + c['bottom']) / 2
        if not lines or abs(lines[-1][0] - y) > 2:
            lines.append((y, []))
        lines[-1][1].append(c)
    output = []
    for _, line in lines:
        text, end = '', None
        for c in sorted(line, key=lambda c: c['x0']):
            if end is not None and c['x0'] - end > 1.0 and not text.endswith(' '):
                text += ' '
            text += c['text']
            end = c['x1']
        output.append(' '.join(text.split()))
    return ' '.join(output)


def layout(words, width):
    names = [w for w in words if w['text'] == 'Name' and w['top'] < 150]
    require(len(names) == 2, 'Missing or ambiguous athlete/category Name headings')
    name = min(names, key=lambda w: w['x0'])
    headers = sorted([w for w in words if abs(w['top'] - name['top']) < 1], key=lambda w: w['x0'])
    labels = [w['text'] for w in headers]
    require(labels[:5] in [['Pos', 'Nr', 'Name', 'Age', 'NOC'], ['Pos', 'Nr', 'Name', 'Age', 'NAT']],
            'Unsupported identity headings')
    official = labels.index('Official') if 'Official' in labels else -1
    require(official >= 7 and labels[5:official] == ['Pos', 'Time'] * ((official - 5) // 2),
            'Unsupported timing headings')
    require(labels[official:] in [['Official', 'Gap', 'TKm', 'Rank', 'Name'],
                                   ['Official', 'Gap', 'TKm', 'Rank', 'Name', 'City']],
            'Unsupported category headings')
    groups = []
    for pos in range(5, official, 2):
        left, right = headers[pos]['x0'], headers[pos + 1]['x1']
        above = [w['text'] for w in words if name['top'] - 20 < w['top'] < name['top'] - 3
                 and left <= (w['x0'] + w['x1']) / 2 <= right]
        require(len(above) == 1, 'Missing or ambiguous split/finish group heading')
        groups.append(above[0])
    require(groups in [['10k', '21k', '30k', '39k', 'Neto'], ['10k', '21k', '30k', 'Brutto']],
            'Uninspected split/finish layout')
    keys = ['position', 'bib', 'name', 'age', 'nationality']
    for group in groups:
        keys += [group + ' place', group + ' time']
    keys += ['Official', 'Gap', 'TKm', 'categoryPlace', 'category']
    if labels[-1] == 'City':
        keys += ['city']
    bounds = []
    for i, key in enumerate(keys):
        left = 0 if i == 0 else headers[i - 1]['x1'] + .5
        right = headers[i]['x1'] + .5
        if key == 'name':
            left, right = headers[i]['x0'] - .5, headers[i + 1]['x0'] - 1.5
        elif key == 'age':
            left = headers[i]['x0'] - 1.5
        elif key == 'category':
            right = headers[i + 1]['x0'] - 1.5 if i + 1 < len(keys) else width
        elif key == 'city':
            left, right = headers[i]['x0'] - 1.5, width
        bounds.append((key, left, right))
    bounds.insert(2, ('marker', headers[1]['x1'] + .5, name['x0'] - .5))
    return name['top'], headers, groups, bounds


def parse_document(path):
    data = open(path, 'rb').read()
    require(len(data) <= 25 * 1024 * 1024 and data.startswith(b'%PDF-'), 'Expected a PDF under 25 MiB')
    pages, seen, expected, signature = [], set(), None, None
    with pdfplumber.open(path) as doc, fitz.open(path) as independent:
        require(not independent.needs_pass and 0 < len(doc.pages) <= 500, 'Unsupported encrypted/oversized PDF')
        require(len(doc.pages) == len(independent), 'PDF engines disagree about page count')
        for number, page in enumerate(doc.pages, 1):
            page = page.dedupe_chars()
            words = page.extract_words(x_tolerance=.5)
            text = page.extract_text(x_tolerance=.5)
            require('Brussels Marathon' in text and 'ChronoRace' in text, 'Not an inspected Brussels ChronoRace report')
            header_y, headers, groups, bounds = layout(words, page.width)
            title = cell_text([c for c in page.chars if c['bottom'] < header_y - 20])
            # The exact document title/date is retained, never converted into an edition.
            division = [w['text'] for w in words if w['x0'] < 70 and 15 < w['top'] < header_y - 15]
            require('Marathon' in division and not any(re.search(r'Half|Mini|Ladies', w, re.I) for w in division),
                    'Select the full Marathon report')
            current = ([w['text'] for w in headers], groups, sorted(title.split()))
            require(signature is None or signature == current, 'Headings, event title or date changed between pages')
            signature = current
            totals = re.findall(r'\b(\d+) entries\b', text)
            require(len(totals) == 1, 'Missing/ambiguous printed entry total')
            count = int(totals[0])
            require(0 < count <= 1000000 and (expected is None or count == expected), 'Printed entry total changed')
            expected = count
            footer = re.search(r'Page\s+(\d+)\s*/\s*(\d+)', text)
            require(footer and tuple(map(int, footer.groups())) == (number, len(doc.pages)), 'Printed page sequence is incomplete')
            footer_words = [w for w in words if w['text'] == 'DNF:' and w['top'] > header_y]
            require(len(footer_words) == 1, 'Missing result table footer')
            bottom = footer_words[0]['top']
            # Unknown statuses cannot disappear silently: the printed total must match.
            table_left = headers[0]['x0'] - (headers[0]['x1'] - headers[0]['x0'])
            marks = [w for w in words if table_left <= w['x0'] and w['x1'] <= bounds[0][2]
                     and re.fullmatch(r'\d+\.|DNF|DNS|DSQ|DQ', w['text'])
                     and header_y + 5 < w['top'] < bottom]
            require(marks, 'No result rows on a document page')
            other = []
            ipage = independent[number - 1]
            for block in ipage.get_text('rawdict')['blocks']:
                for line in block.get('lines', []):
                    for span in line['spans']:
                        for c in span['chars']:
                            box = fitz.Rect(c['bbox']) * ipage.rotation_matrix
                            other.append(dict(text=c['c'], x0=box.x0, x1=box.x1, top=box.y0, bottom=box.y1))
            rows = []
            for index, mark in enumerate(marks):
                center = (mark['top'] + mark['bottom']) / 2
                top = ((marks[index - 1]['top'] + marks[index - 1]['bottom']) / 2 + center) / 2 if index else header_y + 8
                end = ((marks[index + 1]['top'] + marks[index + 1]['bottom']) / 2 + center) / 2 if index + 1 < len(marks) else bottom
                values = {}
                primary_row = [c for c in page.chars if top < (c['top'] + c['bottom']) / 2 < end]
                independent_row = [c for c in other if top < (c['top'] + c['bottom']) / 2 < end]
                for key, left, right in bounds:
                    def read(chars):
                        return cell_text([c for c in chars if top < (c['top'] + c['bottom']) / 2 < end
                                          and left <= (c['x0'] + c['x1']) / 2 < right])
                    value, comparison = read(primary_row), read(independent_row)
                    require(re.sub(r'\s', '', value) == re.sub(r'\s', '', comparison),
                            f'Independent cell comparison failed at page {number}, row {index + 1}, {key}')
                    values[key] = value
                position = mark['text']
                require(values['position'] in [position, 'B ' + position], 'Uninspected leading position marker')
                require(re.fullmatch(r'\d+\.|DNF|DNS|DSQ|DQ', position), f'Unsupported position/status at {number}:{index + 1}: {position!r} (mark {mark["text"]})')
                require(values['bib'].isdigit() and values['name'], f'Missing bib/name at {number}:{index + 1}, position {position}, bib {values["bib"]!r}, name {values["name"]!r}')
                require(values['bib'] not in seen, f'Duplicate bib {values["bib"]}; retain document for review')
                seen.add(values['bib'])
                require(values['marker'] in ['', 'F', 'H', 'B'], 'Uninspected marker')
                require(values['age'] in ['', '-'] or values['age'].isdigit(), 'Invalid source age')
                require(values['nationality'] in ['', '-'] or re.fullmatch(r'[A-Za-z]{3}', values['nationality']), f'Invalid source nationality at {number}:{index + 1}, bib {values["bib"]}: {values["nationality"]!r}')
                for key, value in values.items():
                    if key.endswith(' time') or key == 'Official':
                        require(value in ['', '-'] or re.fullmatch(r'\d+:[0-5]\d:[0-5]\d(?:\.\d+)?', value), f'Invalid {key}: {value}')
                    if key.endswith(' place') or key == 'categoryPlace':
                        require(value in ['', '-'] or re.fullmatch(r'[1-9]\d*', value), f'Invalid {key}: {value}')
                finished = position.endswith('.')
                require(not finished or (values[groups[-1] + ' time'] not in ['', '-'] and values['Official'] not in ['', '-']), 'Finisher missing time')
                rows.append({'page': number, 'row': index + 1, 'position': position, 'original': values,
                             'status': 'finished' if finished else 'DQ' if position == 'DSQ' else position})
            pages.append({'page': number, 'rows': rows})
            page.close()
    require(len(seen) == expected, f'Printed total {expected} differs from extracted {len(seen)} rows; collection held')
    return {'format': 'athrecs-chronorace-pdf-v1', 'sha256': hashlib.sha256(data).hexdigest(),
            'title': title, 'headers': signature[0], 'groups': signature[1],
            'totalRows': expected, 'totalPages': len(pages), 'comparison': 'pdfplumber/PyMuPDF all cells', 'pages': pages}


if __name__ == '__main__':
    try:
        print(json.dumps(parse_document(sys.argv[1]), ensure_ascii=False))
    except Exception as error:
        print(f'ChronoRace PDF held: {error}', file=sys.stderr)
        sys.exit(1)
