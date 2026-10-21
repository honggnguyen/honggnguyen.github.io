"""
Align all 120 flame frames from Fig/Flame/frames, sort natural flame frames first,
synchronize log/base positions using 2D correlation, and export:
1. Fig/Flame/frames_aligned/frame_001.png .. frame_120.png
2. Fig/Flame/frames_aligned/manifest.json (metadata, categories, tags)
3. assets/img/calcifer/ (for the website: transparent WebP, clean logs, zero barrier)
"""
import os, json, glob
import numpy as np
from PIL import Image
from scipy import signal

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(BASE_DIR, 'Fig/Flame/frames')
OUT_DIR = os.path.join(BASE_DIR, 'Fig/Flame/frames_aligned')
WEB_DIR = os.path.join(BASE_DIR, 'assets/img/calcifer')

# 1. Define category ordering: plain flame frames FIRST!
PLAIN_FLAME_FILES = [
    # Big roaring flame cycle 1 (Flame4)
    'Flame4_r1c1.png', 'Flame4_r1c2.png', 'Flame4_r1c3.png', 'Flame4_r1c4.png', 'Flame4_r2c1.png',
    # Big roaring flame cycle 2 (Flame7)
    'Flame7_r1c1.png', 'Flame7_r1c2.png', 'Flame7_r1c3.png', 'Flame7_r1c4.png', 'Flame7_r2c1.png',
    # Calm/medium flame cycles (Flame4 & Flame7)
    'Flame4_r2c2.png', 'Flame4_r2c3.png', 'Flame4_r2c4.png',
    'Flame7_r2c2.png', 'Flame7_r2c3.png', 'Flame7_r2c4.png',
    # Burst / resting flames (Flame5)
    'Flame5_r2c1.png', 'Flame5_r2c2.png', 'Flame5_r2c4.png',
]

EXPRESSION_GROUPS = [
    ('sleep', [
        'Flame1_r1c1.png', 'Flame1_r1c2.png', 'Flame1_r1c3.png', 'Flame1_r1c4.png', 'Flame8_r5c4.png'
    ]),
    ('curious', [
        'Flame1_r3c1.png', 'Flame1_r3c2.png', 'Flame1_r3c3.png', 'Flame1_r3c4.png'
    ]),
    ('smile_wink', [
        'Flame1_r2c1.png', 'Flame1_r2c2.png', 'Flame1_r2c3.png', 'Flame1_r2c4.png',
        'Flame1_r4c1.png', 'Flame1_r4c2.png', 'Flame1_r4c3.png', 'Flame1_r4c4.png',
        'Flame1_r5c1.png', 'Flame1_r5c2.png', 'Flame1_r5c3.png', 'Flame1_r5c4.png'
    ]),
    ('talk', [
        'Flame5_r3c1.png', 'Flame5_r3c2.png', 'Flame5_r3c3.png', 'Flame5_r3c4.png',
        'Flame6_r1c1.png', 'Flame6_r1c2.png', 'Flame6_r1c3.png', 'Flame6_r1c4.png',
        'Flame6_r2c1.png', 'Flame6_r2c2.png', 'Flame6_r2c3.png', 'Flame6_r2c4.png'
    ]),
    ('roaring_cheer', [
        'Flame5_r1c1.png', 'Flame5_r1c2.png', 'Flame5_r1c3.png', 'Flame5_r1c4.png',
        'Flame6_r4c1.png', 'Flame6_r4c2.png', 'Flame6_r4c3.png', 'Flame6_r4c4.png'
    ]),
    ('love_infatuated', [
        'Flame8_r1c1.png', 'Flame8_r1c2.png', 'Flame8_r1c3.png', 'Flame8_r1c4.png'
    ]),
    ('angry_grumpy', [
        'Flame8_r2c1.png', 'Flame8_r2c2.png', 'Flame8_r2c3.png', 'Flame8_r2c4.png'
    ]),
    ('smirk_cunning', [
        'Flame8_r3c1.png', 'Flame8_r3c2.png', 'Flame8_r3c3.png', 'Flame8_r3c4.png'
    ]),
    ('sweat_worried', [
        'Flame8_r4c1.png', 'Flame8_r4c2.png', 'Flame8_r4c3.png', 'Flame8_r4c4.png'
    ]),
    ('surprised_shock', [
        'Flame6_r3c1.png', 'Flame6_r3c2.png', 'Flame6_r3c3.png', 'Flame6_r3c4.png'
    ]),
    ('crying_tears', [
        'Flame5_r4c1.png', 'Flame5_r4c2.png', 'Flame5_r4c3.png', 'Flame5_r4c4.png'
    ]),
    ('celebrate_sparkle', [
        'Flame4_r3c1.png', 'Flame4_r3c2.png', 'Flame4_r3c3.png', 'Flame4_r3c4.png',
        'Flame4_r4c1.png', 'Flame4_r4c2.png', 'Flame4_r4c3.png', 'Flame4_r4c4.png',
        'Flame4_r5c1.png', 'Flame4_r5c2.png', 'Flame4_r5c3.png', 'Flame4_r5c4.png',
        'Flame7_r3c1.png', 'Flame7_r3c2.png', 'Flame7_r3c3.png', 'Flame7_r3c4.png',
        'Flame7_r4c1.png', 'Flame7_r4c2.png', 'Flame7_r4c3.png', 'Flame7_r4c4.png',
        'Flame7_r5c1.png', 'Flame7_r5c2.png', 'Flame7_r5c3.png', 'Flame7_r5c4.png',
        'Flame5_r5c1.png', 'Flame5_r5c2.png',
        'Flame6_r5c1.png', 'Flame6_r5c2.png', 'Flame6_r5c3.png', 'Flame6_r5c4.png',
        'Flame8_r5c1.png', 'Flame8_r5c2.png'
    ]),
    ('tiny_ember', [
        'Flame5_r5c3.png', 'Flame5_r5c4.png', 'Flame8_r5c3.png'
    ])
]


def build_ordered_list():
    all_files = sorted([os.path.basename(p) for p in glob.glob(f'{SRC_DIR}/*.png')])
    ordered = []
    seen = set()

    # 1. Plain flame frames first
    for f in PLAIN_FLAME_FILES:
        if f in all_files and f not in seen:
            ordered.append((f, 'plain_flame', 'Ngọn lửa thường tự nhiên'))
            seen.add(f)

    # 2. Expression groups
    for cat, flist in EXPRESSION_GROUPS:
        for f in flist:
            if f in all_files and f not in seen:
                ordered.append((f, cat, f'Biểu cảm {cat}'))
                seen.add(f)

    # 3. Any remaining files
    for f in all_files:
        if f not in seen:
            ordered.append((f, 'other', 'Biểu cảm bổ sung'))
            seen.add(f)

    assert len(ordered) == len(all_files), f'Expected {len(all_files)}, got {len(ordered)}'
    return ordered


def compute_offsets(all_files):
    ref_im = np.array(Image.open(f'{SRC_DIR}/Flame4_r1c1.png'))
    ref_log = ((ref_im[:, :, 3] == 255) & (ref_im[:, :, 0] < 160) & (ref_im[:, :, 1] < 100))[370:430, 100:380].astype(float)
    ref_log -= ref_log.mean()

    offsets = {}
    for f in all_files:
        im = np.array(Image.open(f'{SRC_DIR}/{f}'))
        cand_log = ((im[:, :, 3] == 255) & (im[:, :, 0] < 160) & (im[:, :, 1] < 100))[370-15:430+15, 100-30:380+30].astype(float)
        cand_log -= cand_log.mean()
        corr = signal.correlate2d(cand_log, ref_log, mode='valid')
        best_y, best_x = np.unravel_index(np.argmax(corr), corr.shape)
        dy = best_y - 15
        dx = best_x - 30
        offsets[f] = (int(dx), int(dy))
    return offsets


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs(WEB_DIR, exist_ok=True)
    ordered = build_ordered_list()
    all_files = [x[0] for x in ordered]
    offsets = compute_offsets(all_files)

    # Standardized canvas dimensions:
    # 512 x 512 gives generous padding without any flame clipping
    CANVAS_W, CANVAS_H = 512, 512
    # Place ref_im so its log sits at (256, 445)
    # ref_im is 464x460. Log anchor is at x~240, y~425 in ref_im
    BASE_X = CANVAS_W // 2 - 240
    BASE_Y = 445 - 425

    manifest = []
    print(f'Aligning and exporting {len(ordered)} frames...')

    for idx, (src_name, category, desc) in enumerate(ordered, 1):
        frame_id = f'frame_{idx:03d}'
        src_path = f'{SRC_DIR}/{src_name}'
        im = Image.open(src_path).convert('RGBA')

        dx, dy = offsets[src_name]
        # Shift each frame by (-dx, -dy) to match ref_im exactly
        paste_x = BASE_X - dx
        paste_y = BASE_Y - dy

        canvas = Image.new('RGBA', (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
        canvas.paste(im, (paste_x, paste_y), im)

        # 1. Save PNG to Fig/Flame/frames_aligned/
        out_png = f'{OUT_DIR}/{frame_id}.png'
        canvas.save(out_png, 'PNG')

        manifest.append({
            'index': idx,
            'id': frame_id,
            'source_file': src_name,
            'category': category,
            'description': desc,
            'offset_dx': dx,
            'offset_dy': dy,
            'canvas_size': [CANVAS_W, CANVAS_H]
        })

    with open(f'{OUT_DIR}/manifest.json', 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f'Successfully generated {len(manifest)} aligned frames in {OUT_DIR}/')
    print('Plain flame frames count:', sum(1 for m in manifest if m['category'] == 'plain_flame'))

    # Export WebP frames to assets/img/calcifer/
    os.makedirs(WEB_DIR, exist_ok=True)
    target_x, target_y = 137, 180
    FIREPLACE_W, FIREPLACE_H = 621, 770

    for item in manifest:
        fid = item['id']
        png_path = f'{OUT_DIR}/{fid}.png'
        im = Image.open(png_path).convert('RGBA')
        canvas = Image.new('RGBA', (FIREPLACE_W, FIREPLACE_H), (0, 0, 0, 0))
        canvas.alpha_composite(im, (target_x, target_y))
        canvas.save(f'{WEB_DIR}/{fid}.webp', 'WEBP', lossless=True)

    # 19 idle frames
    for i in range(1, 20):
        fid = f'frame_{i:03d}'
        im = Image.open(f'{WEB_DIR}/{fid}.webp')
        im.save(f'{WEB_DIR}/flame_idle_{i}.webp', 'WEBP', lossless=True)

    # Dialogue sprite mapping
    mapping = {
        'calcifer_smile_1.webp': 'frame_033.webp',
        'calcifer_smile_2.webp': 'frame_029.webp',
        'calcifer_smile_3.webp': 'frame_037.webp',
        'calcifer_smile_4.webp': 'frame_034.webp',
        'calcifer_smile_5.webp': 'frame_035.webp',
        'calcifer_smile_6.webp': 'frame_036.webp',
        'calcifer_smile_7.webp': 'frame_085.webp',
        'calcifer_smile_8.webp': 'frame_025.webp',
        'calcifer_talk_1.webp': 'frame_020.webp',
        'calcifer_talk_2.webp': 'frame_077.webp',
        'calcifer_talk_3.webp': 'frame_045.webp',
        'calcifer_talk_4.webp': 'frame_049.webp',
        'calcifer_talk_5.webp': 'frame_041.webp',
        'calcifer_talk_6.webp': 'frame_053.webp',
        'calcifer_talk_7.webp': 'frame_081.webp',
        'calcifer_talk_8.webp': 'frame_118.webp',
    }
    import shutil
    for dst, src in mapping.items():
        shutil.copyfile(f'{WEB_DIR}/{src}', f'{WEB_DIR}/{dst}')

    print(f'Successfully exported WebP frames to {WEB_DIR}/')


if __name__ == '__main__':
    main()

