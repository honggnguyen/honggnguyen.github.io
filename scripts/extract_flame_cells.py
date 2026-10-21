"""Cut every flame cell out of Fig/Flame/Flame*.png (flame + logs + glow only, no barrier).
The fake checkerboard baked into the sheets is removed; the aura is rebuilt as a soft glow."""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHEETS = [(f'Flame{i}.png', 4, 5) for i in [1, 4, 5, 6, 7, 8]]  # 4 columns x 5 rows each
OUT_DIR = os.path.join(BASE_DIR, 'Fig/Flame/frames')
GLOW = np.array([255, 120, 40], np.float32)


def clean_cell(rgb):
    p = rgb.astype(np.float32)
    mx, mn = p.max(2), p.min(2)
    pure = ((mx - mn) <= 6) & (p.mean(2) > 140)
    sat = (mx - mn) / np.maximum(mx, 1)
    solid = (sat > 0.75) & ~pure
    solid = ndi.binary_opening(solid, iterations=1)
    solid = ndi.binary_fill_holes(ndi.binary_closing(solid, iterations=3))
    # keep the main sprite + pieces close to it (sparks, ?, zZ); drops cell numbers / watermark
    lab, n = ndi.label(ndi.binary_dilation(solid, iterations=3))
    if n == 0:
        return np.zeros(rgb.shape[:2] + (4,), np.uint8), solid
    sizes = ndi.sum(solid, lab, range(1, n + 1))
    main = int(np.argmax(sizes)) + 1
    ys, xs = np.where(lab == main)
    y0, y1, x0, x1 = ys.min() - 70, ys.max() + 70, xs.min() - 70, xs.max() + 70
    keep = lab == main
    for i in range(1, n + 1):
        if i == main:
            continue
        yy, xx = np.where(lab == i)
        if yy.min() >= y0 and yy.max() <= y1 and xx.min() >= x0 and xx.max() <= x1 and len(yy) > 10:
            keep |= lab == i
    solid &= ndi.binary_dilation(keep, iterations=3)

    # Remove barrier feet and bottom pink/purple artifacts
    y_m, x_m = np.ogrid[:rgb.shape[0], :rgb.shape[1]]
    is_barrier_foot = (
        (y_m >= 412) |
        ((y_m >= 400) & (x_m >= 280) & ((p[:, :, 2] >= 45) | (p[:, :, 1] >= 70))) |
        ((y_m >= 404) & (x_m >= 355)) |
        ((y_m >= 408) & (x_m <= 115))
    )
    solid &= ~is_barrier_foot

    # soft aura from the sprite silhouette
    body = ndi.binary_fill_holes(ndi.binary_closing(solid & (sat > 0.75), iterations=6))
    glow = ndi.gaussian_filter(body.astype(np.float32), 16)
    glow = np.clip(glow * 1.5 - 0.12, 0, 1) * 0.55
    out = np.zeros(rgb.shape[:2] + (4,), np.float32)
    out[:, :, :3] = GLOW
    out[:, :, 3] = glow * 255
    out[solid, :3] = p[solid]
    out[solid, 3] = 255
    out[415:, :, 3] = 0  # clear any aura below log line
    return out.astype(np.uint8), solid


def fix_r5c4(cell, c3_cell, sheet_idx):
    cw, ch = cell.shape[1], cell.shape[0]
    c3_aligned = np.zeros_like(c3_cell)
    c3_aligned[0:ch-1, 2:cw] = c3_cell[1:ch, 0:cw-2]

    fixed = cell.copy()

    # Remove face star on cheer frames (Flame1, Flame4, Flame7)
    if sheet_idx in [1, 4, 7]:
        y_m, x_m = np.ogrid[:ch, :cw]
        in_face = (y_m >= 135) & (y_m <= 270) & (x_m >= 145) & (x_m <= 280)
        raw_star = in_face & (cell[:, :, 2] > 40)
        star_mask = ndi.binary_dilation(raw_star, iterations=3)

        for y in range(ch):
            for x in range(cw):
                if star_mask[y, x]:
                    if y >= 172 and x >= 182:
                        fixed[y, x] = [254, 192, 49]
                    else:
                        fixed[y, x] = c3_aligned[y, x]

        # Paste mirrored right winking eye
        axis = 254.5
        for y in range(230, 248):
            for x in range(272, 306):
                p = cell[y, x]
                if p[0] < 150 and p[1] < 50:
                    mx = int(np.round(2 * axis - x))
                    fixed[y, mx] = p

    # Restore bottom-right log from c3_aligned across all sheets
    y_m, x_m = np.ogrid[:ch, :cw]
    log_mask = (y_m >= 300) & (x_m >= 285)
    fixed[log_mask] = c3_aligned[log_mask]
    return fixed


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for fn, cols, rows in SHEETS:
        sheet_idx = int(fn.replace('Flame', '').replace('.png', ''))
        sh = Image.open(os.path.join(BASE_DIR, 'Fig/Flame', fn)).convert('RGB')
        cw, ch = sh.width // cols, sh.height // rows
        c3_cell = np.array(sh.crop((2 * cw, 4 * ch, 3 * cw, 5 * ch)))
        for r in range(rows):
            for c in range(cols):
                cell = np.array(sh.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch)))
                if r == 4 and c == 3:
                    cell = fix_r5c4(cell, c3_cell, sheet_idx)
                out, solid = clean_cell(cell)
                # clear top-left corner specks from sheet numbers
                out[:80, :80] = 0
                Image.fromarray(out, 'RGBA').save(f'{OUT_DIR}/{fn[:-4]}_r{r + 1}c{c + 1}.png')
        print('done', fn)


if __name__ == '__main__':
    main()
