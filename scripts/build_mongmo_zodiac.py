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

# The 11 Zodiac & Mộng Mơ constellations:
# 114 poems divided across 11 constellations:
# 4 constellations with 11 poems, 7 constellations with 10 poems = 44 + 70 = 114 poems!
MONGMO_CONSTELLATIONS = [
    # (id, name, subtitle, bgImg, poems_count)
    ('mongmo', 'Chòm sao Mộng Mơ', 'thơ tình · hoài niệm', 'assets/img/galaxy_0.webp', 11),
    ('aries', 'Chòm sao Bạch Dương (Aries)', 'khởi đầu tươi sáng', 'assets/img/galaxy_aries.webp', 11),
    ('taurus', 'Chòm sao Kim Ngưu (Taurus)', 'ấm áp · kiên định', 'assets/img/galaxy_taurus.webp', 11),
    ('gemini', 'Chòm sao Song Tử (Gemini)', 'tâm sự · nhịp đập đôi', 'assets/img/galaxy_gemini.webp', 11),
    ('cancer', 'Chòm sao Cự Giải (Cancer)', 'dịu dàng · che chở', 'assets/img/galaxy_cancer.webp', 10),
    ('leo', 'Chòm sao Sư Tử (Leo)', 'rực rỡ · đam mê', 'assets/img/galaxy_leo.webp', 10),
    ('virgo', 'Chòm sao Xử Nữ (Virgo)', 'thuần khiết · tinh tế', 'assets/img/galaxy_virgo.webp', 10),
    ('libra', 'Chòm sao Thiên Bình (Libra)', 'cân bằng · bình yên', 'assets/img/galaxy_libra.webp', 10),
    ('pisces', 'Chòm sao Song Ngư (Pisces)', 'đại dương thi ca', 'assets/img/galaxy_pisces.webp', 10),
    ('ursamajor', 'Chòm sao Đại Hùng (Ursa Major)', 'chỉ đường phương Bắc', 'assets/img/galaxy_ursamajor.webp', 10),
    ('orion', 'Chòm sao Lạp Hộ (Orion)', 'người thợ săn sao', 'assets/img/galaxy_orion.webp', 10),
]

# Coordinate templates:
STAR_COORDS_11 = [
    (14.0, 42.0),
    (22.5, 26.0),
    (31.0, 48.0),
    (40.0, 30.0),
    (48.5, 52.0),
    (57.0, 27.0),
    (65.5, 47.0),
    (74.0, 31.0),
    (82.5, 45.0),
    (44.0, 68.0),
    (59.0, 68.0),
]

STAR_COORDS_10 = [
    (15.0, 40.0),
    (24.0, 25.0),
    (33.5, 48.0),
    (43.0, 30.0),
    (52.5, 52.0),
    (62.0, 28.0),
    (71.5, 46.0),
    (81.0, 32.0),
    (46.0, 68.0),
    (60.0, 67.0),
]

def get_coords(count, c_idx):
    base = STAR_COORDS_11 if count == 11 else STAR_COORDS_10
    out = []
    dx = ((c_idx * 7) % 11 - 5) * 0.7
    dy = ((c_idx * 5) % 9 - 4) * 0.8
    for x, y in base:
        out.append((round(min(88.0, max(10.0, x + dx)), 1), round(min(76.0, max(20.0, y + dy)), 1)))
    return out

all_constellations = []
poem_cursor = 0

for c_idx, (cid, cname, csub, bg_img, pcount) in enumerate(MONGMO_CONSTELLATIONS):
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
            'location': 'Vườn Thơ Mộng Mơ',
            'weather': 'Trời quang · Ngàn sao',
            'body': p['body']
        })
        
    all_constellations.append({
        'id': cid,
        'name': cname,
        'subtitle': csub,
        'category': 'mongmo',
        'bgImg': bg_img,
        'stars': stars
    })

# Now add the single first universe for Viễn Du: Galaxy_1.png -> galaxy_1.webp
viendu_stars = [
    {
        'id': 'viendu_1',
        'num': 1,
        'x': 18.0,
        'y': 48.0,
        'station': 'Trạm Khởi Hành · Căn Phòng Bên Cửa Sổ',
        'tag': 'Hành Trình Viễn Du · Trạm 1',
        'title': 'Trạm 1: Khởi Hành Giữa Ngàn Sao',
        'shortTitle': 'Khởi Hành Giữa Ngàn Sao',
        'date': 'Xuân 2024',
        'author': 'Vivi',
        'location': 'Căn phòng bên cửa sổ',
        'weather': 'Gió đêm se lạnh',
        'coverImage': 'assets/photos/dalat.jpg',
        'body': [
            'Bắt đầu một chuyến đi dài qua những tầng mây,',
            'từ căn phòng ấm áp bên tách trà sen thơm ngát.',
            'Cửa sổ mở ra cả một khoảng trời mênh mông,',
            'chú cún con ngước nhìn theo từng vì sao rớt.'
        ]
    },
    {
        'id': 'viendu_2',
        'num': 2,
        'x': 32.0,
        'y': 32.0,
        'station': 'Trạm Dừng · Sương Mờ Đà Lạt',
        'tag': 'Hành Trình Viễn Du · Trạm 2',
        'title': 'Trạm 2: Đồi Thông & Sương Mờ',
        'shortTitle': 'Đồi Thông & Sương Mờ',
        'date': 'Mùa thu 2024',
        'author': 'Vivi',
        'location': 'Đồi thông Đà Lạt',
        'weather': 'Sương mù giăng lối',
        'coverImage': 'assets/photos/dalat.jpg',
        'body': [
            'Đà Lạt sớm mai phủ một làn sương mỏng,',
            'những nhành thông khẽ run rẩy đón hạt nắng đầu tiên.',
            'Tôi bước đi giữa không gian tĩnh lặng,',
            'nghe tiếng chim ca ríu rít gọi bình minh.'
        ]
    },
    {
        'id': 'viendu_3',
        'num': 3,
        'x': 48.0,
        'y': 52.0,
        'station': 'Trạm Dừng · Biển Chiều Quy Nhơn',
        'tag': 'Hành Trình Viễn Du · Trạm 3',
        'title': 'Trạm 3: Biển Chiều & Hoàng Hôn Vàng',
        'shortTitle': 'Biển Chiều & Hoàng Hôn Vàng',
        'date': 'Hè 2024',
        'author': 'Vivi',
        'location': 'Bờ biển Quy Nhơn',
        'weather': 'Sóng vỗ rì rào',
        'coverImage': 'assets/photos/quynhon.jpg',
        'body': [
            'Sóng biển dạt dào hôn lên bờ cát mịn,',
            'nắng chiều buông vạt áo tím trên mặt nước lung linh.',
            'Ngồi nghe biển hát bản tình ca muôn thuở,',
            'thấy lòng mình nhẹ bẫng tựa áng mây trôi.'
        ]
    },
    {
        'id': 'viendu_4',
        'num': 4,
        'x': 64.0,
        'y': 28.0,
        'station': 'Trạm Dừng · Đỉnh Gió Cao Nguyên',
        'tag': 'Hành Trình Viễn Du · Trạm 4',
        'title': 'Trạm 4: Đỉnh Gió & Trời Mây',
        'shortTitle': 'Đỉnh Gió & Trời Mây',
        'date': 'Thu 2024',
        'author': 'Vivi',
        'location': 'Đỉnh đèo lộng gió',
        'weather': 'Gió thổi lồng lộng',
        'body': [
            'Đứng trên đỉnh cao ngắm nhìn bốn bể,',
            'con đường uốn lượn như dải lụa mềm vắt ngang lưng trời.',
            'Gió thổi bay những âu lo thường nhật,',
            'chỉ còn lại sự tự do và tình yêu thiên nhiên.'
        ]
    },
    {
        'id': 'viendu_5',
        'num': 5,
        'x': 78.0,
        'y': 44.0,
        'station': 'Trạm Đích · Vòm Trời Kỷ Niệm',
        'tag': 'Hành Trình Viễn Du · Trạm 5',
        'title': 'Trạm 5: Điểm Dừng Chân Thênh Thang',
        'shortTitle': 'Điểm Dừng Chân Thênh Thang',
        'date': 'Đông 2024',
        'author': 'Vivi',
        'location': 'Vòm trời sao',
        'weather': 'Sao sa lấp lánh',
        'body': [
            'Đi thật xa để trở về bên chính mình,',
            'mỗi bước chân là một nốt nhạc trong bản giao hưởng cuộc đời.',
            'Cảm ơn những chuyến đi đã cho tôi thêm yêu cuộc sống,',
            'và tin vào những điều kỳ diệu quanh ta.'
        ]
    }
]

all_constellations.append({
    'id': 'vien-du',
    'name': 'Chòm sao Viễn Du',
    'subtitle': 'chân trời mới · phiêu lưu',
    'category': 'viendu',
    'bgImg': 'assets/img/galaxy_1.webp',
    'stars': viendu_stars
})

# Now add the single first universe for Kỷ Niệm: Galaxy_2.png -> galaxy_2.webp
kyniem_stars = [
    {
        'id': 'kyniem_1',
        'num': 1,
        'x': 20.0,
        'y': 44.0,
        'tag': 'Kỷ Niệm · Vivi',
        'title': 'Ký Ức Buổi Chiều Mưa',
        'shortTitle': 'Ký Ức Buổi Chiều Mưa',
        'date': 'Mùa đông năm ấy',
        'author': 'Vivi',
        'location': 'Góc hiên nhỏ',
        'weather': 'Mưa rả rích',
        'body': [
            'Hôm ấy trời mưa rả rích từ trưa đến sẩm tối, từng hạt mưa gõ nhịp đều đều lên mái tôn cũ kỹ như một khúc nhạc không lời từ cõi mộng. Không gian xung quanh dường như ngưng đọng lại, chỉ còn lại mùi hương của đất ẩm quyện với làn khói mỏng bốc lên từ tách trà hoa cúc còn ấm nóng trên bàn.',
            '',
            'Tôi ngồi bó gối bên khung cửa sổ, chiếc khăn len quàng vội còn vương chút hơi ấm của những mùa đông trước. Chú cún xù cuộn tròn một góc dưới chân ghế, đôi mắt lim dim lắng nghe tiếng gió lùa qua khe cửa. Thỉnh thoảng, một tiếng sấm xa xôi vọng lại làm nó khẽ giật mình rúc sâu hơn vào vạt áo tôi.',
            '',
            'Những buổi chiều mưa như thế này luôn gợi nhắc tôi về những điều tưởng chừng đã ngủ quên trong ký ức. Rằng giữa một thế giới luôn hối hả và vội vã ngoài kia, chúng ta đôi khi chỉ cần một góc nhỏ tĩnh lặng, một cơn mưa vừa đủ để gột rửa những muộn phiền, và một trái tim biết rung động trước những điều bình dị nhất.',
            '',
            '> "Mưa ngoài hiên có thể buốt giá, nhưng chỉ cần trong lòng ta còn thắp lên một đốm lửa dịu dàng, thì bão giông nào rồi cũng sẽ hóa thành bình yên."'
        ]
    },
    {
        'id': 'kyniem_2',
        'num': 2,
        'x': 38.0,
        'y': 28.0,
        'tag': 'Kỷ Niệm · Vivi',
        'title': 'Mảnh Vườn Tuổi Thơ',
        'shortTitle': 'Mảnh Vườn Tuổi Thơ',
        'date': 'Ký ức xưa',
        'author': 'Vivi',
        'location': 'Vườn quê thanh bình',
        'weather': 'Nắng vàng mật ong',
        'body': [
            'Ký ức về mảnh vườn của ông bà ngày thơ bé là một vùng trời ngập tràn sắc vàng của nắng và vị ngọt của những mùa hoa. Tôi nhớ con đường đất nhỏ dẫn vào ngõ, hai bên rợp bóng những rặng tre xào xạc trong gió trưa hè.',
            '',
            'Những buổi trưa trốn người lớn không chịu ngủ, chân trần chạy thoăn thoắt qua từng luống rau, say sưa rình bắt những chú chuồn chuồn ớt cánh mỏng tang đậu hờ hững trên cành ổi. Tiếng ve ngân vang râm ran khắp vòm cây, hòa cùng tiếng chổi tre bà quét lá xào xạc ngoài sân gạch.',
            '',
            'Mỗi khi chiều tà buông xuống, hương hoa cau lại thoang thoảng bay khắp hiên nhà. Mâm cơm đạm bạc với bát canh rau tập tàng và đĩa cá kho tương thơm nức mũi mà sao ngon đến lạ kỳ. Đó là những ngày tháng mà nỗi buồn chỉ vẹn vẹn bằng que kem tan chảy dưới nắng, và niềm vui đơn giản là được ngước nhìn những vì sao đầu tiên mọc sớm nơi chân trời.',
            '',
            '> "Tuổi thơ như một chiếc hộp nhạc thần kỳ, dẫu năm tháng có phủ bụi thời gian, mỗi lần khẽ mở ra vẫn vang lên những giai điệu trong trẻo và ấm áp nhất."'
        ]
    },
    {
        'id': 'kyniem_3',
        'num': 3,
        'x': 55.0,
        'y': 52.0,
        'tag': 'Kỷ Niệm · Vivi',
        'title': 'Ngọn Lửa Sưởi Ấm Đêm Đông',
        'shortTitle': 'Ngọn Lửa Sưởi Ấm Đêm Đông',
        'date': 'Đêm giao mùa',
        'author': 'Vivi',
        'location': 'Bên bếp lửa hồng',
        'weather': 'Gió bấc se lạnh',
        'body': [
            'Mùa đông năm ấy đến sớm hơn thường lệ, những cơn gió mùa đông bắc rít từng hồi qua hàng cây sau nhà làm rụng rơi những chiếc lá cuối cùng. Căn phòng nhỏ trở nên ấm cúng lạ thường khi ánh lửa từ bếp sưởi bắt đầu tí tách nổ lách tách những đốm than hồng.',
            '',
            'Tôi kéo chiếc ghế bập bênh lại gần bếp lửa, mở trang sách đang đọc dở. Chú cún nằm lười biếng phơi chiếc bụng tròn xoe trước ánh lửa ấm, cái đuôi thỉnh thoảng khẽ vẫy khi nghe tôi gọi tên. Ánh sáng vàng cam dịu ngọt nhảy múa trên tường, vẽ nên những hình thù huyền ảo như trong truyện cổ tích.',
            '',
            'Trong cái lạnh tê tái của đêm đông, sự ấm áp không chỉ đến từ than hồng mà còn đến từ sự hiện diện của những người ta thương yêu. Cuộc đời này có biết bao ngã rẽ và thăng trầm, nhưng chỉ cần sau những chặng đường mỏi mệt, ta vẫn có một nơi chốn để trở về, có một ngọn lửa nhỏ chờ đợi ta sưởi ấm, thì đó đã là một niềm hạnh phúc vô biên.',
            '',
            '> "Hạnh phúc không nằm ở những điều xa xôi rực rỡ, mà ẩn hiện trong chính khoảnh khắc ta cảm nhận được hơi ấm của sự bình yên ngay dưới mái nhà mình."'
        ]
    },
    {
        'id': 'kyniem_4',
        'num': 4,
        'x': 75.0,
        'y': 36.0,
        'tag': 'Kỷ Niệm · Vivi',
        'title': 'Lời Nhắn Nhủ Thời Gian',
        'shortTitle': 'Lời Nhắn Nhủ Thời Gian',
        'date': 'Hiện tại & Tương lai',
        'author': 'Vivi',
        'location': 'Khoảng trời hoài niệm',
        'weather': 'Bình yên vô tận',
        'body': [
            'Đứng dưới bầu trời đêm ngàn sao lấp lánh, tôi thường tự hỏi: Thời gian rốt cuộc là một dòng chảy vô tình hay là một người bạn đồng hành lặng lẽ? Nó cuốn trôi đi những tháng năm thanh xuân, làm phai mờ những kỷ niệm tưởng như không thể quên, nhưng đồng thời cũng lắng đọng lại những gì chân thành và sâu sắc nhất.',
            '',
            'Gửi tôi của những ngày sau, mong bạn đừng bao giờ đánh mất sự nhạy cảm và lòng trắc ẩn trong tâm hồn. Dẫu cuộc sống có thử thách bạn bằng những giông bão hay những lúc hoang mang lạc lối, hãy nhớ rằng ngay cả những đêm tối tăm nhất cũng là lúc các vì tinh tú tỏa sáng rực rỡ nhất.',
            '',
            'Mỗi bài thơ tôi viết, mỗi chặng đường tôi đi qua, mỗi kỷ niệm được khắc ghi trong cuốn nhật ký này đều là một mảnh ghép tạo nên con người tôi hôm nay. Hãy luôn trân trọng từng khoảnh khắc được sống, được yêu và được ước mơ.',
            '',
            '> "Đừng tiếc nuối những gì thời gian đã mang đi, hãy biết ơn vì nó đã để lại cho ta một trái tim từng rung động, từng yêu thương và tràn đầy ký ức tươi đẹp."'
        ]
    }
]

all_constellations.append({
    'id': 'ky-niem',
    'name': 'Chòm sao Kỷ Niệm',
    'subtitle': 'góc ký ức đọng lại',
    'category': 'kyniem',
    'bgImg': 'assets/img/galaxy_2.webp',
    'stars': kyniem_stars
})

categories = [
    {
        'id': 'mongmo',
        'name': 'Mộng Mơ & Zodiac',
        'shortName': 'Mộng Mơ',
        'icon': '✦',
        'galaxies': [c for c in all_constellations if c['category'] == 'mongmo']
    },
    {
        'id': 'viendu',
        'name': 'Hành Trình Viễn Du',
        'shortName': 'Viễn Du',
        'icon': '⟡',
        'galaxies': [c for c in all_constellations if c['category'] == 'viendu']
    },
    {
        'id': 'kyniem',
        'name': 'Kỷ Niệm',
        'shortName': 'Kỷ Niệm',
        'icon': '✧',
        'galaxies': [c for c in all_constellations if c['category'] == 'kyniem']
    }
]

data_out = {
    'categories': categories,
    'constellations': all_constellations
}

with open('data/poems.json', 'w', encoding='utf-8') as f:
    json.dump(data_out, f, ensure_ascii=False, indent=2)

print('Generated data/poems.json successfully!')
mm_count = len(categories[0]['galaxies'])
vd_count = len(categories[1]['galaxies'])
kn_count = len(categories[2]['galaxies'])
mm_poems = sum(len(c['stars']) for c in categories[0]['galaxies'])
print(f'Mộng Mơ constellations: {mm_count}')
print(f'Viễn Du constellations: {vd_count}')
print(f'Kỷ Niệm constellations: {kn_count}')
print(f'Total poems in Mộng Mơ: {mm_poems}')
