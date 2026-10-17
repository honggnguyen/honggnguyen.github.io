import re
import json

with open('poem/tổng hợp thơ Viviriti.txt', 'r', encoding='utf-8') as f:
    text = f.read()

if text.startswith('\ufeff'):
    text = text[1:]

lines = text.splitlines()

def is_header(line):
    s = line.strip()
    m1 = re.match(r'^(\d+)\.\s*(.*)', s)
    if m1 and not re.match(r'^\d+\.\d+', m1.group(2)):
        return int(m1.group(1)), m1.group(2).strip()
    m2 = re.match(r'^\((\d+)\)\s*(.*)', s)
    if m2:
        return int(m2.group(1)), m2.group(2).strip()
    return None

poem_raws = []
current = None

for idx, line in enumerate(lines):
    h = is_header(line)
    if h:
        if current:
            poem_raws.append(current)
        current = {'num': h[0], 'header_rest': h[1], 'lines': []}
    elif current:
        s = line.strip()
        is_sep = len(s) >= 2 and all(c in '-—_ =*' for c in s)
        if not is_sep:
            current['lines'].append(line)

if current:
    poem_raws.append(current)

# Sort poems by number
poem_raws.sort(key=lambda x: x['num'])

parsed_poems = []

for p in poem_raws:
    num = p['num']
    rest = p['header_rest'].strip()
    raw_lines = [l.strip() for l in p['lines']]
    
    while raw_lines and not raw_lines[0]:
        raw_lines.pop(0)
    while raw_lines and not raw_lines[-1]:
        raw_lines.pop(-1)
        
    title = ""
    date_str = ""
    
    slash_match = re.match(r'^/\s*([^/]+)\s*/$', rest)
    if slash_match:
        title = slash_match.group(1).strip()
        content_lines = raw_lines
    elif rest:
        if raw_lines and re.match(r'^/\s*([^/]+)\s*/$', raw_lines[0]):
            title = re.match(r'^/\s*([^/]+)\s*/$', raw_lines[0]).group(1).strip()
            content_lines = raw_lines[1:]
        elif len(rest) > 0 and (len(rest) <= 30 or any(kw in rest.lower() for kw in ['thơ', 'gửi', 'chào', 'ngày', 'mùa', 'bản', 'mắt', 'nắng', 'sợ'])):
            title = rest
            content_lines = raw_lines
        else:
            content_lines = [rest] + raw_lines
    else:
        if raw_lines and re.match(r'^/\s*([^/]+)\s*/$', raw_lines[0]):
            title = re.match(r'^/\s*([^/]+)\s*/$', raw_lines[0]).group(1).strip()
            content_lines = raw_lines[1:]
        else:
            content_lines = raw_lines

    body = []
    for line in content_lines:
        if not line:
            if body and body[-1] != "":
                body.append("")
            continue
        date_m = re.match(r'^(\d{1,2}[\./]\d{1,2}[\./]\d{2,4})$', line)
        if date_m:
            date_str = date_m.group(1).replace('/', '.')
            continue
        if re.match(r'^[-—~]?\s*(An\s*Nguyên|An\s*Nhiên|an\s*nhiên|Vivi)\b', line, re.IGNORECASE):
            continue
        body.append(line)
        
    while body and body[-1] == "":
        body.pop()

    if not title:
        non_empty = [l for l in body if l]
        if len(non_empty) >= 2:
            title = f"{non_empty[0]} / {non_empty[1]}"
        elif len(non_empty) == 1:
            title = non_empty[0]
        else:
            title = f"Bài thơ #{num}"
            
    title = title.strip(' /~-—')
    if not date_str:
        date_str = "Vivi"
        
    parsed_poems.append({
        'num': num,
        'title': f"#{num}. {title}",
        'short_title': title,
        'date': date_str,
        'author': 'Vivi',
        'body': body
    })

print(f'Parsed total {len(parsed_poems)} unique poems.')

# Define the 13 Constellations:
CONSTELLATION_DEFS = [
    # (id, name, subtitle, category, bgImg, poems_count)
    ('mongmo', 'Chòm sao Mộng Mơ', 'thơ tình · hoài niệm', 'mongmo', 'assets/img/galaxy_0.webp', 9),
    ('aries', 'Chòm sao Bạch Dương (Aries)', 'khởi đầu tươi sáng', 'mongmo', 'assets/img/galaxy_aries.webp', 9),
    ('taurus', 'Chòm sao Kim Ngưu (Taurus)', 'ấm áp · kiên định', 'mongmo', 'assets/img/galaxy_taurus.webp', 9),
    ('gemini', 'Chòm sao Song Tử (Gemini)', 'tâm sự · nhịp đập đôi', 'mongmo', 'assets/img/galaxy_gemini.webp', 9),
    ('cancer', 'Chòm sao Cự Giải (Cancer)', 'dịu dàng · che chở', 'mongmo', 'assets/img/galaxy_cancer.webp', 9),
    
    ('leo', 'Chòm sao Sư Tử (Leo)', 'rực rỡ · đam mê', 'viendu', 'assets/img/galaxy_leo.webp', 9),
    ('virgo', 'Chòm sao Xử Nữ (Virgo)', 'thuần khiết · tinh tế', 'viendu', 'assets/img/galaxy_virgo.webp', 9),
    ('libra', 'Chòm sao Thiên Bình (Libra)', 'cân bằng · bình yên', 'viendu', 'assets/img/galaxy_libra.webp', 9),
    ('orion', 'Chòm sao Lạp Hộ (Orion)', 'người thợ săn sao', 'viendu', 'assets/img/galaxy_orion.webp', 9),
    ('vien-du', 'Chòm sao Viễn Du', 'chân trời mới · phiêu lưu', 'viendu', 'assets/img/galaxy_1.webp', 9),
    
    ('pisces', 'Chòm sao Song Ngư (Pisces)', 'đại dương thi ca', 'kyniem', 'assets/img/galaxy_pisces.webp', 8),
    ('ursamajor', 'Chòm sao Đại Hùng (Ursa Major)', 'chỉ đường phương Bắc', 'kyniem', 'assets/img/galaxy_ursamajor.webp', 8),
    ('ky-niem', 'Chòm sao Kỷ Niệm', 'góc ký ức đọng lại', 'kyniem', 'assets/img/galaxy_2.webp', 8),
]

# Coordinate templates for 9 stars and 8 stars (distributed naturally across the celestial sphere):
STAR_COORDS_9 = [
    (14.5, 42.0),
    (24.0, 26.5),
    (34.5, 48.0),
    (46.0, 31.0),
    (54.5, 52.5),
    (65.0, 28.0),
    (74.5, 46.5),
    (83.0, 32.0),
    (48.5, 68.0),
]

STAR_COORDS_8 = [
    (16.0, 38.0),
    (27.5, 24.0),
    (38.0, 47.0),
    (50.0, 29.0),
    (61.5, 50.0),
    (72.0, 26.0),
    (81.5, 44.0),
    (49.0, 66.0),
]

# Shift coordinates slightly per constellation for variety
def get_coords(count, c_idx):
    base = STAR_COORDS_9 if count == 9 else STAR_COORDS_8
    out = []
    # Deterministic offsets based on constellation index
    dx = ((c_idx * 7) % 11 - 5) * 0.8
    dy = ((c_idx * 5) % 9 - 4) * 0.9
    for x, y in base:
        out.append((round(min(88.0, max(10.0, x + dx)), 1), round(min(76.0, max(20.0, y + dy)), 1)))
    return out

constellations_out = []
poem_cursor = 0

for c_idx, (cid, cname, csub, ccat, bg_img, pcount) in enumerate(CONSTELLATION_DEFS):
    c_poems = parsed_poems[poem_cursor : poem_cursor + pcount]
    poem_cursor += pcount
    
    coords = get_coords(len(c_poems), c_idx)
    stars = []
    
    for s_idx, p in enumerate(c_poems):
        x, y = coords[s_idx]
        stars.append({
            'id': f"{cid}_{s_idx+1}",
            'num': p['num'],
            'x': x,
            'y': y,
            'tag': f"Thơ #{p['num']} · Vivi",
            'title': p['title'],
            'shortTitle': p['short_title'],
            'date': p['date'],
            'author': 'Vivi',
            'location': 'Vườn Thơ Vivi',
            'weather': 'Trời quang · Ngàn sao',
            'body': p['body']
        })
        
    constellations_out.append({
        'id': cid,
        'name': cname,
        'subtitle': csub,
        'category': ccat,
        'bgImg': bg_img,
        'stars': stars
    })

categories_out = [
    {
        'id': 'mongmo',
        'name': 'Mộng Mơ & Tình Yêu',
        'shortName': 'Mộng Mơ',
        'icon': '✦',
        'galaxies': [c for c in constellations_out if c['category'] == 'mongmo']
    },
    {
        'id': 'viendu',
        'name': 'Viễn Du & Bầu Trời Đêm',
        'shortName': 'Viễn Du',
        'icon': '⟡',
        'galaxies': [c for c in constellations_out if c['category'] == 'viendu']
    },
    {
        'id': 'kyniem',
        'name': 'Kỷ Niệm & Trầm Tưởng',
        'shortName': 'Kỷ Niệm',
        'icon': '✧',
        'galaxies': [c for c in constellations_out if c['category'] == 'kyniem']
    }
]

full_data = {
    'categories': categories_out,
    'constellations': constellations_out
}

with open('data/poems.json', 'w', encoding='utf-8') as f_out:
    json.dump(full_data, f_out, ensure_ascii=False, indent=2)

print('Successfully generated data/poems.json!')
print(f'Total constellations: {len(constellations_out)}')
total_stars = sum(len(c['stars']) for c in constellations_out)
print(f'Total stars / poems embedded: {total_stars}')
