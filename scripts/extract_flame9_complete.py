import os
import numpy as np
from PIL import Image
from scipy import signal, ndimage as ndi

BASE_DIR = '/home/tri/Code/Poem'
SRC_IMAGE = os.path.join(BASE_DIR, 'Fig/Flame/Flame9.png')
FRAMES_DIR = os.path.join(BASE_DIR, 'Fig/Flame/frames')
ALIGNED_DIR = os.path.join(BASE_DIR, 'Fig/Flame/frames_aligned')
WEB_DIR = os.path.join(BASE_DIR, 'assets/img/calcifer')

os.makedirs(FRAMES_DIR, exist_ok=True)
os.makedirs(ALIGNED_DIR, exist_ok=True)
os.makedirs(WEB_DIR, exist_ok=True)

GLOW = np.array([255, 120, 40], np.float32)
CANVAS_W, CANVAS_H = 621, 770

# Load reference template from Flame4_r1c1.png
ref_im = np.array(Image.open(f'{FRAMES_DIR}/Flame4_r1c1.png'))
ref_log = ((ref_im[:, :, 3] == 255) & (ref_im[:, :, 0] < 160) & (ref_im[:, :, 1] < 100))[370:430, 100:380].astype(float)
ref_log -= ref_log.mean()

y_splits = [0, 448, 847, 1240, 1625, 2048]
x_splits = [0, 512, 1024, 1536, 2048]

im_src = Image.open(SRC_IMAGE).convert('RGB')
arr_src = np.array(im_src)

def clean_cell(cell, r_idx, c_idx):
    p = cell.astype(np.float32)
    mx, mn = p.max(2), p.min(2)
    sat = (mx - mn) / np.maximum(mx, 1)

    # Sprite detection:
    is_flame = (sat > 0.58) & (p[:, :, 0] > 170)
    is_dark = (p.mean(2) < 95) & (p[:, :, 0] >= p[:, :, 2] - 5)
    is_wood = (p[:, :, 0] > p[:, :, 2] + 16) & (p[:, :, 0] > p[:, :, 1] - 10) & (p.mean(2) < 150) & (sat > 0.20)
    solid = is_flame | is_dark | is_wood
    solid = ndi.binary_closing(solid, iterations=3)
    solid = ndi.binary_fill_holes(solid)

    # Exclude checkerboard:
    is_checker = ((mx - mn) < 22) & (p.mean(2) > 120)
    solid &= ~is_checker

    # Keep main sprite and nearby components (arms, sparks)
    lab, n = ndi.label(solid)
    if n == 0:
        return np.zeros(cell.shape[:2] + (4,), np.uint8), (0, 0)
    sizes = ndi.sum(solid, lab, range(1, n + 1))
    main = int(np.argmax(sizes)) + 1
    ys, xs = np.where(lab == main)
    y0, y1 = max(0, ys.min() - 40), min(cell.shape[0], ys.max() + 40)
    x0, x1 = max(0, xs.min() - 40), min(cell.shape[1], xs.max() + 40)
    keep = (lab == main)
    for i in range(1, n + 1):
        if i == main: continue
        yy, xx = np.where(lab == i)
        # Drop text numbers in top left
        if yy.min() < 70 and xx.min() < 70: continue
        # Drop bottom right watermark in cell 20
        if yy.max() > cell.shape[0] - 65 and xx.max() > cell.shape[1] - 65 and (p[yy, xx].mean() > 200): continue
        if yy.min() >= y0 and yy.max() <= y1 and xx.min() >= x0 and xx.max() <= x1:
            keep |= (lab == i)
    solid &= keep

    # Extra cleanup
    solid[:70, :70] = False
    if r_idx == 4 and c_idx == 3:
        solid[-85:, -85:] = False

    # Find log match against ref_log for exact alignment
    cand_sub = ((solid) & (p[:, :, 0] < 160) & (p[:, :, 1] < 100))
    ys_solid = np.where(solid)[0]
    low_y = ys_solid.max()
    sub_crop = cand_sub[max(0, low_y-65):low_y+15, 120:420].astype(float)
    sub_crop -= sub_crop.mean()
    corr = signal.correlate2d(sub_crop, ref_log, mode='valid')
    by, bx = np.unravel_index(np.argmax(corr), corr.shape)
    match_y = max(0, low_y-65) + by
    match_x = 120 + bx

    # Trim bottom coal mound to match standard frame log line (match_y + 57)
    y_m = np.ogrid[:cell.shape[0], :cell.shape[1]][0]
    solid &= ~(y_m > match_y + 57)

    # Soft golden aura
    body = ndi.binary_fill_holes(ndi.binary_closing(solid & (sat > 0.5), iterations=5))
    glow = ndi.gaussian_filter(body.astype(np.float32), 14)
    glow = np.clip(glow * 1.5 - 0.12, 0, 1) * 0.50

    out = np.zeros(cell.shape[:2] + (4,), np.float32)
    out[:, :, :3] = GLOW
    out[:, :, 3] = glow * 255
    out[solid, :3] = p[solid]
    out[solid, 3] = 255
    out[match_y + 59:, :, 3] = 0

    return out.astype(np.uint8), (match_x, match_y)

extracted_frames = []
for r in range(5):
    for c in range(4):
        idx = r * 4 + c + 1
        cell = arr_src[y_splits[r]:y_splits[r+1], x_splits[c]:x_splits[c+1]]
        clean, (mx, my) = clean_cell(cell, r, c)

        fn_frame = f'Flame9_r{r+1}c{c+1}.png'
        Image.fromarray(clean, 'RGBA').save(os.path.join(FRAMES_DIR, fn_frame))

        paste_x = 253 - mx
        paste_y = 570 - my

        canvas = Image.new('RGBA', (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
        canvas.alpha_composite(Image.fromarray(clean, 'RGBA'), (paste_x, paste_y))

        aligned_fn = f'frame_{120 + idx:03d}.png'
        canvas.save(os.path.join(ALIGNED_DIR, aligned_fn))

        eat_webp = f'calcifer_eat_{idx:02d}.webp'
        canvas.save(os.path.join(WEB_DIR, eat_webp), 'WEBP', lossless=True)
        canvas.save(os.path.join(WEB_DIR, f'frame_{120 + idx:03d}.webp'), 'WEBP', lossless=True)

        extracted_frames.append(canvas)
        print(f'Processed frame {idx:02d}/20 -> {eat_webp} (offset: {paste_x}, {paste_y})')

anim_path = os.path.join(BASE_DIR, 'scripts/calcifer_eat_anim.webp')
extracted_frames[0].save(
    anim_path,
    save_all=True,
    append_images=extracted_frames[1:],
    duration=[200] * 20,
    loop=0
)
print('Successfully generated all 20 frames and animated preview!')
