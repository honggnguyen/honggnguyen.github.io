"""Cut every flame cell out of Fig/Flame/Flame*.png (flame + logs + glow only, no barrier).
The fake checkerboard baked into the sheets is removed; the aura is rebuilt as a soft glow."""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

SHEETS = [(f'Flame{i}.png', 4, 5) for i in [1, 4, 5, 6, 7, 8]]  # 4 columns x 5 rows each
OUT_DIR = 'Fig/Flame/frames'
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

    # soft aura from the sprite silhouette
    body = ndi.binary_fill_holes(ndi.binary_closing(solid & (sat > 0.75), iterations=6))
    glow = ndi.gaussian_filter(body.astype(np.float32), 16)
    glow = np.clip(glow * 1.5 - 0.12, 0, 1) * 0.55
    out = np.zeros(rgb.shape[:2] + (4,), np.float32)
    out[:, :, :3] = GLOW
    out[:, :, 3] = glow * 255
    out[solid, :3] = p[solid]
    out[solid, 3] = 255
    return out.astype(np.uint8), solid


from remove_gemini_logo import remove_logo


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for fn, cols, rows in SHEETS:
        sh = Image.open(f'Fig/Flame/{fn}').convert('RGB')
        cw, ch = sh.width // cols, sh.height // rows
        for r in range(rows):
            for c in range(cols):
                cell = np.array(sh.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch)))
                if r == 4 and c == 3:
                    cell = remove_logo(cell)
                out, solid = clean_cell(cell)
                Image.fromarray(out, 'RGBA').save(f'{OUT_DIR}/{fn[:-4]}_r{r + 1}c{c + 1}.png')
        print('done', fn)


if __name__ == '__main__':
    main()
