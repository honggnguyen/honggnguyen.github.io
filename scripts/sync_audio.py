#!/usr/bin/env python3
"""
Script tự động quét thư mục assets/audio/ và cập nhật data/playlist.json.
Cách dùng:
    python3 scripts/sync_audio.py
hoặc bạn chỉ cần thả file .mp3 vào assets/audio/ rồi chạy lệnh trên!
"""
import os
import glob
import json

AUDIO_DIR = 'assets/audio'
OUTPUT_JSON = 'data/playlist.json'

DEFAULT_MOODS = {
    'city of stars': ('City Of Stars', 'La La Land · Romantic Soundtrack'),
    'come back to me': ('Come Back To Me', 'Deep Acoustic · Trầm lắng'),
    'comptine': ('Comptine d\'un Autre Été', 'Yann Tiersen · Piano lãng mạn'),
    'không sao đâu': ('To All of You (Không sao đâu)', 'Mingginyu · Lofi Healing'),
    'la valse': ('La Valse d\'Amélie', 'Yann Tiersen · Piano Waltz'),
    'lullaby': ('Lullaby In The Peaceful Light', 'Khúc hát ru · Bình yên'),
    'philip glass': ('Music from The Hours', 'Philip Glass · Dòng chảy thời gian'),
    'singin': ('Singin\' in the Rain', 'Gene Kelly · Vũ điệu dưới mưa'),
    'bird song': ('The Bird Song', 'Acoustic · Bay bổng tự do'),
    'soldier': ('Soldier, Poet, King', 'The Oh Hellos · Folk Ballad'),
    'poets': ('Dead Poets Society Playlist', 'Hoài niệm · Thơ ca & Lãng mạn'),
    'torches': ('Torches', 'Ánh đuốc ấm áp · Hy vọng'),
    'van gogh': ('Vincent (Starry Night)', 'Giai điệu Van Gogh · Dịu êm'),
    'suffering': ('Suffering & Healing', 'Không gian tĩnh lặng · Chiêm nghiệm')
}

AMBIENT_GENERATORS = [
    { 'id': 'amb_1', 'title': 'Nguyện Cầu Dưới Sao', 'mood': 'Ambient · Êm dịu' },
    { 'id': 'amb_2', 'title': 'Đêm Thung Lũng Mù Sương', 'mood': 'Acoustic · Bình yên' },
    { 'id': 'amb_3', 'title': 'Gió Nguyện Cầu', 'mood': 'Chuông gió · Bay bổng' },
    { 'id': 'amb_4', 'title': 'Ánh Trăng Mặt Hồ', 'mood': 'Lullaby · Dịu ngọt' },
    { 'id': 'amb_5', 'title': 'Bình Minh Tinh Cầu', 'mood': 'Hào quang · Tươi sáng' },
    { 'id': 'amb_6', 'title': 'Khói Thông Đà Lạt', 'mood': 'Cozy Lofi · Trầm ấm' },
    { 'id': 'amb_7', 'title': 'Dải Ngân Hà Vô Tận', 'mood': 'Cosmic · Vũ trụ sâu' },
    { 'id': 'amb_8', 'title': 'Giấc Mơ Đại Dương', 'mood': 'Harp · Sóng vỗ' }
]

def main():
    files = sorted(glob.glob(os.path.join(AUDIO_DIR, '*.mp3')))
    tracks = []
    
    for i, path in enumerate(files):
        base = os.path.basename(path)
        raw_name = os.path.splitext(base)[0]
        
        # Format title
        title = raw_name
        mood = 'Nhạc tuyển chọn · Giai điệu thư giãn'
        
        for key, (t, m) in DEFAULT_MOODS.items():
            if key in base.lower():
                title = t
                mood = m
                break
                
        # Clean title if generic
        if title == raw_name:
            # Clean common artifacts like (Official Music Video), [Lyrics], etc.
            clean_title = raw_name.replace('_', ' ').replace('-', ' ')
            clean_title = ' '.join(clean_title.split())
            title = clean_title
            
        rel_path = path.replace('\\', '/')
        tracks.append({
            'id': f'custom_{i+1}',
            'title': title,
            'mood': mood,
            'src': rel_path
        })
        
    all_tracks = tracks + AMBIENT_GENERATORS
    
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(all_tracks, f, ensure_ascii=False, indent=2)
        
    print(f'✅ Đã đồng bộ {len(tracks)} bài nhạc từ {AUDIO_DIR} vào {OUTPUT_JSON}!')

if __name__ == '__main__':
    main()
