import json
import re

WIX_JSON_PATH = 'wix_posts/all_wix_posts.json'
POEMS_PATH = 'data/poems.json'

def load_wix_posts():
    with open(WIX_JSON_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_poems():
    with open(POEMS_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def clean_lines(text, title):
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    # Strip leading meta lines
    while lines:
        first = lines[0]
        if first == title or any(k in first.lower() for k in ['min read', 'updated:', 'jan ', 'feb ', 'aug ', 'mar ', 'apr ', 'may ', 'jun ', 'jul ', 'sep ', 'oct ', 'nov ', 'dec ']):
            lines.pop(0)
        else:
            break
    # Strip trailing tag lines
    while lines:
        last = lines[-1].lower()
        if any(last == tag for tag in ['annguyen', 'thơ', 'poem', 'writing', 'review sách', 'thotangban', 'chữa lành', 'healing', 'ghibli']) or last.startswith('tags:'):
            lines.pop()
        else:
            break
    return lines

def format_paragraphs(lines):
    # Format with blank lines between paragraphs
    result = []
    for i, line in enumerate(lines):
        result.append(line)
        # If line ends with period or is dialogue, or next line starts dialogue, add blank line
        if i < len(lines) - 1:
            if line.endswith('.') or line.endswith(':') or line.startswith('A:') or line.startswith('B:') or line.startswith('Inner Voice'):
                result.append('')
    return result

def main():
    wix = load_wix_posts()
    wix_by_idx = {p['index']: p for p in wix}
    data = load_poems()

    # 1. Update existing mongmo poems with original Wix cover artwork
    wix_covers = {
        'mongmo_1': ('assets/img/wix/wix_11.png', '15.01.2021', 'An Nguyên'),
        'mongmo_2': ('assets/img/wix/wix_4.png', '08.02.2022', 'An Nguyên'),
        'mongmo_3': ('assets/img/wix/wix_9.png', '15.01.2022', 'An Nguyên'),
        'mongmo_4': ('assets/img/wix/wix_2.png', '11.02.2022', 'An Nguyên'),
        'mongmo_9': ('assets/img/wix/wix_6.png', '22.01.2022', 'An Nguyên'),
    }

    # 2. Prepare new Wix poems for mongmo
    p5 = wix_by_idx[5]
    p7 = wix_by_idx[7]
    p8 = wix_by_idx[8]

    new_poems = [
        {
            "id": "mongmo_13",
            "num": 13,
            "x": 38.0,
            "y": 82.0,
            "tag": "Thơ #13 · An Nguyên",
            "title": "#13. Thơ tặng em",
            "shortTitle": "Thơ tặng em",
            "date": "22.01.2022",
            "author": "An Nguyên",
            "location": "Đầm Sen Thôn Quê",
            "weather": "Hương sen thanh khiết",
            "coverImage": "assets/img/wix/wix_5.png",
            "body": clean_lines(p5['body'], p5['title'])
        },
        {
            "id": "mongmo_14",
            "num": 14,
            "x": 58.0,
            "y": 84.0,
            "tag": "Thơ #14 · An Nguyên",
            "title": "#14. Chữa lành cho em",
            "shortTitle": "Chữa lành cho em",
            "date": "22.01.2022",
            "author": "An Nguyên",
            "location": "Căn Phòng Vỗ Về",
            "weather": "Đêm đông dịu êm",
            "coverImage": "assets/img/wix/wix_7.png",
            "body": clean_lines(p7['body'], p7['title'])
        },
        {
            "id": "mongmo_15",
            "num": 15,
            "x": 76.0,
            "y": 82.0,
            "tag": "Thơ #15 · An Nguyên",
            "title": "#15. Lắng lòng hưởng âm",
            "shortTitle": "Lắng lòng hưởng âm",
            "date": "22.01.2022",
            "author": "An Nguyên",
            "location": "Giai Điệu Tuổi Thơ",
            "weather": "Nắng chiều êm ả",
            "coverImage": "assets/img/wix/wix_8.png",
            "body": clean_lines(p8['body'], p8['title'])
        }
    ]

    # 3. Prepare new Wix blog posts for ky-niem
    p1 = wix_by_idx[1]
    p3 = wix_by_idx[3]

    p1_lines = clean_lines(p1['body'], p1['title'])
    p3_lines = clean_lines(p3['body'], p3['title'])

    new_blogs = [
        {
            "id": "kyniem_8",
            "num": 8,
            "x": 30.0,
            "y": 80.0,
            "tag": "Kỷ Niệm · Tâm Lý & Giao Tiếp",
            "title": "Sao bắt nhau phải hiểu insight khi bạn không nói. Hay 4 yếu tố của NVC",
            "shortTitle": "4 Yếu Tố Của NVC",
            "date": "25.08.2023",
            "author": "An Nguyên",
            "location": "Góc Trò Chuyện & Thấu Cảm",
            "weather": "Mùa thu · Chiêm nghiệm sâu sắc",
            "coverImage": "assets/img/wix/wix_1.png",
            "body": format_paragraphs(p1_lines)
        },
        {
            "id": "kyniem_9",
            "num": 9,
            "x": 78.0,
            "y": 80.0,
            "tag": "Kỷ Niệm · Điểm Sách & Bản Sắc",
            "title": "Review sách: \"Vì Facebook tôi suýt đánh mất mình, nhờ Google tôi tìm lại chính mình\"",
            "shortTitle": "Review Sách Google & Facebook",
            "date": "09.02.2022",
            "author": "An Nguyên",
            "location": "Bàn Viết & Trà Chiều",
            "weather": "Trời se se lạnh",
            "coverImage": "assets/img/wix/wix_3.png",
            "body": format_paragraphs(p3_lines)
        }
    ]

    # Apply to categories
    for cat in data['categories']:
        for gal in cat['galaxies']:
            if gal['id'] == 'mongmo':
                # update existing covers
                for s in gal['stars']:
                    if s['id'] in wix_covers:
                        cov, dt, auth = wix_covers[s['id']]
                        s['coverImage'] = cov
                        s['date'] = dt
                        s['author'] = auth
                # add new poems
                existing_ids = {s['id'] for s in gal['stars']}
                for np in new_poems:
                    if np['id'] not in existing_ids:
                        gal['stars'].append(np)

            elif gal['id'] == 'ky-niem':
                existing_ids = {s['id'] for s in gal['stars']}
                for nb in new_blogs:
                    if nb['id'] not in existing_ids:
                        gal['stars'].append(nb)

    # Sync to constellations
    cat_map = {}
    for cat in data['categories']:
        for gal in cat['galaxies']:
            cat_map[gal['id']] = gal['stars']

    for c in data['constellations']:
        if c['id'] in cat_map:
            c['stars'] = cat_map[c['id']]

    with open(POEMS_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print('Wix integration complete!')
    print(f"mongmo stars now: {len(cat_map['mongmo'])}")
    print(f"ky-niem stars now: {len(cat_map['ky-niem'])}")

if __name__ == '__main__':
    main()
