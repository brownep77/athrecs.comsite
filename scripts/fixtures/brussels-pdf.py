"""Invented runners, generated locally; never commit downloaded participant data."""
import pathlib
import sys
import fitz


def fixture(path, case='valid'):
    doc = fitz.open()
    net = case == 'neto'
    for number in [1, 2]:
        p = doc.new_page(width=842 if net else 595, height=842)
        def text(x, y, value, size=6):
            p.insert_text((x, y), value, fontsize=size)
        def right(x, y, value):
            text(x - fitz.get_text_length(value, fontsize=6), y, value)
        text(140, 25, 'Brussels Marathon & Half Marathon', 12)
        text(210, 42, 'Brussels, October 4th 2099, BEL')
        text(18, 45, 'Half Marathon' if case == 'half' else 'Marathon')
        groups = [(276, '10k'), (325, '21k'), (375, '30k')]
        groups += [(416, '39k'), (466, 'Neto'), (591, 'Category')] if net else [(416, 'Brutto'), (541, 'Categorie')]
        for x, label in groups:
            text(x, 63, label)
        heads = [(23, 'Pos'), (48, 'Nr'), (65, 'Name'), (225, 'Age'), (242, 'NAT'),
                 (262, 'Pos'), (290, 'Time'), (311, 'Pos'), (339, 'Time'), (361, 'Pos'), (389, 'Time'),
                 (410, 'Pos'), (431, 'Time')]
        heads += ([(460, 'Pos'), (481, 'Time'), (505, 'Official'), (545, 'Gap'), (568, 'TKm'), (588, 'Rank'), (607, 'Name')]
                  if net else [(455, 'Official'), (495, 'Gap'), (518, 'TKm'), (538, 'Rank'), (557, 'Name')])
        for x, label in heads:
            text(x, 75, 'Unknown' if case == 'heading' and number == 2 and label == 'Official' else label)
        for i in range(2):
            ordinal = (number - 1) * 2 + i + 1
            y = 100 + i * 22
            position = str(ordinal) + '.' if ordinal < 3 else 'DNF' if ordinal == 3 else 'DSQ'
            right(33, y, position)
            if net and ordinal == 1:
                text(10, y, 'B')
            right(54, y, '101' if case == 'duplicate' else str(100 + ordinal))
            name = ['EXAMPLE Alex', 'SYNTHETIC Zoe', 'TEST Casey', 'FICTIONAL Rene'][ordinal - 1]
            if not (case == 'missing-name' and ordinal == 4):
                text(65, y, name)
            if ordinal == 2:
                text(65, y + 7, 'Wrapped surname')
            right(235, y, '42')
            text(242, y, ('bel' if net else 'FIN') if ordinal == 1 else '-')
            for x in [270, 320, 369, 418] + ([468] if net else []):
                right(x, y, str(ordinal))
            for x in [300, 349, 399]:
                right(x, y, '1:00:00')
            if net:
                right(444, y, '4:00:00')
            if ordinal < 3:
                right(494 if net else 444, y, '4:59:02' if net else '5:01:02')
                right(524 if net else 474, y, '5:00:02')
            right(601 if net else 551, y, str(ordinal))
            text(607 if net else 557, y, 'M40')
        text(200, 795, 'DNF: Did Not Finish; DSQ: Disqualified')
        text(18, 815, ('5' if case == 'total' else '4') + ' entries')
        text(230, 815, 'ChronoRace - Electronic Timing')
        text(535, 815, f'Page {number} / 2')
    doc.save(path)


if __name__ == '__main__':
    root = pathlib.Path(sys.argv[1])
    for case in ['valid', 'neto', 'half', 'heading', 'duplicate', 'missing-name', 'total']:
        fixture(root / (case + '.pdf'), case)
