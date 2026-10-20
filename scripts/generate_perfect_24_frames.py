import os
import numpy as np
from PIL import Image, ImageFilter

# Cavity-local geometry shared by mask + seam search
CX, CY, RX, RY = 393.5, 415.0, 162.5, 122.5
BX, BY = 2131, 649            # canvas origin inside the full background image
RW0, RW1 = 533, 576           # right-wall strip copied from the gold frame (talk_5)
SEAM_BAND = 4.0               # cross-dissolve width (px) around the seams

def make_cavity_mask(width=621, height=770, yb=None, xr=None):
    """Cavity alpha mask.

    yb: per-column bottom seam Y (len=width) and xr: per-row right seam X (len=height).
    Both come from compute_seams(); when omitted the legacy straight cuts are used.
    """
    mask = np.zeros((height, width), dtype=np.float32)
    Y, X = np.ogrid[:height, :width]
    
    # Exact fireplace cavity opening geometry:
    # Left groove: X = 231.0
    # Right groove: X = 556.0
    # Center X: (231 + 556) / 2 = 393.5
    # Radius X: (556 - 231) / 2 = 162.5
    # Center Y: 415.0
    # Radius Y: 122.5 (apex at cy - ry = 292.5, strictly below stone arch rim)
    cx, cy, rx, ry = CX, CY, RX, RY
    
    top_ellipse = ((X - cx) / rx)**2 + ((Y - cy) / ry)**2 <= 1.0
    in_arch = top_ellipse & (Y <= cy) & (Y >= (cy - ry))
    # Lower cavity is cut generously on the right/bottom; the seams below trim it.
    in_lower_cavity = (X >= (cx - rx)) & (X <= RW1 - 1) & (Y > cy) & (Y <= 640)
    
    mask[in_arch | in_lower_cavity] = 1.0
    
    # 1.2px Gaussian feathering along natural dark groove
    mask_img = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    mask_arr = np.array(mask_img, dtype=np.float32) / 255.0
    
    Yg, Xg = np.mgrid[:height, :width].astype(np.float32)
    if yb is None:
        yb = np.full(width, 583.0, dtype=np.float32)
    if xr is None:
        xr = np.full(height, cx + rx, dtype=np.float32)
    
    # Bottom seam: dissolve across SEAM_BAND px centred on the minimum-contrast path
    soft_bottom = np.clip((np.asarray(yb, np.float32)[None, :] + 0.5 - Yg) / SEAM_BAND + 0.5, 0.0, 1.0)
    mask_arr *= soft_bottom
    
    # Right seam (below the arch springline only; the arch itself keeps the ellipse edge)
    soft_right = np.clip((np.asarray(xr, np.float32)[:, None] + 0.5 - Xg) / SEAM_BAND + 0.5, 0.0, 1.0)
    soft_right[Yg <= cy] = 1.0
    mask_arr *= soft_right
    
    return mask_arr

def _dp_seam(cost, maxstep=1):
    """Min-cost 1-D path through cost[L, K]; path index changes by <= maxstep per step."""
    L, K = cost.shape
    acc = cost.astype(np.float64).copy()
    back = np.zeros((L, K), dtype=np.int32)
    for l in range(1, L):
        prev = acc[l - 1]
        best = np.full(K, np.inf)
        arg = np.zeros(K, dtype=np.int32)
        for d in range(-maxstep, maxstep + 1):
            shifted = np.full(K, np.inf)
            if d < 0:
                shifted[-d:] = prev[:K + d]
            elif d > 0:
                shifted[:K - d] = prev[d:]
            else:
                shifted = prev.copy()
            better = shifted < best
            best = np.where(better, shifted, best)
            arg = np.where(better, np.arange(K) + d, arg)
        acc[l] += best
        back[l] = arg
    k = int(np.argmin(acc[-1]))
    path = [k]
    for l in range(L - 1, 0, -1):
        k = int(back[l, k])
        path.append(k)
    return np.array(path[::-1]), float(acc[-1].min() / L)

def compute_seams(canvases, bg_paths, width=621, height=770):
    """Find bottom/right cut lines where every frame is closest to the background.

    Cost = max over all frames and both backgrounds of the per-pixel RGB difference, so a
    single static seam is valid for the whole animation (no per-frame jitter).
    """
    stack = np.array([c[:, :, :3].astype(np.float32) for c in canvases])
    cost = np.zeros((height, width), dtype=np.float32)
    for p in bg_paths:
        bg = np.array(Image.open(p).convert('RGB').crop((BX, BY, BX + width, BY + height))).astype(np.float32)
        cost = np.maximum(cost, np.abs(stack - bg[None]).mean(3).max(0))
    # smooth a little so the path avoids isolated lucky pixels
    cost = np.array(Image.fromarray(np.clip(cost, 0, 255).astype(np.uint8))
                    .filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32)
    
    # Bottom: Calcifer's body never goes below the log line, so search only Y 578..610
    y0, y1 = 578, 611
    xs0, xs1 = int(CX - RX), RW1
    path_b, cb = _dp_seam(cost[y0:y1, xs0:xs1].T)
    yb = np.full(width, float(y0 + int(np.median(path_b))), dtype=np.float32)
    yb[xs0:xs1] = path_b + y0
    
    # Right: rows below the springline, X 546..575 (anchored near the groove at X=556)
    r0, r1 = int(CY) + 5, 566
    x0, x1 = 546, RW1
    pen = 0.15 * np.abs(np.arange(x0, x1) - 556)[None, :]
    path_r, cr = _dp_seam(cost[r0:r1, x0:x1] + pen)
    xr = np.full(height, float(CX + RX), dtype=np.float32)
    xr[r0:r1] = path_r + x0
    # rows 566.. keep the last value so the corner stays closed
    xr[r1:] = xr[r1 - 1]
    # blend into the arch springline (rows CY..r0)
    xr[int(CY):r0] = np.linspace(CX + RX, xr[r0], r0 - int(CY))
    # seams are integers; light smoothing removes 1px stair-steps
    k = np.ones(5) / 5.0
    xr = np.convolve(np.pad(xr, 2, mode='edge'), k, mode='valid').astype(np.float32)
    yb = np.convolve(np.pad(yb, 2, mode='edge'), k, mode='valid').astype(np.float32)
    print(f'Bottom seam: Y {yb[xs0:xs1].min():.0f}..{yb[xs0:xs1].max():.0f}, mean cost {cb:.1f} '
          f'(straight Y=583 cost {cost[583, xs0:xs1].mean():.1f})')
    print(f'Right seam: X {xr[r0:r1].min():.0f}..{xr[r0:r1].max():.0f}, mean cost {cr:.1f} '
          f'(straight X=556 cost {cost[r0:r1, 556].mean():.1f})')
    return yb, xr

# Exact landmark-aligned offsets across all sheets:
# Ensures iron grate rails, posts, and hearth align to < 1px across all 24 frames
OFFSETS = [
    (0, 0),     # Frame 1
    (5, 0),     # Frame 2
    (11, 0),    # Frame 3
    (5, 0),     # Frame 4
    (-19, 91),  # Frame 5
    (-36, 91),  # Frame 6
    (-36, 91),  # Frame 7
    (-71, 101)  # Frame 8
]

def build_canvas(sheet, idx, clean_right_wall):
    """Place one sprite cell on the 621x770 canvas (no mask applied)."""
    FW, FH = 621, 770
    cw, ch = 688, 768
    c = idx % 4
    r = idx // 4
    cell = sheet.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
    dx, dy = OFFSETS[idx]
    
    canv = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
    canv.paste(cell, (dx, dy))
    
    canv_arr = np.array(canv)
    
    # Eliminate any fireplace stone pillar/arch intrusion along the right wall:
    # Cell 4 (Frame 5, talk_5) is the gold standard with zero stone pillar.
    # Calcifer's body/flames NEVER touch X >= 538, so we directly copy
    # the right wall strip X=[538..576] from talk_5 for all other frames
    # (strip widened from 560 so the right seam can sit past the groove).
    # This avoids threshold-based detection which has false positives from fire glow.
    if idx != 4:
        # Short (2px) feather: long ramps let the raw frame's stone-pillar sliver ghost through.
        w = np.clip((np.arange(RW0, RW1) - RW0 + 1) / 2.0, 0.0, 1.0)[None, :, None]
        region = canv_arr[320:565, RW0:RW1].astype(np.float32)
        gold = clean_right_wall[320:565, :].astype(np.float32)
        w = np.broadcast_to(w, region.shape[:2] + (1,)).copy()
        # talk_5 has a static orange fire glint at X~536-537; never copy bright fire pixels
        fire = (gold[:, :, 0] > 190) & (gold[:, :, 1] > 110)
        grown = fire.copy()
        for dy in (-2, -1, 0, 1, 2):
            for dx in (-2, -1, 0, 1, 2):
                grown |= np.roll(np.roll(fire, dy, axis=0), dx, axis=1)
        w[grown] = 0.0
        canv_arr[320:565, RW0:RW1] = np.round(region * (1.0 - w) + gold * w).astype(np.uint8)
    return canv_arr

def render_frame_rgba(canv_arr, mask_arr):
    canv_arr_f = canv_arr.astype(np.float32)
    canv_arr_f[:, :, 3] *= mask_arr
    return Image.fromarray(canv_arr_f.astype(np.uint8))

def clean_bg_apex_sparks(filepath):
    if not os.path.exists(filepath):
        return
    bg = Image.open(filepath).convert('RGB')
    bg_arr = np.array(bg)
    BX, BY = 2131, 649
    
    # Clean the static tip baked into the stone arch rim (Y: 279..285, X: 348..357)
    y1, y2 = BY + 279, BY + 286
    x1, x2 = BX + 348, BX + 357
    tip_mask = (bg_arr[y1:y2, x1:x2, 0] > 120) & (bg_arr[y1:y2, x1:x2, 1] > 55)
    bg_arr[y1:y2, x1:x2][tip_mask] = [88, 48, 50]
    
    cleaned = Image.fromarray(bg_arr)
    cleaned.save(filepath, 'WEBP', quality=98)
    print(f"Cleaned static arch tip in {filepath}")

def main():
    out_dir = 'assets/img/calcifer'
    os.makedirs(out_dir, exist_ok=True)
    
    # 1. Clean background images
    clean_bg_apex_sparks('assets/img/bg_close.webp')
    clean_bg_apex_sparks('assets/img/bg_open.webp')
    
    # 2. Reference clean right wall from talk_5 (Row 1, Col 0 of Flame_smile2)
    #    X=[538..576] range - Calcifer never touches these columns.
    cw, ch = 688, 768
    fs2 = Image.open('Fig/Flame_smile2.png').convert('RGBA')
    canv4 = Image.new('RGBA', (621, 770), (0, 0, 0, 0))
    canv4.paste(fs2.crop((0 * cw, 1 * ch, 1 * cw, 2 * ch)), (-19, 91))
    clean_right_wall = np.array(canv4)[:, RW0:RW1]
    
    # 3. Open sprite sheets and build all 24 unmasked canvases
    f18 = Image.open('Fig/Flame_1_8.png').convert('RGBA')
    fs1 = Image.open('Fig/Flame_smile.png').convert('RGBA')
    sheets = [('flame_idle_{}', f18), ('calcifer_smile_{}', fs1), ('calcifer_talk_{}', fs2)]
    canvases = {}
    for pattern, sheet in sheets:
        for i in range(8):
            canvases[pattern.format(i + 1)] = build_canvas(sheet, i, clean_right_wall)
    
    # 4. Cavity mask with minimum-contrast bottom/right seams valid for ALL frames
    yb, xr = compute_seams(list(canvases.values()),
                           ['assets/img/bg_close.webp', 'assets/img/bg_open.webp'])
    mask_arr = make_cavity_mask(yb=yb, xr=xr)
    
    print("Generating 24 frames (lossless transparent WebP)...")
    for name, arr in canvases.items():
        f = render_frame_rgba(arr, mask_arr)
        f.save(os.path.join(out_dir, f'{name}.webp'), 'WEBP', lossless=True)
        
    print("ALL_24_FRAMES_GENERATED_SUCCESSFULLY")

if __name__ == '__main__':
    main()
