import json
import os
import re

POSTS_PATH = 'Post/posts.json'
POEMS_PATH = 'data/poems.json'

def load_posts():
    with open(POSTS_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_poems_data():
    with open(POEMS_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def split_to_paragraphs(text):
    # Splits text on double newlines or multiple newlines
    raw_paras = [p.strip() for p in text.split('\n\n') if p.strip()]
    lines = []
    for i, p in enumerate(raw_paras):
        p_lines = [l.strip() for l in p.split('\n') if l.strip()]
        for l in p_lines:
            lines.append(l)
        if i < len(raw_paras) - 1:
            lines.append('')
    return lines

def split_poem_lines(text):
    return [l.strip() for l in text.split('\n') if l.strip()]

def main():
    posts = load_posts()
    post_by_id = {p.get('id'): p for p in posts}
    data = load_poems_data()

    # Find mongmo and ky-niem in data
    # 1. Update poems in mongmo
    new_poems = [
        {
            "id": "mongmo_12",
            "num": 12,
            "x": 14.0,
            "y": 68.0,
            "tag": "Thơ #12 · Vivi",
            "title": "#12. Đôi mắt",
            "shortTitle": "Đôi mắt",
            "date": "15.10.2025",
            "author": "Vivi",
            "location": "Góc Nhỏ Tâm Tư",
            "weather": "Thu tàn · Gió khẽ",
            "coverImage": "assets/img/posts/post_827472506505661_1.jpg",
            "body": split_poem_lines(post_by_id['827472506505661']['message'])
        },
        {
            "id": "mongmo_13",
            "num": 13,
            "x": 26.0,
            "y": 76.0,
            "tag": "Thơ #13 · Vivi",
            "title": "#13. Ra sân nhặt nắng",
            "shortTitle": "Ra sân nhặt nắng",
            "date": "17.10.2025",
            "author": "Vivi",
            "location": "Hiên Nhà Ấm Áp",
            "weather": "Nắng vàng mật ong",
            "coverImage": "assets/img/posts/post_829162669669978_1.jpg",
            "body": split_poem_lines(post_by_id['829162669669978']['message'])
        },
        {
            "id": "mongmo_14",
            "num": 14,
            "x": 68.0,
            "y": 75.0,
            "tag": "Thơ #14 · Vivi",
            "title": "#14. Một mình",
            "shortTitle": "Một mình",
            "date": "20.10.2025",
            "author": "Vivi",
            "location": "Đồng Cỏ Sao Rơi",
            "weather": "Đêm thanh vắng · Ngàn sao",
            "coverImage": "assets/img/posts/post_831715836081328_1.jpg",
            "body": split_poem_lines(post_by_id['831715836081328']['message'])
        },
        {
            "id": "mongmo_15",
            "num": 15,
            "x": 82.0,
            "y": 65.0,
            "tag": "Thơ #15 · Vivi",
            "title": "#15. Mỗi chuyến xe",
            "shortTitle": "Mỗi chuyến xe",
            "date": "22.10.2025",
            "author": "Vivi",
            "location": "Tuyến Đường Kỷ Niệm",
            "weather": "Mưa giăng mờ lối",
            "coverImage": "assets/img/posts/post_833396095913302_1.jpg",
            "body": split_poem_lines(post_by_id['833396095913302']['message'])
        },
        {
            "id": "mongmo_16",
            "num": 16,
            "x": 88.0,
            "y": 28.0,
            "tag": "Thơ #16 · Vivi",
            "title": "#16. Chào bạn tôi, lấp lánh",
            "shortTitle": "Chào bạn tôi, lấp lánh",
            "date": "24.10.2025",
            "author": "Vivi",
            "location": "Đỉnh Mây Tà Xùa",
            "weather": "Sương giăng đỉnh gió",
            "coverImage": "assets/img/posts/post_835104499075795_1.jpg",
            "body": split_poem_lines(post_by_id['835104499075795']['message'])
        },
        {
            "id": "mongmo_17",
            "num": 17,
            "x": 86.0,
            "y": 48.0,
            "tag": "Thơ #17 · Vivi",
            "title": "#17. Em muốn là con cá",
            "shortTitle": "Em muốn là con cá",
            "date": "26.10.2025",
            "author": "Vivi",
            "location": "Biển Sâu Tĩnh Lặng",
            "weather": "Sóng vỗ êm đềm",
            "coverImage": "assets/img/posts/post_836869228899322_1.jpg",
            "body": split_poem_lines(post_by_id['836869228899322']['message'])
        },
        {
            "id": "mongmo_18",
            "num": 18,
            "x": 24.0,
            "y": 58.0,
            "tag": "Thơ #18 · Vivi",
            "title": "#18. Tôi..0...suy tư?",
            "shortTitle": "Tôi..0...suy tư?",
            "date": "15.12.2025",
            "author": "Vivi",
            "location": "Giữa Muôn Trùng Sóng Biển",
            "weather": "Gió mạnh · Hoàng hôn biển",
            "coverImage": "assets/img/posts/post_875880198331558_1.jpg",
            "body": split_poem_lines(post_by_id['875880198331558']['message'])
        }
    ]

    # Clean up poem titles inside body if duplicated
    for np in new_poems:
        if np['body'] and np['body'][0] in [np['title'], np['shortTitle'], np['title'].split('. ')[-1]]:
            np['body'] = np['body'][1:]

    # 2. Update blog/kyniem posts
    new_blogs = [
        {
            "id": "kyniem_5",
            "num": 5,
            "x": 32.0,
            "y": 20.0,
            "tag": "Kỷ Niệm · Cảm Nhận Sách",
            "title": "Điều kỳ diệu của tiệm tạp hóa Namiya",
            "shortTitle": "Tiệm Tạp Hóa Namiya",
            "date": "09.09.2026",
            "author": "Vivi",
            "location": "Góc Đọc Sách Thư Thái",
            "weather": "Đêm thu tĩnh mịch",
            "coverImage": "assets/img/posts/post_1094198463166396_1.jpg",
            "body": split_to_paragraphs(post_by_id['1094198463166396']['message'])
        },
        {
            "id": "kyniem_6",
            "num": 6,
            "x": 62.0,
            "y": 22.0,
            "tag": "Kỷ Niệm · Tản Văn Sáng Tác",
            "title": "Nhạc sĩ cửa hàng cá hay cô nàng mơ mộng",
            "shortTitle": "Nhạc Sĩ Cửa Hàng Cá",
            "date": "15.08.2026",
            "author": "Vivi",
            "location": "Phú Yên · Quy Nhơn · Hà Nội",
            "weather": "Nắng vàng mật ong",
            "coverImage": "assets/img/posts/post_1072781445308098_1.jpg",
            "body": split_to_paragraphs(post_by_id['1072781445308098']['message'])
        },
        {
            "id": "kyniem_7",
            "num": 7,
            "x": 78.0,
            "y": 32.0,
            "tag": "Kỷ Niệm · Lắng Nghe Bản Thân",
            "title": "Chơi trốn tìm với màn mây",
            "shortTitle": "Trốn Tìm Với Mây",
            "date": "20.05.2026",
            "author": "Vivi",
            "location": "Dưới Vòm Mây Trôi",
            "weather": "Trời chiều bảng lảng",
            "coverImage": "assets/img/posts/post_999940205925556_1.jpg",
            "body": split_to_paragraphs(post_by_id['999940205925556']['message'])
        },
        {
            "id": "kyniem_8",
            "num": 8,
            "x": 36.0,
            "y": 52.0,
            "tag": "Kỷ Niệm · Chiêm Nghiệm",
            "title": "Nói về sự khó hiểu",
            "shortTitle": "Nói Về Sự Khó Hiểu",
            "date": "11.05.2026",
            "author": "Vivi",
            "location": "Khoảng Lặng Không Tên",
            "weather": "Gió thoảng kẽ lá",
            "coverImage": "assets/img/posts/post_992048530048057_1.jpg",
            "body": split_to_paragraphs(post_by_id['992048530048057']['message'])
        },
        {
            "id": "kyniem_9",
            "num": 9,
            "x": 60.0,
            "y": 58.0,
            "tag": "Kỷ Niệm · Bước Đường Trưởng Thành",
            "title": "Hành trình NCKH & Chiếc cúp của sự kiên trì",
            "shortTitle": "Hành Trình NCKH",
            "date": "21.04.2026",
            "author": "Vivi",
            "location": "Giảng Đường Đại Học",
            "weather": "Gió mát đầu hè",
            "coverImage": "assets/img/posts/post_975795551673355_1.jpg",
            "body": split_to_paragraphs(post_by_id['975795551673355']['message'])
        },
        {
            "id": "kyniem_10",
            "num": 10,
            "x": 72.0,
            "y": 52.0,
            "tag": "Kỷ Niệm · Điện Ảnh & Tâm Hồn",
            "title": "Bạn không hề kỳ lạ. Bạn chỉ mang trong mình tâm hồn quá đỗi rực rỡ",
            "shortTitle": "Amélie Poulain",
            "date": "10.04.2026",
            "author": "Vivi",
            "location": "Góc Chiếu Phim & Trà Ấm",
            "weather": "Mưa phùn · Bản nhạc êm dịu",
            "coverImage": "assets/img/posts/post_967228485863395_1.jpg",
            "body": split_to_paragraphs(post_by_id['967228485863395']['message'])
        },
        {
            "id": "kyniem_11",
            "num": 11,
            "x": 18.0,
            "y": 38.0,
            "tag": "Kỷ Niệm · Tiếp Thêm Động Lực",
            "title": "Bạn không kém cỏi như bạn nghĩ đâu…",
            "shortTitle": "Không Hề Kém Cỏi",
            "date": "16.02.2026",
            "author": "Vivi",
            "location": "Góc Bàn Nhỏ Sưởi Ấm",
            "weather": "Mùa đông rét ngọt",
            "coverImage": "assets/img/posts/post_925041136748797_1.jpg",
            "body": split_to_paragraphs(post_by_id['925041136748797']['message'])
        },
        {
            "id": "kyniem_12",
            "num": 12,
            "x": 50.0,
            "y": 76.0,
            "tag": "Kỷ Niệm · Nhật Ký Lưu Giữ",
            "title": "Những trang viết không bao giờ phai nhạt",
            "shortTitle": "Trang Viết Lưu Giữ",
            "date": "02.07.2026",
            "author": "Vivi",
            "location": "Cuốn Sổ Tay Kỷ Niệm",
            "weather": "Nắng hạ trong trẻo",
            "coverImage": "assets/img/posts/post_1036097498976493_1.jpg",
            "body": split_to_paragraphs(post_by_id['1036097498976493']['message'])
        }
    ]

    # Clean up blog titles inside body if duplicated
    for nb in new_blogs:
        if nb['body'] and nb['body'][0] in [nb['title'], nb['shortTitle']]:
            nb['body'] = nb['body'][1:]
            if nb['body'] and nb['body'][0] == '':
                nb['body'] = nb['body'][1:]

    # Apply to data:
    # 1. mongmo galaxy in categories and constellations
    for cat in data['categories']:
        for gal in cat['galaxies']:
            if gal['id'] == 'mongmo':
                existing_ids = {s['id'] for s in gal['stars']}
                for np in new_poems:
                    if np['id'] not in existing_ids:
                        gal['stars'].append(np)
            elif gal['id'] == 'ky-niem':
                existing_ids = {s['id'] for s in gal['stars']}
                for nb in new_blogs:
                    if nb['id'] not in existing_ids:
                        gal['stars'].append(nb)

    for c in data['constellations']:
        if c['id'] == 'mongmo':
            existing_ids = {s['id'] for s in c['stars']}
            for np in new_poems:
                if np['id'] not in existing_ids:
                    c['stars'].append(np)
        elif c['id'] == 'ky-niem':
            existing_ids = {s['id'] for s in c['stars']}
            for nb in new_blogs:
                if nb['id'] not in existing_ids:
                    c['stars'].append(nb)

    with open(POEMS_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print('Integration complete!')
    print(f'Added {len(new_poems)} new poems to mongmo')
    print(f'Added {len(new_blogs)} new blog articles to ky-niem')

if __name__ == '__main__':
    main()
